# API 명세 설명

`docs/openapi.yaml`이 기준 명세이고, 이 문서는 그 규칙과 흐름을 설명한다. 둘이 다르면 openapi.yaml이 맞다.

- 프론트엔드의 가짜 서버(`src/mocks/server.ts`)와 타입(`src/types/index.ts`)을 기준으로 썼다.
- 가짜 서버의 조회 결과가 명세 스키마와 맞는지는 `src/mocks/openapi.test.ts`가 검사한다. 타입이나 명세를 바꾸면 이 테스트가 어긋남을 알려 준다.
- 용어와 코드 이름은 `docs/glossary.md`, 화면별 규칙은 `docs/screens.md`를 따른다.
- 백엔드(`chagok-api`, Spring Boot)를 시작할 때 이 두 파일을 옮기거나 공유 저장소로 뺀다.

## 1 기본 규칙

| 항목 | 규칙 |
| --- | --- |
| 주소 | `https://api.<도메인>/api/v1`. 프론트는 `https://app.<도메인>` (같은 상위 도메인, 리프레시 쿠키 때문) |
| 형식 | JSON, 필드 이름은 camelCase. 오류는 `application/problem+json` |
| ID | 문자열. 서버 내부 형식(UUID 권장)은 드러내지 않는다 |
| 날짜 | `DateKey` = `'YYYY-MM-DD'`, 사용자 시간대 기준 |
| 시각 | ISO 8601 UTC (`2026-10-28T09:00:00Z`) |
| 없음 | 값이 없으면 필드를 빼지 않고 `null`로 보낸다 (명세의 required는 모두 항상 온다) |
| 다른 사용자의 데이터 | 403이 아니라 404로 답한다 (있는지조차 알려 주지 않는다) |

### '오늘'의 기준

- 서버가 사용자 설정 시간대(`UserSettings.timezone`)의 자정을 기준으로 오늘을 정한다. 화면은 오늘을 보내지 않는다.
- 완료 취소 가능 여부(완료한 당일만), 일일 보너스, 기록의 날짜, '지난 할 일'도 같은 기준이다.
- 시간대를 바꾸면 그다음 요청부터 새 기준을 쓴다. 이미 쌓인 기록의 날짜는 바꾸지 않는다.

## 2 인증

구글 로그인만 있다. Spring Security + 구글 ID 토큰 검증 + JWT.

```
화면                                서버
 │ Google Identity Services 버튼     │
 │──── POST /auth/google {idToken, timezone} ──▶ ID 토큰 검증, 사용자 찾기/만들기
 │◀─── 200 {accessToken, expiresIn, activeGoalCount}
 │     Set-Cookie: chagok_refresh (httpOnly)
 │
 │──── GET /today  Authorization: Bearer <access> ──▶
 │◀─── 401 (액세스 만료)
 │──── POST /auth/refresh (쿠키 자동) ──▶ 리프레시 회전
 │◀─── 200 {accessToken} + 새 쿠키
 │──── GET /today 다시 ──▶
```

| 토큰 | 수명 | 보관 |
| --- | --- | --- |
| 액세스 (JWT) | 15분 | 화면 메모리에만. 새로고침하면 `/auth/refresh`로 다시 받는다 |
| 리프레시 | 14일 | `chagok_refresh` 쿠키: `HttpOnly; Secure; SameSite=Lax; Path=/api/v1/auth`. DB에는 해시만 저장 |

- 리프레시 토큰은 쓸 때마다 바꾼다. 이미 쓴 토큰이 다시 오면 탈취로 보고 그 사용자의 리프레시 토큰을 모두 무효로 한다.
- CORS는 `https://app.<도메인>`만 허용하고 `Access-Control-Allow-Credentials: true`. 화면은 `/auth/*` 요청에 `credentials: "include"`를 붙인다.
- `/auth/refresh`와 `/auth/logout`은 `Origin` 헤더가 허용한 주소인지도 본다 (쿠키만으로 동작하는 요청이라서).
- 리프레시까지 실패하면 화면은 `/login?next=<원래 경로>`로 보낸다 (docs/screens.md 0.3).
- 로그인 응답의 `activeGoalCount`가 0이면 S09(목표 입력), 아니면 S02로 보낸다.

## 3 멱등성과 동시 수정

크레딧이 움직이거나 두 번 눌리면 안 되는 요청은 `Idempotency-Key` 헤더(화면이 만든 UUID)를 받는다.

| 요청 | 키 |
| --- | --- |
| 완료, 완료 취소, 집 넓히기, 가구 사기 | 반드시 |
| 할 일 만들기, 목표 만들기, 목표에 할 일 더하기 | 있으면 쓴다 (연속 탭 방지) |

- 서버는 (사용자, 키)와 응답을 24시간 저장하고, 같은 키가 다시 오면 처리하지 않고 저장한 응답을 준다.
- 같은 키에 다른 본문이 오면 409 `IDEMPOTENCY_KEY_REUSED`.
- 일일 보너스는 (사용자, 날짜) 유일 제약으로도 막는다.
- 동시 수정은 JPA `@Version`으로 감지하고 409 `VERSION_CONFLICT`로 답한다. 화면은 다시 불러온 뒤 '저장하지 못했어요'와 다시 시도를 보여준다.

## 4 오류

Spring `ProblemDetail`(RFC 9457)에 `code`를 더한다. 화면은 `status`가 아니라 `code`로 분기한다.

```json
{ "type": "about:blank", "title": "Conflict", "status": 409, "code": "CORE_FULL", "detail": "10월 29일 핵심 할 일이 가득 찼어요", "coreTasks": [ ... ] }
```

| code | status | 언제 | 화면 |
| --- | --- | --- | --- |
| `VALIDATION_FAILED` | 400 | 입력값 오류 (빈 제목, 100자 넘김, 나누기 2개 미만 등) | 시트 안 '저장하지 못했어요' |
| `UNAUTHENTICATED` | 401 | 토큰 없음, 만료 | 리프레시 후 다시, 실패하면 로그인 화면 |
| `NOT_FOUND` | 404 | 없거나 다른 사용자의 것, 지운 할 일, 나눠진 할 일 | 각 화면의 '찾을 수 없어요' 상태 |
| `CORE_FULL` | 409 | 그날 핵심이 가득 찼는데 `coreConflict` 없이 핵심으로 들임 | 응답의 `coreTasks`로 핵심 교체 시트 |
| `CORE_REPLACE_TARGET_INVALID` | 409 | 뺄 할 일이 그날 핵심이 아니거나 완료함 | 다시 불러오고 저장 실패 알림 |
| `CANNOT_UNCOMPLETE` | 409 | 지난날 완료한 할 일의 완료 취소 | 체크를 비활성으로 (원래 막혀 있음) |
| `TASK_NOT_PLANNED` | 409 | 완료한 할 일 나누기 등 | 원래 막혀 있음 |
| `DONE_TASK_GOAL_LOCKED` | 409 | 완료한 할 일의 목표 바꾸기 | 원래 막혀 있음 |
| `RECURRENCE_NEEDS_DATE` | 409 | 날짜 없는 할 일에 매일 반복 켜기 | 원래 막혀 있음 |
| `RECURRING_NEEDS_DATE` | 409 | 매일 반복하는 할 일을 날짜 없이 보관 | 원래 막혀 있음 |
| `GOAL_NOT_ACTIVE` | 409 | 진행 중이 아닌 목표에 할 일 더하기, 보관한 목표 보관 등 | 다시 불러오기 |
| `NOT_ENOUGH_CREDIT` | 409 | 잔액이 가격보다 적거나 음수 | 가구 상점의 부족 안내 |
| `HOUSE_UPGRADE_NOT_READY` | 409 | 넓히기 조건을 못 채움 | 원래 막혀 있음 |
| `AI_DAILY_LIMIT` | 429 | 하루 AI 사용 횟수를 다 씀 | '오늘 AI 사용을 모두 썼어요'와 직접 입력 |
| `AI_UNAVAILABLE` | 502 | LLM 오류, 형식에 맞지 않는 응답 | 'AI가 응답하지 않아요'와 직접 입력 (횟수 안 셈) |
| `AI_TIMEOUT` | 504 | 서버 쪽 LLM 호출 시간 초과 | 위와 같음 (횟수 안 셈) |
| `VERSION_CONFLICT` | 409 | 동시 수정 | 다시 불러오고 저장 실패 알림 |
| `IDEMPOTENCY_KEY_REUSED` | 409 | 같은 키에 다른 본문 | 화면 버그. 새 키로 다시 |

'원래 막혀 있음'은 화면이 그 동작을 미리 막고 있어서 정상 사용에서는 생기지 않는 오류다. 서버는 화면을 믿지 않고 같은 규칙을 다시 검사한다.

## 5 주요 흐름

### 완료

1. `POST /tasks/{id}/complete` (멱등성 키 필수).
2. 서버는 한 트랜잭션에서 상태 변경, 실행 이력, 크레딧 원장(핵심 할 일 또는 일일 보너스), 건물 공사 진행을 기록한다.
3. 응답 `CompletionResult`로 화면이 알림 문구를 만든다 (docs/screens.md 'S02 완료 알림 문구 규칙').
   - `credits`에 `EARN_CORE_TASK`가 있으면 '+20 크레딧', `EARN_DAILY_BONUS`면 '+20 크레딧 · 오늘의 보너스'
   - `building`이 있으면 '{건물} 공사 진행', `reachedFrame`이면 '{건물} 골조가 올라갔어요'
   - 일반 할 일이고 보너스 전이면 `normalDoneToday`로 '오늘의 보너스 3/5'
4. 실행 취소는 `POST /tasks/{id}/uncomplete`. 회수는 원장에 `REVOKE_UNCOMPLETE`(음수)를 더하는 방식이고, 잔액을 직접 고치지 않는다.

### 핵심 자리가 가득 찬 날

핵심 할 일을 핵심이 가득 찬 날로 옮기거나(`PUT /tasks/{id}/schedule`) 더하거나(`POST /tasks`) 지정할 때(`PUT /tasks/{id}/core`) 쓴다. 서비스는 말없이 일반 할 일로 바꾸지 않는다.

```
화면: GET /days/2026-10-29/core-tasks?excludeTaskId=t-2   → 3개 (가득 참)
화면: 핵심 교체 시트 → 사용자가 고름
  ├ 뺄 할 일 t-7  → PUT /tasks/t-2/schedule {date, coreConflict: {replaceCoreTaskId: "t-7"}}
  ├ 일반으로       → PUT /tasks/t-2/schedule {date, coreConflict: {asNormal: true}}
  └ 그대로 두기    → 요청 없음
```

미리 확인하지 않고 보내도 서버가 409 `CORE_FULL`과 `coreTasks`를 돌려주므로, 화면은 그 값으로 같은 시트를 열 수 있다.

### AI 목표 분해

1. `GET /ai/usage`로 남은 횟수를 보여준다.
2. `POST /ai/goal-breakdowns`. 서버는 Spring AI로 LLM을 호출하고 구조화된 응답(목표 유형, 초안 5~10개)을 검증한다. 화면은 20초에서 끊는다(`AI_TIMEOUT_MS`).
3. LLM을 호출했으면 사용자가 취소해도 1회로 센다. LLM 오류와 서버 쪽 시간 초과는 세지 않는다.
4. 초안은 저장하지 않는다. 분해 요청(입력, 제안 결과, 모델)은 기록하고 `breakdownId`를 준다.
5. 목표를 만들 때(`POST /goals`) 또는 목표에 더할 때(`POST /goals/{id}/tasks`) `breakdownId`를 함께 보낸다. 서버는 제안 수와 고른 수로 채택률을 센다 (PRODUCT.md 성공 기준).

### 기록

- `GET /records`: 주간 요약과 최근 30일. `olderBefore`가 null이 아니면 '이전 기록 더 보기'를 보여준다.
- `GET /records/days?before=<olderBefore>`: 그 전 30일. 응답의 `olderBefore`를 다음 요청에 그대로 쓴다.
- `DayRecord`는 저장 데이터가 아니라 계획 이력과 실행 이력에서 계산한다. 옮긴 할 일은 원래 날짜의 계획 수에 남는다.
- 주간 실행률은 어제까지만 센다. 계획이 없던 날이나 쉰 날(계획도 완료도 없던 날)은 줄을 만들지 않는다.

## 6 화면 함수와 엔드포인트

화면은 `src/lib/api/*`의 함수만 부른다. 백엔드가 생기면 이 함수들의 구현만 fetch로 바꾼다.

| 프론트 함수 (`src/lib/api`) | 엔드포인트 | 화면 |
| --- | --- | --- |
| `signInWithGoogle` | `POST /auth/google` | S01 |
| `signOut` | `POST /auth/logout` | S15 |
| `fetchTodayPlan` | `GET /today` | S02 |
| `fetchOverdueTasks` | `GET /tasks/overdue` | S02 |
| `fetchDayCoreTasks` | `GET /days/{date}/core-tasks` | S02, S03, S04, S12 |
| `createTask` | `POST /tasks` | S03, S16 |
| `fetchTaskDetail` | `GET /tasks/{id}` | S04 |
| `updateTask` | `PATCH /tasks/{id}` | S04 |
| `deleteTask` | `DELETE /tasks/{id}` | S04 |
| `completeTask` | `POST /tasks/{id}/complete` | S02, S04, S12 |
| `uncompleteTask` | `POST /tasks/{id}/uncomplete` | S02, S04, S12 |
| `setTaskCore` | `PUT /tasks/{id}/core {isCore}` | S02, S04 |
| `replaceCoreTask(remove, add)` | `PUT /tasks/{add}/core {isCore: true, coreConflict: {replaceCoreTaskId: remove}}` | S02, S04 |
| `rescheduleTask` | `PUT /tasks/{id}/schedule {date, coreConflict?}` | S02, S04, S12 |
| `unscheduleTask` | `PUT /tasks/{id}/schedule {date: null}` | S02, S04 |
| `splitTask` | `POST /tasks/{id}/split` | S04 |
| `fetchGoals` | `GET /goals` | S08 |
| `fetchActiveGoalCount` | `GET /goals?status=ACTIVE`의 개수 | S09 첫 진입 |
| `createGoal` | `POST /goals` | S10, S11 |
| `fetchGoalDetail` | `GET /goals/{id}` | S12 |
| `updateGoal` | `PATCH /goals/{id}` | S12 |
| `completeGoal` | `POST /goals/{id}/complete` | S12 |
| `archiveGoal`, `resumeGoal` | `POST /goals/{id}/archive`, `/resume` | S12 |
| `addGoalTasks` | `POST /goals/{id}/tasks` | S12 → S09·S10 |
| `fetchAiUsage` | `GET /ai/usage` | S09, S10 |
| `requestGoalBreakdown` | `POST /ai/goal-breakdowns` | S09, S10 |
| `fetchRecords` | `GET /records` | S13 |
| `fetchDayRecords` | `GET /records/days` | S13 |
| `fetchAchievements` | `GET /achievements` | S14 |
| `fetchVillageDetail` | `GET /village` | S05 |
| `markBuildingStageSeen` | `POST /buildings/{id}/stage-seen` | S05 |
| `fetchHouseDetail` | `GET /house` | S06 |
| `purchaseAndPlace` | `POST /house/furniture-purchases` | S07 |
| `placeOwnedFurniture` | `PUT /house/slots/{slotId}/placement` | S06 |
| `removePlacement` | `DELETE /house/slots/{slotId}/placement` | S06 |
| `upgradeHouse` | `POST /house/upgrade` | S06 |
| `fetchSettings`, `updateSettings` | `GET`, `PATCH /me/settings` | S15 |
| `subscribePush`, `unsubscribePush` | `POST`, `DELETE /me/push-subscriptions` | S15 (`src/lib/push.ts`가 부른다) |

## 7 백엔드에 연결할 때 프론트에서 바꿀 것

가짜 서버의 반환값 중 명세와 모양이 다른 것이다. 화면 코드가 아니라 `src/lib/api`와 그 호출부만 바뀐다.

1. `completeTask`: 가짜 서버는 완성된 문구(`{message}`)를 주지만 서버는 `CompletionResult`를 준다. `src/lib/completion.ts`에 결과로 문구를 만드는 함수를 두고 호출부는 그대로 문구를 받는다.
2. 쓰기 요청의 반환값: 가짜 서버는 `{ok: true}`, `{count}`, `{goalId}`를 주지만 서버는 바뀐 대상을 준다(`Task`, `Task[]`, `GoalDetail`, `HouseDetail`). `count`는 배열 길이로, `goalId`는 `goal.id`로 바꾼다.
3. `signInWithGoogle`: 구글 버튼이 준 ID 토큰과 기기 시간대를 보내도록 바꾼다.
4. 토큰: fetch 래퍼가 액세스 토큰을 붙이고, 401이면 한 번 리프레시한 뒤 다시 보낸다.
5. 오류: `Problem.code`로 분기한다. `CORE_FULL`은 응답의 `coreTasks`로 핵심 교체 시트를 연다.
6. 멱등성 키: 완료, 완료 취소, 넓히기, 가구 사기 요청마다 `crypto.randomUUID()`를 붙인다. 같은 동작을 다시 시도할 때는 같은 키를 쓴다.
7. 가짜 서버 전용인 `setMockScenario`, `mockNotifyBlock`을 지운다.
8. 백엔드가 만든 VAPID 공개 키를 빌드 환경 변수 `NEXT_PUBLIC_VAPID_PUBLIC_KEY`에 넣는다. 비어 있으면 알림 설정은 저장되지만 기기 구독은 만들지 않는다.

## 8 웹 푸시

### 기기 구독

- 알림 켜기·끄기(`UserSettings`)는 사용자 단위이고, 푸시 구독은 기기(브라우저) 단위다. 서버는 알림이 켜진 사용자의 모든 구독으로 보낸다.
- 화면은 알림을 켤 때 권한을 묻고, 받으면 구독을 만들어 `POST /me/push-subscriptions`로 등록한다. 둘 다 끄거나 로그아웃하면 `DELETE`로 지운다.
- 브라우저가 구독을 바꾸면(`pushsubscriptionchange`) 서비스 워커는 액세스 토큰이 없어 직접 등록하지 못한다. 다음에 설정 화면을 열 때 화면이 다시 등록한다. 서버는 푸시 서비스가 404·410으로 답한 구독을 지운다.

### 푸시 메시지

서버가 보내는 메시지 본문(JSON). 서비스 워커(`public/sw.js`)가 읽어 알림으로 보여준다.

| 필드 | 뜻 |
| --- | --- |
| `title` | 알림 제목. 비어 있으면 '오늘 할 일' |
| `body` | 알림 본문 |
| `url` | 알림을 누르면 열 앱 안 경로(`/`로 시작). 없거나 다른 사이트 주소면 `/today` |
| `tag` | 같은 종류 알림을 겹쳐 쌓지 않고 바꾸는 이름. 하루 시작 `morning`, 하루 마무리 `evening` |

문구는 서버가 정하고 `docs/glossary.md` 9장(쓰지 않는 말)을 따른다. 예: 하루 시작 '오늘 할 일을 확인해 보세요', 하루 마무리 '오늘 한 일을 체크해 보세요'.

### 배포할 때

- HTTPS에서만 서비스 워커와 푸시가 동작한다 (`localhost`는 예외).
- `/sw.js`는 `Cache-Control: no-cache`로 내보낸다. 정적 호스팅의 헤더 설정에서 정한다 (화면은 `updateViaCache: 'none'`으로 등록해 HTTP 캐시를 거치지 않는다).
- `/manifest.webmanifest`는 `application/manifest+json`으로 내보낸다.
- 서비스 워커는 화면 파일을 저장해 두지 않는다(오프라인 캐시 없음). 새 버전을 올리면 다음 실행부터 바로 쓴다.

## 9 백엔드 설계에서 정할 것

명세 밖이라 이 문서에서 정하지 않은 것이다.

- 매일 반복 할 일을 언제, 어떻게 다음 날 할 일로 만드는지 (자정 배치 또는 조회 시 생성)
- 빠른 추가 칩 정렬 계산 (docs/planning.md 13장)
- 업적 판정 시점과 지급 (업적 목록이 정해진 뒤)
- 알림 발송 스케줄(사용자 시간대의 알림 시각에 보내기)과 VAPID 키 만들기·보관
- 가구 이미지 주소: `FurnitureCatalogItem`에 아직 이미지 필드가 없다. 3D 렌더가 준비되면 `imageUrl`을 더한다
