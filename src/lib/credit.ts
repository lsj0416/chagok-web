/** 크레딧 표기. 마이너스는 '−'(U+2212)를 붙인다. 색만으로 알리지 않기 위해 부호를 항상 쓴다 */
export function formatCredit(amount: number): string {
  return amount < 0 ? `−${Math.abs(amount)}` : `${amount}`;
}
