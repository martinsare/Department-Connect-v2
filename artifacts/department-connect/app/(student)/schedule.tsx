import React, { useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DATES = ["16", "17", "18", "19", "20", "21"];
const TODAY_IDX = 4;

export default function ScheduleScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { classes } = useData();
  const [selectedDay, setSelectedDay] = useState(TODAY_IDX);

  const dateMap: Record<number, string> = {
    0: "2026-06-16", 1: "2026-06-17", 2: "2026-06-18",
    3: "2026-06-19", 4: "2026-06-20", 5: "2026-06-21",
  };

  const selectedDate = dateMap[selectedDay];
  const dayClasses = classes.filter((c) => c.date === selectedDate);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const statusColor = (status: string) => {
    if (status === "completed") return colors.mutedForeground;
    if (status === "ongoing") return colors.success;
    if (status === "upcoming") return colors.primary;
    return colors.destructive;
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={[styles.header, { paddingTop: topPad + 20 }]}
      >
        <Text style={styles.title}>Schedule</Text>
        <Text style={styles.subtitle}>June 2026</Text>

        <View style={styles.dayRow}>
          {DAYS.map((d, i) => (
            <TouchableOpacity
              key={d}
              style={[
                styles.dayBtn,
                selectedDay === i && styles.dayBtnActive,
              ]}
              onPress={() => setSelectedDay(i)}
              activeOpacity={0.8}
            >
              <Text style={[styles.dayLabel, selectedDay === i && styles.dayLabelActive]}>{d}</Text>
              <Text style={[styles.dateLabel, selectedDay === i && styles.dateLabelActive]}>{DATES[i]}</Text>
              {i === TODAY_IDX && <View style={styles.todayDot} />}
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 84 : 90) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {dayClasses.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Classes</Text>
            <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>
              No sessions scheduled for this day
            </Text>
          </View>
        ) : (
          dayClasses.map((cls) => {
            const col = statusColor(cls.status);
            const statusLabel = { completed: "Completed", ongoing: "Live Now", upcoming: "Upcoming", cancelled: "Cancelled" }[cls.status] ?? cls.status;
            return (
              <View key={cls.id} style={[styles.card, { backgroundColor: colors.card, borderLeftColor: col }]}>
                <View style={styles.timeCol}>
                  <Text style={[styles.startTime, { color: colors.foreground }]}>{cls.startTime.split(" ")[0]}</Text>
                  <Text style={[styles.ampm, { color: colors.mutedForeground }]}>{cls.startTime.split(" ")[1]}</Text>
                  <View style={[styles.timeLine, { backgroundColor: colors.border }]} />
                  <Text style={[styles.endTime, { color: colors.mutedForeground }]}>{cls.endTime.split(" ")[0]}</Text>
                </View>
                <View style={styles.details}>
                  <View style={styles.topRow}>
                    <Text style={[styles.courseCode, { color: colors.primary }]}>{cls.courseCode}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: col + "20" }]}>
                      <Text style={[styles.statusText, { color: col }]}>{statusLabel}</Text>
                    </View>
                  </View>
                  <Text style={[styles.courseName, { color: colors.foreground }]}>{cls.courseName}</Text>
                  <View style={styles.metaRow}>
                    <Ionicons name="location-outline" size={12} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{cls.venue}</Text>
                    <Ionicons name="people-outline" size={12} color={colors.mutedForeground} style={{ marginLeft: 8 }} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{cls.attendanceCount} present</Text>
                  </View>
                  {cls.attendanceOpen && (
                    <View style={[styles.attendanceBadge, { backgroundColor: colors.success + "20" }]}>
                      <Ionicons name="qr-code-outline" size={12} color={colors.success} />
                      <Text style={[styles.attendanceText, { color: colors.success }]}>Attendance Open</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 0 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#fff" },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.65)", marginTop: 2, marginBottom: 20 },
  dayRow: { flexDirection: "row", gap: 6, paddingBottom: 20 },
  dayBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  dayBtnActive: { backgroundColor: "#fff" },
  dayLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.6)" },
  dayLabelActive: { color: "#7C3AED" },
  dateLabel: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff", marginTop: 2 },
  dateLabelActive: { color: "#7C3AED" },
  todayDot: {
    width: 5, height: 5, borderRadius: 2.5,
    backgroundColor: "#F59E0B", marginTop: 3,
  },
  content: { padding: 16, gap: 12 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  emptyBody: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    borderLeftWidth: 4,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  timeCol: { width: 62, alignItems: "center", paddingVertical: 16, paddingHorizontal: 8 },
  startTime: { fontSize: 14, fontFamily: "Inter_700Bold" },
  ampm: { fontSize: 10, fontFamily: "Inter_400Regular" },
  timeLine: { width: 1, flex: 1, minHeight: 16, marginVertical: 4 },
  endTime: { fontSize: 11, fontFamily: "Inter_400Regular" },
  details: { flex: 1, padding: 14 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  courseCode: { fontSize: 12, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  courseName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 6, gap: 3 },
  metaText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  attendanceBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    marginTop: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: "flex-start",
  },
  attendanceText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
});
