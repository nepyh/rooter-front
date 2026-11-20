import { color } from "@/constants/token/color";

export const MUTED_TEXT_COLOR = `${color.neutral["0"]}99`;

export const BLOCK_TEXT_PADDING = 12;
const BLOCK_TEXT_LEFT = 16;
const BLOCK_TEXT_RIGHT = 4;

export const BLOCK_MEASURE_STYLE = {
  position: "absolute" as const,
  top: 0,
  left: BLOCK_TEXT_LEFT,
  right: BLOCK_TEXT_RIGHT,
  opacity: 0,
};

const COLUMN_GAP_HALF = 2;

/**
 * 겹치는 블록을 나란히 놓을 때의 가로 위치(px)
 * @param column 0부터 시작하는 칸 번호
 * @param columns 겹치는 묶음의 전체 칸 수
 * @param areaWidth 블록을 놓는 영역의 너비(px)
 */
export const columnStyle = (column: number, columns: number, areaWidth: number) => {
  const columnWidth = areaWidth / columns;
  return {
    left: column * columnWidth,
    width: columnWidth,
    paddingLeft: column > 0 ? COLUMN_GAP_HALF : 0,
    paddingRight: column < columns - 1 ? COLUMN_GAP_HALF : 0,
  };
};
