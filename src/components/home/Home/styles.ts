import { color } from "@/constants/token/color";

export const MUTED_TEXT_COLOR = `${color.neutral["0"]}99`;

const COLUMN_GAP_HALF = 2;

/**
 * 겹치는 블록을 나란히 놓을 때의 가로 위치(px). 칸 사이는 4px 띄움
 * px 로 계산해서 끄는 동안 left 에 손가락 이동 거리를 그대로 더할 수 있음
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
