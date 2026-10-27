# chagok-web

장기 목표를 AI가 오늘 할 수 있는 할 일로 나누고, 할 일을 완료할 때마다 나만의 마을과 집이 만들어지는 목표 실행 서비스의 프론트엔드다.

- 목표 하나는 마을의 건물 하나가 된다.
- 핵심 할 일을 완료하면 크레딧을 받고, 크레딧으로 가구를 사서 집을 꾸미고 넓힌다.
- 하루를 쉬어도 쌓인 마을, 집, 크레딧은 줄지 않는다.

차곡(chagok)은 프로젝트 코드네임이다. 출시할 서비스명은 아직 정하지 않았고, 화면에서는 `src/config/app.ts`의 `APP_NAME` 자리 표시 텍스트를 쓴다. 백엔드(Spring Boot)는 `chagok-api` 저장소에서 따로 개발한다.

## 현재 단계

와이어프레임 단계다. 색과 폰트는 정하지 않았고, 회색 톤과 기본 폰트로 화면 구조와 흐름을 만든다. 백엔드가 준비되기 전까지 데이터는 `src/mocks/`의 가짜 데이터를 쓴다.

- [x] 프로젝트 초기 세팅
- [ ] Impeccable 설치와 초기화
- [ ] 와이어프레임: S02 오늘 → S09·S10 AI 분해 → S06 집 내부 → 나머지

## 기술 구성

| 영역 | 사용 |
| --- | --- |
| 프레임워크 | Next.js 16 (App Router), React 19, TypeScript |
| 빌드 | 정적 빌드 (`output: 'export'`). 서버 기능은 쓰지 않는다 |
| 스타일 | Tailwind CSS 4 |
| 서버 데이터 | TanStack Query (예정) |
| 배포 형태 | PWA: 매니페스트 + 서비스 워커 (예정) |

정적 빌드라서 상세 화면은 동적 경로 대신 쿼리 파라미터를 쓴다. 예: `/goals/detail?id=`

## 시작하기

Node.js 20.9 이상이 필요하다.

```bash
npm install
npm run dev     # 개발 서버 (http://localhost:3000)
npm run build   # 정적 빌드, 결과는 out/
npm run lint
```

## 폴더 구조

```
src/
  app/            화면(라우트)
  components/     화면 구성 요소
  lib/            화면과 무관한 로직 (계산, 날짜, API 호출)
  types/          도메인 타입
  config/game.ts  게임 상수
  config/app.ts   앱 이름(APP_NAME) 같은 앱 전역 값
  mocks/          가짜 데이터
docs/             기획 문서
```

`lib/`, `types/`, `config/`는 React와 Next.js를 import하지 않는다. 나중에 앱으로 옮길 때 화면만 다시 만들기 위해서이며, ESLint 규칙으로 막아두었다.

## 문서

| 문서 | 내용 |
| --- | --- |
| [`PRODUCT.md`](PRODUCT.md) | 대상 사용자, 목적, 설계 원칙, 말투, 피해야 할 것 |
| [`docs/planning.md`](docs/planning.md) | 기획초안 전체. 게임 규칙과 수치의 원본 |
| [`docs/glossary.md`](docs/glossary.md) | 용어, 코드 이름, 화면 문구, 게임 상수 |
| [`docs/screens.md`](docs/screens.md) | 화면별 구성, 표시 데이터, 사용자 행동, 상태 |
| [`CLAUDE.md`](CLAUDE.md) | 작업 규칙 |
