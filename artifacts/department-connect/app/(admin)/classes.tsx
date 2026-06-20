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
import type { ClassSession } from "@/context/DataContext";

const QR_TOKEN = "DEPT_CONNECT_2026";

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

export default function AdminClassesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { classes, toggleAttendanceOpen } = useData();
  const [qrClass, setQrClass] = useState<ClassSession | null>(null);
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

  const handleToggle = (cls: ClassSession) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleAttendanceOpen(cls.id);
  };

  const handleShowQR = (cls: ClassSession) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setQrClass(cls);
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
            <View style={styles.countRow}>
              <Ionicons name="people-outline" size={12} color={colors.mutedForeground} />
              <Text style={[styles.countText, { color: colors.mutedForeground }]}>{cls.attendanceCount}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.cardActions, { borderTopColor: colors.border }]}>
          {/* Open / Close attendance toggle */}
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

          {/* Show QR */}
          <TouchableOpacity
            style={[styles.qrBtn, { backgroundColor: colors.primary }]}
            onPress={() => handleShowQR(cls)}
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
        <Text style={styles.subtitle}>Generate QR codes for attendance tracking</Text>
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
            {/* Handle */}
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

                {/* Status badge */}
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
                    {qrClass.attendanceOpen ? "Attendance is OPEN — students can scan" : "Attendance is CLOSED — open it for students to scan"}
                  </Text>
                </View>

                {/* QR Code */}
                <View style={[styles.qrWrap, { backgroundColor: "#fff" }]}>
                  <QRCode
                    value={qrValue}
                    size={220}
                    color="#2D1B69"
                    backgroundColor="#fff"
                  />
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
  countText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  cardActions: { flexDirection: "row", borderTopWidth: 1, padding: 10, gap: 8 },
  toggleBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 8, borderRadius: 10,
  },
  toggleText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
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
  handle: { width: 36, height: 4, borderRadius: 2, marginBottom: 20 },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 6 },
  modalCourse: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  modalMeta: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 12, textAlign: "center" },
  openBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7,
    marginBottom: 16,
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
});
