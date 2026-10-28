---
version: 1
slug: "src-app-records-page-tsx"
primary_target: "src/app/records/page.tsx"
related_targets: ["src/components/records/AchievementsScreen.tsx","src/components/settings/SettingsScreen.tsx","src/components/LoginScreen.tsx"]
---

# S13 기록 · S14 업적 · S15 설정 · S01 로그인

## Scope and mode

- Mode: Operate. S13 하단 탭 `/records`, S14 `/records/achievements`, S15 `/settings`, S01 `/login`.
- 기준: `docs/screens.md` S13, S14, S15, S01. 비주얼은 `DESIGN.md`.

## Job

S13: 날짜별로 무엇을 했는지 돌아본다. S14: 얻은 업적과 남은 업적을 본다. S15: 계정, 시간대, 알림, 설치를 정한다. S01: 구글로 시작한다.

## Direction contract

THESIS: 문장과 목록. 큰 숫자 대시보드, 차트, 진행 막대, 연속 일수, 불꽃, 비교를 거부한다. 숫자는 개수와 비율 한 줄로만.

OWN-WORLD: DESIGN.md의 와이어프레임 시스템. 안내 칸(옅은 면), 1px 선 목록, 펼침 줄, 스위치, 그래픽 자리 표시자, 주요 버튼.

STORY: 기록 탭 → '이번 주 할 일 7개를 마쳤어요' → 어제 줄을 펼쳐 한 일과 옮긴 일을 본다 → 업적 줄 → 배지 목록.

FIRST VIEWPORT (375px): S13은 이번 주 문장 요약, 업적 줄, 날짜 줄 목록, 하단 탭. S01은 서비스명 자리, 한 줄 소개, 마을 자리 표시자, 아래 '구글로 계속하기'.

FORM: 표준 모바일 목록과 설정 화면. 구성은 screens.md에 고정. seed: none (pinned by brief). 사용자 확인 2026-10-27: "지금과 동일하게 유지해줘" (와이어프레임 단계 동안 구성안 추첨 생략 유지에 동의. 비주얼 단계에서 다시 정한다)

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Decisions

- 2026-10-28 사용자: "와이어프레임 부분은 너가 판단해서 쭉 끝내면 좋겠어". 결정은 screens.md 확인 필요 표에 올렸다.
- 업적 목록은 미정(planning 14장): 가짜 데이터에만 임시 값과 TODO 주석.
