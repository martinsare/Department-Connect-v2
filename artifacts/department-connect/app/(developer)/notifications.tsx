import React from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useData } from "@/context/DataContext";
import type { AdminNotification, AppNotification } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

type FeedItem = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  body: string;
  time: string;
  isRead: boolean;
  tag: "admin" | "student" | "system";
};

const TAG_COLORS: Record<FeedItem["tag"], string> = {
  admin: "#7C3AED",
  student: "#10B981",
  system: "#6366F1",
};

const TAG_LABELS: Record<FeedItem["tag"], string> = {
  admin: "Admin",
  student: "Student",
  system: "System",
};

const CATEGORY_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  classes: "school-outline",
  events: "calendar-outline",
  extras: "card-outline",
  people: "people-outline",
  grades: "bar-chart-outline",
};

function toFeedItem(n: AppNotification): FeedItem {
  return {
    id: `s_${n.id}`,
    icon: CATEGORY_ICON[n.category] ?? "notifications-outline",
    iconColor: "#10B981",
    title: n.title,
    body: n.body,
    time: n.time,
    isRead: n.isRead,
    tag: "student",
  };
}

function adminToFeedItem(n: AdminNotification): FeedItem {
  return {
    id: `a_${n.id}`,
    icon: (n.icon as keyof typeof Ionicons.glyphMap) ?? "card-outline",
    iconColor: n.iconColor,
    title: n.title,
    body: n.body,
    time: n.time,
    isRead: n.isRead,
    tag: "admin",
  };
}

export default function DevNotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    adminNotifications,
    markAdminNotificationRead,
    notifications,
    students,
    classes,
    auditLogs,
  } = useData();

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const pending = students.filter((s) => s.status === "pending");
  const todayClasses = classes.filter((c) => c.date === "2026-06-20");
  const recentLogs = auditLogs.slice(0, 3);

  const systemItems: FeedItem[] = [
    {
      id: "system-health",
      icon: "checkmark-circle-outline",
      iconColor: "#10B981",
      title: "System Health: Healthy",
      body: "All services operational. API latency 42ms, uptime 99.9%, storage 2.4GB used.",
      time: "Just now",
      isRead: false,
      tag: "system",
    },
    ...(pending.length > 0
      ? [{
          id: "pending",
          icon: "time-outline" as const,
          iconColor: "#F59E0B",
          title: `${pending.length} Pending Student Approval${pending.length !== 1 ? "s" : ""}`,
          body: `Awaiting admin review: ${pending.map((s) => `${s.firstName} ${s.surname}`).slice(0, 2).join(", ")}${pending.length > 2 ? ` +${pending.length - 2} more` : ""}.`,
          time: "Today",
          isRead: false,
          tag: "system" as const,
        }]
      : []),
    ...(todayClasses.length > 0
      ? [{
          id: "classes",
          icon: "school-outline" as const,
          iconColor: "#7C3AED",
          title: `${todayClasses.length} Class${todayClasses.length !== 1 ? "es" : ""} Scheduled Today`,
          body: todayClasses.map((c) => `${c.courseCode} ${c.startTime}`).join(", "),
          time: "Today",
          isRead: true,
          tag: "system" as const,
        }]
      : []),
    {
      id: "db-backup",
      icon: "server-outline",
      iconColor: "#6366F1",
      title: "Database Backup Completed",
      body: "Automated daily backup completed successfully. 2.4GB saved to secure storage.",
      time: "6 hours ago",
      isRead: true,
      tag: "system",
    },
    ...recentLogs.map((log, i) => ({
      id: `log-${i}`,
      icon: "document-text-outline" as const,
      iconColor: "#8B5CF6",
      title: `Audit: ${log.action}`,
      body: `${log.user} — ${log.details}`,
      time: log.timestamp,
      isRead: true,
      tag: "system" as const,
    })),
  ];

  const liveAdminItems = adminNotifications.map(adminToFeedItem);
  const liveStudentItems = notifications.slice(0, 10).map(toFeedItem);

  const allItems: FeedItem[] = [
    ...liveAdminItems,
    ...liveStudentItems,
    ...systemItems,
  ];

  const unreadCount = allItems.filter((n) => !n.isRead).length;

  const markAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    adminNotifications.forEach((n) => {
      if (!n.isRead) markAdminNotificationRead(n.id);
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={["#1a1a2e", "#16213e", "#0f3460"]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>All Notifications</Text>
            <Text style={styles.subtitle}>
              {unreadCount > 0 ? `${unreadCount} unread · Admin + Student + System` : "All caught up"}
            </Text>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAll} style={styles.markAllBtn}>
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <FlatList
        data={allItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 84 : 90) },
        ]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={[styles.sep, { backgroundColor: colors.border }]} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="notifications-off-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No notifications yet</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.row, { backgroundColor: item.isRead ? colors.background : "#F59E0B08" }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (item.tag === "admin") {
                markAdminNotificationRead(item.id.replace("a_", ""));
              }
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, { backgroundColor: item.iconColor + "18" }]}>
              <Ionicons name={item.icon} size={20} color={item.iconColor} />
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <View style={styles.titleRow}>
                <Text style={[styles.notifTitle, { color: colors.foreground }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <View style={[styles.tagPill, { backgroundColor: TAG_COLORS[item.tag] + "22" }]}>
                  <Text style={[styles.tagText, { color: TAG_COLORS[item.tag] }]}>{TAG_LABELS[item.tag]}</Text>
                </View>
                {!item.isRead && <View style={[styles.dot, { backgroundColor: "#F59E0B" }]} />}
              </View>
              <Text style={[styles.notifBody, { color: colors.mutedForeground }]} numberOfLines={2}>
                {item.body}
              </Text>
              <Text style={[styles.time, { color: colors.mutedForeground }]}>{item.time}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.55)", marginTop: 1 },
  markAllBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 20 },
  markAllText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#fff" },
  list: { padding: 0 },
  sep: { height: 1, marginLeft: 72 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 14, paddingVertical: 14, paddingHorizontal: 20 },
  iconWrap: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", marginTop: 2 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  notifTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", flex: 1 },
  tagPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  tagText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  dot: { width: 8, height: 8, borderRadius: 4 },
  notifBody: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  time: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
});
