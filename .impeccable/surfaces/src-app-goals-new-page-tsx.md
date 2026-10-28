---
version: 1
slug: "src-app-goals-new-page-tsx"
primary_target: "src/app/goals/new/page.tsx"
related_targets: ["src/app/goals/new/drafts/page.tsx","src/app/goals/new/manual/page.tsx"]
---

# S09 목표 입력 · S10 할 일 초안 선택 · S11 직접 입력 (`/goals/new`)

## Scope and mode

- Mode: Operate. 목표 제목 하나를 적고, AI 초안 중 쓸 것만 고른다.
- 범위: S09, S10, S11, 건물 종류 바텀시트, 가짜 AI. S12는 자리 표시자.
- 기준: `docs/screens.md` S09, S10, S11. 비주얼은 `DESIGN.md`(S02에서 기록한 와이어프레임 시스템)를 따른다.

## Job

필요한 것만 고르게 한다. 초안은 모두 해제된 채로 도착하고, 'N개 추가하기'가 고른 수를 말한다. AI가 실패해도 직접 입력으로 목표를 만들 수 있다.

## Direction contract

THESIS: 입력은 한 칸, 고르기는 체크 한 번. 폼 위저드, 단계 표시줄, AI 마법 연출(반짝이, 그라데이션, 타이핑 효과)을 거부한다.

OWN-WORLD: DESIGN.md의 와이어프레임 시스템 그대로. 흰 바탕, 회색 단계, 기본 시스템 폰트, S02와 같은 목록 행, 바텀시트, 하단 고정 버튼. 건물은 같은 비율의 회색 자리 표시자에 이름.

STORY: 목표를 적는다 → 추천받기 → 초안 중 해볼 것만 체크(필요하면 제목을 그 자리에서 고친다) → 'N개 추가하기' → 목표 상세.

FIRST VIEWPORT (375px): S09는 안내 문구와 목표 제목 입력이 위, 남은 횟수와 '할 일 추천받기'가 아래 고정(키보드 위). S10은 목표 제목과 건물 자리 표시자, 선택 전환 버튼, 초안 목록, 아래 고정 'N개 추가하기'.

FORM: 표준 모바일 입력 화면과 체크 목록. 구성은 screens.md에 고정. seed: none (pinned by brief). 사용자 확인 2026-10-27: "지금과 동일하게 유지해줘" (와이어프레임 단계 동안 구성안 추첨 생략 유지에 동의. 비주얼 단계에서 다시 정한다)

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Decisions made in shape (screens.md 확인 필요에 기록)

- 건물 종류: S10은 바텀시트, S11은 화면의 칩 5개.
- 생성 중 취소는 1회로 센다. 실패와 시간 초과는 세지 않는다. 시간 초과 20초.
- S10 상한 도달 시 다시 만들기 비활성과 '오늘 AI 사용을 모두 썼어요'.
- S11 줄마다 지우기. 다시 만들기는 확인 없이.
