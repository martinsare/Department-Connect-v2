import React, { useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <View style={[barS.track, { flex: 1 }]}>
        <View style={[barS.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color, minWidth: 36, textAlign: "right" }}>{pct}%</Text>
    </View>
  );
}

const barS = StyleSheet.create({
  track: { height: 8, borderRadius: 4, backgroundColor: "#E2E8F0", overflow: "hidden" },
  fill: { height: "100%", borderRadius: 4 },
});

export default function AnalyticsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { students, classes, contributions, attendanceS1, attendanceS2 } = useData();
  const [attSemester, setAttSemester] = useState<1 | 2>(1);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const activeStudents = students.filter((s) => s.status === "active").length;
  const pendingStudents = students.filter((s) => s.status === "pending").length;
  const levelBreakdown = [
    { level: "100L", count: students.filter((s) => s.level === "100L").length },
    { level: "200L", count: students.filter((s) => s.level === "200L").length },
    { level: "300L", count: students.filter((s) => s.level === "300L").length },
    { level: "400L", count: students.filter((s) => s.level === "400L").length },
    { level: "500L", count: students.filter((s) => s.level === "500L").length },
  ];

  const totalCollected = contributions.filter((c) => c.status === "paid").reduce((s, c) => s + c.amount, 0);
  const totalOutstanding = contributions.filter((c) => c.status === "unpaid").reduce((s, c) => s + c.amount, 0);
  const collectionPct = totalCollected + totalOutstanding > 0
    ? Math.round(totalCollected / (totalCollected + totalOutstanding) * 100)
    : 0;

  const attRecords = attSemester === 1 ? attendanceS1 : attendanceS2;
  const avgAtt = attRecords.length > 0
    ? Math.round(attRecords.reduce((s, r) => s + r.percentage, 0) / attRecords.length)
    : 0;

  const switchAttSemester = (s: 1 | 2) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAttSemester(s);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={["#2D1B69", "#7C3AED"]}
        style={[styles.header, { paddingTop: topPad + 20 }]}
      >
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>Department Overview · June 2026</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 84 : 90) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.quickStats}>
          {[
            { label: "Active", value: activeStudents, color: colors.success, icon: "person-circle" as const },
            { label: "Pending", value: pendingStudents, color: colors.warning, icon: "time-outline" as const },
            { label: "Avg Att.", value: `${avgAtt}%`, color: colors.primary, icon: "checkmark-circle" as const },
            { label: "Collected", value: `₦${(totalCollected / 1000).toFixed(0)}k`, color: colors.info, icon: "card-outline" as const },
          ].map((s) => (
            <View key={s.label} style={[styles.quickStat, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.quickStatIcon, { backgroundColor: s.color + "18" }]}>
                <Ionicons name={s.icon} size={18} color={s.color} />
              </View>
              <Text style={[styles.quickStatValue, { color: colors.foreground }]}>{s.value}</Text>
              <Text style={[styles.quickStatLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Students by Level */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Students by Level</Text>
          <View style={styles.levelList}>
            {levelBreakdown.map((l) => (
              <View key={l.level} style={styles.levelRow}>
                <Text style={[styles.levelLabel, { color: colors.foreground }]}>{l.level}</Text>
                <View style={{ flex: 1 }}>
                  <ProgressBar value={l.count} max={students.length || 1} color={colors.primary} />
                </View>
                <Text style={[styles.levelCount, { color: colors.mutedForeground }]}>{l.count}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Attendance by Course — with semester toggle */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Attendance by Course</Text>
            <View style={[styles.semToggle, { backgroundColor: colors.muted }]}>
              <TouchableOpacity
                style={[styles.semBtn, attSemester === 1 && { backgroundColor: colors.primary }]}
                onPress={() => switchAttSemester(1)}
                activeOpacity={0.85}
              >
                <Text style={[styles.semBtnText, attSemester === 1 && { color: "#fff" }]}>S1</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.semBtn, attSemester === 2 && { backgroundColor: colors.primary }]}
                onPress={() => switchAttSemester(2)}
                activeOpacity={0.85}
              >
                <Text style={[styles.semBtnText, attSemester === 2 && { color: "#fff" }]}>S2</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={[styles.semLabel, { color: colors.mutedForeground }]}>
            {attSemester === 1 ? "1st" : "2nd"} Semester · {attRecords.length} courses · avg {avgAtt}%
          </Text>
          <View style={{ gap: 12, marginTop: 12 }}>
            {attRecords.map((r) => (
              <View key={r.courseCode} style={styles.levelRow}>
                <Text style={[styles.courseCode, { color: colors.primary }]}>{r.courseCode}</Text>
                <View style={{ flex: 1 }}>
                  <ProgressBar
                    value={r.percentage}
                    max={100}
                    color={r.percentage >= 80 ? colors.success : r.percentage >= 70 ? colors.warning : colors.destructive}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Contributions */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Contributions</Text>
          <View style={styles.finRow}>
            <View style={[styles.finCard, { backgroundColor: colors.success + "12" }]}>
              <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
              <Text style={[styles.finValue, { color: colors.success }]}>₦{totalCollected.toLocaleString()}</Text>
              <Text style={[styles.finLabel, { color: colors.mutedForeground }]}>Collected</Text>
            </View>
            <View style={[styles.finCard, { backgroundColor: colors.warning + "12" }]}>
              <Ionicons name="time-outline" size={20} color={colors.warning} />
              <Text style={[styles.finValue, { color: colors.warning }]}>₦{totalOutstanding.toLocaleString()}</Text>
              <Text style={[styles.finLabel, { color: colors.mutedForeground }]}>Outstanding</Text>
            </View>
          </View>
          <View style={styles.finBarTrack}>
            <View style={[styles.finBarFill, { backgroundColor: colors.success, width: `${collectionPct}%` }]} />
          </View>
          <Text style={[styles.finNote, { color: colors.mutedForeground }]}>
            {collectionPct}% of total dues collected
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#fff" },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.65)", marginTop: 2 },
  content: { padding: 16, gap: 12 },
  quickStats: { flexDirection: "row", gap: 10 },
  quickStat: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 12, alignItems: "center", gap: 4 },
  quickStatIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  quickStatValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
  quickStatLabel: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  card: { borderRadius: 18, borderWidth: 1, padding: 18 },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  cardTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  semToggle: { flexDirection: "row", borderRadius: 8, padding: 2, gap: 2 },
  semBtn: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6 },
  semBtnText: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#94A3B8" },
  semLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginBottom: 0 },
  levelList: { gap: 12 },
  levelRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
  levelLabel: { fontSize: 13, fontFamily: "Inter_700Bold", minWidth: 40 },
  levelCount: { fontSize: 12, fontFamily: "Inter_600SemiBold", minWidth: 20, textAlign: "right" },
  courseCode: { fontSize: 11, fontFamily: "Inter_700Bold", minWidth: 56, letterSpacing: 0.5 },
  finRow: { flexDirection: "row", gap: 10, marginBottom: 14, marginTop: 4 },
  finCard: { flex: 1, borderRadius: 14, padding: 14, alignItems: "center", gap: 6 },
  finValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  finLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  finBarTrack: { height: 8, borderRadius: 4, backgroundColor: "#E2E8F0", overflow: "hidden" },
  finBarFill: { height: "100%", borderRadius: 4 },
  finNote: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 8, textAlign: "center" },
});
