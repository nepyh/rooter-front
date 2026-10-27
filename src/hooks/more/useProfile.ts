import { useEffect, useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useUserStore } from "@/store";
import { updateUserProfile, uploadAvatar } from "@/api/common/user";
import type { UserInfo } from "@/api/common/user";
import { resolveSchoolName } from "@/api/more/Profile";
import { queryClient, queryKeys } from "@/api/queryClient";
import { useUserInfo } from "@/hooks/common/useUserInfo";

// ================================
// Hooks
// ================================

/**
 * useProfile — 프로필 화면의 내 정보 조회, 프로필 사진 변경, 소개 저장
 * 내 정보는 캐시(useUserInfo)에서 바로 꺼내 보여주고, 사진·소개를 바꾸면 캐시도 함께 고쳐 더보기 화면에 바로 반영합니다.
 * @returns user, userInfo, schoolName, bio, setBio, profileImageUri, pickImage, saveBio(성공 여부를 돌려줌)
 */
export function useProfile() {
  const user = useUserStore((state) => state.user);
  const userId = useUserStore((state) => state.userId);
  const updateProfile = useUserStore((state) => state.updateProfile);
  const userInfo = useUserInfo();

  const [editedBio, setBio] = useState<string | null>(null);
  const [pickedImageUri, setPickedImageUri] = useState<string | null>(null);
  const [schoolName, setSchoolName] = useState<string | null>(null);

  const bio = editedBio ?? userInfo?.bio ?? user?.bio ?? "";
  const profileImageUri = pickedImageUri ?? userInfo?.avatarUrl ?? undefined;

  useEffect(() => {
    if (!userInfo) return;
    resolveSchoolName(userInfo).then(setSchoolName);
  }, [userInfo]);

  const updateUserInfoCache = (patch: Partial<UserInfo>) => {
    if (userId === null) return;
    queryClient.setQueryData<UserInfo>(queryKeys.users.info(userId), (old) => (old ? { ...old, ...patch } : old));
  };

  const pickImage = async () => {
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

    if (result.canceled || userId === null) return;

    const asset = result.assets[0];
    setPickedImageUri(asset.uri);

    try {
      const uploaded = await uploadAvatar(userId, { uri: asset.uri, fileName: asset.fileName, mimeType: asset.mimeType });
      updateUserInfoCache({ avatarUrl: uploaded.avatarUrl });
    } catch {
      setPickedImageUri(null);
      Alert.alert("업로드 실패", "프로필 사진 업로드에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const saveBio = async () => {
    if (userId === null) return false;
    try {
      await updateUserProfile(userId, { bio });
      updateProfile({ bio });
      updateUserInfoCache({ bio });
      return true;
    } catch {
      Alert.alert("저장 실패", "소개 저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
      return false;
    }
  };

  return { user, userInfo, schoolName, bio, setBio, profileImageUri, pickImage, saveBio };
}
