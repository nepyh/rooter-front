import { Pressable, SectionList, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LoadingView, MorePageHeader, NotificationCard, Text, Toast, UnreadCountBadge } from "@/components";
import type { AppNotification } from "@/api/more/NotificationList";
import { useNow } from "@/hooks/common/useNow";
import { useNotifications } from "@/hooks/more/useNotifications";
import { formatRelativeTime, getNotificationHref, groupNotificationsByDay } from "@/utils/more/notification";
import { parseServerDateTime } from "@/utils/common/date";
import { getSpacing } from "@/utils/common/token";

// ================================
// Components
// ================================

function CardSeparator() {
  return <View className="h-spacing-4" />;
}

/**
 * 알림함 화면. 안 읽은 알림을 날짜별로 묶어 보여주고, 누르면 읽음 처리 후 알림 종류에 맞는 화면으로 이동
 */
export default function NotificationListPage() {
  const now = useNow(60_000);
  const { loaded, failed, notifications, unreadCount, loadingMore, loadMore, markRead, readAll, errorMessage, clearError } = useNotifications();
  const sections = groupNotificationsByDay(notifications, now);

  const handlePress = (notification: AppNotification) => {
    markRead(notification.id);
    const href = getNotificationHref(notification);
    if (href) router.push(href);
  };

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <MorePageHeader
        title="알림"
        accessory={<UnreadCountBadge count={unreadCount} />}
        right={
          <Pressable onPress={readAll} disabled={unreadCount === 0}>
            <Text variant="base-large" color="secondary">모두 읽음</Text>
          </Pressable>
        }
      />

      {loaded ? (
        <SectionList
          sections={sections}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <NotificationCard
              title={item.title}
              body={item.body}
              time={formatRelativeTime(parseServerDateTime(item.createdAt), now)}
              onPress={() => handlePress(item)}
            />
          )}
          renderSectionHeader={({ section }) => (
            <Text variant="header-small" className={`pb-spacing-5 ${section.key === sections[0]?.key ? "" : "pt-spacing-9"}`}>
              {section.title}
            </Text>
          )}
          ItemSeparatorComponent={CardSeparator}
          stickySectionHeadersEnabled={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            loadingMore ? null : (
              <Text variant="base-medium" color="disabled" className="text-center pt-spacing-9">
                {failed ? "알림을 불러오지 못했습니다." : "새 알림이 없어요."}
              </Text>
            )
          }
          ListFooterComponent={loadingMore ? <LoadingView text="" /> : null}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: getSpacing("spacing-9") }}
        />
      ) : (
        <LoadingView />
      )}

      {!!errorMessage && <Toast text={errorMessage} onClose={clearError} />}
    </View>
  );
}
