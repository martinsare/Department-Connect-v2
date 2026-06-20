import React, { useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import QRCode from "react-native-qrcode-svg";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import type { ClassSession, ClassAttendee } from "@/context/DataContext";
import { Avatar } from "@/components/Avatar";
import { QR_ATTENDANCE_TOKEN as QR_TOKEN } from "@/data/seedData";

const STATUS_COLORS: Record<string, string> = {
  ongoing: "#10B981",
  upcoming: "#7C3AED",
  completed: "#6B7280",
  cancelled: "#EF4444",
};

const STATUS_LABELS: Record<string, string> = {
  ongoing: "● Live",
  upcoming: "Upcoming",
  completed: "Done",
  cancelled: "Cancelled",
};

function AttendeeRow({ item, index }: { item: ClassAttendee; index: number }) {
  const colors = useColors();
  const { students } = useData();
  const initials = item.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const avatarColors = ["#7C3AED", "#8B5CF6", "#A78BFA", "#6D28D9", "#5B21B6"];
  const bg = avatarColors[index % avatarColors.length];
  const studentPic = students.find((s) => s.matricNumber === item.matricNumber)?.profilePicture;

  return (
    <View style={[rosterStyles.row, { borderBottomColor: colors.border }]}>
      <Avatar
        uri={studentPic}
        initials={initials}
        size={38}
        backgroundColor={bg}
        textColor="#fff"
      />
      <View style={{ flex: 1 }}>
        <Text style={[rosterStyles.name, { color: colors.foreground }]}>{item.name}</Text>
        <Text style={[rosterStyles.matric, { color: colors.mutedForeground }]}>
          {item.matricNumber} · {item.level}
        </Text>
      </View>
      <View style={[rosterStyles.timeBadge, { backgroundColor: colors.primary + "15" }]}>
        <Ionicons name="time-outline" size={11} color={colors.primary} />
        <Text style={[rosterStyles.timeText, { color: colors.primary }]}>{item.scanTime}</Text>
      </View>
    </View>
  );
}

const rosterStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#fff" },
  name: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  matric: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  timeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
});

export default function AdminClassesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { classes, classAttendees, toggleAttendanceOpen } = useData();
  const [qrClass, setQrClass] = useState<ClassSession | null>(null);
  const [rosterClass, setRosterClass] = useState<ClassSession | null>(null);
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const sorted = [...classes].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return a.startTime < b.startTime ? -1 : 1;
  });

  const today = "2026-06-20";
  const todayClasses = sorted.filter((c) => c.date === today);
  const otherClasses = sorted.filter((c) => c.date !== today);

  const qrValue = qrClass
    ? JSON.stringify({ classId: qrClass.id, courseCode: qrClass.courseCode, courseName: qrClass.courseName, token: QR_TOKEN })
    : "{}";

  const rosterList: ClassAttendee[] = rosterClass ? (classAttendees[rosterClass.id] ?? []) : [];

  const handleToggle = (cls: ClassSession) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleAttendanceOpen(cls.id);
  };

  const handleShareQR = async () => {
    if (!qrClass) return;
    try {
      await Share.share({
        message: `Department Connect QR Code\n${qrClass.courseCode} — ${qrClass.courseName}\n${qrClass.date} ${qrClass.startTime}–${qrClass.endTime}\n\nToken: ${QR_TOKEN}\nClass ID: ${qrClass.id}`,
      });
    } catch {}
  };

  const ClassCard = ({ cls }: { cls: ClassSession }) => {
    const sc = STATUS_COLORS[cls.status] ?? "#6B7280";
    const roster = classAttendees[cls.id] ?? [];
    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.cardTop}>
          <View style={styles.cardLeft}>
            <Text style={[styles.code, { color: colors.primary }]}>{cls.courseCode}</Text>
            <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>{cls.courseName}</Text>
            <View style={styles.meta}>
              <Ionicons name="time-outline" size={12} color={colors.mutedForeground} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{cls.startTime}–{cls.endTime}</Text>
              <Ionicons name="location-outline" size={12} color={colors.mutedForeground} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{cls.venue}</Text>
            </View>
          </View>
          <View style={styles.cardRight}>
            <View style={[styles.statusBadge, { backgroundColor: sc + "20" }]}>
              <Text style={[styles.statusLabel, { color: sc }]}>{STATUS_LABELS[cls.status]}</Text>
            </View>
            <TouchableOpacity
              style={styles.countRow}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setRosterClass(cls); }}
              activeOpacity={0.7}
            >
              <Ionicons name="people-outline" size={12} color={colors.primary} />
              <Text style={[styles.countText, { color: colors.primary }]}>{roster.length} present</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.cardActions, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.toggleBtn, { backgroundColor: cls.attendanceOpen ? "#10B98115" : colors.muted }]}
            onPress={() => handleToggle(cls)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={cls.attendanceOpen ? "lock-open-outline" : "lock-closed-outline"}
              size={14}
              color={cls.attendanceOpen ? "#10B981" : colors.mutedForeground}
            />
            <Text style={[styles.toggleText, { color: cls.attendanceOpen ? "#10B981" : colors.mutedForeground }]}>
              {cls.attendanceOpen ? "Attendance Open" : "Open Attendance"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.rosterBtn, { backgroundColor: colors.primary + "18" }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setRosterClass(cls); }}
            activeOpacity={0.8}
          >
            <Ionicons name="people-outline" size={14} color={colors.primary} />
            <Text style={[styles.rosterBtnText, { color: colors.primary }]}>Roster</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.qrBtn, { backgroundColor: colors.primary }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setQrClass(cls); }}
            activeOpacity={0.85}
          >
            <Ionicons name="qr-code-outline" size={14} color="#fff" />
            <Text style={styles.qrBtnText}>Show QR</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={[styles.header, { paddingTop: topPad + 20 }]}
      >
        <Text style={styles.title}>Class Management</Text>
        <Text style={styles.subtitle}>Manage attendance and view class rosters</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 84 : 100) }]}
        showsVerticalScrollIndicator={false}
      >
        {todayClasses.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.primary }]}>TODAY</Text>
            {todayClasses.map((cls) => <ClassCard key={cls.id} cls={cls} />)}
          </>
        )}
        {otherClasses.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>OTHER DAYS</Text>
            {otherClasses.map((cls) => <ClassCard key={cls.id} cls={cls} />)}
          </>
        )}
      </ScrollView>

      {/* QR Code Modal */}
      <Modal visible={!!qrClass} transparent animationType="slide" statusBarTranslucent onRequestClose={() => setQrClass(null)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Attendance QR Code</Text>
            {qrClass && (
              <>
                <Text style={[styles.modalCourse, { color: colors.primary }]}>
                  {qrClass.courseCode} — {qrClass.courseName}
                </Text>
                <Text style={[styles.modalMeta, { color: colors.mutedForeground }]}>
                  {qrClass.date}  ·  {qrClass.startTime}–{qrClass.endTime}  ·  {qrClass.venue}
                </Text>

                <View style={[
                  styles.openBadge,
                  { backgroundColor: qrClass.attendanceOpen ? "#10B98118" : "#EF444418" }
                ]}>
                  <Ionicons
                    name={qrClass.attendanceOpen ? "checkmark-circle" : "close-circle"}
                    size={14}
                    color={qrClass.attendanceOpen ? "#10B981" : "#EF4444"}
                  />
                  <Text style={[styles.openBadgeText, { color: qrClass.attendanceOpen ? "#10B981" : "#EF4444" }]}>
                    {qrClass.attendanceOpen ? "Attendance is OPEN — students can scan" : "Attendance is CLOSED"}
                  </Text>
                </View>

                <View style={[styles.qrWrap, { backgroundColor: "#fff" }]}>
                  <QRCode value={qrValue} size={220} color="#2D1B69" backgroundColor="#fff" />
                </View>

                <Text style={[styles.qrHint, { color: colors.mutedForeground }]}>
                  Show this to students to scan with Department Connect
                </Text>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: qrClass.attendanceOpen ? "#EF444415" : "#10B98115" }]}
                    onPress={() => { handleToggle(qrClass); setQrClass(prev => prev ? { ...prev, attendanceOpen: !prev.attendanceOpen } : null); }}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={qrClass.attendanceOpen ? "lock-closed-outline" : "lock-open-outline"}
                      size={16}
                      color={qrClass.attendanceOpen ? "#EF4444" : "#10B981"}
                    />
                    <Text style={[styles.actionBtnText, { color: qrClass.attendanceOpen ? "#EF4444" : "#10B981" }]}>
                      {qrClass.attendanceOpen ? "Close" : "Open"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#7C3AED15" }]} onPress={handleShareQR} activeOpacity={0.8}>
                    <Ionicons name="share-outline" size={16} color="#7C3AED" />
                    <Text style={[styles.actionBtnText, { color: "#7C3AED" }]}>Share</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.muted }]} onPress={() => setQrClass(null)} activeOpacity={0.8}>
                    <Ionicons name="close" size={16} color={colors.mutedForeground} />
                    <Text style={[styles.actionBtnText, { color: colors.mutedForeground }]}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Roster Modal */}
      <Modal visible={!!rosterClass} transparent animationType="slide" statusBarTranslucent onRequestClose={() => setRosterClass(null)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.rosterSheet, { backgroundColor: colors.card }]}>

            {/* Fixed header section — padded separately so ScrollView reaches the edges */}
            <View style={styles.rosterFixed}>
              <View style={[styles.handle, { backgroundColor: colors.border }]} />

              {/* Header */}
              <View style={styles.rosterHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalTitle, { color: colors.foreground, marginBottom: 2 }]}>
                    Attendance Roster
                  </Text>
                  {rosterClass && (
                    <Text style={[styles.modalCourse, { color: colors.primary }]}>
                      {rosterClass.courseCode} — {rosterClass.courseName}
                    </Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => setRosterClass(null)}>
                  <Ionicons name="close" size={22} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>

              {/* Stats row */}
              {rosterClass && (
                <View style={[styles.rosterStats, { backgroundColor: colors.muted }]}>
                  <View style={styles.rosterStat}>
                    <Text style={[styles.rosterStatVal, { color: colors.primary }]}>{rosterList.length}</Text>
                    <Text style={[styles.rosterStatLabel, { color: colors.mutedForeground }]}>Present</Text>
                  </View>
                  <View style={[styles.rosterStatDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.rosterStat}>
                    <Text style={[styles.rosterStatVal, { color: colors.foreground }]}>{rosterClass.date}</Text>
                    <Text style={[styles.rosterStatLabel, { color: colors.mutedForeground }]}>Date</Text>
                  </View>
                  <View style={[styles.rosterStatDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.rosterStat}>
                    <Text style={[styles.rosterStatVal, { color: colors.foreground }]}>{rosterClass.startTime}</Text>
                    <Text style={[styles.rosterStatLabel, { color: colors.mutedForeground }]}>Start Time</Text>
                  </View>
                </View>
              )}

              {/* Attendance open toggle */}
              {rosterClass && (
                <TouchableOpacity
                  style={[
                    styles.rosterToggle,
                    { backgroundColor: rosterClass.attendanceOpen ? "#10B98115" : "#EF444415" },
                  ]}
                  onPress={() => {
                    handleToggle(rosterClass);
                    setRosterClass((prev) =>
                      prev ? { ...prev, attendanceOpen: !prev.attendanceOpen } : null
                    );
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={rosterClass.attendanceOpen ? "lock-open-outline" : "lock-closed-outline"}
                    size={15}
                    color={rosterClass.attendanceOpen ? "#10B981" : "#EF4444"}
                  />
                  <Text style={[styles.rosterToggleText, { color: rosterClass.attendanceOpen ? "#10B981" : "#EF4444" }]}>
                    {rosterClass.attendanceOpen
                      ? "Attendance is OPEN — tap to close"
                      : "Attendance is CLOSED — tap to open"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Scrollable list — flex: 1 now works because rosterSheet has flex: 1 */}
            {rosterList.length === 0 ? (
              <View style={styles.rosterEmpty}>
                <View style={[styles.rosterEmptyIcon, { backgroundColor: colors.muted }]}>
                  <Ionicons name="people-outline" size={36} color={colors.mutedForeground} />
                </View>
                <Text style={[styles.rosterEmptyTitle, { color: colors.foreground }]}>No attendees recorded</Text>
                <Text style={[styles.rosterEmptyBody, { color: colors.mutedForeground }]}>
                  {rosterClass?.attendanceOpen
                    ? "Students who scan the QR code will appear here in real time."
                    : "No students scanned in during this session."}
                </Text>
              </View>
            ) : (
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 36 }}
                showsVerticalScrollIndicator={false}
              >
                {rosterList.map((item, i) => (
                  <AttendeeRow key={item.studentId + i} item={item} index={i} />
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 28 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#fff" },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.65)", marginTop: 4 },
  content: { padding: 16 },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 1.2, marginBottom: 10, marginTop: 4 },
  card: { borderRadius: 16, borderWidth: 1, marginBottom: 12, overflow: "hidden" },
  cardTop: { flexDirection: "row", padding: 14, gap: 10 },
  cardLeft: { flex: 1, gap: 4 },
  cardRight: { alignItems: "flex-end", gap: 6 },
  code: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 0.8 },
  name: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  meta: { flexDirection: "row", alignItems: "center", gap: 4, flexWrap: "wrap" },
  metaText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  countRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  countText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  cardActions: { flexDirection: "row", borderTopWidth: 1, padding: 10, gap: 8 },
  toggleBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 8, borderRadius: 10,
  },
  toggleText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  rosterBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
  },
  rosterBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  qrBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
  },
  qrBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#fff" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modalSheet: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 36, alignItems: "center",
  },
  rosterSheet: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: "85%",
    flex: 1,
  },
  rosterFixed: {
    paddingHorizontal: 24, paddingTop: 24, paddingBottom: 4,
  },
  handle: { width: 36, height: 4, borderRadius: 2, marginBottom: 20, alignSelf: "center" },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 6 },
  modalCourse: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  modalMeta: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 12, textAlign: "center" },
  openBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, marginBottom: 16,
  },
  openBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  qrWrap: { borderRadius: 16, padding: 20, marginBottom: 12 },
  qrHint: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center", marginBottom: 20 },
  modalActions: { flexDirection: "row", gap: 10, width: "100%" },
  actionBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 10, borderRadius: 12,
  },
  actionBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  rosterHeader: { flexDirection: "row", alignItems: "flex-start", marginBottom: 16 },
  rosterStats: {
    flexDirection: "row", borderRadius: 14, padding: 14,
    marginBottom: 14, alignItems: "center",
  },
  rosterStat: { flex: 1, alignItems: "center", gap: 2 },
  rosterStatVal: { fontSize: 16, fontFamily: "Inter_700Bold" },
  rosterStatLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  rosterStatDivider: { width: 1, height: 28, marginHorizontal: 4 },
  rosterToggle: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    marginBottom: 14,
  },
  rosterToggleText: { fontSize: 13, fontFamily: "Inter_600SemiBold", flex: 1 },
  rosterEmpty: { alignItems: "center", paddingVertical: 40, gap: 12 },
  rosterEmptyIcon: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  rosterEmptyTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  rosterEmptyBody: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 18 },
});
