/**
 * 로그인 뒤 돌아갈 주소. 같은 사이트 안의 경로만 받는다.
 * '/\evil.com', '/%09/evil.com'처럼 브라우저가 다른 사이트로 읽는 주소를 막기 위해 URL로 풀어서 출처를 비교한다
 */
export function safeReturnPath(next: string | null, origin: string): string | null {
  if (!next || !next.startsWith("/")) return null;
  let url: URL;
  try {
    url = new URL(next, origin);
  } catch {
    return null;
  }
  if (url.origin !== origin || url.pathname === "/login") return null;
  // 라우터가 경로를 한 번 더 풀었을 때('%09' → 탭, 버려짐) '//'로 시작하면 다른 사이트가 된다
  let decoded: string;
  try {
    decoded = decodeURIComponent(url.pathname).replace(/[\u0000-\u001f\u007f]/g, "");
  } catch {
    return null;
  }
  if (/^[/\\]{2}/.test(decoded)) return null;
  return `${url.pathname}${url.search}${url.hash}`;
}
