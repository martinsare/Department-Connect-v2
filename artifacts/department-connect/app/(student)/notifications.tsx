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
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import type { NotificationCategory } from "@/context/DataContext";

type Tab = "all" | NotificationCategory;

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "lectures", label: "Lectures" },
  { key: "big_events", label: "Big Events" },
  { key: "small_events", label: "Small Events" },
  { key: "extras", label: "Extras" },
];

const CATEGORY_ICONS: Record<NotificationCategory, keyof typeof Ionicons.glyphMap> = {
  lectures: "school-outline",
  big_events: "megaphone-outline",
  small_events: "people-outline",
  extras: "receipt-outline",
};

const CATEGORY_COLORS: Record<NotificationCategory, string> = {
  lectures: "#7C3AED",
  big_events: "#F59E0B",
  small_events: "#8B5CF6",
  extras: "#10B981",
};

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { notifications, markNotificationRead } = useData();
  const [activeTab, setActiveTab] = useState<Tab>("all");

  const filtered =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => n.category === activeTab);

  const unreadCount = (cat: Tab) =>
    cat === "all"
      ? notifications.filter((n) => !n.isRead).length
      : notifications.filter((n) => n.category === cat && !n.isRead).length;

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={[styles.header, { paddingTop: topPad + 20 }]}
      >
        <Text style={styles.title}>Inbox</Text>
        <View style={styles.tabsScroll}>
          <FlatList
            horizontal
            data={TABS}
            keyExtractor={(t) => t.key}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item: tab }) => {
              const count = unreadCount(tab.key);
              return (
                <TouchableOpacity
                  style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setActiveTab(tab.key);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                    {tab.label}
                  </Text>
                  {count > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{count}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={{ gap: 8 }}
          />
        </View>
      </LinearGradient>

      <FlatList
        data={filtered}
        keyExtractor={(n) => n.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 84 : 90) },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No notifications</Text>
          </View>
        }
        renderItem={({ item: n }) => {
          const catColor = CATEGORY_COLORS[n.category];
          const catIcon = CATEGORY_ICONS[n.category];
          return (
            <TouchableOpacity
              style={[
                styles.notifCard,
                {
                  backgroundColor: n.isRead ? colors.card : colors.secondary,
                  borderColor: n.isRead ? colors.border : colors.primary + "40",
                },
              ]}
              onPress={() => {
                markNotificationRead(n.id);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              activeOpacity={0.85}
            >
              <View style={[styles.iconCircle, { backgroundColor: catColor + "20" }]}>
                <Ionicons name={catIcon} size={18} color={catColor} />
              </View>
              <View style={styles.notifContent}>
                <View style={styles.notifTopRow}>
                  <Text style={[styles.notifTitle, { color: colors.foreground }]} numberOfLines={1}>
                    {n.title}
                  </Text>
                  {n.priority === "high" && (
                    <View style={[styles.highBadge, { backgroundColor: "#FEE2E2" }]}>
                      <Text style={styles.highBadgeText}>High</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.notifBody, { color: colors.mutedForeground }]} numberOfLines={2}>
                  {n.body}
                </Text>
                <View style={styles.notifMeta}>
                  <View style={[styles.categoryChip, { backgroundColor: catColor + "15" }]}>
                    <Text style={[styles.categoryChipText, { color: catColor }]}>
                      {n.category.replace("_", " ")}
                    </Text>
                  </View>
                  <Text style={[styles.notifTime, { color: colors.mutedForeground }]}>{n.time}</Text>
                </View>
              </View>
              {!n.isRead && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#fff", marginBottom: 16 },
  tabsScroll: { marginBottom: 0 },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  tabActive: { backgroundColor: "#fff" },
  tabText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.8)" },
  tabTextActive: { color: "#7C3AED" },
  badge: {
    backgroundColor: "#EF4444",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: { color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold" },
  list: { padding: 16, gap: 10 },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  notifCard: {
    flexDirection: "row",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: "flex-start",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  notifContent: { flex: 1 },
  notifTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  notifTitle: { fontSize: 14, fontFamily: "Inter_700Bold", flex: 1, marginRight: 8 },
  notifBody: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  notifMeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  categoryChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  categoryChipText: { fontSize: 10, fontFamily: "Inter_700Bold", textTransform: "uppercase", letterSpacing: 0.5 },
  notifTime: { fontSize: 11, fontFamily: "Inter_400Regular" },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  highBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  highBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#DC2626" },
});
