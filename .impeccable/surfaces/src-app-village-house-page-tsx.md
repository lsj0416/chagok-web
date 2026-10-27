---
version: 1
slug: "src-app-village-house-page-tsx"
primary_target: "src/app/village/house/page.tsx"
related_targets: []
---

# S06 집 내부 · S07 가구 상점 (`/village/house`)

## Scope and mode

- Mode: Operate (보상과 감상의 공간이지만 행동은 사고, 놓고, 넓히기).
- 범위: S06, S07 시트, 설치된 가구 메뉴, 넓히기 확인 시트. S05 마을은 자리 표시자에 집 링크만.
- 기준: `docs/screens.md` S06, S07. 비주얼은 `DESIGN.md`.

## Job

모은 크레딧으로 가구를 사서 정해진 자리에 놓고, 조건이 차면 집을 넓힌다. 가구를 하나 더 사려면 무엇을 하면 되는지가 바로 보여야 한다.

## Direction contract

THESIS: 방이 화면의 주인공이고, 숫자는 그 아래 두 줄이다. 상점 격자, 화폐 연출, 기간 한정 배지, 가격 강조를 거부한다.

OWN-WORLD: DESIGN.md의 와이어프레임 시스템. 방은 1:1 회색 자리 표시자, 가구는 회색 상자에 이름, 빈 자리는 44px 원 안의 +.

STORY: 집에 들어온다 → 빈 자리 +를 누른다 → 놓을 수 있는 가구 중 하나를 고른다 → 구매하고 설치 → 가구 수가 차면 넓히기.

FIRST VIEWPORT (375px): 상단 바(뒤로 가기, 집 단계 이름, 크레딧 잔액). 1:1 방 그림이 폭 가득. 그 아래 업그레이드 영역(다음 단계 이름, 가구 n/m, 크레딧 n/m, 넓히기 버튼).

FORM: 표준 모바일 상세 화면과 바텀시트. 구성은 screens.md에 고정. seed: none (pinned by brief). 사용자 확인 2026-10-27: "지금과 동일하게 유지해줘" (와이어프레임 단계 동안 구성안 추첨 생략 유지에 동의. 비주얼 단계에서 다시 정한다)

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Decisions

- 확정(2026-10-27): 한 번 산 가구는 빼도 업그레이드 조건의 가구 수에 남는다. 방 그림 비율 1:1.
- 확인 필요: 넓힌 뒤 알림, 잔액 마이너스 이유 문구, 보유 가구 먼저, 로딩·불러오기 실패는 S02 방식.
- 슬롯 종류는 미정. 가짜 데이터의 임시 값만 쓴다 (CLAUDE.md 미정 항목).
