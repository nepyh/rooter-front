import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Stack, Text, Input, Button, MorePageHeader, MenuGroup, MenuRow, ProfileAvatar, ReadOnlyField } from "@/components";
import { useProfile } from "@/hooks/more/useProfile";
import { useLogout } from "@/hooks/more/useLogout";
import { formatGradeClass } from "@/utils/more/profile";
import { getSpacing } from "@/utils/token";

/**
 * 프로필 화면
 */
export default function ProfilePage() {
  const { user, userInfo, schoolName, bio, setBio, profileImageUri, pickImage, saveBio } = useProfile();
  const handleLogout = useLogout();

  const handleSave = async () => {
    if (await saveBio()) router.replace("/More/More");
  };

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <MorePageHeader title="프로필" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: getSpacing("spacing-9") }}>
        <Stack width="full" className="items-center pt-spacing-5">
          <ProfileAvatar imageUri={profileImageUri} fallbackText={(user?.username ?? "?").slice(0, 1)} onPressCamera={pickImage} />
        </Stack>

        <Stack gap="xl" width="full" className="pt-spacing-9">
          <ReadOnlyField label="이름" value={user?.username ?? ""} />
          <ReadOnlyField label="이메일" value={user?.email ?? ""} />
          <ReadOnlyField label="학교" value={schoolName ?? "-"} />
          <ReadOnlyField label="학년 · 반" value={formatGradeClass(userInfo)} />
          <Stack gap="s" width="full">
            <Text variant="base-medium">소개</Text>
            <Input
              value={bio}
              onChangeText={setBio}
              placeholder="소개를 입력하세요."
              multiline
              style={{ height: 120, textAlignVertical: "top" }}
            />
          </Stack>
        </Stack>

        <MenuGroup className="mt-spacing-9">
          <MenuRow label="비밀번호 변경" onPress={() => router.push("/More/ChangePassword")} />
          <MenuRow label="로그아웃" onPress={handleLogout} />
        </MenuGroup>
      </ScrollView>

      <Button variant="primary" onPress={handleSave} className="mt-spacing-5">수정하기</Button>
    </View>
  );
}
