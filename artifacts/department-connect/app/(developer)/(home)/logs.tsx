import React from "react";
import { FlatList, Platform, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

const ACTION_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Login: "log-in-outline",
  "Attendance Marked": "checkmark-circle-outline",
  "Account Approved": "checkmark-done-circle-outline",
  "Account Created": "person-add-outline",
  "Class Session Created": "school-outline",
  "Payment Received": "card-outline",
  "Event Created": "calendar-outline",
};

const ROLE_COLORS: Record<string, string> = {
  Student: "#7C3AED",
  Admin: "#F59E0B",
  Lecturer: "#F59E0B",
  "Course Rep": "#F59E0B",
  "Dept. Executive": "#F59E0B",
  "Super Admin": "#8B5CF6",
  System: "#6B7280",
};

export default function LogsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { auditLogs } = useData();

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={["#1a1a2e", "#16213e", "#0f3460"]}
        style={[styles.header, { paddingTop: topPad + 20 }]}
      >
        <Text style={styles.title}>Audit Logs</Text>
        <Text style={styles.subtitle}>{auditLogs.length} entries · June 20, 2026</Text>
      </LinearGradient>

      <FlatList
        data={auditLogs}
        keyExtractor={(l) => l.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 84 : 90) }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: log }) => {
          const iconName = ACTION_ICONS[log.action] ?? "information-circle-outline";
          const roleColor = ROLE_COLORS[log.role] ?? colors.primary;
          return (
            <View style={[styles.logCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.iconWrap, { backgroundColor: roleColor + "18" }]}>
                <Ionicons name={iconName} size={18} color={roleColor} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.topRow}>
                  <Text style={[styles.action, { color: colors.foreground }]}>{log.action}</Text>
                  <View style={[styles.rolePill, { backgroundColor: roleColor + "15" }]}>
                    <Text style={[styles.roleText, { color: roleColor }]}>{log.role}</Text>
                  </View>
                </View>
                <Text style={[styles.logUser, { color: colors.mutedForeground }]}>{log.user}</Text>
                <Text style={[styles.logDetail, { color: colors.mutedForeground }]}>{log.details}</Text>
                <Text style={[styles.timestamp, { color: colors.mutedForeground }]}>{log.timestamp}</Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#fff" },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.55)", marginTop: 2 },
  list: { padding: 16, gap: 10 },
  logCard: { flexDirection: "row", gap: 12, borderRadius: 16, borderWidth: 1, padding: 14 },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 3 },
  action: { fontSize: 14, fontFamily: "Inter_700Bold", flex: 1, marginRight: 8 },
  rolePill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  roleText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  logUser: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  logDetail: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 3, lineHeight: 16 },
  timestamp: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 6 },
});
