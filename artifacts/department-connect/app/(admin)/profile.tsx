import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
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
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "@/components/Avatar";

export default function AdminProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, updateUser } = useAuth();

  const [phone, setPhone] = useState(user?.phone ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
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
      updateUser({ profilePicture: result.assets[0].uri });
    }
  };

  const handleSave = () => {
    updateUser({ phone, email });
    setEditing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Saved", "Profile updated successfully.");
  };

  const handleChangePassword = () => {
    if (!currentPwd.trim()) { Alert.alert("Error", "Please enter your current password."); return; }
    if (currentPwd !== "password") { Alert.alert("Error", "Current password is incorrect."); return; }
    if (newPwd.length < 8) { Alert.alert("Error", "New password must be at least 8 characters."); return; }
    if (newPwd !== confirmPwd) { Alert.alert("Error", "New passwords do not match."); return; }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowPasswordModal(false);
    setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    Alert.alert("Password Changed", "Your password has been updated successfully.");
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.avatarWrap} onPress={pickImage} activeOpacity={0.85}>
          <Avatar
            uri={user?.profilePicture}
            initials={initials}
            size={84}
            backgroundColor="rgba(255,255,255,0.25)"
            textColor="#fff"
            borderWidth={3}
            borderColor="rgba(255,255,255,0.5)"
          />
          <View style={styles.cameraOverlay}>
            <Ionicons name="camera" size={14} color="#fff" />
          </View>
        </TouchableOpacity>

        <Text style={styles.fullName}>{user?.firstName} {user?.surname}</Text>
        <View style={styles.badges}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{user?.subRole ?? "Admin"}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{user?.department}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Staff Information</Text>
          {[
            { label: "First Name", value: user?.firstName ?? "" },
            { label: "Surname", value: user?.surname ?? "" },
            { label: "Staff ID", value: user?.staffId ?? "—" },
            { label: "Role", value: user?.subRole ?? "Admin" },
            { label: "Department", value: user?.department ?? "" },
          ].map((row, i, arr) => (
            <View key={row.label} style={[styles.infoRow, { borderBottomColor: colors.border, borderBottomWidth: i < arr.length - 1 ? 1 : 0 }]}>
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={[styles.infoValue, { color: colors.foreground }]}>{row.value || "—"}</Text>
                <Ionicons name="lock-closed-outline" size={11} color={colors.mutedForeground} />
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Contact Details</Text>
            <TouchableOpacity
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); if (editing) handleSave(); else setEditing(true); }}
              style={[styles.editBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.editBtnText}>{editing ? "Save" : "Edit"}</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Phone Number</Text>
          <TextInput
            style={[styles.fieldInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: editing ? colors.primary : "transparent" }]}
            value={phone}
            onChangeText={setPhone}
            editable={editing}
            keyboardType="phone-pad"
            maxLength={11}
          />

          <Text style={[styles.fieldLabel, { color: colors.mutedForeground, marginTop: 12 }]}>Email Address</Text>
          <TextInput
            style={[styles.fieldInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: editing ? colors.primary : "transparent" }]}
            value={email}
            onChangeText={setEmail}
            editable={editing}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Security</Text>
          <TouchableOpacity
            style={[styles.secRow, { borderTopColor: colors.border }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowPasswordModal(true); }}
            activeOpacity={0.8}
          >
            <View style={[styles.secIcon, { backgroundColor: colors.primary + "15" }]}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.secLabel, { color: colors.foreground }]}>Change Password</Text>
              <Text style={[styles.secDesc, { color: colors.mutedForeground }]}>Update your account password (min. 8 characters)</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showPasswordModal} transparent animationType="slide" onRequestClose={() => setShowPasswordModal(false)}>
        <View style={styles.pwOverlay}>
          <View style={[styles.pwSheet, { backgroundColor: colors.card }]}>
            <View style={[styles.pwHandle, { backgroundColor: colors.border }]} />
            <View style={styles.pwHeader}>
              <Text style={[styles.pwTitle, { color: colors.foreground }]}>Change Password</Text>
              <TouchableOpacity onPress={() => { setShowPasswordModal(false); setCurrentPwd(""); setNewPwd(""); setConfirmPwd(""); }}>
                <Ionicons name="close" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            {[
              { label: "Current Password", value: currentPwd, set: setCurrentPwd, secure: !showCurrent, toggle: () => setShowCurrent(v => !v), showToggle: true },
              { label: "New Password", value: newPwd, set: setNewPwd, secure: !showNew, toggle: () => setShowNew(v => !v), showToggle: true },
              { label: "Confirm New Password", value: confirmPwd, set: setConfirmPwd, secure: true, showToggle: false },
            ].map((f, i) => (
              <View key={f.label}>
                <Text style={[styles.pwLabel, { color: colors.mutedForeground, marginTop: i > 0 ? 14 : 0 }]}>{f.label}</Text>
                <View style={[styles.pwInputRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.pwInput, { color: colors.foreground }]}
                    value={f.value}
                    onChangeText={f.set}
                    secureTextEntry={f.secure}
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder={i === 0 ? "Enter current password" : i === 1 ? "Min. 8 characters" : "Re-enter new password"}
                    placeholderTextColor={colors.mutedForeground}
                  />
                  {f.showToggle && (
                    <TouchableOpacity onPress={f.toggle}>
                      <Ionicons name={!f.secure ? "eye-off-outline" : "eye-outline"} size={18} color={colors.mutedForeground} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
            <TouchableOpacity style={[styles.pwSaveBtn, { backgroundColor: colors.primary }]} onPress={handleChangePassword} activeOpacity={0.85}>
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
  backBtn: { alignSelf: "flex-start", marginBottom: 16 },
  avatarWrap: { position: "relative", marginBottom: 12 },
  cameraOverlay: {
    position: "absolute", bottom: 0, right: 0,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: "#7C3AED",
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "#fff",
  },
  fullName: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff" },
  badges: { flexDirection: "row", gap: 8, marginTop: 8 },
  badge: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#fff" },
  content: { padding: 16, gap: 12 },
  card: { borderRadius: 18, borderWidth: 1, padding: 18 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  cardTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 4 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 13 },
  infoLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  infoValue: { fontSize: 14, fontFamily: "Inter_400Regular" },
  editBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
  editBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 13 },
  fieldLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginBottom: 6, marginTop: 4 },
  fieldInput: { borderRadius: 10, borderWidth: 1.5, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, fontFamily: "Inter_400Regular" },
  secRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 14, borderTopWidth: 1 },
  secIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  secLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  secDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  pwOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  pwSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  pwHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 20 },
  pwHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  pwTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  pwLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginBottom: 6 },
  pwInputRow: { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 12 },
  pwInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  pwSaveBtn: { borderRadius: 14, padding: 16, alignItems: "center", marginTop: 24 },
  pwSaveBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
});
