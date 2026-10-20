// ================================
// Types
// ================================

export interface ContributionMonthGroup {
  label: string;
  weeks: Date[][];
}

// ================================
// Functions
// ================================

/**
 * 그 주의 일요일 0시
 * @param date 기준 날짜
 */
export const startOfWeek = (date: Date) => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - d.getDay());
  return d;
};

/**
 * 오늘이 든 주까지 weekCount 주를 달별로 묶음. 주의 첫날(일요일)이 속한 달로 묶음
 * @param today 오늘 날짜
 * @param weekCount 보여줄 주 수
 */
export const buildContributionMonths = (today: Date, weekCount: number): ContributionMonthGroup[] => {
  const lastWeekStart = startOfWeek(today);
  const weeks: Date[][] = [];
  for (let w = weekCount - 1; w >= 0; w--) {
    const weekStart = new Date(lastWeekStart);
    weekStart.setDate(weekStart.getDate() - w * 7);
    weeks.push(Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    }));
  }

  const months: ContributionMonthGroup[] = [];
  weeks.forEach((week) => {
    const label = `${week[0].getMonth() + 1}월`;
    const lastGroup = months[months.length - 1];
    if (lastGroup && lastGroup.label === label) lastGroup.weeks.push(week);
    else months.push({ label, weeks: [week] });
  });
  return months;
};
