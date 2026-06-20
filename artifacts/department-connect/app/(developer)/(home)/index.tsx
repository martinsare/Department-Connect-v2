import React from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

export default function DeveloperDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { students, classes, auditLogs } = useData();
  const router = useRouter();

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const stats = [
    { label: "Students", value: students.length, color: colors.primary, icon: "people-outline" as const },
    { label: "Admins", value: 3, color: colors.info, icon: "shield-outline" as const },
    { label: "Super Admins", value: 1, color: colors.warning, icon: "code-slash-outline" as const },
    { label: "Classes Today", value: classes.filter((c) => c.date === "2026-06-20").length, color: colors.success, icon: "school-outline" as const },
  ];

  const systemMetrics = [
    { label: "DB Health", value: "Healthy", color: colors.success, icon: "checkmark-circle" as const },
    { label: "API Latency", value: "42ms", color: colors.info, icon: "speedometer-outline" as const },
    { label: "Uptime", value: "99.9%", color: colors.success, icon: "pulse-outline" as const },
    { label: "Storage Used", value: "2.4 GB", color: colors.warning, icon: "server-outline" as const },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={["#1a1a2e", "#16213e", "#0f3460"]}
        style={[styles.header, { paddingTop: topPad + 20 }]}
      >
        <View style={styles.headerRow}>
          <View>
            <View style={styles.devBadge}>
              <Ionicons name="code-slash" size={12} color="#F59E0B" />
              <Text style={styles.devBadgeText}>Super Admin</Text>
            </View>
            <Text style={styles.name}>{user?.firstName} {user?.surname}</Text>
            <Text style={styles.id}>{user?.staffId}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <TouchableOpacity
              style={styles.bellBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/(developer)/notifications");
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="notifications-outline" size={20} color="rgba(255,255,255,0.85)" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                Alert.alert("Sign Out", "Are you sure?", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Sign Out", style: "destructive", onPress: logout },
                ])
              }
              style={styles.logoutBtn}
            >
              <Ionicons name="log-out-outline" size={20} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.metricGrid}>
          {systemMetrics.map((m) => (
            <View key={m.label} style={styles.metricItem}>
              <Ionicons name={m.icon} size={14} color={m.color} />
              <Text style={[styles.metricValue, { color: m.color }]}>{m.value}</Text>
              <Text style={styles.metricLabel}>{m.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 84 : 90) }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>User Counts</Text>
        <View style={styles.statsRow}>
          {stats.map((s) => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.statIcon, { backgroundColor: s.color + "18" }]}>
                <Ionicons name={s.icon} size={18} color={s.color} />
              </View>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Activity</Text>
        {auditLogs.slice(0, 5).map((log) => (
          <View key={log.id} style={[styles.logRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.logDot, { backgroundColor: log.role === "System" ? colors.info : colors.primary }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.logAction, { color: colors.foreground }]}>{log.action}</Text>
              <Text style={[styles.logUser, { color: colors.mutedForeground }]}>{log.user}  ·  {log.role}</Text>
              <Text style={[styles.logDetail, { color: colors.mutedForeground }]} numberOfLines={1}>{log.details}</Text>
            </View>
            <Text style={[styles.logTime, { color: colors.mutedForeground }]}>{log.timestamp.split(" · ")[0]}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  devBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(245,158,11,0.2)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
    alignSelf: "flex-start", marginBottom: 8,
  },
  devBadgeText: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#F59E0B" },
  name: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff" },
  id: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.5)", marginTop: 2 },
  logoutBtn: { padding: 8 },
  bellBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.18)",
  },
  metricGrid: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  metricItem: { flex: 1, alignItems: "center", gap: 4 },
  metricValue: { fontSize: 14, fontFamily: "Inter_700Bold" },
  metricLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.5)", textAlign: "center" },
  content: { padding: 16 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginTop: 8, marginBottom: 12 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 8 },
  statCard: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 14, alignItems: "center", gap: 4 },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center" },
  logRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  logDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  logAction: { fontSize: 14, fontFamily: "Inter_700Bold" },
  logUser: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  logDetail: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  logTime: { fontSize: 11, fontFamily: "Inter_400Regular" },
});
