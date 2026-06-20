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
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { formatDob } from "@/utils/formatDob";
import { Avatar } from "@/components/Avatar";

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
  const { updateStudentPicture } = useData();
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [birthdayPrivacy, setBirthdayPrivacy] = useState(user?.birthdayPrivacy ?? false);
  const [hideYear, setHideYear] = useState(user?.hideYear ?? true);
  const [editing, setEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const initials = `${user?.firstName?.[0] ?? ""}${user?.surname?.[0] ?? ""}`;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow access to your photo library to upload a profile picture.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const uri = result.assets[0].uri;
      updateUser({ profilePicture: uri });
      if (user?.matricNumber) updateStudentPicture(user.matricNumber, uri);
    }
  };

  const handleSave = () => {
    updateUser({ phone, email, birthdayPrivacy });
    setEditing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleChangePassword = () => {
    if (!currentPwd.trim()) {
      Alert.alert("Error", "Please enter your current password.");
      return;
    }
    if (currentPwd !== "password") {
      Alert.alert("Error", "Current password is incorrect.");
      return;
    }
    if (newPwd.length < 8) {
      Alert.alert("Error", "New password must be at least 8 characters.");
      return;
    }
    if (newPwd !== confirmPwd) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowPasswordModal(false);
    setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    Alert.alert("Password Changed", "Your password has been updated successfully.");
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
        <TouchableOpacity style={styles.avatarWrap} onPress={pickImage} activeOpacity={0.85}>
          <Avatar
            uri={user?.profilePicture}
            initials={initials}
            size={80}
            backgroundColor="rgba(255,255,255,0.25)"
            textColor="#fff"
            borderWidth={3}
            borderColor="rgba(255,255,255,0.5)"
          />
          <View style={styles.cameraOverlay}>
            <Ionicons name="camera" size={13} color="#fff" />
          </View>
        </TouchableOpacity>
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
          <InfoRow label="Date of Birth" value={formatDob(user?.dob, true)} />
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
                Hide birth year from staff
              </Text>
              <Text style={[styles.switchDesc, { color: colors.mutedForeground }]}>
                When on, admins only see your birth month and day — not the year
              </Text>
            </View>
            <Switch
              value={hideYear}
              onValueChange={(v) => {
                setHideYear(v);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                updateUser({ hideYear: v });
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <View style={[styles.switchRow, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 14 }]}>
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

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Security</Text>
          <TouchableOpacity
            style={[styles.securityRow, { borderTopColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowPasswordModal(true);
            }}
            activeOpacity={0.8}
          >
            <View style={[styles.securityIcon, { backgroundColor: colors.primary + "15" }]}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.securityLabel, { color: colors.foreground }]}>Change Password</Text>
              <Text style={[styles.securityDesc, { color: colors.mutedForeground }]}>
                Update your account password (min. 8 characters)
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
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

      <Modal visible={showPasswordModal} transparent animationType="slide" onRequestClose={() => setShowPasswordModal(false)}>
        <View style={styles.pwModalOverlay}>
          <View style={[styles.pwSheet, { backgroundColor: colors.card }]}>
            <View style={[styles.pwHandle, { backgroundColor: colors.border }]} />
            <View style={styles.pwHeader}>
              <Text style={[styles.pwTitle, { color: colors.foreground }]}>Change Password</Text>
              <TouchableOpacity onPress={() => { setShowPasswordModal(false); setCurrentPwd(""); setNewPwd(""); setConfirmPwd(""); }}>
                <Ionicons name="close" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.pwFieldLabel, { color: colors.mutedForeground }]}>Current Password</Text>
            <View style={[styles.pwInputRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <TextInput
                style={[styles.pwInput, { color: colors.foreground }]}
                value={currentPwd}
                onChangeText={setCurrentPwd}
                secureTextEntry={!showCurrent}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Enter current password"
                placeholderTextColor={colors.mutedForeground}
              />
              <TouchableOpacity onPress={() => setShowCurrent((v) => !v)}>
                <Ionicons name={showCurrent ? "eye-off-outline" : "eye-outline"} size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.pwFieldLabel, { color: colors.mutedForeground, marginTop: 14 }]}>New Password</Text>
            <View style={[styles.pwInputRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <TextInput
                style={[styles.pwInput, { color: colors.foreground }]}
                value={newPwd}
                onChangeText={setNewPwd}
                secureTextEntry={!showNew}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Min. 8 characters"
                placeholderTextColor={colors.mutedForeground}
              />
              <TouchableOpacity onPress={() => setShowNew((v) => !v)}>
                <Ionicons name={showNew ? "eye-off-outline" : "eye-outline"} size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.pwFieldLabel, { color: colors.mutedForeground, marginTop: 14 }]}>Confirm New Password</Text>
            <View style={[styles.pwInputRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <TextInput
                style={[styles.pwInput, { color: colors.foreground }]}
                value={confirmPwd}
                onChangeText={setConfirmPwd}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Re-enter new password"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>

            <TouchableOpacity
              style={[styles.pwSaveBtn, { backgroundColor: colors.primary }]}
              onPress={handleChangePassword}
              activeOpacity={0.85}
            >
              <Text style={styles.pwSaveBtnText}>Update Password</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", paddingHorizontal: 20, paddingBottom: 28 },
  avatarWrap: { position: "relative", marginBottom: 12 },
  cameraOverlay: {
    position: "absolute", bottom: 0, right: 0,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: "#7C3AED",
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "#fff",
  },
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
  securityRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingTop: 14, borderTopWidth: 1,
  },
  securityIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  securityLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  securityDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  pwModalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  pwSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  pwHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 20 },
  pwHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  pwTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  pwFieldLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginBottom: 6 },
  pwInputRow: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 12, borderWidth: 1.5,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  pwInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  pwSaveBtn: { borderRadius: 14, padding: 16, alignItems: "center", marginTop: 24 },
  pwSaveBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
});
