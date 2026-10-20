import { getTextbookDetail } from '../common/catalog';
import type { TextbookDetail } from '../common/catalog';

/**
 * 여러 교과서의 목차를 한 번에 조회 (실패한 교과서는 빠짐)
 * @param textbookIds 쉼표로 이은 교과서 id (예: "3,7")
 */
export const getTextbookDetails = async (textbookIds: string): Promise<TextbookDetail[]> => {
  const ids = textbookIds.split(",").filter(Boolean).map(Number);
  const details = await Promise.all(ids.map((id) => getTextbookDetail(id).catch(() => null)));
  return details.filter((detail): detail is TextbookDetail => detail !== null);
};
