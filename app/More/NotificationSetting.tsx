import { useState } from "react";
import { ScrollView, View } from "react-native";
import Animated, { FadeInUp, FadeOutUp, LinearTransition } from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import { LeadMinutesChip, Modal, MorePageHeader, NotificationSettingRow, Switch, Toast, WheelPicker } from "@/components";
import { MAX_LEAD_MINUTES, MIN_LEAD_MINUTES } from "@/api/more/NotificationSetting";
import { useNotificationPermission } from "@/hooks/more/useNotificationPermission";
import { useNotificationSettings } from "@/hooks/more/useNotificationSettings";

// ================================
// Constants
// ================================

const LEAD_MINUTE_OPTIONS = Array.from({ length: MAX_LEAD_MINUTES - MIN_LEAD_MINUTES + 1 }, (_, i) => MIN_LEAD_MINUTES + i);
const LEAD_MINUTE_LABELS = LEAD_MINUTE_OPTIONS.map((minutes) => `${minutes}분`);

const REVEAL_ENTERING = FadeInUp.duration(250);
const REVEAL_EXITING = FadeOutUp.duration(200);
const REVEAL_LAYOUT = LinearTransition.duration(250);

// ================================
// Components
// ================================

/**
 * 알림 설정 화면
 * 기기 알림을 허용해야 할일 알림 설정이 보이고, 할일 알림을 켜야 몇 분 전에 받을지 설정이 보임
 */
export default function NotificationSettingPage() {
  const { granted, openPermission } = useNotificationPermission();
  const { settings, update, errorMessage, clearError } = useNotificationSettings();
  const [pickedMinutes, setPickedMinutes] = useState<number | null>(null);

  const saveLeadMinutes = () => {
    if (pickedMinutes !== null) update({ taskReminderLeadMinutes: pickedMinutes });
    setPickedMinutes(null);
  };

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <MorePageHeader title="알림 설정" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="w-full gap-spacing-8 pt-spacing-5">
          <NotificationSettingRow
            title="알림 받기"
            description={'루터 앱의 알림 수신을 허용합니다.'}
          >
            <Switch value={!!granted} onToggle={openPermission} />
          </NotificationSettingRow>

          {granted && settings && (
            <>
              <Animated.View entering={REVEAL_ENTERING} exiting={REVEAL_EXITING} layout={REVEAL_LAYOUT}>
                <View className="h-spacing-divider w-full bg-neutral-600" />
              </Animated.View>
              <Animated.View entering={REVEAL_ENTERING} exiting={REVEAL_EXITING} layout={REVEAL_LAYOUT}>
                <NotificationSettingRow title="할일 알림" description="사용자가 설정한 시간 전에 할 일 알림을 전송합니다.">
                  <Switch
                    value={settings.taskReminderEnabled}
                    onToggle={() => update({ taskReminderEnabled: !settings.taskReminderEnabled })}
                  />
                </NotificationSettingRow>
              </Animated.View>
              {settings.taskReminderEnabled && (
                <Animated.View entering={REVEAL_ENTERING} exiting={REVEAL_EXITING} layout={REVEAL_LAYOUT}>
                  <NotificationSettingRow title="할일 알림 시간 설정" description="몇 분 전에 할일 알림을 받을지 설정합니다. 0~60분까지 가능합니다.">
                    <LeadMinutesChip minutes={settings.taskReminderLeadMinutes} onPress={() => setPickedMinutes(settings.taskReminderLeadMinutes)} />
                  </NotificationSettingRow>
                </Animated.View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={pickedMinutes !== null}
        title="할일 알림 시간"
        description="할일 시작 몇 분 전에 알림을 받을지 골라주세요."
        confirmText="저장"
        onCancel={() => setPickedMinutes(null)}
        onConfirm={saveLeadMinutes}
      >
        {pickedMinutes !== null && (
          <WheelPicker
            data={LEAD_MINUTE_LABELS}
            selectedIndex={pickedMinutes - MIN_LEAD_MINUTES}
            onChange={(index) => setPickedMinutes(LEAD_MINUTE_OPTIONS[index])}
          />
        )}
      </Modal>

      {!!errorMessage && <Toast text={errorMessage} onClose={clearError} />}
    </View>
  );
}
