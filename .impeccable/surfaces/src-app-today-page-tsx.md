---
version: 1
slug: "src-app-today-page-tsx"
primary_target: "src/app/today/page.tsx"
related_targets: []
---

# S02 오늘 (`/today`)

## Scope and mode

- Mode: Operate. 앱을 열면 처음 보이는 화면. 한 손, 이동 중, 짧은 사용.
- 범위: S02 본체와 모든 상태, 완료 알림과 실행 취소, 더보기 메뉴, 핵심 교체 시트, 지난 할 일 바텀시트, 빈 화면 카드. S03, S16은 버튼과 빈 시트만 연결한다.
- 기준: `docs/screens.md` S02, S02 빈 화면 카드, 지난 할 일 바텀시트.

## Job

할 일을 탭 한 번으로 완료하고, 자리에서 짧은 알림과 실행 취소만 본다. 몇 초 안에 하나를 끝내고 닫을 수 있어야 한다. 지난 할 일이 있어도 재촉받는 느낌이 없어야 한다.

## Direction contract

THESIS: 오늘 화면은 조용한 할 일 목록이다. 진행 현황은 한 줄 문장이고, 핵심 할 일이 중심이다. 큰 숫자, 차트, 카드 격자, 축하 연출을 거부한다.

OWN-WORLD: 와이어프레임 단계(CLAUDE.md 고정). 흰 바탕, 회색 단계만 쓴다. 기본 시스템 폰트. 구분은 굵기, 크기, 간격, 1px 선으로만. 그래픽은 같은 비율의 회색 자리 표시자.

STORY: 연다 → 핵심 할 일 3개를 본다 → 왼쪽 체크를 누른다 → '+20 크레딧 · 오피스 공사 진행'과 실행 취소를 본다 → 닫는다.

FIRST VIEWPORT (375px): 위에 날짜와 설정. 그 아래 조건부 안내 한 줄, 진행 현황 한 줄, 핵심 할 일 목록. 할 일 추가 버튼은 하단 탭 바로 위에 고정. 알림은 추가 버튼 위.

FORM: 표준 모바일 목록 화면. 화면 구성 순서가 screens.md에 고정되어 있어 구성안 추첨은 하지 않았다. seed: none (pinned by brief). 사용자 확인 2026-10-27: "지금과 동일하게 유지해줘" (와이어프레임 단계 동안 구성안 추첨 생략 유지에 동의. 비주얼 단계에서 다시 정한다)

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Decisions made in shape (screens.md 확인 필요에 기록)

- 지난 할 일 목록은 바텀시트.
- 연달아 완료하면 앞 알림을 새 알림으로 바꾸고, 실행 취소는 마지막 완료에만 적용.
- 완료한 할 일은 알림이 사라질 때 완료 목록으로 옮겨진다.
- 완료는 탭만. 스와이프는 나중에 결정.
- 날짜 바꾸기는 브라우저 기본 날짜 선택기.
- 상태 확인은 개발 서버에서만 `?mock=` 시나리오 전환.
