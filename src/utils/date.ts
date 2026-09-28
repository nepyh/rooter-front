const pad = (n: number) => String(n).padStart(2, "0");

/**
 * 기기 시간 기준 yyyy-MM-dd 문자열 변환 함수
 * @param date 변환할 날짜
 * @returns yyyy-MM-dd 문자열
 */
export const toLocalDateString = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

// ================================
// Calendar grid
// ================================

export interface CalendarCellData {
  date: Date;
  inMonth: boolean;
}

export const buildMonthWeeks = (year: number, month: number): CalendarCellData[][] => {
  const startWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;

  const cells: CalendarCellData[] = [];
  for (let i = 0; i < startWeekday; i++) {
    cells.push({ date: new Date(year, month - 1, daysInPrevMonth - startWeekday + 1 + i), inMonth: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ date: new Date(year, month, day), inMonth: true });
  }
  for (let day = 1; cells.length < totalCells; day++) {
    cells.push({ date: new Date(year, month + 1, day), inMonth: false });
  }

  const weeks: CalendarCellData[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
};
