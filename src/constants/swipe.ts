// 홈 날짜 넘기기(useDayPager)와 달력 달 넘기기(useMonthSwipe)가 같은 손맛을 내도록 함께 쓰는 기준

/** 손으로 넘길지(가로 Pan) 정하는 기준. 가로로 이만큼(dp) 먼저 움직여야 켜지고, 세로로 이만큼 먼저 움직이면 세로 스크롤·탭에 양보 */
export const SWIPE_ACTIVE_X = 16;
export const SWIPE_FAIL_Y = 12;

/** 놓았을 때 페이지를 넘기는 기준: 페이지 너비의 이 비율 이상 끌었거나, 이 속도(px/s) 이상으로 튕겼을 때 */
export const SWIPE_PAGE_RATIO = 0.3;
export const SWIPE_FLING_VELOCITY = 500;
