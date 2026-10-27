---
version: 1
slug: "src-app-goals-detail-page-tsx"
primary_target: "src/app/goals/detail/page.tsx"
related_targets: ["src/components/goals/GoalListScreen.tsx","src/components/goals/GoalDetailScreen.tsx"]
---

# S08 목표 목록 · S12 목표 상세

## Scope and mode

- Mode: Operate. S08은 하단 탭 화면 `/goals`, S12는 전체 화면 `/goals/detail?id=`.
- 범위: S08, S12, S12의 더보기·목표 수정·목표 완료·보관 시트, S12에서 여는 S03, S09·S10의 '이 목표에 더하기' 모드.
- 기준: `docs/screens.md` S08, S12. 비주얼은 `DESIGN.md`.

## Job

S08: 목표를 상태별로 보고 새 목표를 만든다. S12: 목표에 연결된 할 일을 관리하고, 사용자가 원할 때 목표를 완료하거나 보관한다.

## Direction contract

THESIS: 목록은 줄, 상세는 건물 그림과 할 일 목록. 달성률 퍼센트, 진행 막대, 마감 경고, 카드 묶음을 거부한다. 진행은 '할 일 3/8' 개수로만 쓴다.

OWN-WORLD: DESIGN.md의 와이어프레임 시스템. 선택 칩 필터, 그래픽 자리 표시자, S02 할 일 줄, 안내 칸, 하단 행동 영역, 바텀시트.

STORY: 목표 탭 → 목표 줄을 누른다 → 건물과 할 일을 본다 → 날짜 없는 할 일을 '오늘로' → 모두 마치면 '목표를 완료할까요?' → 완료하면 '오피스가 완성됐어요'.

FIRST VIEWPORT (375px): S08은 필터 칩 한 줄과 목표 줄 4개, 아래 '새 목표'와 하단 탭. S12는 건물 그림, 목표 이름과 기한·완료 조건·할 일 개수, 안내 칸(있으면), 할 일 목록, 아래 [할 일 추가][더보기].

FORM: 표준 모바일 목록과 상세. 구성은 screens.md에 고정. seed: none (pinned by brief). 사용자 확인 2026-10-27: "지금과 동일하게 유지해줘" (와이어프레임 단계 동안 구성안 추첨 생략 유지에 동의. 비주얼 단계에서 다시 정한다)

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Decisions

- 2026-10-28 사용자: "와이어프레임 부분은 너가 판단해서 쭉 끝내면 좋겠어". 이 화면의 결정은 권장안으로 정하고 screens.md 확인 필요 표에 올렸다.
- 새 이름(확인 필요): GoalSummary, GoalDetail, UpdateGoalRequest, RemainingTaskAction, updateGoal, completeGoal, archiveGoal, resumeGoal, addGoalTasks.
