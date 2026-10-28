---
version: 1
slug: "src-app-tasks-detail-page-tsx"
primary_target: "src/app/tasks/detail/page.tsx"
related_targets: ["src/components/tasks/TaskDetailScreen.tsx"]
---

# S04 할 일 상세

## Scope and mode

- Mode: Operate. 전체 화면 `/tasks/detail?id=`. S02(지금), S12(만들 때 연결)에서 할 일 제목을 눌러 들어온다.
- 범위: S04 화면, 날짜 바꾸기 시트, 나누기 시트, 삭제 확인 시트. 목표 고르기는 S03의 시트를 그대로 쓴다. 핵심이 가득 찼을 때는 S02의 핵심 교체 시트를 그대로 쓴다.
- 기준: `docs/screens.md` S04. 비주얼은 `DESIGN.md`.

## Job

할 일 하나를 고치고 다시 계획한다. 바꾸는 즉시 저장되고, 저장 버튼이 없다. 자주 쓰는 행동(나누기, 삭제, 완료 취소)은 엄지가 닿는 아래쪽에 둔다.

## Direction contract

THESIS: 제목 한 줄과 설정 줄 몇 개. 폼 화면, 저장 버튼, '수정 완료' 확인, 섹션 카드 묶음을 거부한다. 고르기 줄과 스위치는 S03과 같은 모양이다.

OWN-WORLD: DESIGN.md의 와이어프레임 시스템. 고르기 줄(이름 왼쪽, 값 오른쪽, 꺾쇠), 스위치, 48px 입력칸, 바텀시트, 하단 행동 영역, 안내 칸.

STORY: 오늘 화면에서 제목을 누른다 → 제목을 고치고 화면을 누르면 저장된다 → 날짜 줄을 눌러 내일로 옮긴다 → 너무 큰 할 일은 나누기로 두세 개로 쪼갠다 → 오늘 화면으로 돌아오고 '할 일 3개로 나눴어요'.

FIRST VIEWPORT (375px): 뒤로 가기, 고칠 수 있는 제목(크게), (완료한 할 일이면 안내 칸), 날짜 줄, 핵심 할 일 스위치, 연결 목표 줄, 매일 반복 스위치, 메모 입력칸, 하단 고정 [삭제][나누기].

FORM: 표준 모바일 상세 화면. 구성은 screens.md에 고정. seed: none (pinned by brief). 사용자 확인 2026-10-27: "지금과 동일하게 유지해줘" (와이어프레임 단계 동안 구성안 추첨 생략 유지에 동의. 비주얼 단계에서 다시 정한다)

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Decisions

- 확정(2026-10-28, 사용자): 새 이름 `Task.memo`, `TaskDetail`, `deleteTask`. 완료한 할 일은 날짜, 핵심, 연결 목표, 나누기를 잠근다(제목, 메모, 반복만 고친다). 나누기와 삭제 뒤에는 이전 화면으로 돌아가 알림을 보여준다. 수정은 바꾸는 즉시 저장한다(제목, 메모는 입력칸을 벗어날 때).
- 완료한 할 일: 위에 안내 칸 '오늘 완료했어요' 또는 '10월 26일에 완료했어요'. 당일이면 하단의 나누기 자리가 '완료 취소'가 된다. 잠긴 날짜와 목표는 꺾쇠 없는 읽기 줄로 보여준다(값은 흐리게 하지 않는다).
- 날짜 바꾸기 시트: S03과 같은 날짜 칩(오늘 · 내일 · 날짜 선택 · 날짜 없음). 오늘, 내일, 날짜 없음은 누르면 바로 저장하고 닫는다. 날짜 선택은 날짜를 고른 뒤 '바꾸기'.
- 핵심 지정: 그 날짜의 핵심이 이미 3개면 S02의 핵심 교체 시트.
- 저장 실패: 바꾼 값을 되돌리고 알림 '저장하지 못했어요'와 다시 시도.
- 확인 필요(screens.md에 올림): 나눈 새 할 일은 일반 할 일로 만들고 반복과 메모는 물려주지 않는다. 날짜 없는 할 일의 매일 반복. 완료한 할 일 삭제 시 공사 진행도 그대로 둔다.
