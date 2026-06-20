import React, { useState } from "react";
import {
  FlatList,
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
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import type { AuditLog } from "@/context/DataContext";

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
  const [selected, setSelected] = useState<AuditLog | null>(null);

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
            <TouchableOpacity
              style={[styles.logCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelected(log);
              }}
              activeOpacity={0.8}
            >
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
                <Text style={[styles.logDetail, { color: colors.mutedForeground }]} numberOfLines={1}>{log.details}</Text>
                <Text style={[styles.timestamp, { color: colors.mutedForeground }]}>{log.timestamp}</Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color={colors.mutedForeground} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          );
        }}
      />

      {/* Log Detail Modal */}
      <Modal
        visible={!!selected}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setSelected(null)}
      >
        <View style={detail.overlay}>
          <View style={[detail.sheet, { backgroundColor: colors.card }]}>
            <View style={[detail.handle, { backgroundColor: colors.border }]} />

            {selected && (() => {
              const iconName = ACTION_ICONS[selected.action] ?? "information-circle-outline";
              const roleColor = ROLE_COLORS[selected.role] ?? colors.primary;

              const rows: { label: string; value: string; icon: React.ComponentProps<typeof Ionicons>["name"] }[] = [
                { label: "Action", value: selected.action, icon: "flash-outline" },
                { label: "Performed By", value: selected.user, icon: "person-outline" },
                { label: "Role", value: selected.role, icon: "ribbon-outline" },
                { label: "Timestamp", value: selected.timestamp, icon: "time-outline" },
                { label: "Details", value: selected.details, icon: "document-text-outline" },
                { label: "Log ID", value: selected.id, icon: "barcode-outline" },
              ];

              return (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                  {/* Header */}
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 20 }}>
                    <View style={[detail.iconCircle, { backgroundColor: roleColor + "20" }]}>
                      <Ionicons name={iconName} size={24} color={roleColor} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground }}>
                        {selected.action}
                      </Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
                        <View style={{ backgroundColor: roleColor + "18", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 }}>
                          <Text style={{ fontSize: 12, fontFamily: "Inter_700Bold", color: roleColor }}>{selected.role}</Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => setSelected(null)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="close" size={22} color={colors.mutedForeground} />
                    </TouchableOpacity>
                  </View>

                  {/* Detail rows */}
                  {rows.map((row, i) => (
                    <View
                      key={row.label}
                      style={{
                        flexDirection: "row", alignItems: "flex-start", gap: 12,
                        paddingVertical: 13,
                        borderBottomWidth: i < rows.length - 1 ? 1 : 0,
                        borderBottomColor: colors.border,
                      }}
                    >
                      <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: colors.muted, alignItems: "center", justifyContent: "center", marginTop: 2 }}>
                        <Ionicons name={row.icon} size={16} color={roleColor} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 0.5 }}>
                          {row.label}
                        </Text>
                        <Text style={{ fontSize: 14, fontFamily: "Inter_400Regular", color: colors.foreground, marginTop: 2, lineHeight: 20 }}>
                          {row.value}
                        </Text>
                      </View>
                    </View>
                  ))}

                  <TouchableOpacity
                    style={{ marginTop: 24, borderRadius: 14, paddingVertical: 14, backgroundColor: colors.muted, alignItems: "center" }}
                    onPress={() => setSelected(null)}
                    activeOpacity={0.8}
                  >
                    <Text style={{ fontSize: 15, fontFamily: "Inter_700Bold", color: colors.foreground }}>Close</Text>
                  </TouchableOpacity>
                </ScrollView>
              );
            })()}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const detail = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: "85%" },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 20 },
  iconCircle: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
});

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#fff" },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.55)", marginTop: 2 },
  list: { padding: 16, gap: 10 },
  logCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, borderWidth: 1, padding: 14 },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 3 },
  action: { fontSize: 14, fontFamily: "Inter_700Bold", flex: 1, marginRight: 8 },
  rolePill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  roleText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  logUser: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  logDetail: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 3, lineHeight: 16 },
  timestamp: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 6 },
});
