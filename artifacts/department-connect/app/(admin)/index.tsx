import React from "react";
import {
  Alert,
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
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

function StatCard({
  label,
  value,
  icon,
  color,
  sub,
}: {
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  sub?: string;
}) {
  const colors = useColors();
  return (
    <View style={[cardStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[cardStyles.iconWrap, { backgroundColor: color + "18" }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[cardStyles.value, { color: colors.foreground }]}>{value}</Text>
      <Text style={[cardStyles.label, { color: colors.mutedForeground }]}>{label}</Text>
      {sub && <Text style={[cardStyles.sub, { color: color }]}>{sub}</Text>}
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 4,
    minWidth: "45%",
  },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  value: { fontSize: 22, fontFamily: "Inter_700Bold" },
  label: { fontSize: 12, fontFamily: "Inter_400Regular" },
  sub: { fontSize: 11, fontFamily: "Inter_600SemiBold", marginTop: 2 },
});

export default function AdminDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { students, classes, announcements } = useData();

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const activeStudents = students.filter((s) => s.status === "active").length;
  const pendingStudents = students.filter((s) => s.status === "pending");
  const todayClasses = classes.filter((c) => c.date === "2026-06-20");
  const totalAdmins = 3;

  const totalAttended = classes.reduce((s, c) => s + c.attendanceCount, 0);
  const totalCapacity = classes.length * 25;
  const attRate = Math.round((totalAttended / totalCapacity) * 100);

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={["#0D2B7E", "#1B4FD8"]}
        style={[styles.header, { paddingTop: topPad + 20 }]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.subRole}>{user?.subRole ?? "Admin"}</Text>
            <Text style={styles.name}>{user?.firstName} {user?.surname}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={20} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 84 : 90) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard label="Active Students" value={activeStudents} icon="people" color={colors.primary} />
          <StatCard
            label="Pending Approvals"
            value={pendingStudents.length}
            icon="time-outline"
            color={colors.warning}
            sub={pendingStudents.length > 0 ? "Needs attention" : undefined}
          />
          <StatCard label="Today's Classes" value={todayClasses.length} icon="calendar" color={colors.info} />
          <StatCard label="Attendance Rate" value={`${attRate}%`} icon="stats-chart" color={colors.success} />
        </View>

        {pendingStudents.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Pending Approvals</Text>
            {pendingStudents.slice(0, 3).map((s) => {
              const days = Math.floor(
                (new Date("2026-06-20").getTime() - new Date(s.submittedAt ?? "2026-06-20").getTime()) /
                  86400000
              );
              return (
                <View key={s.id} style={[styles.pendingCard, { backgroundColor: "#FFF7ED", borderColor: "#FED7AA" }]}>
                  <View style={styles.pendingLeft}>
                    <Text style={styles.pendingName}>{s.firstName} {s.surname}</Text>
                    <Text style={styles.pendingMeta}>{s.matricNumber}  ·  {s.level}</Text>
                  </View>
                  <View style={styles.pendingRight}>
                    <Text style={styles.pendingDays}>{days}d</Text>
                    <Text style={styles.pendingWaiting}>waiting</Text>
                  </View>
                </View>
              );
            })}
          </>
        )}

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Today's Classes</Text>
        {todayClasses.map((cls) => (
          <View key={cls.id} style={[styles.classRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.classDot, { backgroundColor: cls.status === "ongoing" ? colors.success : cls.status === "completed" ? colors.mutedForeground : colors.primary }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.classCode, { color: colors.primary }]}>{cls.courseCode}</Text>
              <Text style={[styles.className, { color: colors.foreground }]}>{cls.courseName}</Text>
              <Text style={[styles.classMeta, { color: colors.mutedForeground }]}>{cls.startTime} – {cls.endTime}  ·  {cls.venue}</Text>
            </View>
            <View style={styles.classRight}>
              <Ionicons name="people-outline" size={14} color={colors.mutedForeground} />
              <Text style={[styles.classCount, { color: colors.mutedForeground }]}>{cls.attendanceCount}</Text>
            </View>
          </View>
        ))}

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Announcements</Text>
        {announcements.slice(0, 2).map((an) => (
          <View key={an.id} style={[styles.annoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.annoTitle, { color: colors.foreground }]}>{an.title}</Text>
            <Text style={[styles.annoBody, { color: colors.mutedForeground }]} numberOfLines={1}>{an.body}</Text>
            <Text style={[styles.annoMeta, { color: colors.mutedForeground }]}>{an.postedBy}  ·  {an.time}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  subRole: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: 1 },
  name: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff", marginTop: 2 },
  logoutBtn: { padding: 8 },
  content: { padding: 16 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginTop: 16, marginBottom: 12 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  pendingCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  pendingLeft: { flex: 1 },
  pendingName: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#92400E" },
  pendingMeta: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#B45309", marginTop: 2 },
  pendingRight: { alignItems: "center" },
  pendingDays: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#F59E0B" },
  pendingWaiting: { fontSize: 10, fontFamily: "Inter_400Regular", color: "#B45309" },
  classRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  classDot: { width: 8, height: 8, borderRadius: 4 },
  classCode: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  className: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginTop: 1 },
  classMeta: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  classRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  classCount: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  annoCard: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10 },
  annoTitle: { fontSize: 14, fontFamily: "Inter_700Bold", marginBottom: 4 },
  annoBody: { fontSize: 13, fontFamily: "Inter_400Regular" },
  annoMeta: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 6 },
});
