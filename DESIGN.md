---
name: chagok (공사 안내판)
description: 장기 목표를 할 일로 나누고 완료할 때마다 마을이 자라는 목표 실행 서비스. 목표마다 공사 현장이 있고 할 일 하나가 공정 하나인 세계
colors:
  sign: "#1f4fa3"
  sign-ink: "#ffffff"
  sign-2: "#d5e1f6"
  caution: "#f2c230"
  ink: "#18202b"
  ink-2: "#434a56"
  ink-3: "#5b6270"
  line: "#e6e3dc"
  line-strong: "#878c95"
  surface: "#ffffff"
  surface-2: "#f4f3ef"
  surface-3: "#e8e6e0"
  placeholder: "#d6d6d6"
  backdrop: "rgb(24 32 43 / 0.45)"
typography:
  display:
    fontFamily: "Do Hyeon, Gothic A1, ui-sans-serif, sans-serif"
    fontSize: "32px"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "0em"
  headline:
    fontFamily: "Do Hyeon, Gothic A1, ui-sans-serif, sans-serif"
    fontSize: "22px"
    fontWeight: 400
    lineHeight: 1.375
    letterSpacing: "0em"
  title:
    fontFamily: "Do Hyeon, Gothic A1, ui-sans-serif, sans-serif"
    fontSize: "20px"
    fontWeight: 400
    letterSpacing: "0em"
  button-display:
    fontFamily: "Do Hyeon, Gothic A1, ui-sans-serif, sans-serif"
    fontSize: "19px"
    fontWeight: 400
    letterSpacing: "0em"
  section:
    fontFamily: "Do Hyeon, Gothic A1, ui-sans-serif, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    letterSpacing: "0em"
  body:
    fontFamily: "Gothic A1, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.375
  body-sm:
    fontFamily: "Gothic A1, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
  label:
    fontFamily: "Gothic A1, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
  caption:
    fontFamily: "Gothic A1, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
  tab-label:
    fontFamily: "Gothic A1, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 400
rounded:
  sm: "2px"
  md: "3px"
  lg: "4px"
  xl: "4px"
  2xl: "6px"
  full: "9999px"
spacing:
  inset-list: "8px"
  inset-panel: "16px"
  sign-gap: "16px"
  gutter: "20px"
  section-gap: "24px"
  touch: "44px"
  cta: "52px"
  bar: "56px"
  app-max-width: "430px"
components:
  sign-band:
    backgroundColor: "{colors.sign}"
    textColor: "{colors.sign-ink}"
    typography: "{typography.headline}"
    padding: "0 8px"
    height: "56px"
  button-primary-bar:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    typography: "{typography.button-display}"
    rounded: "0px"
    height: "52px"
    width: "100%"
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "0px"
    padding: "0 16px"
    height: "48px"
  button-outline:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "0 16px"
    height: "48px"
  button-tonal:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    height: "48px"
  button-text:
    textColor: "{colors.ink-2}"
    typography: "{typography.body-sm}"
    padding: "0 12px"
    height: "44px"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "44px"
  chip-selected:
    backgroundColor: "{colors.sign}"
    textColor: "{colors.sign-ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "44px"
  check-done:
    backgroundColor: "{colors.sign}"
    textColor: "{colors.sign-ink}"
    rounded: "{rounded.full}"
    size: "22px"
  check-select:
    backgroundColor: "{colors.sign}"
    textColor: "{colors.sign-ink}"
    rounded: "{rounded.md}"
    size: "22px"
  stage-meter-filled:
    backgroundColor: "{colors.caution}"
    height: "5px"
  stage-meter-paused:
    backgroundColor: "{colors.line-strong}"
    height: "5px"
  stage-meter-empty:
    backgroundColor: "{colors.surface-3}"
    height: "5px"
  hoarding-strip:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    padding: "12px 10px 10px"
  notice-panel:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.xl}"
    padding: "12px 16px"
  empty-card:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.2xl}"
    padding: "20px 16px 16px"
  toast:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.xl}"
    padding: "6px 6px 6px 16px"
  bottom-sheet:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.2xl}"
    padding: "0 20px 20px"
  tab-bar:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-3}"
    typography: "{typography.tab-label}"
    height: "56px"
  tab-active:
    textColor: "{colors.sign}"
    typography: "{typography.tab-label}"
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "0 12px"
    height: "48px"
  switch-on:
    backgroundColor: "{colors.sign}"
    rounded: "{rounded.full}"
    width: "48px"
    height: "28px"
  graphic-placeholder:
    backgroundColor: "{colors.placeholder}"
    textColor: "{colors.ink-2}"
    typography: "{typography.caption}"
    rounded: "{rounded.lg}"
---

# Design System: chagok (공사 안내판)

> 이 문서는 비주얼 단계(2026-10-28, 방향 '공사 안내판', seed:aa5e64985ad9cf17)에서 빌드된 코드를 기준으로 기록한다. 값의 원본은 `src/app/globals.css`의 `@theme`와 `src/app/layout.tsx`의 서체 설정이다. 화면 코드는 토큰 이름(`sign`, `ink`, `surface-2` 등)만 쓴다. 와이어프레임 단계의 회색 시스템을 대체한다.

## Overview

**Creative North Star: "공사 안내판"**

목표마다 공사 현장이 있고, 할 일 하나가 공정 하나다. 화면은 현장 입구의 안내판과 가림막처럼 읽힌다. 모든 화면의 머리는 파란 안내판 띠에 흰 안내판 글자(Do Hyeon)로 제목을 쓰고, 그 아래를 안전 노랑 줄이 막는다. 본문은 흰 가림막 패널과 콘크리트 쪽으로 살짝 데운 회색 면 위의 목록이다. 파스텔 게임 투두와 흰 미니멀 목록 둘 다 거부한다.

색은 세 가지 일만 나눠 맡는다. 파랑은 '안내와 확정'(머리 띠, 완료 체크, 선택, 활성 탭, 포커스, 켠 스위치), 노랑은 '공정 진행'(공정 막대, 안내판과 먹색 버튼 아래 줄), 먹색은 '대표 행동'(채움 버튼, 알림). 판과 버튼은 각지고(0~4px), 원은 완료 체크와 스위치처럼 원이어야 하는 것에만 남는다.

한 손, 이동 중, 몇 초 안에 하나를 끝내는 밀도는 그대로다. 자주 쓰는 행동은 엄지가 닿는 아래쪽에 모이고, 진행은 큰 숫자 하나(안내판의 '핵심 1/3')와 3칸 공정 막대로만 말한다. 마을, 건물, 집, 가구 그림은 3D 렌더가 준비될 때까지 같은 비율의 회색 상자와 이름으로 둔다.

**Key Characteristics:**
- 파란 안내판 띠(흰 제목, 아래 3px 노랑 줄)가 모든 화면의 머리
- 제목은 Do Hyeon(굵기 하나), 본문은 Gothic A1(400/600/700)
- 노랑은 공정 막대와 아래 줄에만, 글자색으로 쓰지 않는다
- 먹색 채움 버튼은 언제나 각진 모서리와 노랑 아래 줄
- 3칸 공정 막대(터·골조·완성)가 건물이 보이는 모든 곳의 공통 표지
- 둥근 체크는 완료, 네모 체크는 선택
- 그림 자리는 회색 자리 표시자 그대로

## Colors

공사 안내판 파랑과 안전 노랑 두 색이 데운 중성 회색 위에 놓인다. 대비 수치는 도구로 쟀다(WCAG 2.1 AA).

### Primary
- **안내판 파랑 (sign)**: 화면 머리 띠와 로그인 머리, 완료 체크 채움, 선택 칩과 네모 체크와 라디오, 활성 탭 글자와 위쪽 막대, 켠 스위치 트랙, 고른 건물 테두리, 포커스 링, 입력 커서. 흰 글자 대비 7.76:1, 흰 바탕 위 파랑도 7.76:1. 안드로이드 상태 표시줄 색(`themeColor`)도 같은 값이라 띠가 상태 표시줄까지 이어진다.
- **안내판 글자 (sign-ink)**: 파랑 위 제목, 숫자, 아이콘. 파랑 띠 안의 포커스 링도 이 색으로 바뀐다.
- **안내판 보조 글자 (sign-2)**: 파랑 위 보조 문장('오늘 2/8 완료', 크레딧 이름, 로그인 소개). 파랑 위 5.89:1. 텍스트 선택 바탕도 이 색.

### Secondary
- **안전 노랑 (caution)**: 공정 막대의 채운 칸, 안내판 띠 아래 3px 줄, 먹색 버튼 아래 줄. 흰 바탕 대비 1.68:1이라 글자로 읽히지 않는다. 그래서 글자색으로 쓰지 않는다.

### Neutral
- **먹색 (ink)**: 본문 글자(흰 바탕 16.4:1), 대표 버튼 채움, 알림 바탕.
- **진회색 (ink-2)**: 섹션 안 소제목, 보조 버튼 글자, 그림 자리 이름(자리 회색 위 6.14:1), 오프라인 띠 바탕.
- **중회색 (ink-3)**: 목표 이름, 날짜, 완료한 할 일 제목, 비활성 탭, 더보기 아이콘, 끈 스위치 테두리. 흰 바탕 6.13:1, 옅은 면 위 5.52:1. 본문 대비 기준을 넘는 가장 옅은 글자색.
- **선 (line)**: 목록 사이, 탭 바 위, 가림막 패널 사이의 1px 선.
- **진한 선 (line-strong)**: 비어 있는 체크 원, 입력 칸과 테두리 버튼과 칩의 테두리, 시트 손잡이, 멈춘 공정 막대. 흰 바탕 3.38:1.
- **흰 면 (surface)**: 앱 기둥, 할 일 목록, 바텀시트, 테두리 버튼.
- **콘크리트 면 (surface-2)**: 건물 띠 바탕, 안내 칸, 빈 화면 카드, 보조 버튼, 넓은 화면의 앱 바깥.
- **더 짙은 콘크리트 (surface-3)**: 공정 막대의 빈 칸, 로딩 뼈대, 끈 스위치 트랙, 마을 위 건물과 가구 상자.
- **자리 표시 회색 (placeholder)**: 마을, 건물, 집, 가구 그림 자리. 세계의 색과 상관없이 회색으로 둔다.
- **덮개 (backdrop)**: 바텀시트 뒤를 덮는 반투명 먹색(45%).

### Named Rules
**The Three Jobs Rule.** 파랑은 안내와 확정(완료, 선택, 활성, 포커스, 켬), 노랑은 공정 진행과 아래 줄, 먹색은 대표 행동. 한 색이 다른 색의 일을 하지 않는다.

**The Caution-Never-Text Rule.** 노랑은 막대와 줄로만 쓴다. 글자, 아이콘, 배지 채움으로 쓰지 않는다.

**The Grey-Art Rule.** 그림 자리는 `placeholder` 회색 상자와 이름뿐이다. 파랑이나 노랑으로 칠하지 않고 일러스트나 아이콘으로 대신 그리지 않는다(CLAUDE.md 규칙 7).

**The Token-Only Rule.** 화면 코드에는 색 값을 직접 쓰지 않고 토큰 이름만 쓴다. 예외는 `layout.tsx`의 `themeColor`(메타데이터라 토큰을 읽지 못한다)로, `sign`과 같은 값을 유지한다.

## Typography

**Display Font:** Do Hyeon (Gothic A1, ui-sans-serif로 대체). 굵기 400 하나.
**Body Font:** Gothic A1 (ui-sans-serif, system-ui로 대체). 굵기 400, 600, 700, 800을 받는다.

둘 다 `next/font`로 빌드할 때 받아 앱 안에서 제공한다(`display: swap`). 한국어 줄바꿈은 단어 단위(`word-break: keep-all`).

**Character:** 안내판에 찍힌 듯한 좁고 굵은 제목 글자와, 오래 읽어도 편한 고딕 본문의 짝. 제목 글자는 굵기가 하나뿐이라 크기로만 위계를 나눈다.

### Hierarchy
- **Display** (Do Hyeon, 32px, 줄 높이 1.25): 로그인 안내판의 서비스 이름 하나.
- **Headline** (Do Hyeon, 22px, 줄 높이 1.375): 안내판 띠의 화면 제목. 오늘 화면 안내판의 큰 숫자('핵심 1/3')도 22px Do Hyeon(줄 높이 1).
- **Title** (Do Hyeon, 20px): 바텀시트 제목, '찾을 수 없어요' 같은 화면 안 큰 제목.
- **Button display** (Do Hyeon, 19px): 하단에 붙은 대표 버튼 글자('할 일 추가').
- **Section** (Do Hyeon, 18px): 목록 섹션 제목('핵심 할 일', '날짜 있는 할 일'), 빈 화면 제목, 문장 요약. 건물 띠의 건물 이름은 16px Do Hyeon.
- **Body** (Gothic A1 400, 16px, 줄 높이 1.375): 할 일 제목(최대 두 줄), 입력 칸, 스위치와 고르기 줄 이름. 목표 제목은 600.
- **Body small** (Gothic A1 400, 15px): 안내 칸 문장, 알림 문장, 칩, 시트 안 버튼(600).
- **Label** (Gothic A1 600, 14px): 버튼 글자, 소제목(진회색). 같은 크기 400은 시트 설명과 보조 문장.
- **Caption** (Gothic A1 400, 13px): 할 일 아래 목표 이름, 단계 이름, 그림 자리 이름(중회색, 한 줄 말줄임).
- **Tab label** (Gothic A1 400, 활성은 700, 11px): 하단 탭 이름.

### Named Rules
**The Sign-Letter Rule.** `h1`, `h2`는 전역 규칙으로 Do Hyeon 400이고 `font-synthesis: none`이다. 굵게 합성하지 않는다. 더 강조하려면 크기를 올린다.

**The Tabular Rule.** 개수와 날짜 숫자(`1/5`, `할 일 3/8`, 크레딧)는 `tabular-nums`로 자리를 맞춘다.

## Layout

- **한 열, 최대 430px.** 앱은 가운데 정렬된 흰 기둥이고 넓은 화면에서는 기둥 바깥이 콘크리트 면이다. 360px, 375px, 430px에서 같은 구조로 늘고 준다.
- **안내판 띠.** 최소 높이 56px, 좌우 8px 안쪽에 44px 뒤로 가기(또는 12px 빈칸), 제목, 오른쪽 행동 하나(설정 아이콘, 크레딧). 보조 줄이 있으면 제목 아래 좌우 20px, 아래 12px. 띠는 상태 표시줄 안전 영역까지 파랑으로 채운다. 띠 아래는 16px을 띄운다. 오늘 화면만 예외로 가림막(건물 띠)이 노랑 줄 바로 아래에 붙는다.
- **좌우 여백 두 가지.** 글자만 있는 줄(섹션 제목, 보너스 줄, 목표 상세 본문)은 20px, 면이 있는 덩어리(안내 칸, 카드, 하단 버튼)는 16px. 할 일 목록은 8px 안쪽에 44px 체크 영역이 붙어 체크 원과 글자가 20px 선에 맞는다.
- **섹션 사이 24px.** 섹션 제목 위 24px, 안내 칸 위 12px, 보너스 줄 위 20px.
- **아래쪽 고정 영역.** 탭 화면은 아래에서부터 하단 탭(56px + 안전 영역), 대표 버튼(52px), 알림. 전체 화면은 흰 바탕에 위쪽 1px 선이 있는 하단 행동 영역(좌우 16px, 위 12px)을 아래에 붙이고, 키보드가 열려도 키보드 위에 남는다.

**The Every-Screen-Has-A-Sign Rule.** 모든 화면은 안내판 띠로 시작하고 띠에는 언제나 제목이 있다(상세 화면은 '할 일', 목표 이름, 목표 입력 질문). 제목을 비운 띠는 없다.

**The Thumb-Zone Rule.** 자주 쓰는 행동과 그 결과(대표 버튼, 알림, 바텀시트)는 아래쪽에 둔다. 위쪽 띠에는 설정처럼 드물게 누르는 것만 둔다.

**The 44px Rule.** 누르는 대상은 모두 최소 44px. 눈에 보이는 체크는 22px이지만 누르는 영역은 44px이다.

## Elevation & Depth

기본은 평평하다. 면의 구분은 콘크리트 면 채움, 1px 선, 그리고 안내판의 노랑 줄로 한다. 그림자는 내용 위에 떠서 다른 것을 가리는 두 요소에만 있다.

### Shadow Vocabulary
- **시트 그림자** (`box-shadow: 0 -4px 24px rgb(24 32 43 / 0.16)`): 아래에서 올라온 바텀시트의 위쪽 가장자리. 뒤에 덮개가 깔린다.
- **알림 그림자** (`box-shadow: 0 4px 16px rgb(0 0 0 / 0.18)`): 목록 위에 뜨는 알림.
- **스위치 손잡이** (`box-shadow: 0 1px 2px rgb(0 0 0 / 0.2)`): 트랙 위 흰 손잡이가 보이게 하는 최소한의 깊이. 유일한 예외.

### Named Rules
**The Floating-Only Rule.** 그림자는 바텀시트와 알림에만 쓴다(스위치 손잡이만 예외). 카드, 버튼, 이름표, 건물 띠는 그림자 없이 채움과 선으로 나눈다. 먹색 버튼의 노랑 아래 줄은 그림자가 아니라 테두리다.

## Shapes

안내판과 가림막은 각진 판이다. `@theme`가 둥글기 단계를 줄여 덮어쓴다.

- **각진 모서리 (0px):** 안내판 띠, 먹색 채움 버튼, 공정 막대 칸, 가림막 패널.
- **아주 작은 둥글기 (2px, sm):** 로딩 뼈대의 글자 막대.
- **작은 둥글기 (3px, md):** 칩, 네모 체크, 마을 위 건물 상자.
- **보통 둥글기 (4px, lg·xl):** 테두리 버튼, 보조 버튼, 입력 칸, 안내 칸, 알림, 그림 자리, 마을 이름표.
- **큰 둥글기 (6px, 2xl):** 빈 화면 카드, 바텀시트 위쪽 두 모서리.
- **원:** 완료 체크, 라디오, 스위치 트랙과 손잡이, 아이콘 버튼의 누르는 영역, 시트 손잡이(36×4px), 가구 빈 자리.

**The Round-Means-Done Rule.** 둥근 체크는 완료, 네모 체크(3px)는 선택이다. 두 모양을 바꿔 쓰지 않는다.

## Components

### Buttons
판처럼 각지고, 대표 행동은 아래에 노랑 줄을 단다.
- **하단 대표 버튼:** 먹색 채움, 각진 모서리, 아래 4px 노랑 줄, 높이 52px, 전체 폭, 흰 Do Hyeon 19px('할 일 추가', '구글로 계속하기', 하단 행동 영역의 주요 버튼).
- **본문 먹색 버튼:** 먹색 채움, 각진 모서리, 아래 3px 노랑 줄, 높이 44~48px, 흰 Gothic A1 14~16px 600('다시 시도', '옮기기', 'AI로 목표 만들기', 안내 칸의 첫 행동).
- **테두리 버튼:** 흰 채움, 진한 선 1px, 4px 둥글기, 먹색 600 글자. 아래에 같은 일을 하는 대표 버튼이 있으면 본문의 같은 행동은 이 형태로 낮춘다(목표 상세 빈 상태의 'AI로 할 일 추가', '직접 추가'). 안내 칸의 둘째 행동도 이 형태.
- **보조 버튼:** 콘크리트 면 채움, 진회색 600 글자, 테두리 없음, 4px 둥글기. 시트 안 '취소'처럼 같은 무게의 선택지.
- **글자 버튼:** 채움과 테두리 없이 15px 600 진회색, 높이 44px.
- **아이콘 버튼:** 44px 원형 누르는 영역, 아이콘 20~24px, 채움 없음.
- **비활성:** 모두 투명도 40%. 색을 따로 바꾸지 않는다.
- **Focus:** 파랑 2px 윤곽선, 2px 띄움. 파랑 띠 안에서는 흰 윤곽선.

**The Yellow-Underline Rule.** 먹색 채움 버튼은 언제나 각진 모서리와 노랑 아래 줄(하단 대표 4px, 본문 3px)을 함께 가진다. 줄 없는 먹색 버튼이나 둥근 먹색 버튼은 없다.

**The One-Ink-Per-Job Rule.** 화면 아래 대표 버튼과 같은 일을 하는 본문 버튼은 먹색으로 채우지 않고 테두리 버튼으로 낮춘다.

### Chips
- **Style:** 흰 채움, 진한 선 1px, 3px 둥글기, 높이 44px, 15px 글자, 좌우 14px.
- **행동 칩:** 빠른 추가 칩. 선택 상태 없이 누르면 바로 행동한다.
- **선택 칩:** 하나만 고르는 묶음(radiogroup). 선택되면 파랑 채움, 흰 글자 600.

### Cards / Containers
- **안내 칸:** 콘크리트 면, 4px 둥글기, 최소 높이 48px, 15px 문장. 누를 수 있으면 오른쪽 꺾쇠, 행동이 있으면 오른쪽 테두리 버튼.
- **빈 화면 카드:** 콘크리트 면, 6px 둥글기, 18px Do Hyeon 제목 아래 14px 600 소제목 묶음.
- **Shadow Strategy:** 없음(Elevation 참조).

### Inputs / Fields
- **Style:** 흰 채움, 진한 선 1px, 4px 둥글기, 높이 48px, 16px 글자(모바일 확대 방지), 파랑 커서. 날짜는 브라우저 기본 날짜 선택기.
- **제자리 고치기:** 초안 제목처럼 그 자리에서 고칠 때는 파랑 1px 테두리 입력 칸으로 바뀐다.
- **Focus:** 공통 파랑 윤곽선.

### Navigation
- **안내판 띠 (화면 머리):** 파랑 바탕, 아래 3px 노랑 줄, 22px Do Hyeon 흰 제목, 흰 아이콘. 날짜나 제목 위에 작은 이름표(eyebrow)를 두지 않는다.
- **하단 탭:** 흰 바탕, 위쪽 1px 선, 높이 56px에 4칸, 22px 선 아이콘 위 11px 이름. 활성 탭은 파랑 글자 700, 아이콘 선 2.2, 칸 위쪽 안쪽에 3px 파랑 막대. 비활성은 중회색, 선 1.8.

### 공정 막대 (Stage Meter)
이 세계의 시그니처. 터·골조·완성 세 칸(높이 5px, 칸 사이 3px, 각진 모서리)에서 지금 단계까지 노랑으로 채우고 남은 칸은 짙은 콘크리트(surface-3). 보관한 목표(공사 중지)는 채운 칸을 진한 선 색으로 바꾼다. 단계 이름 글자가 옆에 늘 함께 있어 막대는 스크린 리더가 읽지 않는다(색만으로 말하지 않는다). 건물 띠, 목표 줄(폭 96px), 목표 상세 그림 아래(전체 폭), 마을 이름표(폭 96px)에 같은 모양으로 쓴다.

### 가림막 건물 띠 (Hoarding Strip)
오늘 화면의 안내판 바로 아래에 붙는 띠. 콘크리트 면 바탕, 아래 1px 선. 건물마다 가림막 패널 한 칸: 위쪽에 높이 5px 파랑·흰 점선 띠(파랑 14px, 흰 6px 반복), 패널 사이 1px 선, 안쪽 10~12px. 칸 안에 1:1 그림 자리, 16px Do Hyeon 건물 이름, 공정 막대, 13px 중회색 단계. 세 칸까지 폭을 나누고 넘치면 가로로 넘긴다(칸 최소 31%). 누르면 마을로 간다. 불러오지 못하면 띠를 숨기고 할 일 목록을 가리지 않는다.

### 할 일 줄 (Task Row)
목록의 기본 단위. 왼쪽 44px 체크 영역(22px 원, 2px 진한 선), 가운데 16px 제목(최대 두 줄)과 13px 목표 이름, 오른쪽 44px 더보기. 완료하면 원이 파랑으로 채워지고 흰 체크가 들어가며, 제목은 중회색 취소선이 된다. 완료한 줄은 더보기 자리를 빈칸으로 남겨 정렬을 유지한다. 줄 사이 1px 선. 길게 누르면 더보기 시트가 열린다. 목표 상세에서는 더보기 대신 '오늘로' 글자 버튼.

### 초안 줄 (Draft Row)
AI 추천 할 일을 고르는 줄. 할 일 줄과 같은 44px 영역에 네모 체크(22px, 3px 둥글기, 2px 진한 선). 선택하면 파랑 채움과 흰 체크. 제목을 누르면 그 자리에서 파랑 테두리 입력 칸이 된다.

### 스위치 (Switch)
줄 전체가 누르는 영역(최소 48px), 왼쪽 16px 이름과 13px 중회색 보조 문장, 오른쪽 48×28px 트랙. 켜면 파랑 트랙, 끄면 짙은 콘크리트 트랙에 중회색 1px 안쪽 테두리. 손잡이는 흰 24px 원(150ms 이동). 비활성이면 이름과 트랙만 40%, 보조 문장(비활성 이유)은 그대로 읽힌다.

### 고르기 줄과 라디오 (Picker Row)
다른 시트를 여는 한 줄(최소 48px, 16px 이름, 오른쪽 15px 현재 값과 꺾쇠). 시트 안 라디오는 22px 원, 고르면 파랑 테두리와 가운데 파랑 점. 가구 상점 줄은 고르면 파랑 채움과 흰 체크.

### 목표 줄 (Goal Row)
카드로 감싸지 않고 1px 선으로 나눈다. 왼쪽 56px 그림 자리, 가운데 16px 600 제목(두 줄까지), 13px 중회색 '오피스 · 터 · 12월 27일까지', 그 아래 공정 막대(96px). 오른쪽 14px 진회색 '할 일 3/8'(개수만). 줄 전체가 링크.

### 마을 그림 (Village)
3:4 그림 자리 위에 임시 좌표로 집(96px)과 건물(64px, 3px 둥글기, 진한 선 1px, 짙은 콘크리트 채움)을 놓는다. 고른 건물은 2px 파랑 테두리. 아래쪽 안쪽 12px에 흰 이름표(진한 선 1px, 4px 둥글기, 최소 56px): 15px 600 목표 이름, 13px 진회색 공사 진행, 공정 막대, 꺾쇠. 단계가 오른 뒤 첫 진입에만 그 건물 상자가 600ms 동안 1.14배로 커졌다 돌아온다(300ms 지연). 앱의 유일한 보상 움직임이다.

### 바텀시트 (Bottom Sheet)
네이티브 dialog. 폭은 앱 기둥과 같고 최대 높이는 보이는 화면의 85%, 키보드가 열리면 키보드 위에 붙는다. 위쪽 6px 둥글기, 36×4px 손잡이, 20px Do Hyeon 제목, 14px 중회색 설명, 스크롤되는 내용(좌우 20px). 280ms 동안 아래에서 올라오며 덮개가 함께 짙어진다. 열리면 제목이 초점을 받고 링을 그리지 않는다(파랑 링이 '선택됨'으로 보이지 않게). 바로 입력하는 시트만 `data-autofocus` 입력 칸이 초점을 받는다.

### 알림 (Toast)
먹색 바탕, 흰 15px 문장, 4px 둥글기, 최소 48px. 실행 취소는 오른쪽 44px 밑줄 글자 버튼. 대표 버튼 바로 위에 뜨고 240ms 동안 8px 아래에서 떠오른다. 새 알림은 앞 알림을 바꾼다.

### 그래픽 자리 표시자 (Graphic Placeholder)
마을, 건물, 집, 가구 그림 자리. 최종 그림과 같은 비율의 자리 표시 회색 상자, 4px 둥글기, 가운데 13px 진회색 이름.

### 상태 표시
- **로딩:** 짙은 콘크리트 뼈대. 건물 띠도 같은 가림막 칸 모양의 뼈대.
- **오류:** 콘크리트 면 안내 칸에 15px 문장과 본문 먹색 버튼 '다시 시도'.
- **오프라인:** 화면 위에 붙는 진회색 띠, 흰 14px 문장.

## Do's and Don'ts

### Do:
- **Do** 모든 화면을 파란 안내판 띠(제목 필수, 아래 3px 노랑 줄)로 시작하고 띠 아래를 16px 띄운다. 오늘 화면만 건물 띠를 바로 붙인다.
- **Do** 먹색 채움 버튼은 각진 모서리와 노랑 아래 줄(하단 대표 4px, 본문 3px)로 만든다.
- **Do** 아래 대표 버튼과 같은 일을 하는 본문 버튼은 테두리 버튼으로 낮춘다.
- **Do** 완료, 선택, 활성 탭, 포커스, 켠 스위치는 파랑으로 표시한다.
- **Do** 건물 단계는 3칸 공정 막대와 단계 이름 글자를 함께 보여준다. 멈춘 공사는 막대를 진한 선 색으로 바꾸고 '공사 중지'를 글자로 쓴다.
- **Do** 대비는 도구로 잰다. 글자는 흰 바탕에서 ink-3(6.13:1)보다 옅게 쓰지 않는다.
- **Do** 움직임은 감속 곡선 하나(`cubic-bezier(0.16, 1, 0.3, 1)`)와 transform, opacity만 쓰고 줄이기 설정에서는 사실상 끈다.

### Don't:
- **Don't** 노랑을 글자, 아이콘, 배지 채움으로 쓰지 않는다(흰 바탕 1.68:1).
- **Don't** 제목이나 날짜 위에 작은 이름표(eyebrow, kicker)를 두지 않는다.
- **Don't** 마을, 건물, 집, 가구를 일러스트나 아이콘으로 대신 그리거나 회색이 아닌 색으로 칠하지 않는다.
- **Don't** 둥근 체크로 선택을, 네모 체크로 완료를 표시하지 않는다.
- **Don't** Do Hyeon을 굵게 합성하지 않는다. 강조는 크기로 한다.
- **Don't** 카드, 버튼, 이름표에 그림자를 넣지 않는다. 그림자는 바텀시트와 알림만 쓴다(스위치 손잡이만 예외).
- **Don't** 진행 현황에 퍼센트 막대, 차트, 축하 연출을 쓰지 않는다. 진행은 개수와 공정 막대로만 말한다.
