import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Platform,
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
import Svg, { Rect, Line } from "react-native-svg";
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

const FRAME_SIZE = 220;
const CORNER = 28;

function QRFrame({ scanLine }: { scanLine: Animated.Value }) {
  const top = scanLine.interpolate({ inputRange: [0, 1], outputRange: [0, FRAME_SIZE - 4] });
  return (
    <View style={{ width: FRAME_SIZE, height: FRAME_SIZE }}>
      <Svg width={FRAME_SIZE} height={FRAME_SIZE}>
        {/* TL */}
        <Rect x={0} y={0} width={CORNER} height={4} fill="#7C3AED" rx={2} />
        <Rect x={0} y={0} width={4} height={CORNER} fill="#7C3AED" rx={2} />
        {/* TR */}
        <Rect x={FRAME_SIZE - CORNER} y={0} width={CORNER} height={4} fill="#7C3AED" rx={2} />
        <Rect x={FRAME_SIZE - 4} y={0} width={4} height={CORNER} fill="#7C3AED" rx={2} />
        {/* BL */}
        <Rect x={0} y={FRAME_SIZE - 4} width={CORNER} height={4} fill="#7C3AED" rx={2} />
        <Rect x={0} y={FRAME_SIZE - CORNER} width={4} height={CORNER} fill="#7C3AED" rx={2} />
        {/* BR */}
        <Rect x={FRAME_SIZE - CORNER} y={FRAME_SIZE - 4} width={CORNER} height={4} fill="#7C3AED" rx={2} />
        <Rect x={FRAME_SIZE - 4} y={FRAME_SIZE - CORNER} width={4} height={CORNER} fill="#7C3AED" rx={2} />
      </Svg>
      {/* Animated scan line */}
      <Animated.View
        style={{
          position: "absolute",
          left: 4,
          right: 4,
          height: 2,
          borderRadius: 1,
          backgroundColor: "#7C3AED",
          opacity: 0.8,
          top,
          shadowColor: "#7C3AED",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 4,
        }}
      />
    </View>
  );
}

export default function AttendanceScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { attendanceS1, markAttendance, attendedClasses, classes } = useData();

  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<"idle" | "success" | "already">("idle");
  const scanLine = useRef(new Animated.Value(0)).current;
  const scanLoopRef = useRef<any>(null);

  const overall = Math.round(
    attendanceS1.reduce((s, r) => s + r.percentage, 0) / attendanceS1.length
  );
  const overallColor = getStatusColor(overall, colors);
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const todayClasses = classes.filter((c) => c.date === "2026-06-20");
  const unattended = todayClasses.find((c) => !attendedClasses.includes(c.id));

  const startScan = () => {
    setScanResult("idle");
    setScanning(true);
    scanLine.setValue(0);
    scanLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLine, { toValue: 1, duration: 1100, useNativeDriver: false }),
        Animated.timing(scanLine, { toValue: 0, duration: 1100, useNativeDriver: false }),
      ])
    );
    scanLoopRef.current.start();

    setTimeout(() => {
      scanLoopRef.current?.stop();
      if (unattended) {
        markAttendance(unattended.id);
        setScanResult("success");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setScanResult("already");
      }
      setTimeout(() => {
        setScanning(false);
        setScanResult("idle");
      }, 1800);
    }, 2600);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={[styles.header, { paddingTop: topPad + 20 }]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Attendance</Text>
            <Text style={styles.subtitle}>2025/2026 · 1st Semester</Text>
          </View>
          <TouchableOpacity
            style={styles.scanBtn}
            onPress={startScan}
            activeOpacity={0.85}
          >
            <Ionicons name="qr-code-outline" size={18} color="#7C3AED" />
            <Text style={styles.scanBtnText}>Scan QR</Text>
          </TouchableOpacity>
        </View>

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

      {/* QR Scanner Modal */}
      <Modal visible={scanning} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {scanResult === "idle" ? (
              <>
                <Text style={styles.modalTitle}>Scanning…</Text>
                <Text style={styles.modalSub}>Hold the QR code steady inside the frame</Text>
                <View style={styles.frameWrap}>
                  {/* Dark viewfinder area */}
                  <View style={styles.viewfinder} />
                  <View style={styles.frameOverlay}>
                    <QRFrame scanLine={scanLine} />
                  </View>
                </View>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => { setScanning(false); scanLoopRef.current?.stop(); }}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : scanResult === "success" ? (
              <>
                <View style={styles.resultIcon}>
                  <Ionicons name="checkmark-circle" size={56} color="#10B981" />
                </View>
                <Text style={styles.resultTitle}>Attendance Marked!</Text>
                <Text style={styles.resultSub}>
                  {unattended ? `${unattended.courseCode} — ${unattended.courseName}` : "Class recorded"}
                </Text>
              </>
            ) : (
              <>
                <View style={styles.resultIcon}>
                  <Ionicons name="information-circle" size={56} color="#F59E0B" />
                </View>
                <Text style={styles.resultTitle}>Already Marked</Text>
                <Text style={styles.resultSub}>Your attendance for today is already recorded.</Text>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#fff" },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.65)", marginTop: 2 },
  scanBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#fff", borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8, marginTop: 4,
  },
  scanBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#7C3AED" },
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.82)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCard: {
    width: 300,
    backgroundColor: "#1A0A3B",
    borderRadius: 28,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3B1D8A",
  },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff", marginBottom: 6 },
  modalSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)", textAlign: "center", marginBottom: 24 },
  frameWrap: { width: FRAME_SIZE, height: FRAME_SIZE, marginBottom: 28, borderRadius: 16, overflow: "hidden" },
  viewfinder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
  },
  frameOverlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  cancelBtn: {
    paddingHorizontal: 28, paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 20,
  },
  cancelText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.8)" },
  resultIcon: { marginBottom: 14 },
  resultTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff", marginBottom: 6 },
  resultSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)", textAlign: "center" },
});
