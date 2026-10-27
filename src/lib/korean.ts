function finalConsonant(word: string): number | null {
  const last = word.charCodeAt(word.length - 1);
  if (last < 0xac00 || last > 0xd7a3) return null;
  return (last - 0xac00) % 28;
}

/** 받침에 따라 '으로' 또는 '로'를 붙인다 (ㄹ 받침은 '로'). 예: 투룸으로, 아파트로 */
export function withEuro(word: string): string {
  const final = finalConsonant(word);
  return final === null || final === 0 || final === 8 ? `${word}로` : `${word}으로`;
}

/** 받침에 따라 '을' 또는 '를'을 붙인다. 예: 침대를, 책장을 */
export function withEulReul(word: string): string {
  const final = finalConsonant(word);
  return final === null || final === 0 ? `${word}를` : `${word}을`;
}

/** 받침에 따라 '이' 또는 '가'를 붙인다. 예: 오피스가, 학교가, 체육관이 */
export function withIGa(word: string): string {
  const final = finalConsonant(word);
  return final === null || final === 0 ? `${word}가` : `${word}이`;
}
