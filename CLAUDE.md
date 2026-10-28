# CLAUDE.md

이 저장소(`chagok-web`)는 차곡(chagok)의 프론트엔드다. 차곡은 장기 목표를 AI가 할 일로 나누고, 할 일을 완료할 때마다 마을과 집이 만들어지는 목표 실행 서비스다. 백엔드(Spring Boot)는 `chagok-api` 저장소에서 별도로 개발한다.

'차곡'은 프로젝트 코드네임이다. 출시할 서비스명은 아직 정하지 않았으므로 화면에 '차곡'을 쓰지 않는다. 서비스명이 들어갈 자리는 `src/config/app.ts`의 `APP_NAME` 상수 하나로 처리하고, 값은 자리 표시 텍스트로 둔다. 코드, 패키지 이름, 저장소 이름에는 `chagok`을 쓴다.

## 문서

| 문서 | 내용 |
| --- | --- |
| `PRODUCT.md` | 대상 사용자, 목적, 설계 원칙, 말투, 피해야 할 것. Impeccable이 읽는다 |
| `docs/planning.md` | 차곡 기획초안 v0.8 전체. 게임 규칙과 수치의 원본 |
| `docs/glossary.md` | 용어, 코드 이름, 화면 문구, 게임 상수 |
| `docs/screens.md` | 화면별 구성, 표시 데이터, 사용자 행동, 상태 |
| `docs/openapi.yaml` | 백엔드 API 명세 (기준). 가짜 서버 응답과 맞는지 `src/mocks/openapi.test.ts`가 검사한다 |
| `docs/api.md` | API 규칙과 흐름 설명: 인증, 멱등성, 오류 코드, 화면 함수와 엔드포인트 대응 |

작업 전에 읽을 문서

| 작업 | 읽을 문서 |
| --- | --- |
| 화면 하나 만들기, 수정하기 | `docs/screens.md`의 해당 화면 + `docs/glossary.md` |
| 타입, 가짜 데이터 만들기 | `docs/glossary.md` + `docs/openapi.yaml`의 해당 스키마 (타입을 바꾸면 명세도 함께 고친다) |
| 크레딧, 보너스, 집 업그레이드 계산 | `docs/glossary.md` 8장 + `docs/planning.md` 4장 |
| 문구 쓰기 | `PRODUCT.md`의 Brand Personality + `docs/glossary.md` 9장 |

전체 문서를 한 번에 읽지 말고, 작업에 필요한 부분만 읽는다.

## 기술 구성

Next.js 코드를 쓰기 전에 아래 안내를 따른다. (Next.js가 만든 파일이며 `next dev` 실행 시 다시 생긴다)

@AGENTS.md

- Next.js + TypeScript, 정적 빌드(`output: 'export'`). 서버 기능(Server Actions, API Routes, 서버 컴포넌트의 데이터 요청)은 쓰지 않는다
- Tailwind CSS
- TanStack Query (서버 데이터)
- PWA: 매니페스트(`src/app/manifest.ts`) + 서비스 워커(`public/sw.js`, 웹 푸시만, 오프라인 캐시 없음). 푸시 구독은 `src/lib/push.ts`
- 상세 화면은 동적 경로 대신 쿼리 파라미터를 쓴다 (`/goals/detail?id=`)

## 폴더 구조

```
src/
  app/            화면(라우트)
  components/     화면 구성 요소
  lib/            화면과 무관한 로직 (계산, 날짜, API 호출)
  types/          도메인 타입 (glossary.md의 코드 이름 그대로)
  config/game.ts  게임 상수 (glossary.md 8장)
  config/app.ts   앱 이름(APP_NAME) 같은 앱 전역 값
  mocks/          가짜 데이터
docs/
```

`lib/`, `types/`, `config/`는 화면 코드(React, Next.js)를 import하지 않는다. 나중에 앱(Expo)으로 옮길 때 화면만 다시 만들기 위해서다.

## 작업 규칙

1. 이름은 `docs/glossary.md`의 코드 이름을 그대로 쓴다. 없는 개념이 필요하면 새 이름을 만들기 전에 먼저 묻는다.
2. 게임 규칙과 수치는 바꾸지 않는다. 바꿔야 할 것 같으면 이유와 함께 먼저 묻는다.
3. 숫자를 코드에 직접 쓰지 않는다. `src/config/game.ts`의 상수를 쓴다.
4. `docs/screens.md`에 없는 화면, 버튼, 데이터를 추가하지 않는다. 필요해 보이면 먼저 묻는다.
5. 화면마다 `docs/screens.md`에 정의된 상태(빈 상태, 로딩, 오류 등)를 모두 구현한다.
6. 백엔드가 준비되기 전까지 데이터는 `src/mocks/`의 가짜 데이터를 쓴다. 가짜 데이터는 `src/types/`의 타입을 따른다. 나중에 이 구조를 기준으로 API 명세를 작성한다.
7. 마을, 건물, 집, 가구 그림은 3D 렌더 이미지가 준비되기 전까지 같은 비율의 회색 자리 표시자로 둔다. 일러스트나 아이콘으로 대신 그리지 않는다.
8. 서비스가 사용자 대신 결정하는 동작을 만들지 않는다. 자동 이월, 자동 실패 처리, 목표 자동 완료가 없다.
9. 완료 직후 다른 화면으로 이동시키지 않는다. 알림과 실행 취소만 보여준다.
10. 화면 문구에 '실패', '미완료', 연속 일수, 랭킹을 쓰지 않는다.

## 와이어프레임 단계

### 사전 준비 (순서대로)

1. 프로젝트 초기 세팅: Next.js + TypeScript + Tailwind, 정적 빌드 설정, 폴더 구조, `src/config/game.ts`와 `src/config/app.ts`
2. Impeccable 설치: 사용자가 직접 `npx impeccable install`을 실행한다. 설치 전에 훅 설정을 확인하고, 사용 통계는 `npx impeccable telemetry off`로 끈다
3. `/impeccable init`: `PRODUCT.md`가 이미 있으므로 이를 바탕으로 진행한다

Impeccable이 설치되어 있지 않으면 Impeccable 명령을 흉내 내지 말고, 설치가 필요하다고 사용자에게 알린다.

### 진행

- 색과 폰트는 비주얼 단계(2026-10-28)에서 정했다(방향: 공사 안내판). 값은 `DESIGN.md`와 `src/app/globals.css`의 토큰을 따른다. 그림 자리 표시자는 계속 회색이다.
- Impeccable 순서: `/impeccable shape` → `/impeccable craft` → `/impeccable onboard`, `/impeccable harden`
- 화면 순서: S02 오늘 → S09·S10 AI 분해 → S06 집 내부 → 나머지
- 폭 375px에서 먼저 확인하고, 360px과 430px에서 깨지지 않는지 본다.
- 엄지가 닿는 화면 아래쪽에 자주 쓰는 행동을 둔다.

### 미정 항목

슬롯 종류(`SlotType`)와 업적 목록은 아직 정하지 않았다. S06, S07, S14를 만들 때는 아래처럼 처리한다.

- 값은 `src/mocks/`의 가짜 데이터에만 임시로 둔다. `src/types/`의 타입은 `string`으로 두고, 열거형이나 `src/config/` 상수로 만들지 않는다.
- 임시 값에는 `// TODO: 미정 (docs/planning.md 14장)` 주석을 단다.
- 값이 정해지면 `docs/glossary.md`에 먼저 추가한 뒤 코드에 반영한다.

## 확인 방법

- 화면을 만들면 브라우저에서 375px 폭으로 열어 직접 확인한다.
- 각 상태는 가짜 데이터를 바꿔서 하나씩 확인한다.
- 계산 로직(`src/lib/`)은 테스트를 함께 작성한다. 특히 크레딧 지급과 회수, 일일 보너스, 집 업그레이드 조건, 실행률.
