import React, { useRef, useState } from "react";
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import EmptyClassesIllustration from "@/components/illustrations/EmptyClassesIllustration";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

export default function StudentHome() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { classes, contributions, events, announcements, attendedClasses, markAttendance, notifications } = useData();
  const [scanSuccess, setScanSuccess] = useState(false);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const todayClasses = classes.filter((c) => c.date === "2026-06-20");
  const nextClass = todayClasses.find((c) => c.status === "ongoing" || c.status === "upcoming");
  const unpaidContributions = contributions.filter((c) => c.status === "unpaid");
  const totalOwed = unpaidContributions.reduce((s, c) => s + c.amount, 0);
  const upcomingEvents = events.filter((e) => e.date >= "2026-06-20").slice(0, 4);

  const handleScanQR = (classId: string) => {
    if (attendedClasses.includes(classId)) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    markAttendance(classId);
    setScanSuccess(true);
    setTimeout(() => setScanSuccess(false), 3000);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.firstName ?? "";

  const statusColor: Record<string, string> = {
    completed: colors.mutedForeground,
    ongoing: "#10B981",
    upcoming: colors.primary,
    cancelled: "#EF4444",
  };
  const statusLabel: Record<string, string> = {
    completed: "Completed",
    ongoing: "● Live now",
    upcoming: "Upcoming",
    cancelled: "Cancelled",
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <LinearGradient
        colors={["#2D1B69", "#7C3AED"]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.name}>{firstName}</Text>
          </View>
          {/* Bell icon with unread badge */}
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/notifications" as any);
            }}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="notifications-outline" size={22} color="#fff" />
            {notifications.filter((n) => !n.isRead).length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {notifications.filter((n) => !n.isRead).length > 9
                    ? "9+"
                    : notifications.filter((n) => !n.isRead).length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => router.push("/(student)/profile")}
            activeOpacity={0.85}
          >
            <Text style={styles.avatarText}>
              {(user?.firstName?.[0] ?? "")}{(user?.surname?.[0] ?? "")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{todayClasses.length}</Text>
            <Text style={styles.statLabel}>Classes today</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: unpaidContributions.length > 0 ? "#FCD34D" : "#34D399" }]}>
              {unpaidContributions.length > 0 ? `₦${(totalOwed / 1000).toFixed(0)}k` : "Nil"}
            </Text>
            <Text style={styles.statLabel}>Amount owed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{upcomingEvents.length}</Text>
            <Text style={styles.statLabel}>Events ahead</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 100 : 100) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Scan success */}
        {scanSuccess && (
          <View style={[styles.successBanner, { backgroundColor: "#10B981" }]}>
            <Ionicons name="checkmark-circle" size={18} color="#fff" />
            <Text style={styles.successText}>Attendance marked!</Text>
          </View>
        )}

        {/* Outstanding Dues Banner */}
        {unpaidContributions.length > 0 && (
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/(student)/payments");
            }}
          >
            <LinearGradient
              colors={["#92400E", "#D97706"]}
              style={styles.duesBanner}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.duesBannerLeft}>
                <View style={styles.duesBannerIcon}>
                  <Ionicons name="warning-outline" size={20} color="#D97706" />
                </View>
                <View>
                  <Text style={styles.duesBannerTitle}>
                    {unpaidContributions.length} unpaid contribution{unpaidContributions.length > 1 ? "s" : ""}
                  </Text>
                  <Text style={styles.duesBannerSub}>
                    Total: ₦{totalOwed.toLocaleString()}
                  </Text>
                </View>
              </View>
              <View style={styles.duesBannerBtn}>
                <Text style={styles.duesBannerBtnText}>Pay Now</Text>
                <Ionicons name="arrow-forward" size={14} color="#D97706" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Next / Current Class */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          {nextClass ? (nextClass.status === "ongoing" ? "Current Class" : "Next Class") : "Today's Classes"}
        </Text>

        {todayClasses.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <EmptyClassesIllustration size={140} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No classes today</Text>
            <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>Enjoy your free day!</Text>
          </View>
        ) : nextClass ? (
          <View style={[styles.classHeroCard, { backgroundColor: colors.card, borderColor: nextClass.status === "ongoing" ? "#10B981" : colors.primary }]}>
            <View style={styles.classHeroTop}>
              <View style={[styles.classStatusBadge, { backgroundColor: (statusColor[nextClass.status] ?? colors.primary) + "20" }]}>
                <Text style={[styles.classStatusText, { color: statusColor[nextClass.status] ?? colors.primary }]}>
                  {statusLabel[nextClass.status]}
                </Text>
              </View>
              {nextClass.attendanceOpen && !attendedClasses.includes(nextClass.id) && (
                <TouchableOpacity
                  style={styles.scanBtn}
                  onPress={() => handleScanQR(nextClass.id)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="qr-code-outline" size={15} color="#fff" />
                  <Text style={styles.scanBtnText}>Mark Present</Text>
                </TouchableOpacity>
              )}
              {attendedClasses.includes(nextClass.id) && (
                <View style={[styles.attendedBadge, { backgroundColor: "#10B98120" }]}>
                  <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                  <Text style={[styles.attendedText, { color: "#10B981" }]}>Attended</Text>
                </View>
              )}
            </View>
            <Text style={[styles.classHeroCourse, { color: colors.primary }]}>{nextClass.courseCode}</Text>
            <Text style={[styles.classHeroName, { color: colors.foreground }]}>{nextClass.courseName}</Text>
            <View style={styles.classHeroMeta}>
              <View style={styles.classMetaItem}>
                <Ionicons name="time-outline" size={14} color={colors.mutedForeground} />
                <Text style={[styles.classMetaText, { color: colors.mutedForeground }]}>
                  {nextClass.startTime} – {nextClass.endTime}
                </Text>
              </View>
              <View style={styles.classMetaItem}>
                <Ionicons name="location-outline" size={14} color={colors.mutedForeground} />
                <Text style={[styles.classMetaText, { color: colors.mutedForeground }]}>{nextClass.venue}</Text>
              </View>
            </View>
          </View>
        ) : (
          todayClasses.map((cls) => (
            <View key={cls.id} style={[styles.classRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.classRowDot, { backgroundColor: statusColor[cls.status] ?? colors.mutedForeground }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.classRowCode, { color: colors.primary }]}>{cls.courseCode}</Text>
                <Text style={[styles.classRowName, { color: colors.foreground }]}>{cls.courseName}</Text>
                <Text style={[styles.classRowMeta, { color: colors.mutedForeground }]}>{cls.startTime} · {cls.venue}</Text>
              </View>
              <Text style={[styles.classRowStatus, { color: statusColor[cls.status] ?? colors.mutedForeground }]}>
                {statusLabel[cls.status]}
              </Text>
            </View>
          ))
        )}

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Upcoming Events</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
              {upcomingEvents.map((ev) => (
                <View key={ev.id} style={[styles.eventChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[styles.eventChipDot, { backgroundColor: ev.category === "big_event" ? "#F59E0B" : colors.primary }]} />
                  <Text style={[styles.eventChipTitle, { color: colors.foreground }]} numberOfLines={2}>{ev.title}</Text>
                  <Text style={[styles.eventChipMeta, { color: colors.mutedForeground }]}>{ev.date}</Text>
                  <Text style={[styles.eventChipVenue, { color: colors.mutedForeground }]} numberOfLines={1}>{ev.venue}</Text>
                </View>
              ))}
            </ScrollView>
          </>
        )}

        {/* Recent Announcements */}
        {announcements.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Announcements</Text>
            {announcements.slice(0, 3).map((an) => (
              <View key={an.id} style={[styles.annoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.annoCategoryDot, { backgroundColor: colors.primary }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.annoTitle, { color: colors.foreground }]}>{an.title}</Text>
                  <Text style={[styles.annoBody, { color: colors.mutedForeground }]} numberOfLines={2}>{an.body}</Text>
                  <Text style={[styles.annoMeta, { color: colors.mutedForeground }]}>{an.postedBy}  ·  {an.time}</Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 28 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 },
  greeting: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.75)" },
  name: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#FFFFFF", marginTop: 2 },
  bellBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.25)",
  },
  badge: {
    position: "absolute", top: -4, right: -4,
    minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: "#EF4444",
    alignItems: "center", justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5, borderColor: "#2D1B69",
  },
  badgeText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#fff" },
  avatar: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "rgba(255,255,255,0.4)",
  },
  avatarText: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 18,
    padding: 16,
  },
  statItem: { flex: 1, alignItems: "center" },
  statNum: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.65)", marginTop: 2, textAlign: "center" },
  statDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.2)" },
  scroll: { padding: 16, gap: 0 },
  successBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 14, padding: 14, marginBottom: 14,
  },
  successText: { color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 14 },
  duesBanner: {
    borderRadius: 18, padding: 16, marginBottom: 20,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  duesBannerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  duesBannerIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  duesBannerTitle: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },
  duesBannerSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)", marginTop: 2 },
  duesBannerBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#fff", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
  },
  duesBannerBtnText: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#D97706" },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", marginTop: 8, marginBottom: 12 },
  emptyCard: {
    borderRadius: 20, borderWidth: 1, padding: 32,
    alignItems: "center", gap: 8, marginBottom: 8,
  },
  emptyEmoji: { fontSize: 36 },
  emptyTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  emptyBody: { fontSize: 13, fontFamily: "Inter_400Regular" },
  classHeroCard: {
    borderRadius: 20, borderWidth: 2, padding: 20, marginBottom: 8, gap: 8,
  },
  classHeroTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  classStatusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  classStatusText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  scanBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#7C3AED", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7,
  },
  scanBtnText: { color: "#fff", fontSize: 12, fontFamily: "Inter_700Bold" },
  attendedBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  attendedText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  classHeroCourse: { fontSize: 13, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  classHeroName: { fontSize: 18, fontFamily: "Inter_700Bold" },
  classHeroMeta: { flexDirection: "row", gap: 16, marginTop: 4 },
  classMetaItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  classMetaText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  classRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 8,
  },
  classRowDot: { width: 10, height: 10, borderRadius: 5 },
  classRowCode: { fontSize: 12, fontFamily: "Inter_700Bold" },
  classRowName: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginTop: 1 },
  classRowMeta: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  classRowStatus: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  hScroll: { marginLeft: -4, marginBottom: 8 },
  eventChip: {
    width: 160, borderRadius: 18, borderWidth: 1,
    padding: 16, gap: 6, marginLeft: 4, marginRight: 4,
  },
  eventChipDot: { width: 8, height: 8, borderRadius: 4 },
  eventChipTitle: { fontSize: 14, fontFamily: "Inter_700Bold", lineHeight: 19 },
  eventChipMeta: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginTop: 2 },
  eventChipVenue: { fontSize: 11, fontFamily: "Inter_400Regular" },
  annoCard: {
    flexDirection: "row", gap: 12,
    borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 8,
  },
  annoCategoryDot: { width: 4, borderRadius: 2, alignSelf: "stretch" },
  annoTitle: { fontSize: 14, fontFamily: "Inter_700Bold", marginBottom: 4 },
  annoBody: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  annoMeta: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 6 },
});
