import React, { useState } from "react";
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

type RoleFilter = "all" | "student" | "admin" | "developer";

const ROLE_COLORS: Record<string, string> = {
  student: "#3B82F6",
  admin: "#F59E0B",
  developer: "#8B5CF6",
};

const ALL_USERS = [
  { id: "s1", name: "Tolu Adeyemi", identifier: "ART2500001", role: "student", status: "active", level: "300L" },
  { id: "s2", name: "Chidi Okonkwo", identifier: "ART2500002", role: "student", status: "active", level: "300L" },
  { id: "s3", name: "Fatima Bello", identifier: "ART2500003", role: "student", status: "pending", level: "200L" },
  { id: "s4", name: "Peter Nwosu", identifier: "ART2500004", role: "student", status: "active", level: "400L" },
  { id: "s5", name: "Kemi Adesanya", identifier: "ART2500005", role: "student", status: "rejected", level: "100L" },
  { id: "s6", name: "Emmanuel Obi", identifier: "ART2500006", role: "student", status: "pending", level: "300L" },
  { id: "s7", name: "Rukayat Lawal", identifier: "ART2500007", role: "student", status: "active", level: "200L" },
  { id: "s8", name: "Michael Eze", identifier: "ART2500008", role: "student", status: "active", level: "400L" },
  { id: "a1", name: "Yusuf Ibrahim", identifier: "LEC001", role: "admin", status: "active", level: "Lecturer" },
  { id: "a2", name: "Sandra Okafor", identifier: "REP001", role: "admin", status: "active", level: "Course Rep" },
  { id: "a3", name: "James Adeleke", identifier: "EXE001", role: "admin", status: "active", level: "Dept. Exec" },
  { id: "d1", name: "Dev Martins", identifier: "DEV001", role: "developer", status: "active", level: "Superuser" },
];

export default function UsersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const filtered = roleFilter === "all" ? ALL_USERS : ALL_USERS.filter((u) => u.role === roleFilter);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={["#1a1a2e", "#16213e", "#0f3460"]}
        style={[styles.header, { paddingTop: topPad + 20 }]}
      >
        <Text style={styles.title}>All Users</Text>
        <Text style={styles.subtitle}>{ALL_USERS.length} accounts registered</Text>
        <View style={styles.filterRow}>
          {(["all", "student", "admin", "developer"] as RoleFilter[]).map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.filterChip, roleFilter === r && styles.filterChipActive]}
              onPress={() => {
                setRoleFilter(r);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterText, roleFilter === r && styles.filterTextActive]}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <FlatList
        data={filtered}
        keyExtractor={(u) => u.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 84 : 90) }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: u }) => {
          const roleColor = ROLE_COLORS[u.role] ?? colors.primary;
          return (
            <View style={[styles.userRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.avatar, { backgroundColor: roleColor + "20" }]}>
                <Text style={[styles.avatarText, { color: roleColor }]}>
                  {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.userName, { color: colors.foreground }]}>{u.name}</Text>
                <Text style={[styles.userMeta, { color: colors.mutedForeground }]}>{u.identifier}  ·  {u.level}</Text>
              </View>
              <View style={[styles.roleBadge, { backgroundColor: roleColor + "15" }]}>
                <Text style={[styles.roleText, { color: roleColor }]}>{u.role}</Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#fff" },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.55)", marginTop: 2, marginBottom: 16 },
  filterRow: { flexDirection: "row", gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  filterChipActive: { backgroundColor: "#fff" },
  filterText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.7)" },
  filterTextActive: { color: "#1a1a2e" },
  list: { padding: 16, gap: 10 },
  userRow: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, borderWidth: 1, padding: 14 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  userName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  userMeta: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  roleText: { fontSize: 12, fontFamily: "Inter_700Bold", textTransform: "capitalize" },
});
