import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

function AnimatedBar({ percentage, color }: { percentage: number; color: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: percentage,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, []);
  const width = anim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] });
  return (
    <View style={barStyles.track}>
      <Animated.View style={[barStyles.fill, { width, backgroundColor: color }]} />
    </View>
  );
}

const barStyles = StyleSheet.create({
  track: { height: 8, borderRadius: 4, backgroundColor: "#E2E8F0", overflow: "hidden", flex: 1 },
  fill: { height: "100%", borderRadius: 4 },
});

function getStatusColor(pct: number, colors: any) {
  if (pct >= 80) return colors.success;
  if (pct >= 70) return colors.warning;
  return colors.destructive;
}

export default function AttendanceScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { attendanceS1 } = useData();

  const overall = Math.round(
    attendanceS1.reduce((s, r) => s + r.percentage, 0) / attendanceS1.length
  );
  const overallColor = getStatusColor(overall, colors);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={[styles.header, { paddingTop: topPad + 20 }]}
      >
        <Text style={styles.title}>Attendance</Text>
        <Text style={styles.subtitle}>2025/2026 · 1st Semester</Text>

        <View style={styles.overallCard}>
          <View style={styles.overallLeft}>
            <Text style={[styles.overallPct, { color: overallColor }]}>{overall}%</Text>
            <Text style={styles.overallLabel}>Overall</Text>
          </View>
          <View style={styles.overallRight}>
            {overall >= 80 ? (
              <View style={[styles.statusBadge, { backgroundColor: colors.success + "25" }]}>
                <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                <Text style={[styles.statusText, { color: colors.success }]}>Good Standing</Text>
              </View>
            ) : overall >= 70 ? (
              <View style={[styles.statusBadge, { backgroundColor: colors.warning + "25" }]}>
                <Ionicons name="warning" size={14} color={colors.warning} />
                <Text style={[styles.statusText, { color: colors.warning }]}>At Risk</Text>
              </View>
            ) : (
              <View style={[styles.statusBadge, { backgroundColor: colors.destructive + "25" }]}>
                <Ionicons name="close-circle" size={14} color={colors.destructive} />
                <Text style={[styles.statusText, { color: colors.destructive }]}>Critical</Text>
              </View>
            )}
            <Text style={styles.overallNote}>Minimum 70% required</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 84 : 90) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>By Course</Text>
        {attendanceS1.map((rec) => {
          const col = getStatusColor(rec.percentage, colors);
          return (
            <View key={rec.courseCode} style={[styles.courseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.courseHeader}>
                <View>
                  <Text style={[styles.courseCode, { color: colors.primary }]}>{rec.courseCode}</Text>
                  <Text style={[styles.courseName, { color: colors.foreground }]}>{rec.courseName}</Text>
                </View>
                <Text style={[styles.coursePct, { color: col }]}>{rec.percentage}%</Text>
              </View>
              <View style={styles.barRow}>
                <AnimatedBar percentage={rec.percentage} color={col} />
                <Text style={[styles.fraction, { color: colors.mutedForeground }]}>
                  {rec.attended}/{rec.total}
                </Text>
              </View>
              {rec.percentage < 70 && (
                <View style={[styles.warningRow, { backgroundColor: colors.destructive + "12" }]}>
                  <Ionicons name="warning-outline" size={12} color={colors.destructive} />
                  <Text style={[styles.warningText, { color: colors.destructive }]}>
                    Need {Math.ceil((0.75 * rec.total - rec.attended) / (1 - 0.75))} more classes to meet 75%
                  </Text>
                </View>
              )}
            </View>
          );
        })}

        <View style={[styles.legend, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.legendTitle, { color: colors.foreground }]}>Key</Text>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.legendLabel, { color: colors.mutedForeground }]}>80%+ · Good Standing</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
            <Text style={[styles.legendLabel, { color: colors.mutedForeground }]}>70–79% · At Risk</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: colors.destructive }]} />
            <Text style={[styles.legendLabel, { color: colors.mutedForeground }]}>Below 70% · Critical</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#fff" },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.65)", marginTop: 2, marginBottom: 20 },
  overallCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  overallLeft: { marginRight: 20 },
  overallPct: { fontSize: 48, fontFamily: "Inter_700Bold" },
  overallLabel: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)" },
  overallRight: { flex: 1 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, alignSelf: "flex-start", marginBottom: 6 },
  statusText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  overallNote: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)" },
  content: { padding: 16 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 12 },
  courseCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    gap: 10,
  },
  courseHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  courseCode: { fontSize: 12, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  courseName: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginTop: 2 },
  coursePct: { fontSize: 22, fontFamily: "Inter_700Bold" },
  barRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  fraction: { fontSize: 12, fontFamily: "Inter_600SemiBold", minWidth: 36, textAlign: "right" },
  warningRow: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 8, padding: 8 },
  warningText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  legend: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginTop: 4,
    gap: 8,
  },
  legendTitle: { fontSize: 13, fontFamily: "Inter_700Bold", marginBottom: 4 },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
});
