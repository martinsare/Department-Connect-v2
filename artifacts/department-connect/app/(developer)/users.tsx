import React, { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
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
import type { AdminSubRole } from "@/context/AuthContext";

type RoleFilter = "all" | "student" | "admin" | "developer";

const ROLE_COLORS: Record<string, string> = {
  student: "#7C3AED",
  admin: "#F59E0B",
  developer: "#8B5CF6",
};

const SUB_ROLES: AdminSubRole[] = ["Lecturer", "Course Representative", "Department Executive"];
const SUB_ROLE_LABELS: Record<AdminSubRole, string> = {
  Lecturer: "Lecturer",
  "Course Representative": "Course Rep",
  "Department Executive": "Dept. Executive",
};

export default function UsersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { allUsers, addAdmin } = useAuth();
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [showForm, setShowForm] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [staffId, setStaffId] = useState("");
  const [subRole, setSubRole] = useState<AdminSubRole>("Lecturer");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [formError, setFormError] = useState("");

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const displayUsers = allUsers.map((u) => ({
    id: u.id,
    name: `${u.firstName} ${u.surname}`,
    identifier: u.matricNumber ?? u.staffId ?? "—",
    role: u.role,
    status: u.status ?? "active",
    level: u.subRole ? SUB_ROLE_LABELS[u.subRole as AdminSubRole] ?? u.subRole : u.level ?? "—",
  }));

  const filtered = roleFilter === "all" ? displayUsers : displayUsers.filter((u) => u.role === roleFilter);

  const resetForm = () => {
    setFirstName("");
    setSurname("");
    setStaffId("");
    setSubRole("Lecturer");
    setPhone("");
    setEmail("");
    setPassword("");
    setShowPass(false);
    setFormError("");
  };

  const handleCreate = () => {
    if (!firstName.trim() || !surname.trim()) {
      setFormError("First name and surname are required.");
      return;
    }
    if (!staffId.trim()) {
      setFormError("Staff ID is required.");
      return;
    }
    if (allUsers.some((u) => u.staffId?.toLowerCase() === staffId.toLowerCase().trim())) {
      setFormError("That Staff ID is already in use.");
      return;
    }
    if (!password.trim() || password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addAdmin({
      firstName: firstName.trim(),
      surname: surname.trim(),
      role: "admin",
      staffId: staffId.trim().toUpperCase(),
      subRole,
      department: "Computer Science",
      phone: phone.trim(),
      email: email.trim(),
      password: password,
    });
    resetForm();
    setShowForm(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={["#1a1a2e", "#16213e", "#0f3460"]}
        style={[styles.header, { paddingTop: topPad + 20 }]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>All Users</Text>
            <Text style={styles.subtitle}>{allUsers.length} accounts registered</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setShowForm(true); }}
            activeOpacity={0.85}
          >
            <Ionicons name="person-add-outline" size={16} color="#fff" />
            <Text style={styles.addBtnText}>Add Admin</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterRow}>
          {(["all", "student", "admin", "developer"] as RoleFilter[]).map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.filterChip, roleFilter === r && styles.filterChipActive]}
              onPress={() => { setRoleFilter(r); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
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

      {/* Add Admin Modal */}
      <Modal visible={showForm} transparent animationType="slide" statusBarTranslucent onRequestClose={() => { resetForm(); setShowForm(false); }}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />

            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add New Admin</Text>
                <Text style={[styles.modalSubtitle, { color: colors.mutedForeground }]}>
                  New admin can log in immediately with their surname or Staff ID
                </Text>
              </View>
              <TouchableOpacity onPress={() => { resetForm(); setShowForm(false); }}>
                <Ionicons name="close" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
              {/* Name row */}
              <View style={styles.fieldRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: colors.mutedForeground }]}>First Name</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                    placeholder="e.g. Amaka"
                    placeholderTextColor={colors.mutedForeground}
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: colors.mutedForeground }]}>Surname</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                    placeholder="e.g. Eze"
                    placeholderTextColor={colors.mutedForeground}
                    value={surname}
                    onChangeText={setSurname}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Staff ID */}
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Staff ID</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                placeholder="e.g. LEC004"
                placeholderTextColor={colors.mutedForeground}
                value={staffId}
                onChangeText={(v) => setStaffId(v.toUpperCase())}
                autoCapitalize="characters"
              />

              {/* Sub-role picker */}
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Sub-role</Text>
              <View style={styles.subRoleRow}>
                {SUB_ROLES.map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.subRoleChip,
                      { borderColor: subRole === r ? colors.primary : colors.border },
                      subRole === r && { backgroundColor: colors.primary + "15" },
                    ]}
                    onPress={() => { setSubRole(r); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.subRoleText, { color: subRole === r ? colors.primary : colors.mutedForeground }]}>
                      {r === "Course Representative" ? "Course Rep" : r === "Department Executive" ? "Dept. Exec" : r}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Phone */}
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Phone</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                placeholder="08012345678"
                placeholderTextColor={colors.mutedForeground}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              {/* Email */}
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Email (optional)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                placeholder="name@csc.edu"
                placeholderTextColor={colors.mutedForeground}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              {/* Password */}
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Password</Text>
              <View style={[styles.passWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.passInput, { color: colors.foreground }]}
                  placeholder="Min. 6 characters"
                  placeholderTextColor={colors.mutedForeground}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                />
                <TouchableOpacity onPress={() => setShowPass((p) => !p)} activeOpacity={0.7}>
                  <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={18} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>

              {formError ? (
                <View style={styles.errorWrap}>
                  <Ionicons name="alert-circle-outline" size={14} color="#EF4444" />
                  <Text style={styles.errorText}>{formError}</Text>
                </View>
              ) : null}

              {/* Create button */}
              <TouchableOpacity
                style={[styles.createBtn, { backgroundColor: colors.primary }]}
                onPress={handleCreate}
                activeOpacity={0.85}
              >
                <Ionicons name="person-add-outline" size={18} color="#fff" />
                <Text style={styles.createBtnText}>Create Admin Account</Text>
              </TouchableOpacity>

              <Text style={[styles.loginHint, { color: colors.mutedForeground }]}>
                They can log in with their surname or Staff ID + the password you set above.
              </Text>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#fff" },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.55)", marginTop: 2 },
  addBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#7C3AED", borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 9, marginTop: 4,
  },
  addBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#fff" },
  filterRow: { flexDirection: "row", gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.1)" },
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
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: "92%" },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 20 },
  modalHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 20 },
  modalTitle: { fontSize: 19, fontFamily: "Inter_700Bold" },
  modalSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 3, lineHeight: 16, maxWidth: 260 },
  fieldRow: { flexDirection: "row", gap: 12 },
  label: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginBottom: 6, marginTop: 14 },
  input: {
    borderRadius: 12, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, fontFamily: "Inter_400Regular",
  },
  subRoleRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  subRoleChip: {
    borderWidth: 1.5, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  subRoleText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  passWrap: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 12, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 12, gap: 8,
  },
  passInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  errorWrap: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 },
  errorText: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#EF4444", flex: 1 },
  createBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderRadius: 14, paddingVertical: 15, marginTop: 20,
  },
  createBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
  loginHint: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 12, lineHeight: 16 },
});
