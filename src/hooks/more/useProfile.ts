import { useEffect, useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useUserStore } from "@/store";
import { getUserInfo, updateUserProfile, uploadAvatar } from "@/api/user";
import type { UserInfo } from "@/api/user";
import { resolveSchoolName } from "@/api/more/Profile";

// ================================
// Hooks
// ================================

/**
 * useProfile — 프로필 화면의 내 정보 조회, 프로필 사진 변경, 소개 저장
 * 로그인 응답엔 소개·사진이 없어서 화면에 들어오면 서버에서 최신 값을 받아옵니다.
 * @returns user, userInfo, schoolName, bio, setBio, profileImageUri, pickImage, saveBio(성공 여부를 돌려줌)
 */
export function useProfile() {
  const user = useUserStore((state) => state.user);
  const userId = useUserStore((state) => state.userId);
  const updateProfile = useUserStore((state) => state.updateProfile);

  const [bio, setBio] = useState(user?.bio ?? "");
  const [profileImageUri, setProfileImageUri] = useState(user?.profileImageUri);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [schoolName, setSchoolName] = useState<string | null>(null);

  useEffect(() => {
    if (userId === null) return;
    getUserInfo(userId)
      .then((info) => {
        setUserInfo(info);
        resolveSchoolName(info).then(setSchoolName);
        setBio(info.bio ?? "");
        if (info.avatarUrl) setProfileImageUri(info.avatarUrl);
        updateProfile({ bio: info.bio ?? "" });
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

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
    setProfileImageUri(asset.uri);

    try {
      await uploadAvatar(userId, { uri: asset.uri, fileName: asset.fileName, mimeType: asset.mimeType });
      updateProfile({ profileImageUri: asset.uri });
    } catch {
      Alert.alert("업로드 실패", "프로필 사진 업로드에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const saveBio = async () => {
    if (userId === null) return false;
    try {
      await updateUserProfile(userId, { bio });
      updateProfile({ bio, profileImageUri });
      return true;
    } catch {
      Alert.alert("저장 실패", "소개 저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
      return false;
    }
  };

  return { user, userInfo, schoolName, bio, setBio, profileImageUri, pickImage, saveBio };
}
