import React, { useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

function StatPill({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={[statStyles.pill, { backgroundColor: color + "18" }]}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={[statStyles.value, { color }]}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  pill: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  value: { fontSize: 18, fontFamily: "Inter_700Bold" },
  label: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#64748B", textAlign: "center" },
});

function ClassItem({ cls, onScan }: { cls: any; onScan?: () => void }) {
  const colors = useColors();
  const statusColors: Record<string, string> = {
    completed: colors.mutedForeground,
    ongoing: colors.success,
    upcoming: colors.primary,
    cancelled: colors.destructive,
  };
  const statusLabels: Record<string, string> = {
    completed: "Done",
    ongoing: "Live",
    upcoming: "Soon",
    cancelled: "Cancelled",
  };
  const col = statusColors[cls.status] ?? colors.mutedForeground;
  return (
    <View style={[classStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[classStyles.dot, { backgroundColor: col }]} />
      <View style={classStyles.info}>
        <Text style={[classStyles.code, { color: colors.primary }]}>{cls.courseCode}</Text>
        <Text style={[classStyles.name, { color: colors.foreground }]} numberOfLines={1}>{cls.courseName}</Text>
        <Text style={[classStyles.meta, { color: colors.mutedForeground }]}>
          {cls.startTime} – {cls.endTime}  ·  {cls.venue}
        </Text>
      </View>
      <View style={classStyles.right}>
        <View style={[classStyles.badge, { backgroundColor: col + "20" }]}>
          <Text style={[classStyles.badgeText, { color: col }]}>{statusLabels[cls.status]}</Text>
        </View>
        {cls.attendanceOpen && onScan && (
          <TouchableOpacity
            style={[classStyles.scanBtn, { backgroundColor: colors.primary }]}
            onPress={onScan}
            activeOpacity={0.85}
          >
            <Ionicons name="qr-code-outline" size={14} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const classStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 12,
    marginBottom: 10,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  info: { flex: 1 },
  code: { fontSize: 12, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  name: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginTop: 1 },
  meta: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  right: { alignItems: "flex-end", gap: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  scanBtn: { padding: 6, borderRadius: 8 },
});

export default function StudentHome() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { classes, contributions, events, announcements, attendanceS1, attendedClasses, markAttendance } = useData();
  const [scanSuccess, setScanSuccess] = React.useState(false);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const todayClasses = classes.filter((c) => c.date === "2026-06-20");
  const overallAtt = Math.round(
    attendanceS1.reduce((s, r) => s + r.percentage, 0) / attendanceS1.length
  );
  const unpaidContributions = contributions.filter((c) => c.status === "unpaid");
  const totalOwed = unpaidContributions.reduce((s, c) => s + c.amount, 0);
  const upcomingEvents = events.filter((e) => e.date >= "2026-06-20");

  const handleScanQR = (classId: string) => {
    if (attendedClasses.includes(classId)) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    markAttendance(classId);
    setScanSuccess(true);
    setTimeout(() => setScanSuccess(false), 3000);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const initials = `${user?.firstName?.[0] ?? ""}${user?.surname?.[0] ?? ""}`;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={[styles.header, { paddingTop: topPad + 20 }]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.name}>{user?.firstName} {user?.surname}</Text>
            <Text style={styles.matric}>{user?.matricNumber}  ·  {user?.level}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>

        <View style={styles.statRow}>
          <StatPill label="Attendance" value={`${overallAtt}%`} color="#34D399" icon="checkmark-circle" />
          <StatPill label="Owed" value={totalOwed > 0 ? `₦${totalOwed.toLocaleString()}` : "Nil"} color={totalOwed > 0 ? "#F59E0B" : "#34D399"} icon="card-outline" />
          <StatPill label="Classes" value={`${todayClasses.length}`} color="#60A5FA" icon="calendar" />
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 84 : 90) }]}
        showsVerticalScrollIndicator={false}
      >
        {scanSuccess && (
          <View style={[styles.successBanner, { backgroundColor: colors.success }]}>
            <Ionicons name="checkmark-circle" size={18} color="#fff" />
            <Text style={styles.successText}>Attendance marked successfully!</Text>
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Today's Classes</Text>
        {todayClasses.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
            <Ionicons name="calendar-outline" size={32} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No classes today</Text>
          </View>
        ) : (
          todayClasses.map((cls) => (
            <ClassItem
              key={cls.id}
              cls={cls}
              onScan={cls.attendanceOpen && !attendedClasses.includes(cls.id) ? () => handleScanQR(cls.id) : undefined}
            />
          ))
        )}

        {unpaidContributions.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Outstanding Dues</Text>
            {unpaidContributions.map((c) => (
              <View key={c.id} style={[styles.duesCard, { backgroundColor: "#FFF7ED", borderColor: "#FED7AA" }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.duesTitle, { color: "#92400E" }]}>{c.title}</Text>
                  <Text style={styles.duesMeta}>Due: {c.deadline}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.duesAmount}>₦{c.amount.toLocaleString()}</Text>
                  <TouchableOpacity
                    style={styles.payBtn}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push("/(student)/payments");
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.payBtnText}>Pay Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Upcoming Events</Text>
        {upcomingEvents.slice(0, 2).map((ev) => (
          <View key={ev.id} style={[styles.eventCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.eventCategoryDot, { backgroundColor: ev.category === "big_event" ? colors.accent : colors.info }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.eventTitle, { color: colors.foreground }]}>{ev.title}</Text>
              <Text style={[styles.eventMeta, { color: colors.mutedForeground }]}>{ev.date}  ·  {ev.time}  ·  {ev.venue}</Text>
            </View>
          </View>
        ))}

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Announcements</Text>
        {announcements.slice(0, 2).map((an) => (
          <View key={an.id} style={[styles.annoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.annoTitle, { color: colors.foreground }]}>{an.title}</Text>
            <Text style={[styles.annoBody, { color: colors.mutedForeground }]} numberOfLines={2}>{an.body}</Text>
            <Text style={[styles.annoMeta, { color: colors.mutedForeground }]}>{an.postedBy}  ·  {an.time}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  greeting: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)" },
  name: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#FFFFFF", marginTop: 2 },
  matric: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)", marginTop: 4 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  avatarText: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
  statRow: { flexDirection: "row", gap: 10 },
  content: { padding: 16, gap: 0 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginTop: 20, marginBottom: 12 },
  emptyCard: {
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  successText: { color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 14 },
  duesCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
  },
  duesTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  duesMeta: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#B45309", marginTop: 2 },
  duesAmount: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#92400E" },
  payBtn: { backgroundColor: "#F59E0B", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginTop: 6 },
  payBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 12 },
  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  eventCategoryDot: { width: 10, height: 10, borderRadius: 5 },
  eventTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  eventMeta: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  annoCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  annoTitle: { fontSize: 14, fontFamily: "Inter_700Bold", marginBottom: 4 },
  annoBody: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  annoMeta: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 6 },
});
