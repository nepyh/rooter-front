import { useCallback, useEffect, useState } from "react";
import Animated, { SlideOutLeft } from "react-native-reanimated";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LoadingView, BackHeader, PageTitle, SubjectFilter, TextbookGrid } from "@/components";
import { getSubjects } from "@/api/home/common/catalog";
import type { Subject } from "@/api/home/common/catalog";
import { getUserInfo } from "@/api/common/user";
import { getTextbooksWithSubject, type TextbookWithSubject } from "@/api/home/TextbookSelectPage";
import { useUserStore } from "@/store";
import { filterTextbooksByGrade } from "@/utils/home/textbook";

/**
 * 교과서 선택 화면
 */
export default function TextbookSelectPage() {
  const { examDate } = useLocalSearchParams<{ examDate: string }>();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [textbooks, setTextbooks] = useState<TextbookWithSubject[]>([]);
  const [loadingTextbooks, setLoadingTextbooks] = useState(true);
  const userId = useUserStore((state) => state.userId);
  const [grade, setGrade] = useState<number | null>(null);
  const [nextTextbookId, setNextTextbookId] = useState<number | null>(null);

  useEffect(() => {
    getSubjects()
      .then((list) => {
        setSubjects(list);
        if (list.length === 0) setLoadingTextbooks(false);
      })
      .catch(() => setLoadingTextbooks(false));
  }, []);

  useEffect(() => {
    if (userId === null) return;
    getUserInfo(userId).then((info) => setGrade(info.grade)).catch(() => setGrade(null));
  }, [userId]);

  useEffect(() => {
    if (subjects.length === 0) return;
    const targets = selectedSubjectId === null ? subjects : subjects.filter((s) => s.id === selectedSubjectId);
    setLoadingTextbooks(true);
    getTextbooksWithSubject(targets).then((list) => {
      setTextbooks(list);
      setLoadingTextbooks(false);
    });
  }, [subjects, selectedSubjectId]);

  useEffect(() => {
    if (nextTextbookId === null) return;
    router.push({
      pathname: "/Home/ChapterSelectPage",
      params: { examDate, textbookIds: String(nextTextbookId) },
    });
  }, [nextTextbookId, examDate]);

  useFocusEffect(useCallback(() => setNextTextbookId(null), []));

  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/Home/ExamDatePage"));

  return (
    <Animated.View exiting={nextTextbookId !== null ? SlideOutLeft.duration(300) : undefined} className="flex-1">
      <StatusBar style="light" />
      <BackHeader onBack={goBack} />
      <PageTitle title="교과서 선택" description="시험 범위에 알맞는 교과서를 선택해주세요" className="pb-spacing-6" />
      <SubjectFilter subjects={subjects} selectedId={selectedSubjectId} onSelect={setSelectedSubjectId} />
      {loadingTextbooks
        ? <LoadingView />
        : <TextbookGrid textbooks={filterTextbooksByGrade(textbooks, grade)} onSelect={setNextTextbookId} />}
    </Animated.View>
  );
}
