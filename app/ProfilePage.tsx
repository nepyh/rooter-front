import { useState } from "react";
import { Alert, Image, Pressable, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import { Stack, Row, Text, Input, Button } from "@/components";
import { Icon } from "@/assets";
import type { IconName } from "@/assets";
import { useUserStore } from "@/store";
import { logout } from "@/api/auth";
import { updateUserProfile } from "@/api/user";

// ================================
// Components
// ================================

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <Stack gap="s" width="full">
      <Text variant="base-medium">{label}</Text>
      <View className="bg-neutral-700 rounded-md p-xl w-full">
        <Text variant="base-large" weight="medium">{value}</Text>
      </View>
    </Stack>
  );
}

function MenuRow({ icon, label, onPress }: { icon?: IconName; label: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center justify-between p-m rounded-sm w-full">
      <Text variant="base-medium" weight="medium" className="text-white">{label}</Text>
      <Icon name={icon ?? "chevronRight"} size={24} />
    </Pressable>
  );
}

/**
 * 프로필 화면
 */
export default function ProfilePage() {
  const user = useUserStore((state) => state.user);
  const userId = useUserStore((state) => state.userId);
  const updateProfile = useUserStore((state) => state.updateProfile);

  const [bio, setBio] = useState(user?.bio ?? "");
  const [profileImageUri, setProfileImageUri] = useState(user?.profileImageUri);

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("권한 필요", "프로필 사진을 변경하려면 사진 접근 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (userId === null) return;

    try {
      await updateUserProfile(userId, { bio });
      updateProfile({ bio, profileImageUri });
      router.replace("/SettingPage");
    } catch {
      Alert.alert("저장 실패", "소개 저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const handleLogout = async () => {
    // logout()은 서버 호출 성공/실패와 무관하게 로컬 로그인 상태를 항상 정리합니다.
    try {
      await logout();
    } catch {
      // 로컬 상태는 이미 정리됐으므로 무시하고 화면만 이동합니다.
    }
    router.replace("/");
  };

  return (
    <View className="flex-1">
      <StatusBar style="light" />

      <Row gap="s" className="items-center pb-l">
        <Pressable onPress={() => router.back()}>
          <Icon name="chevronLeft" size={28} />
        </Pressable>
        <Text variant="header-large">프로필</Text>
      </Row>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <Stack width="full" className="items-center pt-l">
          <View className="w-[100px] h-[100px]">
            <View className="w-[100px] h-[100px] rounded-full overflow-hidden bg-neutral-700 items-center justify-center">
              {profileImageUri ? (
                <Image source={{ uri: profileImageUri }} style={{ width: 100, height: 100 }} />
              ) : (
                <Text variant="title-small">{(user?.username ?? "?").slice(0, 1)}</Text>
              )}
            </View>
            <Pressable
              onPress={handlePickImage}
              className="absolute bottom-0 right-0 w-[28px] h-[28px] rounded-full bg-background-primary items-center justify-center"
            >
              <Icon name="camera" size={16} />
            </Pressable>
          </View>
        </Stack>

        <Stack gap="xl" width="full" className="pt-xxl">
          <ReadOnlyField label="이름" value={user?.username ?? ""} />
          <ReadOnlyField label="이메일" value={user?.email ?? ""} />
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

        <Stack gap="xs" width="full" className="bg-neutral-700 p-xs rounded-md mt-xxl">
          <MenuRow label="비밀번호 변경" onPress={() => router.push("/ChangePasswordPage")} />
          <MenuRow label="로그아웃" onPress={handleLogout} />
        </Stack>
      </ScrollView>

      <Button variant="primary" onPress={handleSave} className="mt-l">수정하기</Button>
    </View>
  );
}
