"use client";

import { Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import { PrimaryButton } from "@/components/BottomActions";
import { BottomSheet } from "@/components/BottomSheet";
import { Spinner } from "@/components/Spinner";
import { SPLIT_MIN_TASKS } from "@/config/game";
import { canSplit, splitTitles } from "@/lib/split";
import { TASK_TITLE_MAX_LENGTH } from "@/config/app";

interface SplitSheetProps {
  open: boolean;
  onClose: () => void;
  /** 성공하면 부모가 화면을 떠난다. 실패하면 시트 안에서 알리고 입력은 그대로 둔다 */
  onSubmit: (titles: string[]) => Promise<unknown>;
}

interface Row {
  id: number;
  value: string;
}

const emptyRows = (): Row[] => Array.from({ length: SPLIT_MIN_TASKS }, (_, i) => ({ id: i, value: "" }));

/** S04 나누기: 새 제목을 SPLIT_MIN_TASKS개 이상 적는다. 원래 할 일은 SPLIT이 된다 */
export function SplitSheet({ open, onClose, onSubmit }: SplitSheetProps) {
  const [rows, setRows] = useState<Row[]>(emptyRows);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const nextId = useRef(SPLIT_MIN_TASKS);
  const inputs = useRef(new Map<number, HTMLInputElement>());
  // 새로 더한 칸에 바로 커서를 옮긴다
  const focusId = useRef<number | null>(null);

  const values = rows.map((r) => r.value);
  const count = splitTitles(values).length;
  const ready = canSplit(values) && !pending;

  const close = () => {
    setRows(emptyRows());
    nextId.current = SPLIT_MIN_TASKS;
    setFailed(false);
    onClose();
  };

  const addRow = () => {
    const id = nextId.current++;
    focusId.current = id;
    setRows((prev) => [...prev, { id, value: "" }]);
  };

  const submit = async () => {
    if (!ready) return;
    setPending(true);
    setFailed(false);
    try {
      await onSubmit(splitTitles(values));
    } catch {
      setFailed(true);
    } finally {
      setPending(false);
    }
  };

  return (
    <BottomSheet
      open={open}
      onClose={close}
      title="나누기"
      description="원래 할 일은 목록에서 빠지고, 같은 날짜와 목표로 새 할 일이 생겨요"
    >
      <form
        className="flex flex-col gap-2 pt-1"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <ol className="flex flex-col gap-2">
          {rows.map((row, i) => (
            <li key={row.id} className="flex items-center gap-1">
              <input
                ref={(el) => {
                  if (el) inputs.current.set(row.id, el);
                  else inputs.current.delete(row.id);
                  if (el && focusId.current === row.id) {
                    el.focus();
                    focusId.current = null;
                  }
                }}
                type="text"
                autoFocus={i === 0}
                data-autofocus={i === 0 || undefined}
                enterKeyHint={i === rows.length - 1 ? "done" : "next"}
                maxLength={TASK_TITLE_MAX_LENGTH}
                aria-label={`나눈 할 일 ${i + 1}`}
                placeholder={`할 일 ${i + 1}`}
                value={row.value}
                onChange={(e) => {
                  const value = e.target.value;
                  setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, value } : r)));
                }}
                onKeyDown={(e) => {
                  if (e.key !== "Enter" || e.nativeEvent.isComposing) return;
                  // 엔터는 다음 칸으로. 마지막 칸이면 나누기
                  const next = rows[i + 1];
                  if (next) {
                    e.preventDefault();
                    inputs.current.get(next.id)?.focus();
                  }
                }}
                className="h-12 min-w-0 flex-1 rounded-lg border border-line-strong bg-surface px-3 text-[16px] placeholder:text-ink-3"
              />
              {rows.length > SPLIT_MIN_TASKS && (
                <button
                  type="button"
                  aria-label={`할 일 ${i + 1} 칸 지우기`}
                  onClick={() => setRows((prev) => prev.filter((r) => r.id !== row.id))}
                  className="grid size-11 shrink-0 place-items-center rounded-full text-ink-3"
                >
                  <X aria-hidden size={18} />
                </button>
              )}
            </li>
          ))}
        </ol>

        <button
          type="button"
          onClick={addRow}
          className="flex h-11 items-center gap-1.5 self-start px-1 text-[15px] font-semibold text-ink-2"
        >
          <Plus aria-hidden size={18} />칸 추가
        </button>

        <div className="sticky bottom-0 -mx-5 bg-surface px-5 pt-1">
          {failed && (
            <p role="alert" className="pb-2 text-center text-[14px] text-ink-2">
              저장하지 못했어요. 다시 눌러 주세요
            </p>
          )}
          <PrimaryButton type="submit" disabled={!ready}>
            {pending && <Spinner />}
            {count >= SPLIT_MIN_TASKS ? `${count}개로 나누기` : "나누기"}
          </PrimaryButton>
        </div>
      </form>
    </BottomSheet>
  );
}
