import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

function InfoRow({ label, value, editable = false }: { label: string; value: string; editable?: boolean }) {
  const colors = useColors();
  return (
    <View style={[rowStyles.row, { borderBottomColor: colors.border }]}>
      <Text style={[rowStyles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={rowStyles.right}>
        <Text style={[rowStyles.value, { color: colors.foreground }]}>{value || "—"}</Text>
        {!editable && <Ionicons name="lock-closed-outline" size={12} color={colors.mutedForeground} />}
      </View>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  label: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  right: { flexDirection: "row", alignItems: "center", gap: 6 },
  value: { fontSize: 14, fontFamily: "Inter_400Regular" },
});

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout, updateUser } = useAuth();
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [birthdayPrivacy, setBirthdayPrivacy] = useState(user?.birthdayPrivacy ?? false);
  const [editing, setEditing] = useState(false);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const initials = `${user?.firstName?.[0] ?? ""}${user?.surname?.[0] ?? ""}`;

  const handleSave = () => {
    updateUser({ phone, email, birthdayPrivacy });
    setEditing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          logout();
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={[styles.header, { paddingTop: topPad + 20 }]}
      >
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.fullName}>{user?.firstName} {user?.surname}</Text>
        <View style={styles.badges}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{user?.level}</Text>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{user?.department}</Text>
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
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Student Information</Text>
          <InfoRow label="First Name" value={user?.firstName ?? ""} />
          <InfoRow label="Surname" value={user?.surname ?? ""} />
          <InfoRow label="Matric Number" value={user?.matricNumber ?? ""} />
          <InfoRow label="Date of Birth" value={user?.dob ?? ""} />
          <InfoRow label="Level" value={user?.level ?? ""} />
          <InfoRow label="Department" value={user?.department ?? ""} />
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Contact Details</Text>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (editing) handleSave(); else setEditing(true);
              }}
              style={[styles.editBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.editBtnText}>{editing ? "Save" : "Edit"}</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Phone Number</Text>
          <TextInput
            style={[
              styles.fieldInput,
              { backgroundColor: colors.muted, color: colors.foreground, borderColor: editing ? colors.primary : "transparent" },
            ]}
            value={phone}
            onChangeText={setPhone}
            editable={editing}
            keyboardType="phone-pad"
            maxLength={11}
          />

          <Text style={[styles.fieldLabel, { color: colors.mutedForeground, marginTop: 12 }]}>Email Address</Text>
          <TextInput
            style={[
              styles.fieldInput,
              { backgroundColor: colors.muted, color: colors.foreground, borderColor: editing ? colors.primary : "transparent" },
            ]}
            value={email}
            onChangeText={setEmail}
            editable={editing}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Privacy Settings</Text>
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.switchLabel, { color: colors.foreground }]}>
                Share birthday with department
              </Text>
              <Text style={[styles.switchDesc, { color: colors.mutedForeground }]}>
                Allow others to receive a birthday notification on your birthday
              </Text>
            </View>
            <Switch
              value={birthdayPrivacy}
              onValueChange={(v) => {
                setBirthdayPrivacy(v);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                updateUser({ birthdayPrivacy: v });
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: "#FEE2E2", borderColor: "#FECACA" }]}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Ionicons name="log-out-outline" size={18} color="#DC2626" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", paddingHorizontal: 20, paddingBottom: 28 },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
    marginBottom: 12,
  },
  avatarText: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#fff" },
  fullName: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff" },
  badges: { flexDirection: "row", gap: 8, marginTop: 8 },
  levelBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  levelText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#fff" },
  content: { padding: 16, gap: 12 },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  cardTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 4 },
  editBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
  editBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 13 },
  fieldLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginBottom: 6, marginTop: 4 },
  fieldInput: {
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  switchLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  switchDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2, lineHeight: 16 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginTop: 4,
  },
  logoutText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#DC2626" },
});
