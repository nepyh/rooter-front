import { getTextbooksBySubject } from '../common/catalog';
import type { Subject, Textbook } from '../common/catalog';

// ================================
// Types
// ================================

export interface TextbookWithSubject extends Textbook {
  subjectName: string;
}

// ================================
// Functions
// ================================

/**
 * 여러 과목의 교과서를 한 번에 조회하고 과목 이름을 붙여 반환 (실패한 과목은 빈 목록)
 * @param subjects 조회할 과목 목록
 */
export const getTextbooksWithSubject = async (subjects: Subject[]): Promise<TextbookWithSubject[]> => {
  const lists = await Promise.all(
    subjects.map((subject) =>
      getTextbooksBySubject(subject.id)
        .then((list) => list.map((textbook) => ({ ...textbook, subjectName: subject.name })))
        .catch(() => [] as TextbookWithSubject[])
    )
  );
  return lists.flat();
};
