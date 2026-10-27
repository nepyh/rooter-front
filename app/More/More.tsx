import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Row, Text, Toast, ProfileCard, MoreSection, MenuGroup, MenuRow, ContributionGraph } from "@/components";
import { Icon } from "@/assets";
import { useUserStore } from "@/store";
import { useUserInfo } from "@/hooks/common/useUserInfo";
import { useContributionLevels } from "@/hooks/more/useContributionLevels";

// ================================
// Constants
// ================================

const TOAST_MESSAGES: Record<string, string> = {
  "password-changed": "비밀번호가 변경되었습니다.",
};

const CONTRIBUTION_WEEK_COUNT = 53;

// ================================
// Components
// ================================

/**
 * 마이페이지(설정) 화면
 */
export default function SettingPage() {
  const router = useRouter();
  const { toast } = useLocalSearchParams<{ toast?: string }>();
  const user = useUserStore((state) => state.user);
  const userInfo = useUserInfo();
  const [showToast, setShowToast] = useState(false);
  const today = new Date();
  const levels = useContributionLevels(today, CONTRIBUTION_WEEK_COUNT);

  useEffect(() => {
    if (toast && TOAST_MESSAGES[toast]) setShowToast(true);
  }, [toast]);

  return (
    <View className="flex-1">
      <StatusBar style="light" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        <Row width="full" className="items-center pb-spacing-5">
          <Text variant="header-large">마이페이지</Text>
        </Row>

        <ProfileCard
          username={user?.username ?? "게스트"}
          email={user?.email ?? "로그인이 필요합니다"}
          imageUri={userInfo?.avatarUrl ?? undefined}
          onPress={() => router.push("/More/Profile")}
        />

        <MoreSection title="일반">
          <MenuGroup>
            <MenuRow icon="bell" label="알림" arrow="muted" onPress={() => router.push("/More/Notification")} />
            <MenuRow icon="lock" label="계정" arrow="muted" onPress={() => router.push("/More/AccountSetting")} />
            <MenuRow icon="calendar" label="불가능 시간" arrow="muted" onPress={() => router.push("/More/UnavailableTimePage")} />
          </MenuGroup>
        </MoreSection>

        <MoreSection title="데일리">
          <ContributionGraph today={today} weekCount={CONTRIBUTION_WEEK_COUNT} levels={levels} />
        </MoreSection>

        <Row width="full" className="justify-end pt-spacing-9" pointerEvents="none">
          <Icon name="mascotCharacter" size={120} />
        </Row>
      </ScrollView>

      {showToast && toast && <Toast text={TOAST_MESSAGES[toast]} onClose={() => setShowToast(false)} />}
    </View>
  );
}
