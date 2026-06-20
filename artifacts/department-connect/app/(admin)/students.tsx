import React, { useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useData, type StudentStatus } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

const LEVELS = ["All", "100L", "200L", "300L", "400L", "500L"];

const STATUS_COLORS: Record<StudentStatus, string> = {
  active: "#10B981",
  pending: "#F59E0B",
  rejected: "#EF4444",
  suspended: "#6B7280",
};

export default function StudentsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { students } = useData();
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");

  const filtered = students.filter((s) => {
    const matchSearch =
      !search.trim() ||
      s.firstName.toLowerCase().includes(search.toLowerCase()) ||
      s.surname.toLowerCase().includes(search.toLowerCase()) ||
      s.matricNumber.toLowerCase().includes(search.toLowerCase());
    const matchLevel = levelFilter === "All" || s.level === levelFilter;
    return matchSearch && matchLevel;
  });

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={["#0D2B7E", "#1B4FD8"]}
        style={[styles.header, { paddingTop: topPad + 20 }]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Students</Text>
            <Text style={styles.subtitle}>{students.length} total enrolled</Text>
          </View>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color={colors.mutedForeground} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or matric..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {!!search && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <View style={[styles.levelRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <FlatList
          horizontal
          data={LEVELS}
          keyExtractor={(l) => l}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.levelChip,
                {
                  backgroundColor: levelFilter === item ? colors.primary : colors.muted,
                  borderColor: levelFilter === item ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setLevelFilter(item)}
              activeOpacity={0.8}
            >
              <Text style={[styles.levelChipText, { color: levelFilter === item ? "#fff" : colors.mutedForeground }]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(s) => s.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 84 : 90) },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No students found</Text>
          </View>
        }
        renderItem={({ item: s }) => {
          const statusColor = STATUS_COLORS[s.status];
          return (
            <View style={[styles.studentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.avatarText, { color: colors.primary }]}>{s.firstName[0]}{s.surname[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.studentName, { color: colors.foreground }]}>{s.firstName} {s.surname}</Text>
                <Text style={[styles.studentMeta, { color: colors.mutedForeground }]}>{s.matricNumber}</Text>
                <View style={styles.studentBottom}>
                  <Text style={[styles.studentLevel, { color: colors.primary }]}>{s.level}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
                    <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                    <Text style={[styles.statusText, { color: statusColor }]}>{s.status}</Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.border} />
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#fff" },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.65)", marginTop: 2 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#0F172A",
  },
  levelRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  levelChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  levelChipText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  list: { padding: 16, gap: 10 },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  studentCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  studentName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  studentMeta: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  studentBottom: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  studentLevel: { fontSize: 12, fontFamily: "Inter_700Bold" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold", textTransform: "capitalize" },
});
