import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

function StatCard({
  label,
  value,
  icon,
  color,
  sub,
  onPress,
}: {
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  sub?: string;
  onPress?: () => void;
}) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[cardStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <View style={[cardStyles.iconWrap, { backgroundColor: color + "18" }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[cardStyles.value, { color: colors.foreground }]}>{value}</Text>
      <Text style={[cardStyles.label, { color: colors.mutedForeground }]}>{label}</Text>
      {sub && <Text style={[cardStyles.sub, { color: color }]}>{sub}</Text>}
    </TouchableOpacity>
  );
}

const cardStyles = StyleSheet.create({
  card: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 14, gap: 4, minWidth: "45%" },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  value: { fontSize: 22, fontFamily: "Inter_700Bold" },
  label: { fontSize: 12, fontFamily: "Inter_400Regular" },
  sub: { fontSize: 11, fontFamily: "Inter_600SemiBold", marginTop: 2 },
});

const TARGET_OPTIONS = ["All Students", "100L", "200L", "300L", "400L", "500L"];
const CATEGORIES = ["Academic", "Administrative", "Financial", "Social", "Urgent"];

export default function AdminDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout, allUsers } = useAuth();
  const { students, classes, announcements, contributions, events, addAnnouncement, attendanceS1, attendanceS2 } = useData();
  const [showAnnounce, setShowAnnounce] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [modalAttSem, setModalAttSem] = useState<1 | 2>(1);
  const [annTitle, setAnnTitle] = useState("");
  const [annBody, setAnnBody] = useState("");
  const [annTarget, setAnnTarget] = useState("All Students");
  const [annCategory, setAnnCategory] = useState("Academic");
  const [posting, setPosting] = useState(false);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const activeStudents = students.filter((s) => s.status === "active").length;
  const pendingStudents = students.filter((s) => s.status === "pending");
  const todayClasses = classes.filter((c) => c.date === "2026-06-20");
  const totalAdmins = allUsers.filter((u) => u.role === "admin").length;

  const totalAttended = classes.reduce((s, c) => s + c.attendanceCount, 0);
  const totalCapacity = classes.length * 25;
  const attRate = Math.round((totalAttended / totalCapacity) * 100);

  const modalAttRecords = modalAttSem === 1 ? attendanceS1 : attendanceS2;
  const modalAvgAtt = modalAttRecords.length > 0
    ? Math.round(modalAttRecords.reduce((s, r) => s + r.percentage, 0) / modalAttRecords.length)
    : 0;

  const totalContributions = contributions.reduce((s, c) => s + c.amount, 0);
  const paidContributions = contributions.filter((c) => c.status === "paid").reduce((s, c) => s + c.amount, 0);
  const outstandingPayments = contributions.filter((c) => c.status === "unpaid").length;

  const upcomingEvents = events.filter((e) => e.date >= "2026-06-20").slice(0, 2);

  const handlePostAnnouncement = async () => {
    if (!annTitle.trim() || !annBody.trim()) {
      Alert.alert("Missing Fields", "Please fill in both title and message.");
      return;
    }
    setPosting(true);
    await new Promise((r) => setTimeout(r, 500));
    addAnnouncement({
      title: annTitle.trim(),
      body: annBody.trim(),
      postedBy: `${user?.firstName} ${user?.surname} (${user?.subRole ?? "Admin"})`,
      time: "Just now",
      category: annCategory,
      targetAudience: annTarget,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setPosting(false);
    setShowAnnounce(false);
    setAnnTitle(""); setAnnBody("");
    Alert.alert("Announcement Posted", `Your announcement has been sent to ${annTarget}.`);
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={[styles.header, { paddingTop: topPad + 20 }]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Admin Panel</Text>
            <Text style={styles.name}>{user?.firstName} {user?.surname}</Text>
            <Text style={styles.role}>{user?.subRole ?? "Admin"}  ·  {user?.department}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={20} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: "rgba(255,255,255,0.2)" }]}
            onPress={() => setShowAnnounce(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="megaphone-outline" size={18} color="#fff" />
            <Text style={styles.quickBtnText}>Announce</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: "rgba(255,255,255,0.2)" }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setShowAnalytics(true); }}
            activeOpacity={0.8}
          >
            <Ionicons name="bar-chart-outline" size={18} color="#fff" />
            <Text style={styles.quickBtnText}>Analytics</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 84 : 90) }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard label="Active Students" value={activeStudents} icon="people" color="#7C3AED" />
          <StatCard
            label="Pending Approvals"
            value={pendingStudents.length}
            icon="hourglass-outline"
            color={pendingStudents.length > 0 ? "#F59E0B" : "#10B981"}
            sub={pendingStudents.length > 0 ? "Tap to review" : "All clear"}
            onPress={pendingStudents.length > 0 ? () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push("/(admin)/approvals"); } : undefined}
          />
          <StatCard label="Admin Users" value={totalAdmins} icon="shield-outline" color="#8B5CF6" />
          <StatCard
            label="Today's Classes"
            value={todayClasses.length}
            icon="school-outline"
            color="#10B981"
            sub={`${todayClasses.filter((c) => c.status === "ongoing").length} live now`}
          />
          <StatCard label="Attendance Rate" value={`${attRate}%`} icon="checkmark-done-circle-outline" color="#10B981" sub="This week" />
          <StatCard
            label="Outstanding Fees"
            value={outstandingPayments}
            icon="card-outline"
            color={outstandingPayments > 0 ? "#EF4444" : "#10B981"}
            sub={`of ₦${totalContributions.toLocaleString()} total`}
          />
        </View>

        {pendingStudents.length > 0 && (
          <>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 20, marginBottom: 12 }}>
              <Ionicons name="time-outline" size={16} color={colors.warning} />
              <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 0, marginBottom: 0 }]}>Pending Approvals</Text>
            </View>
            {pendingStudents.slice(0, 3).map((s) => (
              <View key={s.id} style={[styles.pendingCard, { backgroundColor: "#FEF3C7", borderColor: "#FCD34D" }]}>
                <View style={[styles.pendingAvatar, { backgroundColor: "#F59E0B20" }]}>
                  <Text style={styles.pendingAvatarText}>{s.firstName[0]}{s.surname[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pendingName}>{s.firstName} {s.surname}</Text>
                  <Text style={styles.pendingMeta}>{s.matricNumber}  ·  {s.level}</Text>
                </View>
                <View style={[styles.pendingBadge, { backgroundColor: "#FEF3C7" }]}>
                  <Ionicons name="time-outline" size={12} color="#B45309" />
                  <Text style={styles.pendingBadgeText}>Pending</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {upcomingEvents.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Upcoming Events</Text>
            {upcomingEvents.map((ev) => (
              <View key={ev.id} style={[styles.eventCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.eventDot, { backgroundColor: ev.category === "big_event" ? colors.accent : colors.info }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.eventTitle, { color: colors.foreground }]}>{ev.title}</Text>
                  <Text style={[styles.eventMeta, { color: colors.mutedForeground }]}>{ev.date}  ·  {ev.time}  ·  {ev.venue}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Announcements</Text>
        {announcements.slice(0, 3).map((an) => (
          <View key={an.id} style={[styles.annoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.annoTitle, { color: colors.foreground }]}>{an.title}</Text>
            <Text style={[styles.annoBody, { color: colors.mutedForeground }]} numberOfLines={2}>{an.body}</Text>
            <Text style={[styles.annoMeta, { color: colors.mutedForeground }]}>{an.postedBy}  ·  {an.time}</Text>
          </View>
        ))}
      </ScrollView>

      {/* ── Analytics Modal ── */}
      <Modal visible={showAnalytics} transparent animationType="slide" statusBarTranslucent onRequestClose={() => setShowAnalytics(false)}>
        <View style={anlStyles.overlay}>
          <View style={[anlStyles.sheet, { backgroundColor: colors.card }]}>
            <View style={[anlStyles.handle, { backgroundColor: colors.border }]} />
            <View style={anlStyles.header}>
              <Text style={[anlStyles.title, { color: colors.foreground }]}>Department Analytics</Text>
              <TouchableOpacity onPress={() => setShowAnalytics(false)}>
                <Ionicons name="close" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

              {/* Attendance */}
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 0 }}>
                <Text style={[anlStyles.section, { color: colors.foreground, marginBottom: 0 }]}>Attendance Overview</Text>
                <View style={{ flexDirection: "row", backgroundColor: colors.muted, borderRadius: 8, padding: 2, gap: 2 }}>
                  {([1, 2] as const).map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={{ paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6, backgroundColor: modalAttSem === s ? colors.primary : "transparent" }}
                      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setModalAttSem(s); }}
                      activeOpacity={0.8}
                    >
                      <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: modalAttSem === s ? "#fff" : colors.mutedForeground }}>S{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <Text style={[{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginBottom: 10, marginTop: 2 }]}>
                {modalAttSem === 1 ? "1st" : "2nd"} Semester · {modalAttRecords.length} courses · avg {modalAvgAtt}%
              </Text>
              <View style={anlStyles.metricRow}>
                <View style={[anlStyles.metricBox, { backgroundColor: "#7C3AED15", flex: 1 }]}>
                  <Ionicons name="people-outline" size={20} color="#7C3AED" />
                  <Text style={[anlStyles.metricVal, { color: colors.foreground }]}>{modalAvgAtt}%</Text>
                  <Text style={[anlStyles.metricLabel, { color: colors.mutedForeground }]}>Avg rate</Text>
                </View>
                <View style={[anlStyles.metricBox, { backgroundColor: "#10B98115", flex: 1 }]}>
                  <Ionicons name="checkmark-done-outline" size={20} color="#10B981" />
                  <Text style={[anlStyles.metricVal, { color: colors.foreground }]}>{modalAttRecords.length}</Text>
                  <Text style={[anlStyles.metricLabel, { color: colors.mutedForeground }]}>Courses</Text>
                </View>
              </View>

              {/* Per-course attendance bar chart — uses real attendance records, not raw sessions */}
              {modalAttRecords.map((r) => {
                const pct = r.percentage;
                return (
                  <View key={r.courseCode} style={anlStyles.barRow}>
                    <View style={{ flex: 1 }}>
                      <View style={anlStyles.barLabelRow}>
                        <Text style={[anlStyles.barLabel, { color: colors.foreground }]}>{r.courseCode}</Text>
                        <Text style={[anlStyles.barPct, { color: colors.primary }]}>{pct}%</Text>
                      </View>
                      <View style={[anlStyles.barTrack, { backgroundColor: colors.muted }]}>
                        <View style={[anlStyles.barFill, { width: `${pct}%` as any, backgroundColor: pct >= 80 ? "#10B981" : pct >= 70 ? "#F59E0B" : "#EF4444" }]} />
                      </View>
                    </View>
                  </View>
                );
              })}

              {/* Financial */}
              <Text style={[anlStyles.section, { color: colors.foreground }]}>Financial Summary</Text>
              <View style={anlStyles.metricRow}>
                <View style={[anlStyles.metricBox, { backgroundColor: "#10B98115", flex: 1 }]}>
                  <Ionicons name="cash-outline" size={20} color="#10B981" />
                  <Text style={[anlStyles.metricVal, { color: colors.foreground }]}>₦{paidContributions.toLocaleString()}</Text>
                  <Text style={[anlStyles.metricLabel, { color: colors.mutedForeground }]}>Collected</Text>
                </View>
                <View style={[anlStyles.metricBox, { backgroundColor: "#EF444415", flex: 1 }]}>
                  <Ionicons name="card-outline" size={20} color="#EF4444" />
                  <Text style={[anlStyles.metricVal, { color: colors.foreground }]}>₦{(totalContributions - paidContributions).toLocaleString()}</Text>
                  <Text style={[anlStyles.metricLabel, { color: colors.mutedForeground }]}>Outstanding</Text>
                </View>
              </View>
              {/* Collection rate bar */}
              {totalContributions > 0 && (() => {
                const collPct = Math.round((paidContributions / totalContributions) * 100);
                return (
                  <View style={anlStyles.barRow}>
                    <View style={{ flex: 1 }}>
                      <View style={anlStyles.barLabelRow}>
                        <Text style={[anlStyles.barLabel, { color: colors.foreground }]}>Collection Rate</Text>
                        <Text style={[anlStyles.barPct, { color: "#10B981" }]}>{collPct}%</Text>
                      </View>
                      <View style={[anlStyles.barTrack, { backgroundColor: colors.muted }]}>
                        <View style={[anlStyles.barFill, { width: `${collPct}%` as any, backgroundColor: "#10B981" }]} />
                      </View>
                    </View>
                  </View>
                );
              })()}

              {/* Students by level */}
              <Text style={[anlStyles.section, { color: colors.foreground }]}>Students by Level</Text>
              {(["100L", "200L", "300L", "400L"] as const).map((lvl) => {
                const count = students.filter((s) => s.level === lvl).length;
                const pct = students.length ? Math.round((count / students.length) * 100) : 0;
                return (
                  <View key={lvl} style={anlStyles.barRow}>
                    <View style={{ flex: 1 }}>
                      <View style={anlStyles.barLabelRow}>
                        <Text style={[anlStyles.barLabel, { color: colors.foreground }]}>{lvl} — {count} students</Text>
                        <Text style={[anlStyles.barPct, { color: colors.primary }]}>{pct}%</Text>
                      </View>
                      <View style={[anlStyles.barTrack, { backgroundColor: colors.muted }]}>
                        <View style={[anlStyles.barFill, { width: `${pct}%` as any, backgroundColor: colors.primary }]} />
                      </View>
                    </View>
                  </View>
                );
              })}

              {/* Events summary */}
              <Text style={[anlStyles.section, { color: colors.foreground }]}>Events</Text>
              <View style={anlStyles.metricRow}>
                <View style={[anlStyles.metricBox, { backgroundColor: "#F59E0B15", flex: 1 }]}>
                  <Ionicons name="calendar-outline" size={20} color="#F59E0B" />
                  <Text style={[anlStyles.metricVal, { color: colors.foreground }]}>{events.length}</Text>
                  <Text style={[anlStyles.metricLabel, { color: colors.mutedForeground }]}>Total events</Text>
                </View>
                <View style={[anlStyles.metricBox, { backgroundColor: "#8B5CF615", flex: 1 }]}>
                  <Ionicons name="megaphone-outline" size={20} color="#8B5CF6" />
                  <Text style={[anlStyles.metricVal, { color: colors.foreground }]}>{announcements.length}</Text>
                  <Text style={[anlStyles.metricLabel, { color: colors.mutedForeground }]}>Announcements</Text>
                </View>
              </View>

            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showAnnounce} transparent animationType="slide" onRequestClose={() => setShowAnnounce(false)}>
        <View style={annStyles.overlay}>
          <View style={[annStyles.sheet, { backgroundColor: colors.card }]}>
            <View style={annStyles.header}>
              <Text style={[annStyles.title, { color: colors.foreground }]}>Post Announcement</Text>
              <TouchableOpacity onPress={() => setShowAnnounce(false)}>
                <Ionicons name="close" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <Text style={[annStyles.label, { color: colors.mutedForeground }]}>Title *</Text>
            <TextInput
              style={[annStyles.field, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
              placeholder="e.g. Exam Timetable Released"
              placeholderTextColor={colors.mutedForeground}
              value={annTitle}
              onChangeText={setAnnTitle}
            />

            <Text style={[annStyles.label, { color: colors.mutedForeground }]}>Message *</Text>
            <TextInput
              style={[annStyles.field, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border, minHeight: 90, textAlignVertical: "top" }]}
              placeholder="Write your announcement here..."
              placeholderTextColor={colors.mutedForeground}
              value={annBody}
              onChangeText={setAnnBody}
              multiline
            />

            <Text style={[annStyles.label, { color: colors.mutedForeground }]}>Category</Text>
            <View style={annStyles.chipRow}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[annStyles.chip, { backgroundColor: annCategory === c ? colors.primary : colors.muted, borderColor: annCategory === c ? colors.primary : colors.border }]}
                  onPress={() => setAnnCategory(c)}
                  activeOpacity={0.8}
                >
                  <Text style={[annStyles.chipText, { color: annCategory === c ? "#fff" : colors.mutedForeground }]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[annStyles.label, { color: colors.mutedForeground }]}>Target Audience</Text>
            <View style={annStyles.chipRow}>
              {TARGET_OPTIONS.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[annStyles.chip, { backgroundColor: annTarget === t ? colors.primary : colors.muted, borderColor: annTarget === t ? colors.primary : colors.border }]}
                  onPress={() => setAnnTarget(t)}
                  activeOpacity={0.8}
                >
                  <Text style={[annStyles.chipText, { color: annTarget === t ? "#fff" : colors.mutedForeground }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[annStyles.postBtn, { backgroundColor: posting ? colors.muted : colors.primary }]}
              onPress={handlePostAnnouncement}
              activeOpacity={0.85}
              disabled={posting}
            >
              <Ionicons name="send-outline" size={18} color="#fff" />
              <Text style={annStyles.postBtnText}>{posting ? "Posting..." : "Post to Students"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)" },
  name: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#FFFFFF", marginTop: 2 },
  role: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)", marginTop: 4 },
  logoutBtn: { padding: 8 },
  quickActions: { flexDirection: "row", gap: 10 },
  quickBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 10, borderRadius: 12 },
  quickBtnText: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  content: { padding: 16, gap: 0 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginTop: 20, marginBottom: 12 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  pendingCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 8 },
  pendingAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  pendingAvatarText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#B45309" },
  pendingName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#92400E" },
  pendingMeta: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#B45309", marginTop: 1 },
  pendingBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  pendingBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#B45309" },
  eventCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 8 },
  eventDot: { width: 10, height: 10, borderRadius: 5 },
  eventTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  eventMeta: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  annoCard: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 8 },
  annoTitle: { fontSize: 14, fontFamily: "Inter_700Bold", marginBottom: 4 },
  annoBody: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  annoMeta: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 6 },
});

const anlStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: "88%" },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  section: { fontSize: 14, fontFamily: "Inter_700Bold", marginTop: 20, marginBottom: 12 },
  metricRow: { flexDirection: "row", gap: 10 },
  metricBox: { borderRadius: 14, padding: 14, gap: 4, alignItems: "flex-start" },
  metricVal: { fontSize: 20, fontFamily: "Inter_700Bold" },
  metricLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  barRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  barLabelRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  barLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  barPct: { fontSize: 12, fontFamily: "Inter_700Bold" },
  barTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  barFill: { height: 6, borderRadius: 3 },
});

const annStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  label: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginBottom: 6, marginTop: 16 },
  field: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontFamily: "Inter_400Regular" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1 },
  chipText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  postBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 15, marginTop: 24 },
  postBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
});
