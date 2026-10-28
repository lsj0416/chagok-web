---
version: 1
slug: "src-components-today-addtasksheet-tsx"
primary_target: "src/components/today/AddTaskSheet.tsx"
related_targets: ["src/components/today/QuickAddSheet.tsx"]
---

# S03 할 일 추가 · S16 빠른 추가 (바텀시트)

## Scope and mode

- Mode: Operate. 오늘 화면(S02) 위에 열리는 시트 두 개.
- 범위: S03(할 일 추가), S16(빠른 추가), S03의 목표 선택 시트. S12에서 여는 경로는 S12를 만들 때 연결한다(기본값 인자는 지금 받는다).
- 기준: `docs/screens.md` S03, S16. 비주얼은 `DESIGN.md`.

## Job

할 일 추가는 제목 하나. 시트가 열리면 바로 타이핑하고 엔터로 추가한다. 빠른 추가는 수량만 고른다.

## Direction contract

THESIS: 입력칸 하나와 칩 몇 개. 폼 필드 나열, 필수 표시 별표, 설명 문단, 확인 대화상자를 거부한다.

OWN-WORLD: DESIGN.md의 와이어프레임 시스템. 바텀시트, 선택 칩(먹색 채움), 48px 입력칸, 전체 폭 주요 버튼, 스위치.

STORY: 할 일 추가를 누른다 → 키보드와 함께 제목을 적는다 → 엔터 → 목록에 생기고 입력칸이 비워진다 → 다음 할 일. 빠른 추가: 칩을 누른다 → 수량 칩 하나 → 추가.

FIRST VIEWPORT (375px, 키보드 열림): 시트 제목, 제목 입력칸, 날짜 칩 한 줄, '연결 목표' 줄(screens.md의 목표 칩을 줄로 바꿈, 확인 필요), 핵심 스위치, 키보드 바로 위 추가 버튼.

FORM: 표준 모바일 입력 시트. 구성은 screens.md에 고정. seed: none (pinned by brief). 사용자 확인 2026-10-27: "지금과 동일하게 유지해줘" (와이어프레임 단계 동안 구성안 추첨 생략 유지에 동의. 비주얼 단계에서 다시 정한다)

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Decisions

- 확정(2026-10-28): S03에 빠른 추가 칩 줄을 두지 않는다. 날짜 칩은 오늘 · 내일 · 날짜 선택 · 날짜 없음. 새 이름 amountOptions, defaultAmount, recurrence(DAILY).
- 확인 필요: CreateTaskRequest 이름, 연속 추가 때 유지하는 값, 시트 안 저장 실패 표시, 오늘이 아닌 날짜의 핵심 3개.
