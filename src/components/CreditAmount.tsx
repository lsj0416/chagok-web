import { formatCredit } from "@/lib/credit";

/** 안내판 띠의 크레딧 잔액. 마이너스면 흰 판 위에 진한 주황 글자로 바꾸고, 색만으로 말하지 않게 '−' 부호를 함께 쓴다 */
export function CreditAmount({ balance }: { balance: number }) {
  return (
    <strong className={`font-bold ${balance < 0 ? "rounded-sm bg-surface px-1.5 text-debt" : "text-sign-ink"}`}>
      {formatCredit(balance)}
    </strong>
  );
}
