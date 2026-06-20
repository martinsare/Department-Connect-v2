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
import { CameraView, useCameraPermissions } from "expo-camera";
import Svg, { Rect } from "react-native-svg";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { QR_ATTENDANCE_TOKEN as QR_TOKEN } from "@/data/seedData";

const FRAME = 240;
const CORNER = 30;

function AnimatedBar({ percentage, color }: { percentage: number; color: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, { toValue: percentage, duration: 800, useNativeDriver: false }).start();
  }, [percentage]);
  const width = anim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] });
  return (
    <View style={barStyles.track}>
      <Animated.View style={[barStyles.fill, { width, backgroundColor: color }]} />
    </View>
  );
}
const barStyles = StyleSheet.create({
  track: { height: 6, borderRadius: 3, backgroundColor: "#E2E8F0", overflow: "hidden", flex: 1 },
  fill: { height: "100%", borderRadius: 3 },
});

function statusColor(pct: number, colors: any) {
  if (pct >= 80) return colors.success;
  if (pct >= 70) return colors.warning;
  return colors.destructive;
}

type ScanState = "idle" | "success" | "already" | "closed" | "invalid";

export default function AttendanceScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { attendanceS1, attendanceS2, markAttendance, attendedClasses, classes } = useData();
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [scannedLabel, setScannedLabel] = useState("");
  const [semester, setSemester] = useState<1 | 2>(1);
  const scanLine = useRef(new Animated.Value(0)).current;
  const scanLoopRef = useRef<any>(null);

  const records = semester === 1 ? attendanceS1 : attendanceS2;
  const overall = Math.round(records.reduce((s, r) => s + r.percentage, 0) / records.length);
  const col = statusColor(overall, colors);
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const atRiskCount = records.filter((r) => r.percentage < 70).length;
  const goodCount = records.filter((r) => r.percentage >= 80).length;

  const startScanLine = () => {
    scanLine.setValue(0);
    scanLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLine, { toValue: 1, duration: 1200, useNativeDriver: false }),
        Animated.timing(scanLine, { toValue: 0, duration: 1200, useNativeDriver: false }),
      ])
    );
    scanLoopRef.current.start();
  };

  const stopScanLine = () => { scanLoopRef.current?.stop(); };

  const openScanner = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) return;
    }
    setScanned(false);
    setScanState("idle");
    setScannedLabel("");
    setScanning(true);
    startScanLine();
  };

  const closeScanner = () => {
    stopScanLine();
    setScanning(false);
    setScanned(false);
    setScanState("idle");
  };

  const onBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    stopScanLine();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      const payload = JSON.parse(data) as { classId?: string; token?: string; courseCode?: string; courseName?: string };
      if (payload.token !== QR_TOKEN || !payload.classId) {
        setScanState("invalid");
      } else {
        const cls = classes.find((c) => c.id === payload.classId);
        if (!cls) {
          setScanState("invalid");
        } else if (!cls.attendanceOpen) {
          setScanState("closed");
          setScannedLabel(`${cls.courseCode} — ${cls.courseName}`);
        } else if (attendedClasses.includes(cls.id)) {
          setScanState("already");
          setScannedLabel(`${cls.courseCode} — ${cls.courseName}`);
        } else {
          const now = new Date();
          const scanTime = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
          markAttendance(cls.id, {
            studentId: user?.id ?? "unknown",
            name: user ? `${user.firstName} ${user.surname}` : "Unknown Student",
            matricNumber: user?.matricNumber ?? "—",
            level: user?.level ?? "—",
            scanTime,
          });
          setScanState("success");
          setScannedLabel(`${cls.courseCode} — ${cls.courseName}`);
        }
      }
    } catch {
      setScanState("invalid");
    }
    setTimeout(() => closeScanner(), 2200);
  };

  const lineTop = scanLine.interpolate({ inputRange: [0, 1], outputRange: [0, FRAME - 3] });

  const switchSemester = (s: 1 | 2) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSemester(s);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={[styles.header, { paddingTop: topPad + 20 }]}
      >
        {/* Title row */}
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Attendance</Text>
            <Text style={styles.subtitle}>2025/2026 · {user?.level ?? "300L"}</Text>
          </View>
          <TouchableOpacity style={styles.scanBtn} onPress={openScanner} activeOpacity={0.85}>
            <Ionicons name="qr-code-outline" size={18} color="#7C3AED" />
            <Text style={styles.scanBtnText}>Scan QR</Text>
          </TouchableOpacity>
        </View>

        {/* Semester segmented control */}
        <View style={styles.semesterRow}>
          <TouchableOpacity
            style={[styles.semTab, semester === 1 && styles.semTabActive]}
            onPress={() => switchSemester(1)}
            activeOpacity={0.85}
          >
            <Text style={[styles.semTabText, semester === 1 && styles.semTabTextActive]}>1st Semester</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.semTab, semester === 2 && styles.semTabActive]}
            onPress={() => switchSemester(2)}
            activeOpacity={0.85}
          >
            <Text style={[styles.semTabText, semester === 2 && styles.semTabTextActive]}>2nd Semester</Text>
          </TouchableOpacity>
        </View>

        {/* Overall summary card */}
        <View style={styles.overallCard}>
          <View style={styles.overallLeft}>
            <Text style={[styles.overallPct, { color: col }]}>{overall}%</Text>
            <Text style={styles.overallLabel}>Overall</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statVal, { color: colors.success }]}>{goodCount}</Text>
              <Text style={styles.statLbl}>Good</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statVal, { color: colors.destructive }]}>{atRiskCount}</Text>
              <Text style={styles.statLbl}>At Risk</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statVal, { color: "rgba(255,255,255,0.9)" }]}>{records.length}</Text>
              <Text style={styles.statLbl}>Courses</Text>
            </View>
          </View>
          <View style={styles.overallRight}>
            {overall >= 80 ? (
              <View style={[styles.statusBadge, { backgroundColor: colors.success + "25" }]}>
                <Ionicons name="checkmark-circle" size={13} color={colors.success} />
                <Text style={[styles.statusText, { color: colors.success }]}>Good Standing</Text>
              </View>
            ) : overall >= 70 ? (
              <View style={[styles.statusBadge, { backgroundColor: colors.warning + "25" }]}>
                <Ionicons name="warning" size={13} color={colors.warning} />
                <Text style={[styles.statusText, { color: colors.warning }]}>At Risk</Text>
              </View>
            ) : (
              <View style={[styles.statusBadge, { backgroundColor: colors.destructive + "25" }]}>
                <Ionicons name="close-circle" size={13} color={colors.destructive} />
                <Text style={[styles.statusText, { color: colors.destructive }]}>Critical</Text>
              </View>
            )}
            <Text style={styles.overallNote}>Min. 70% required</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 84 : 90) }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          {semester === 1 ? "1st" : "2nd"} Semester — {records.length} Courses
        </Text>

        {records.map((rec) => {
          const c = statusColor(rec.percentage, colors);
          return (
            <View key={rec.courseCode} style={[styles.courseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.courseHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.codeRow}>
                    <Text style={[styles.courseCode, { color: colors.primary }]}>{rec.courseCode}</Text>
                    <View style={[styles.pctBadge, { backgroundColor: c + "18" }]}>
                      <Text style={[styles.pctBadgeText, { color: c }]}>{rec.percentage}%</Text>
                    </View>
                  </View>
                  <Text style={[styles.courseName, { color: colors.foreground }]}>{rec.courseName}</Text>
                </View>
              </View>
              <View style={styles.barRow}>
                <AnimatedBar key={`${semester}-${rec.courseCode}`} percentage={rec.percentage} color={c} />
                <Text style={[styles.fraction, { color: colors.mutedForeground }]}>{rec.attended}/{rec.total}</Text>
              </View>
              {rec.percentage < 70 && (
                <View style={[styles.warningRow, { backgroundColor: colors.destructive + "10" }]}>
                  <Ionicons name="warning-outline" size={11} color={colors.destructive} />
                  <Text style={[styles.warningText, { color: colors.destructive }]}>
                    Need {Math.max(0, Math.ceil((0.75 * rec.total - rec.attended) / 0.25))} more classes to reach 75%
                  </Text>
                </View>
              )}
            </View>
          );
        })}

        <View style={[styles.legend, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.legendTitle, { color: colors.foreground }]}>Key</Text>
          {[
            { color: colors.success, label: "80%+ · Good Standing" },
            { color: colors.warning, label: "70–79% · At Risk" },
            { color: colors.destructive, label: "Below 70% · Critical" },
          ].map(({ color: c2, label }) => (
            <View key={label} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: c2 }]} />
              <Text style={[styles.legendLabel, { color: colors.mutedForeground }]}>{label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* QR Scanner Modal */}
      <Modal visible={scanning} transparent animationType="fade" statusBarTranslucent onRequestClose={closeScanner}>
        <View style={styles.backdrop}>
          <View style={styles.modalCard}>
            {scanState === "idle" ? (
              <>
                <Text style={styles.modalTitle}>Scan Attendance QR</Text>
                <Text style={styles.modalSub}>Point your camera at the QR code shown by your lecturer</Text>
                <View style={{ width: FRAME, height: FRAME, borderRadius: 12, overflow: "hidden", marginVertical: 20 }}>
                  <CameraView
                    style={StyleSheet.absoluteFillObject}
                    facing="back"
                    barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                    onBarcodeScanned={onBarcodeScanned}
                  />
                  <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
                    <Svg width={FRAME} height={FRAME}>
                      <Rect x={0} y={0} width={CORNER} height={3} fill="#7C3AED" rx={1.5} />
                      <Rect x={0} y={0} width={3} height={CORNER} fill="#7C3AED" rx={1.5} />
                      <Rect x={FRAME - CORNER} y={0} width={CORNER} height={3} fill="#7C3AED" rx={1.5} />
                      <Rect x={FRAME - 3} y={0} width={3} height={CORNER} fill="#7C3AED" rx={1.5} />
                      <Rect x={0} y={FRAME - 3} width={CORNER} height={3} fill="#7C3AED" rx={1.5} />
                      <Rect x={0} y={FRAME - CORNER} width={3} height={CORNER} fill="#7C3AED" rx={1.5} />
                      <Rect x={FRAME - CORNER} y={FRAME - 3} width={CORNER} height={3} fill="#7C3AED" rx={1.5} />
                      <Rect x={FRAME - 3} y={FRAME - CORNER} width={3} height={CORNER} fill="#7C3AED" rx={1.5} />
                    </Svg>
                    <Animated.View
                      style={{
                        position: "absolute", left: 3, right: 3, height: 2,
                        backgroundColor: "#7C3AED", borderRadius: 1, opacity: 0.9,
                        top: lineTop,
                      }}
                    />
                  </View>
                </View>
                <TouchableOpacity style={styles.cancelBtn} onPress={closeScanner}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.resultWrap}>
                {scanState === "success" ? (
                  <>
                    <View style={[styles.resultIcon, { backgroundColor: "#10B98120" }]}>
                      <Ionicons name="checkmark-circle" size={48} color="#10B981" />
                    </View>
                    <Text style={styles.resultTitle}>Attendance Marked!</Text>
                    <Text style={styles.resultSub}>{scannedLabel}</Text>
                  </>
                ) : scanState === "already" ? (
                  <>
                    <View style={[styles.resultIcon, { backgroundColor: "#F59E0B20" }]}>
                      <Ionicons name="information-circle" size={48} color="#F59E0B" />
                    </View>
                    <Text style={styles.resultTitle}>Already Recorded</Text>
                    <Text style={styles.resultSub}>Your attendance for {scannedLabel} is already marked.</Text>
                  </>
                ) : scanState === "closed" ? (
                  <>
                    <View style={[styles.resultIcon, { backgroundColor: "#EF444420" }]}>
                      <Ionicons name="lock-closed" size={48} color="#EF4444" />
                    </View>
                    <Text style={styles.resultTitle}>Attendance Closed</Text>
                    <Text style={styles.resultSub}>The lecturer has not opened attendance for {scannedLabel}.</Text>
                  </>
                ) : (
                  <>
                    <View style={[styles.resultIcon, { backgroundColor: "#EF444420" }]}>
                      <Ionicons name="close-circle" size={48} color="#EF4444" />
                    </View>
                    <Text style={styles.resultTitle}>Invalid QR Code</Text>
                    <Text style={styles.resultSub}>This QR code is not a valid Department Connect attendance code.</Text>
                  </>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#fff" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.65)", marginTop: 2 },
  scanBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#fff", borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8, marginTop: 4,
  },
  scanBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#7C3AED" },

  semesterRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    padding: 3,
    marginBottom: 16,
  },
  semTab: {
    flex: 1, paddingVertical: 8, borderRadius: 11,
    alignItems: "center",
  },
  semTabActive: { backgroundColor: "#fff" },
  semTabText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.65)" },
  semTabTextActive: { color: "#7C3AED" },

  overallCard: {
    backgroundColor: "rgba(255,255,255,0.13)",
    borderRadius: 18, padding: 16,
    flexDirection: "row", alignItems: "center", gap: 14,
  },
  overallLeft: { alignItems: "center" },
  overallPct: { fontSize: 40, fontFamily: "Inter_700Bold", lineHeight: 44 },
  overallLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)" },
  divider: { width: 1, height: 48, backgroundColor: "rgba(255,255,255,0.2)" },
  statsGrid: { flexDirection: "column", gap: 4 },
  statItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  statVal: { fontSize: 15, fontFamily: "Inter_700Bold" },
  statLbl: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.55)" },
  overallRight: { flex: 1, alignItems: "flex-end" },
  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderRadius: 10, paddingHorizontal: 9, paddingVertical: 5,
    marginBottom: 6,
  },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  overallNote: { fontSize: 10, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.5)" },

  content: { padding: 16, gap: 10 },
  sectionTitle: { fontSize: 14, fontFamily: "Inter_700Bold", marginBottom: 2 },

  courseCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 8 },
  courseHeader: { flexDirection: "row", alignItems: "flex-start" },
  codeRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  courseCode: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  pctBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  pctBadgeText: { fontSize: 11, fontFamily: "Inter_700Bold" },
  courseName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  barRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  fraction: { fontSize: 11, fontFamily: "Inter_600SemiBold", minWidth: 32, textAlign: "right" },
  warningRow: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 8, padding: 7 },
  warningText: { fontSize: 11, fontFamily: "Inter_400Regular" },

  legend: { borderRadius: 14, borderWidth: 1, padding: 14, marginTop: 4, gap: 8 },
  legendTitle: { fontSize: 12, fontFamily: "Inter_700Bold", marginBottom: 2 },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },

  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.88)", alignItems: "center", justifyContent: "center" },
  modalCard: {
    width: 300, backgroundColor: "#120730", borderRadius: 28,
    padding: 24, alignItems: "center",
    borderWidth: 1, borderColor: "#3B1D8A",
  },
  modalTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff", marginBottom: 6 },
  modalSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.55)", textAlign: "center", marginBottom: 4 },
  cancelBtn: { paddingHorizontal: 28, paddingVertical: 10, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 20 },
  cancelText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.75)" },
  resultWrap: { alignItems: "center", paddingVertical: 16, gap: 12 },
  resultIcon: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  resultTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
  resultSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)", textAlign: "center" },
});
