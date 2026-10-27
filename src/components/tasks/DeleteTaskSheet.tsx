"use client";

import { useState } from "react";
import { PrimaryButton } from "@/components/BottomActions";
import { BottomSheet } from "@/components/BottomSheet";
import { Spinner } from "@/components/Spinner";

interface DeleteTaskSheetProps {
  open: boolean;
  /** 완료한 할 일이면 받은 크레딧이 남는다고 알린다 */
  done: boolean;
  onClose: () => void;
  /** 성공하면 부모가 화면을 떠난다. 실패하면 시트 안에서 알린다 */
  onConfirm: () => Promise<unknown>;
}

/** S04 삭제 확인 */
export function DeleteTaskSheet({ open, done, onClose, onConfirm }: DeleteTaskSheetProps) {
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  const close = () => {
    setFailed(false);
    onClose();
  };

  const confirm = async () => {
    if (pending) return;
    setPending(true);
    setFailed(false);
    try {
      await onConfirm();
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
      title="할 일을 지울까요?"
      description={done ? "받은 크레딧과 공사 진행은 그대로 남아요" : "지운 할 일은 되돌릴 수 없어요"}
    >
      <div className="flex flex-col gap-2 pt-2">
        {failed && (
          <p role="alert" className="text-center text-[14px] text-ink-2">
            지우지 못했어요. 다시 눌러 주세요
          </p>
        )}
        <PrimaryButton disabled={pending} onClick={() => void confirm()}>
          {pending && <Spinner />}
          지우기
        </PrimaryButton>
        <button
          type="button"
          onClick={close}
          className="h-12 rounded-xl bg-surface-2 text-[15px] font-semibold text-ink-2"
        >
          그대로 두기
        </button>
      </div>
    </BottomSheet>
  );
}
