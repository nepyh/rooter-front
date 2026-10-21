import { color } from "@/constants/token/color";

export const MUTED_TEXT_COLOR = `${color.neutral["0"]}99`;

const COLUMN_GAP_HALF = 2;

/**
 * 겹치는 블록을 나란히 놓을 때의 가로 위치. 칸 사이는 4px 띄움
 * @param column 0부터 시작하는 칸 번호
 * @param columns 겹치는 묶음의 전체 칸 수
 */
export const columnStyle = (column: number, columns: number) => ({
  left: `${(column * 100) / columns}%` as const,
  width: `${100 / columns}%` as const,
  paddingLeft: column > 0 ? COLUMN_GAP_HALF : 0,
  paddingRight: column < columns - 1 ? COLUMN_GAP_HALF : 0,
});
