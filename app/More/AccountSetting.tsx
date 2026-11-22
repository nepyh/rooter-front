import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { PageHeader, MoreSection, MenuGroup, MenuRow, Modal, Toast } from "@/components";
import { useLogout } from "@/hooks/more/useLogout";
import { useWithdraw } from "@/hooks/more/useWithdraw";
import { useAgreementCheck } from "@/hooks/more/useAgreementCheck";
import { useAgreementRevoke } from "@/hooks/more/useAgreementRevoke";

export default function AccountSettingPage() {
  const handleLogout = useLogout();
  const withdraw = useWithdraw();
  const agreementCheck = useAgreementCheck();
  const agreementRevoke = useAgreementRevoke();

  const errorSources = [withdraw, agreementCheck, agreementRevoke];
  const errorSource = errorSources.find((source) => !!source.errorMessage);

  const handleStudySurvey = () => {
    router.push({ pathname: "/LearningSurvey/StudySurveyIntro", params: { from: "AccountSetting" } });
  };

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <PageHeader title="계정 설정" />
      <MoreSection title="계정 설정" spacing="none">
        <MenuGroup>
          <MenuRow icon="logout" label="로그아웃" onPress={handleLogout} />
          <MenuRow icon="withdraw" label="탈퇴하기" onPress={withdraw.open} />
        </MenuGroup>
      </MoreSection>
      <MoreSection title="약관">
        <MenuGroup>
          <MenuRow icon="book" label="약관 확인하기" onPress={agreementCheck.open} />
          <MenuRow icon="close" label="약관 철회하기" onPress={agreementRevoke.open} />
        </MenuGroup>
      </MoreSection>
      <MoreSection title="기타">
        <MenuGroup>
          <MenuRow icon="pencilLine" label="공부 스타일 설문하기" onPress={handleStudySurvey} />
        </MenuGroup>
      </MoreSection>
      <Modal {...withdraw.modalProps} />
      <Modal {...agreementCheck.modalProps} />
      <Modal {...agreementRevoke.modalProps} />
      {errorSource && <Toast text={errorSource.errorMessage} onClose={errorSource.clearError} />}
    </View>
  );
}
