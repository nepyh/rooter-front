import { useCallback, useEffect, useState } from "react";
import Animated, { SlideOutLeft } from "react-native-reanimated";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, LoadingView, BackHeader, PageTitle, SubjectFilter, TextbookGrid, NextButton } from "@/components";
import { useTextbookCatalog } from "@/hooks/home/useTextbookCatalog";
import { usePlanDraftStore } from "@/store";

/**
 * 교과서 선택 화면
 */
export default function TextbookSelectPage() {
  const { examDate } = useLocalSearchParams<{ examDate: string }>();
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const { subjects, textbooks, loadingTextbooks } = useTextbookCatalog(selectedSubjectId);
  const [nextTextbookId, setNextTextbookId] = useState<number | null>(null);
  const subjectsByTextbook = usePlanDraftStore((state) => state.subjectsByTextbook);
  const selectedSubjects = Object.values(subjectsByTextbook).flat();
  const selectedTextbookIds = new Set(selectedSubjects.map((subject) => subject.textbookId));

  useEffect(() => {
    if (nextTextbookId === null) return;
    router.push({
      pathname: "/Home/ChapterSelectPage",
      params: { examDate, textbookIds: String(nextTextbookId) },
    });
  }, [nextTextbookId, examDate]);

  useFocusEffect(useCallback(() => setNextTextbookId(null), []));

  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/Home/ExamDatePage"));

  const handleNext = () => {
    if (selectedSubjects.length === 0) return;
    router.push({ pathname: "/Home/SleepTimePage", params: { examDate, subjects: JSON.stringify(selectedSubjects) } });
  };

  return (
    <Animated.View exiting={nextTextbookId !== null ? SlideOutLeft.duration(300) : undefined} className="flex-1">
      <StatusBar style="light" />
      <BackHeader
        onBack={goBack}
        right={<Text variant="base-large" color="disabled">{`${selectedTextbookIds.size}개 선택됨`}</Text>}
      />
      <PageTitle title="교과서 선택" description="시험 범위에 알맞는 교과서를 선택해주세요" className="pb-spacing-6" />
      <SubjectFilter subjects={subjects} selectedId={selectedSubjectId} onSelect={setSelectedSubjectId} />
      {loadingTextbooks
        ? <LoadingView />
        : <TextbookGrid textbooks={textbooks} selectedIds={selectedTextbookIds} onSelect={setNextTextbookId} />}
      <NextButton disabled={selectedSubjects.length === 0} onPress={handleNext} className="mt-spacing-5 mb-spacing-6" />
    </Animated.View>
  );
}
