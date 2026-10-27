---
name: chagok (와이어프레임)
description: 장기 목표를 할 일로 나누고 완료할 때마다 마을이 자라는 목표 실행 서비스. 색과 서체를 정하기 전, 회색 와이어프레임 단계의 시스템
colors:
  ink: "#1c1c1c"
  ink-2: "#4b4b4b"
  ink-3: "#6e6e6e"
  line: "#e3e3e3"
  line-strong: "#c9c9c9"
  surface: "#ffffff"
  surface-2: "#f3f3f3"
  surface-3: "#e9e9e9"
  placeholder: "#d6d6d6"
  backdrop: "rgb(0 0 0 / 0.4)"
typography:
  headline:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "19px"
    fontWeight: 700
    letterSpacing: "-0.01em"
  title:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 700
  body:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.375
  body-sm:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
  label:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
  caption:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
  tab-label:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 400
rounded:
  sm: "4px"
  lg: "8px"
  xl: "12px"
  sheet: "16px"
  full: "9999px"
spacing:
  inset-list: "8px"
  inset-panel: "16px"
  gutter: "20px"
  section-gap: "28px"
  touch: "44px"
  bar: "56px"
  app-max-width: "430px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "0 16px"
    height: "48px"
  button-primary-bar:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    height: "48px"
    width: "100%"
  button-outline:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "0 16px"
    height: "44px"
  button-tonal:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    height: "44px"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "44px"
  chip-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "44px"
  button-outline-bar:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    height: "48px"
    width: "100%"
  button-text:
    textColor: "{colors.ink-2}"
    typography: "{typography.body-sm}"
    padding: "0 12px"
    height: "44px"
  bottom-actions:
    backgroundColor: "{colors.surface}"
    padding: "12px 16px"
  draft-row:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "4px 0"
  task-row:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "4px 0"
  notice-panel:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.xl}"
    padding: "12px 16px"
  toast:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.xl}"
    padding: "6px 6px 6px 16px"
  bottom-sheet:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sheet}"
    padding: "0 20px 20px"
  tab-bar:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-3}"
    typography: "{typography.tab-label}"
    height: "56px"
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "0 12px"
    height: "48px"
  graphic-placeholder:
    backgroundColor: "{colors.placeholder}"
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
---

# Design System: chagok (와이어프레임)

> 이 문서는 와이어프레임 단계의 시스템을 빌드된 코드(S02 오늘 화면과 공용 컴포넌트) 기준으로 기록한다. **색과 서체는 아직 정하지 않았다.** 지금 값은 모두 회색 단계와 기본 시스템 폰트다. 색과 서체를 정할 때는 `src/app/globals.css`의 `@theme` 토큰 값만 바꾸고, 이 문서를 다시 생성한다. 컴포넌트 코드는 토큰 이름(`ink`, `surface-2` 등)만 참조하므로 고칠 필요가 없어야 한다.

## Overview

**Creative North Star: "조용한 할 일 목록"**

화면은 흰 바탕 위의 표준 모바일 목록이다. 구분은 굵기, 크기, 간격, 1px 선, 옅은 회색 면으로만 한다. 진행 현황은 큰 숫자나 차트가 아니라 한 줄 문장이고, 축하 연출 대신 짧은 알림과 실행 취소만 남는다. 한 손으로, 이동 중에, 몇 초 안에 하나를 끝내고 닫는 사용에 맞춘 밀도다.

자주 쓰는 행동은 엄지가 닿는 아래쪽에 모인다. 아래에서부터 하단 탭, 할 일 추가 버튼, 알림 순으로 쌓이고, 바텀시트도 아래에서 올라온다. 앱은 폭 430px 안에 갇힌 한 열이고, 그보다 넓은 화면에서는 회색 바탕 가운데 흰 기둥으로 놓인다.

마을, 건물, 집, 가구 그림은 3D 렌더가 준비될 때까지 같은 비율의 회색 상자와 이름으로만 둔다.

**Key Characteristics:**
- 흰 바탕, 회색 10단계, 강조색 없음. 가장 진한 회색(`ink`)이 주요 행동의 채움색 역할을 한다
- 기본 시스템 산세리프 하나, 굵기 400/600/700과 11~19px 크기 차이로 위계를 만든다
- 그림자는 화면 위에 뜨는 두 가지(바텀시트, 알림)에만 쓴다
- 모든 누르는 대상은 최소 44px
- 그래픽 자리는 회색 자리 표시자

## Colors

강조색이 없는 회색 단계 팔레트. 와이어프레임 단계의 임시값이며 확정된 브랜드 색이 아니다.

### Primary
- **먹색 (ink)**: 본문 글자, 주요 버튼과 할 일 추가 버튼의 채움, 완료 체크 채움, 알림 배경, 포커스 링. 지금은 이 색이 강조색 자리를 대신한다. 색을 정하면 가장 먼저 바뀔 자리다.

### Neutral
- **진회색 (ink-2)**: 섹션 제목, 진행 현황 문장, 보조 버튼 글자, 오프라인 배너 배경.
- **중회색 (ink-3)**: 목표 이름 같은 보조 정보, 완료한 할 일 제목, 비활성 탭, 더보기와 펼침 아이콘. 흰 바탕 대비 5.1:1로 본문 대비 기준을 넘는 가장 옅은 글자색이다.
- **선 (line)**: 목록 사이와 탭 바 위의 1px 구분선.
- **진한 선 (line-strong)**: 비어 있는 체크 원, 테두리 버튼과 칩, 입력 칸 테두리, 바텀시트 손잡이.
- **흰 면 (surface)**: 앱 기둥과 바텀시트의 바탕, 테두리 버튼과 칩의 채움.
- **옅은 면 (surface-2)**: 안내 영역, 빈 화면 카드, 모두 마침 메시지, 오류 상자, 보조 버튼의 채움. 넓은 화면에서 앱 바깥 바탕.
- **더 옅은 면 (surface-3)**: 로딩 뼈대, 텍스트 선택 영역.
- **자리 표시 회색 (placeholder)**: 그래픽과 아직 만들지 않은 화면의 자리 표시자.
- **덮개 (backdrop)**: 바텀시트 뒤 화면을 어둡게 덮는 반투명 검정.

**The Token-Only Rule.** 화면 코드에는 색 값을 직접 쓰지 않고 위 토큰 이름만 쓴다. 색을 정하는 날 바꾸는 곳은 `globals.css`의 `@theme` 하나뿐이다.

**The No-Accent-Yet Rule.** 색과 서체가 정해지기 전에는 회색 바깥의 색(브랜드 색, 상태 색, 그라데이션 색)을 추가하지 않는다. 상태 구분은 굵기, 채움, 취소선으로 한다.

## Typography

**Body Font:** 기본 시스템 산세리프 (`ui-sans-serif, system-ui, sans-serif`, Tailwind 기본 스택). 따로 지정한 서체 없음.

**Character:** 서체는 아직 정하지 않았다. 지금은 하나의 기본 서체로 크기와 굵기만 바꿔 위계를 만든다. 한국어 줄바꿈은 단어 단위(`word-break: keep-all`)다.

### Hierarchy
- **Headline** (700, 19px, 자간 -0.01em): 상단 바의 화면 제목. S02에서는 날짜("10월 27일 화요일").
- **Title** (700, 18px): 바텀시트 제목, 빈 화면 카드 제목, 상단 바 아래 본문의 첫 제목(초안 화면의 목표 이름).
- **Body** (400, 16px, 줄 높이 1.375): 할 일 제목(최대 두 줄), 시트 안 행동 목록, 입력 칸, 할 일 추가 버튼(600).
- **Body small** (400, 15px): 안내 영역 문장, 알림 문장, 칩, 시트 안 보조 버튼(600).
- **Label** (600, 14px): 섹션 제목(진회색), 버튼 글자. 같은 크기의 400은 진행 현황 문장과 시트 설명에 쓴다.
- **Caption** (400, 13px): 할 일 아래 목표 이름, 날짜 같은 보조 정보(중회색, 한 줄 말줄임).
- **Tab label** (400, 활성은 600, 11px): 하단 탭 이름.

**The Weight-Not-Color Rule.** 위계는 굵기와 크기, 세 단계 글자색(ink, ink-2, ink-3)으로만 만든다. 숫자는 `tabular-nums`로 자리를 맞춘다.

## Layout

- **한 열, 최대 430px.** 앱 전체가 가운데 정렬된 흰 기둥이다. 360px, 375px, 430px에서 같은 구조로 늘어나고 줄어든다. 넓은 화면에서는 기둥 바깥이 옅은 면(surface-2)이다.
- **상단 바와 하단 탭은 각각 56px.** 상단 바는 좌우 8px 안쪽에 44px 아이콘 버튼을 둔다.
- **좌우 여백 두 가지.** 글자만 있는 줄(섹션 제목, 진행 현황, 보너스 줄)은 20px, 면이 있는 덩어리(안내 영역, 카드, 하단 버튼)는 16px. 할 일 목록은 8px 안쪽에 44px 체크 영역이 붙어 체크 원과 글자가 20px 선에 맞는다.
- **섹션 사이 28px.** 섹션 제목 위 28px, 진행 현황 위 12px, 보너스 줄 위 20px.
- **아래쪽 고정 영역.** 탭 화면은 아래에서부터 하단 탭(56px + 안전 영역), 할 일 추가 버튼(48px, 위로 흰색에서 투명으로 흐려지는 바탕), 알림. 본문은 이 높이만큼 아래 여백을 둔다. 전체 화면(목표 만들기 등)은 흰 바탕에 위쪽 1px 선이 있는 하단 행동 영역을 화면 아래에 붙인다(sticky). 키보드가 열려도 키보드 위에 남는다.

**The Thumb-Zone Rule.** 자주 쓰는 행동과 그 결과(추가 버튼, 알림, 바텀시트)는 화면 아래쪽에 둔다. 위쪽에는 날짜와 설정처럼 드물게 누르는 것만 둔다.

**The 44px Rule.** 누르는 대상은 모두 최소 44px. 눈에 보이는 체크 원은 22px이지만 누르는 영역은 44px이다.

## Elevation & Depth

기본은 평평하다. 면의 구분은 옅은 회색 채움과 1px 선으로 한다. 그림자는 화면 위에 떠서 다른 내용을 가리는 두 요소에만 있다.

### Shadow Vocabulary
- **시트 그림자** (`box-shadow: 0 -4px 24px rgb(0 0 0 / 0.12)`): 아래에서 올라온 바텀시트의 위쪽 가장자리. 뒤에는 덮개가 깔린다.
- **알림 그림자** (`box-shadow: 0 4px 16px rgb(0 0 0 / 0.18)`): 목록 위에 뜨는 알림.

**The Floating-Only Rule.** 그림자는 내용 위에 뜨는 요소(바텀시트, 알림)에만 쓴다. 카드, 버튼, 안내 영역은 그림자 없이 채움으로 구분한다.

## Shapes

부드럽게 둥근 모서리의 사각형과 완전한 원 두 가지 형태다.

- **작은 둥글기 (4px):** 로딩 뼈대의 글자 막대.
- **보통 둥글기 (8px):** 일반 버튼, 입력 칸, 그래픽 자리 표시자.
- **큰 둥글기 (12px):** 안내 영역, 모두 마침 메시지, 오류 상자, 알림, 할 일 추가 버튼.
- **시트 둥글기 (16px):** 바텀시트 위쪽 두 모서리. 빈 화면 카드도 16px을 쓴다.
- **원:** 체크 원, 아이콘 버튼의 누르는 영역, 칩, 바텀시트 손잡이(36×4px).

## Components

### Buttons
- **주요 버튼:** 먹색 채움, 흰 글자 14~15px 600, 8px 둥글기, 높이 44~48px. "다시 시도", "옮기기", "AI로 목표 만들기". 하단 행동 영역의 주요 버튼은 전체 폭, 48px, 12px 둥글기, 16px 600("할 일 추천받기", "N개 추가하기").
- **비활성:** 모든 버튼은 같은 방식으로 투명도 40%. 색을 따로 바꾸지 않는다.
- **할 일 추가 버튼:** S02의 대표 행동. 전체 폭, 높이 48px, 12px 둥글기, 먹색 채움, 더하기 아이콘과 16px 600 글자. 하단 탭 바로 위에 고정.
- **테두리 버튼:** 흰 채움, 진한 선 1px 테두리, 먹색 글자. 같은 자리에 주요 버튼보다 약한 행동("직접 입력", "마을 보러 가기"의 조용한 형태). AI를 쓸 수 없을 때(실패, 하루 상한)의 "직접 입력하기"는 주요 버튼 아래 전체 폭 테두리 버튼이 된다.
- **글자 버튼:** 채움과 테두리 없이 15px 600 진회색, 높이 44px. 하단 행동 영역의 보조 행동("직접 입력하기", "나중에 하기", "다시 만들기").
- **보조 버튼:** 옅은 면 채움, 진회색 글자, 테두리 없음. 시트 안 "취소", 지난 할 일의 세 갈래 행동("오늘로", "날짜 바꾸기", "날짜 없이 보관")처럼 같은 무게의 선택지가 나란히 놓일 때.
- **아이콘 버튼:** 44px 원형 누르는 영역, 아이콘 20~24px, 채움 없음.
- **Focus:** 모든 요소에 먹색 2px 윤곽선, 2px 띄움.

### Chips
- **Style:** 흰 채움, 진한 선 1px 테두리, 완전한 원 모서리, 높이 44px, 15px 글자.
- **행동 칩:** 빠른 추가 칩. 선택 상태 없이 누르면 바로 행동한다.
- **선택 칩:** 하나만 고르는 칩 묶음(직접 입력의 건물 종류, radiogroup). 선택되면 먹색 채움, 흰 글자 600.

### Cards / Containers
- **안내 영역:** 옅은 면 채움, 12px 둥글기, 최소 높이 48px, 15px 문장 한 줄. 누를 수 있으면 오른쪽에 꺾쇠 아이콘, 행동이 있으면 오른쪽에 테두리 버튼.
- **빈 화면 카드:** 옅은 면 채움, 16px 둥글기, 18px 제목 아래 14px 소제목별 묶음(목표에서 가져오기, 빠른 추가, 버튼).
- **Shadow Strategy:** 없음. Elevation 참조.

### Inputs / Fields
- **Style:** 흰 채움, 진한 선 1px 테두리, 8px 둥글기, 높이 48px, 16px 글자(모바일 확대 방지). 날짜는 브라우저 기본 날짜 선택기.
- **Focus:** 공통 먹색 윤곽선.

### Navigation
- **하단 탭:** 흰 바탕, 위쪽 1px 선, 높이 56px에 4칸. 각 칸은 22px 선 아이콘 위에 11px 이름. 활성 탭은 먹색, 600, 아이콘 선 2.2. 비활성은 중회색, 선 1.8.
- **상단 바:** 높이 56px, 왼쪽에 19px 700 제목(전체 화면은 뒤로 가기 아이콘), 오른쪽에 아이콘 버튼 하나. 본문에 큰 안내 제목이 있는 화면(목표 입력)은 상단 바 제목을 비우고, 본문 제목이 화면의 h1이 된다.

### 할 일 줄 (Task Row)
목록의 기본 단위. 왼쪽 44px 체크 영역(22px 원, 2px 진한 선 테두리), 가운데 16px 제목(최대 두 줄)과 13px 목표 이름, 오른쪽 44px 더보기. 완료하면 원이 먹색으로 채워지고 흰 체크가 들어가며, 제목은 중회색 취소선이 된다. 완료한 줄은 더보기 자리를 빈칸으로 남겨 정렬을 유지한다. 줄 사이는 선 없이 간격으로만 나눈다. 길게 누르면 더보기 시트가 열린다.

### 초안 줄 (Draft Row)
고르는 목록의 단위(AI 추천 할 일). 할 일 줄과 같은 44px 영역에 **네모 체크**(22px, 6px 둥글기, 2px 진한 선)를 둔다. 둥근 체크는 '완료', 네모 체크는 '선택'이다. 선택하면 먹색 채움과 흰 체크. 제목을 누르면 그 자리에서 먹색 1px 테두리 입력 칸으로 바뀐다. 목록 위 오른쪽에 "모두 선택/모두 해제" 밑줄 글자 버튼.

### 방 그림 (Room)
집 내부 화면의 주인공. 1:1 그래픽 자리 표시자가 앱 기둥 폭을 채우고(좌우 16px), 왼쪽 위에 13px 진회색으로 이름('원룸 내부')을 쓴다. 슬롯은 그 위에 임시 좌표(%)로 놓이며 중심을 좌표에 맞춘다.
- **빈 자리:** 44px 원, 2px 중회색 점선 테두리, 흰 채움, 18px 더하기 아이콘.
- **설치된 가구:** 48px 정사각형, 6px 둥글기, 진한 선 1px 테두리, surface-3 채움, 가운데 이름. **예외: 이름은 11px.** 주택(18자리)에서 360px 폭에 겹치지 않는 가장 큰 크기라서다(56px 상자는 겹친다). 그래픽 자리 표시자의 13~14px 규칙에서 이 상자만 벗어난다.

### 마을 그림 (Village)
마을 화면의 주인공. 3:4 그래픽 자리 표시자가 앱 기둥 폭을 채우고(좌우 16px), 왼쪽 위에 13px 진회색 '마을 그림'(자리 표시자 이름). 그 위에 임시 좌표(%)로:
- **집:** 가운데 96px 정사각형, 진한 선 1px, surface-3 채움, 14px 600 집 단계 이름과 13px '집'. 누르면 집 내부로 간다.
- **건물:** 64px 정사각형, 같은 재질. 13px 600 먹색 건물 이름, 아래 줄에 단계(터/골조/완성), 보관한 목표는 한 줄 더 '공사 중지'(색 대신 글자). 고른 건물은 2px 먹색 테두리. 터 자리 8곳을 왼쪽, 오른쪽, 위, 아래, 모서리 순으로 채운다.
- **이름표:** 마을 그림 아래쪽 안쪽 12px에 붙는 흰 띠(진한 선 1px, 8px 둥글기, 최소 56px). 15px 600 목표 이름(한 줄, 넘치면 말줄임. 아래쪽 건물을 가리지 않기 위해서다), 13px 진회색 공사 진행, 오른쪽 꺾쇠. 누르면 목표 상세로 간다. 그림자는 쓰지 않는다(Floating-Only Rule).
- **단계 연출:** 단계가 오른 뒤 첫 진입에만 그 건물 상자가 600ms 동안 1.14배로 커졌다 돌아온다(transform, 300ms 지연, 감속 곡선). 움직임 줄이기 설정에서는 생략. 앱에서 유일한 보상 움직임이다.

### 가구 고르기 줄 (Shop Row)
가구 상점 시트의 한 줄(radiogroup). 왼쪽 56px 그래픽 자리 표시자(13px 이름, 장식이라 읽지 않음), 가운데 16px 이름과 14px 진회색 가격 또는 '보유 중', 오른쪽 22px 둥근 라디오(선택 시 먹색 채움과 흰 체크). 줄 사이 1px 선. 판매 가구 하나에 한 줄이고, 놓지 않은 보유 가구가 있으면 그 줄이 '보유 중'이 된다. 시트 아래에 붙은 전체 폭 주요 버튼 위로 부족 안내(14px 진회색, 가운데 정렬)가 놓인다.

### 조건 줄 (Condition Row)
넓히기 조건 같은 '현재/필요' 표시. 위아래 1px 선 사이에 줄마다 최소 48px, 왼쪽 15px 이름, 오른쪽 15px 600 `2/3` 같은 값. 조건을 채우면 값 옆에 16px 체크 아이콘을 붙인다(스크린 리더용 '채움' / '아직 모자람' 글자). 색만으로 상태를 말하지 않는다.

### 바텀시트 (Bottom Sheet)
네이티브 dialog. 화면 아래에 붙고 폭은 앱 기둥과 같으며 최대 높이 85dvh. 위쪽에 36×4px 손잡이, 18px 700 제목, 14px 중회색 설명, 그 아래 스크롤되는 내용(좌우 20px). 아래로 끌거나 덮개를 누르거나 Esc로 닫는다. 280ms 동안 아래에서 올라오며 덮개가 함께 짙어진다(감속 곡선 `cubic-bezier(0.16, 1, 0.3, 1)`).

### 알림 (Toast)
먹색 바탕, 흰 15px 문장, 12px 둥글기, 최소 높이 48px. 행동(실행 취소)은 오른쪽의 44px 높이 밑줄 글자 버튼. 할 일 추가 버튼 바로 위에 뜨고 240ms 동안 8px 아래에서 떠오른다. 새 알림은 앞 알림을 바꾼다.

### 진행 줄 (Progress Line)
진행 현황은 14px 진회색 문장 한 줄이다. 일일 보너스는 위아래 1px 선 사이에 이름과 `1/5` 같은 숫자 하나. 차트나 큰 숫자를 쓰지 않는다.

### 그래픽 자리 표시자 (Graphic Placeholder)
마을, 건물, 집, 가구 그림 자리. 최종 그림과 같은 비율의 자리 표시 회색 상자, 8px 둥글기, 가운데에 진회색으로 이름을 쓴다(작은 건물 상자는 13px, 화면 자리 상자는 14px). 아직 만들지 않은 화면의 자리도 같은 형태(4:3 상자)다.

### 상태 표시
- **로딩:** 더 옅은 면(surface-3)의 뼈대. 체크 원 자리에 22px 원, 제목 자리에 16px 높이 막대.
- **오류:** 옅은 면 상자 안에 15px 문장과 주요 버튼 "다시 시도". 하단에 주요 버튼이 있는 화면은 상자에 문장만 두고 주요 버튼 글자를 "다시 시도"로 바꾼다.
- **진행 중:** 20px 회전 원(움직임 줄이기 설정에서는 멈춤)과 15px 진회색 문장. 버튼 자리나 목록 자리를 그대로 대신한다.
- **오프라인:** 화면 위에 붙는 진회색 띠, 흰 14px 문장과 16px 아이콘.

## Do's and Don'ts

### Do:
- **Do** 색은 `ink`, `ink-2`, `ink-3`, `line`, `line-strong`, `surface`, `surface-2`, `surface-3`, `placeholder`, `backdrop` 토큰 이름으로만 쓴다.
- **Do** 주요 행동 하나만 먹색 채움으로 두고, 나머지는 테두리 버튼이나 보조 버튼으로 낮춘다.
- **Do** 누르는 대상을 최소 44px로, 자주 쓰는 행동을 화면 아래쪽에 둔다.
- **Do** 진행과 결과는 문장 한 줄과 숫자 하나로 조용히 보여준다.
- **Do** 마을, 건물, 집, 가구 자리는 같은 비율의 회색 상자와 이름으로 둔다.
- **Do** 움직임은 감속 곡선 하나(`ease-out-expo`)로, 줄이기 설정(`prefers-reduced-motion`)에서는 사실상 꺼지게 한다.

### Don't:
- **Don't** 색과 서체가 정해지기 전에 브랜드 색, 상태 색, 웹 폰트를 추가하지 않는다.
- **Don't** 마을, 건물, 집, 가구를 일러스트나 아이콘으로 대신 그리지 않는다. (조작용 선 아이콘, 예를 들어 탭, 설정, 꺾쇠, 더보기는 이 규칙과 무관하다.)
- **Don't** 진행 현황에 큰 숫자, 차트, 카드 격자, 축하 연출을 쓰지 않는다.
- **Don't** 카드나 버튼에 그림자를 넣지 않는다. 그림자는 바텀시트와 알림만 쓴다.
