import React, { useState } from "react";
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
import { useColors } from "@/hooks/useColors";

type AdminNotif = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  body: string;
  time: string;
  isRead: boolean;
};

export default function AdminNotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { students, classes, contributions, announcements } = useData();

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const pending = students.filter((s) => s.status === "pending");
  const todayClasses = classes.filter((c) => c.date === "2026-06-20");
  const unpaidContributions = contributions.filter((c) => c.status === "unpaid");

  const derived: AdminNotif[] = [
    ...(pending.length > 0
      ? [{
          id: "pending-approvals",
          icon: "time-outline" as const,
          iconColor: "#F59E0B",
          title: `${pending.length} Pending Approval${pending.length !== 1 ? "s" : ""}`,
          body: `${pending.map((s) => `${s.firstName} ${s.surname}`).slice(0, 3).join(", ")}${pending.length > 3 ? ` +${pending.length - 3} more` : ""} are awaiting document verification.`,
          time: "Today",
          isRead: false,
        }]
      : []),
    ...(todayClasses.length > 0
      ? [{
          id: "today-classes",
          icon: "school-outline" as const,
          iconColor: "#7C3AED",
          title: `${todayClasses.length} Class${todayClasses.length !== 1 ? "es" : ""} Today`,
          body: todayClasses.map((c) => `${c.courseCode} at ${c.startTime}`).join(" · "),
          time: "Today",
          isRead: false,
        }]
      : []),
    ...(unpaidContributions.length > 0
      ? [{
          id: "unpaid-contributions",
          icon: "card-outline" as const,
          iconColor: "#EF4444",
          title: `${unpaidContributions.length} Unpaid Contribution${unpaidContributions.length !== 1 ? "s" : ""}`,
          body: `₦${unpaidContributions.reduce((s, c) => s + c.amount, 0).toLocaleString()} outstanding across ${unpaidContributions.length} student${unpaidContributions.length !== 1 ? "s" : ""}.`,
          time: "This week",
          isRead: true,
        }]
      : []),
    ...(announcements.slice(0, 3).map((a, i) => ({
      id: `ann-${i}`,
      icon: "megaphone-outline" as const,
      iconColor: "#8B5CF6",
      title: `Announcement: ${a.title}`,
      body: `Posted to ${a.targetAudience}${a.postedBy ? ` by ${a.postedBy}` : ""}.`,
      time: a.time,
      isRead: true,
    }))),
  ];

  const [notifs, setNotifs] = useState<AdminNotif[]>(derived);
  const unreadCount = notifs.filter((n) => !n.isRead).length;

  const markAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={["#2D1B69", "#7C3AED"]}
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
            <Text style={styles.title}>Notifications</Text>
            <Text style={styles.subtitle}>
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
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
        data={notifs}
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
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No notifications yet
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.row, { backgroundColor: item.isRead ? colors.background : colors.primary + "08" }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setNotifs((prev) =>
                prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
              );
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
                {!item.isRead && <View style={[styles.dot, { backgroundColor: colors.primary }]} />}
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
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.65)", marginTop: 1 },
  markAllBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 20 },
  markAllText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#fff" },
  list: { padding: 0 },
  sep: { height: 1, marginLeft: 72 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 14, paddingVertical: 14, paddingHorizontal: 20 },
  iconWrap: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", marginTop: 2 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  notifTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  notifBody: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  time: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
});
