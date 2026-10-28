---
version: 1
slug: "src-app-village-page-tsx"
primary_target: "src/app/village/page.tsx"
related_targets: []
---

# S05 마을 (`/village`)

## Scope and mode

- Mode: Operate (하단 탭 화면. 보상과 감상의 공간이지만 행동은 집 들어가기, 건물 보기).
- 범위: S05. 집 → S06, 이름표 → S12(자리 표시자), 'AI로 목표 만들기' → S09.
- 기준: `docs/screens.md` S05. 비주얼은 `DESIGN.md`.

## Job

실행이 쌓인 결과를 숫자보다 건물로 본다. 쉬었다 돌아와도 줄어든 것이 없다.

## Direction contract

THESIS: 마을 그림이 화면의 전부다. 통계, 목록, 랭킹, 연속 기록, 화면을 덮는 연출을 거부한다. 단계가 오른 건물에만 짧은 움직임.

OWN-WORLD: DESIGN.md의 와이어프레임 시스템. 마을은 3:4 회색 자리 표시자, 집과 건물은 회색 상자에 이름과 단계. 상태는 색 대신 글자('공사 중지')로.

STORY: 마을 탭 → 자란 건물을 본다 → 건물을 눌러 목표와 공사 진행을 본다 → 집을 눌러 들어간다.

FIRST VIEWPORT (375px): 상단 바(마을, 크레딧 잔액). 3:4 마을 그림이 폭 가득, 가운데 집, 둘레 8곳에 건물. 이름표는 마을 그림 아래쪽 띠. 하단 탭.

FORM: 표준 모바일 탭 화면과 이미지 위 핫스팟. 구성은 screens.md에 고정. seed: none (pinned by brief). 사용자 확인 2026-10-27: "지금과 동일하게 유지해줘" (와이어프레임 단계 동안 구성안 추첨 생략 유지에 동의. 비주얼 단계에서 다시 정한다)

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Decisions

- 확정(2026-10-27): 마을 그림 3:4 세로 한 장. 마지막으로 본 단계는 서버에 저장(`lastSeenStage`).
- 확인 필요: 터 8곳을 넘을 때, 이름표 문구와 위치.
