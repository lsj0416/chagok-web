// 가짜 AI 분해 응답. 목표 제목의 키워드로 목표 유형을 고르고, 유형별 초안을 돌려준다
import { AI_DRAFT_COUNT_MAX, AI_DRAFT_COUNT_MIN } from "@/config/game";
import type { GoalBreakdown, GoalType } from "@/types";

const KEYWORDS: [GoalType, string[]][] = [
  ["CAREER", ["취업", "이직", "면접", "개발자", "채용", "입사", "포트폴리오"]],
  ["STUDY", ["자격증", "공부", "시험", "합격", "토익", "기사", "학점"]],
  ["FINANCE", ["저축", "재테크", "투자", "모으기", "돈", "적금"]],
  ["HEALTH", ["운동", "헬스", "다이어트", "러닝", "건강", "체중", "등산"]],
];

const DRAFTS: Record<GoalType, string[]> = {
  CAREER: [
    "관심 있는 회사 5곳 목록 만들기",
    "채용공고 3개에서 자주 나오는 기술 정리하기",
    "이력서에 넣을 프로젝트 3개 고르기",
    "프로젝트 하나의 문제 해결 과정 한 문단으로 쓰기",
    "지원동기 첫 문단 쓰기",
    "자주 나오는 면접 질문 10개 모으기",
    "면접 질문 1개에 답변 녹음해보기",
    "깃허브 README 하나 다듬기",
    "기술 블로그 글 주제 3개 적기",
    "현직자 인터뷰 글 1개 읽고 메모하기",
    "코딩 테스트 문제 2개 풀기",
    "자기소개 1분 버전 써보기",
  ],
  STUDY: [
    "시험 일정과 접수 기간 확인하기",
    "과목별 출제 비중 정리하기",
    "교재 목차 보고 주차별 범위 나누기",
    "1과목 1장 개념 읽기",
    "기출 1회분 시간 재고 풀기",
    "틀린 문제 오답 노트에 옮기기",
    "헷갈리는 용어 10개 카드로 만들기",
    "요약 노트 한 장 만들기",
    "어제 공부한 내용 5분 복습하기",
    "모의고사 점수 기록하기",
    "약한 과목 한 단원 다시 보기",
  ],
  FINANCE: [
    "지난달 지출 내역 내려받기",
    "고정 지출 목록 만들기",
    "한 달 저축 목표 금액 정하기",
    "자동이체 날짜 월급날 다음 날로 바꾸기",
    "안 쓰는 구독 서비스 하나 해지하기",
    "비상금 통장 따로 만들기",
    "이번 주 식비 예산 정하기",
    "적금 상품 3개 금리 비교하기",
    "가계부 일주일 써보기",
  ],
  HEALTH: [
    "운동할 요일과 시간 정하기",
    "집 근처 걷기 코스 하나 정하기",
    "20분 걷기",
    "스트레칭 영상 하나 따라하기",
    "스쿼트 15회 3세트",
    "물 마시는 양 하루 기록하기",
    "운동복과 신발 꺼내두기",
    "이번 주 운동한 날 달력에 표시하기",
    "헬스장 가격과 위치 알아보기",
    "취침 시간 30분 앞당기기",
  ],
  PROJECT: [
    "만들고 싶은 것 한 문장으로 쓰기",
    "꼭 필요한 기능 3개만 고르기",
    "비슷한 서비스 2개 써보고 메모하기",
    "화면 하나 종이에 그려보기",
    "작업할 폴더와 저장소 만들기",
    "첫 화면 하나 만들기",
    "이번 주에 끝낼 작은 목표 하나 정하기",
    "만든 것 한 사람에게 보여주기",
    "다음에 할 일 목록 정리하기",
  ],
};

export function guessGoalType(title: string): GoalType {
  for (const [type, words] of KEYWORDS) {
    if (words.some((w) => title.includes(w))) return type;
  }
  return "PROJECT";
}

/** round: 다시 만들 때마다 다른 초안이 나오도록 시작 위치를 바꾼다 */
export function mockBreakdown(title: string, round: number): GoalBreakdown {
  const goalType = guessGoalType(title);
  const pool = DRAFTS[goalType];
  const span = AI_DRAFT_COUNT_MAX - AI_DRAFT_COUNT_MIN + 1;
  const count = Math.min(pool.length, AI_DRAFT_COUNT_MIN + ((title.length + round) % span));
  const start = (round * 3) % pool.length;
  const drafts = Array.from({ length: count }, (_, i) => ({
    id: `draft-${round}-${i}`,
    title: pool[(start + i) % pool.length],
  }));
  return { goalType, drafts };
}
