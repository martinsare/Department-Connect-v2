import React, { useState } from "react";
import {
  ActivityIndicator,
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
import { router } from "expo-router";
import { useData } from "@/context/DataContext";
import { addRegisteredStudent } from "@/context/registeredStudentsStore";
import {
  addRegisteredTeacher,
  registeredTeachersStore,
} from "@/context/registeredTeachersStore";
import { SuccessAnimation } from "@/components/AnimatedStatus";

const LEVELS = ["100L", "200L", "300L", "400L", "500L"];
const DEPARTMENTS = [
  "Computer Science",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Economics",
  "Accounting",
  "Business Administration",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Law",
  "Medicine & Surgery",
  "Nursing Science",
  "Mass Communication",
];

type Role = "student" | "teacher";
type DoneType = "student" | "teacher";

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { students, addStudent } = useData();

  const [role, setRole] = useState<Role>("student");

  /* ── Student fields ── */
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [matric, setMatric] = useState("");
  const [level, setLevel] = useState("300L");
  const [department, setDepartment] = useState("");
  const [showDeptPicker, setShowDeptPicker] = useState(false);
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* ── Admin fields ── */
  const [tFirstName, setTFirstName] = useState("");
  const [tSurname, setTSurname] = useState("");
  const [tStaffId, setTStaffId] = useState("");
  const [tDepartment, setTDepartment] = useState("");
  const [showTDeptPicker, setShowTDeptPicker] = useState(false);
  const [tSubRole, setTSubRole] = useState<"Lecturer" | "Course Representative" | "Department Executive">("Lecturer");
  const [tPhone, setTPhone] = useState("");
  const [tEmail, setTEmail] = useState("");
  const [tPassword, setTPassword] = useState("");
  const [tConfirmPassword, setTConfirmPassword] = useState("");
  const [tShowPassword, setTShowPassword] = useState(false);
  const [tShowConfirm, setTShowConfirm] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<DoneType | null>(null);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 24);
  const botPad = insets.bottom + 24;

  const switchRole = (r: Role) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRole(r);
    setError("");
  };

  /* ── Student submit ── */
  const handleStudentRegister = async () => {
    setError("");
    if (!firstName.trim()) return setError("First name is required.");
    if (!surname.trim()) return setError("Surname is required.");
    if (!matric.trim()) return setError("Matric number is required.");
    if (!department) return setError("Please select your department.");
    if (!dob.trim()) return setError("Date of birth is required.");
    if (!email.trim()) return setError("Email address is required.");
    if (!/\S+@\S+\.\S+/.test(email.trim())) return setError("Please enter a valid email address.");
    if (!password) return setError("Password is required.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");

    const matricNorm = matric.trim().toUpperCase();
    if (students.some((s) => s.matricNumber.toUpperCase() === matricNorm)) {
      return setError("A student with this matric number already exists. Please contact Admin.");
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    const id = `reg_${Date.now()}`;
    const submittedAt = new Date().toISOString();

    const newStudent = {
      id,
      firstName: firstName.trim(),
      surname: surname.trim(),
      matricNumber: matricNorm,
      level,
      department,
      phone: phone.trim(),
      email: email.trim(),
      dob: dob.trim(),
      status: "pending" as const,
      submittedAt,
      birthdayPrivacy: false,
      hideYear: false,
    };

    addStudent(newStudent);
    addRegisteredStudent({ ...newStudent, role: "student", password });

    setLoading(false);
    setDone("student");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  /* ── Teacher submit ── */
  const handleTeacherRegister = async () => {
    setError("");
    if (!tFirstName.trim()) return setError("First name is required.");
    if (!tSurname.trim()) return setError("Surname is required.");
    if (!tStaffId.trim()) return setError("Staff ID is required.");
    if (!tDepartment) return setError("Please select your department.");
    if (!tPassword) return setError("Password is required.");
    if (tPassword.length < 6) return setError("Password must be at least 6 characters.");
    if (tPassword !== tConfirmPassword) return setError("Passwords do not match.");

    const staffIdNorm = tStaffId.trim().toUpperCase();
    if (registeredTeachersStore.some((t) => t.staffId.toUpperCase() === staffIdNorm)) {
      return setError("A teacher with this Staff ID already submitted a request.");
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));

    addRegisteredTeacher({
      id: `treg_${Date.now()}`,
      firstName: tFirstName.trim(),
      surname: tSurname.trim(),
      role: "admin",
      subRole: tSubRole,
      staffId: staffIdNorm,
      department: tDepartment,
      phone: tPhone.trim(),
      email: tEmail.trim(),
      dob: "",
      status: "pending",
      password: tPassword,
      submittedAt: new Date().toISOString(),
      birthdayPrivacy: false,
      hideYear: false,
    });

    setLoading(false);
    setDone("teacher");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  /* ── Success screen ── */
  if (done) {
    const isTeacher = done === "teacher";
    return (
      <LinearGradient
        colors={["#0D0720", "#2D1B69", "#4C1D95"]}
        style={[styles.gradient, { alignItems: "center", justifyContent: "center", padding: 24 }]}
      >
        <View style={styles.successCard}>
          <SuccessAnimation />
          <Text style={styles.successTitle}>
            {isTeacher ? "Application Submitted!" : "Registration Submitted!"}
          </Text>
          <Text style={styles.successBody}>
            {isTeacher
              ? "Your admin application is now pending review by the Super Admin. You'll be able to log in once approved."
              : "Your account is pending approval from Admin. You'll be able to log in once approved."}
          </Text>
          {isTeacher && (
            <View style={styles.infoNote}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#7C3AED" />
              <Text style={styles.infoNoteText}>
                Super Admin will review your credentials and approve or reject your admin account.
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.replace("/login")}
            activeOpacity={0.85}
          >
            <Ionicons name="arrow-back" size={16} color="#fff" />
            <Text style={styles.backBtnText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={["#0D0720", "#2D1B69", "#4C1D95"]} style={[styles.purpleZone, { paddingTop: topPad }]}>
        {/* Back */}
        <TouchableOpacity style={styles.backLink} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={18} color="rgba(255,255,255,0.8)" />
          <Text style={styles.backLinkText}>Back to Login</Text>
        </TouchableOpacity>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="person-add-outline" size={36} color="#fff" />
          </View>
          <Text style={styles.heroTitle}>Create Account</Text>
          <Text style={styles.heroSub}>Fill in your details to request access</Text>
        </View>

        {/* Role toggle */}
        <View style={styles.roleSwitcher}>
          <TouchableOpacity
            style={[styles.roleTab, role === "student" && styles.roleTabActive]}
            onPress={() => switchRole("student")}
            activeOpacity={0.8}
          >
            <Ionicons
              name={role === "student" ? "school" : "school-outline"}
              size={16}
              color={role === "student" ? "#fff" : "rgba(255,255,255,0.5)"}
            />
            <Text style={[styles.roleTabText, role === "student" && styles.roleTabTextActive]}>
              Student
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleTab, role === "teacher" && styles.roleTabActive]}
            onPress={() => switchRole("teacher")}
            activeOpacity={0.8}
          >
            <Ionicons
              name={role === "teacher" ? "person-circle" : "person-circle-outline"}
              size={16}
              color={role === "teacher" ? "#fff" : "rgba(255,255,255,0.5)"}
            />
            <Text style={[styles.roleTabText, role === "teacher" && styles.roleTabTextActive]}>
              Admin
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.whitePanel}>
        <ScrollView
          contentContainerStyle={[styles.panelScroll, { paddingBottom: botPad }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        {/* ── Student form ── */}
        {role === "student" && (
          <View>
            {!!error && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Name row */}
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>First Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Tolu"
                  placeholderTextColor="#94A3B8"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Surname *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Adeyemi"
                  placeholderTextColor="#94A3B8"
                  value={surname}
                  onChangeText={setSurname}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Matric */}
            <Text style={[styles.label, { marginTop: 14 }]}>Matric Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. ART2500027"
              placeholderTextColor="#94A3B8"
              value={matric}
              onChangeText={setMatric}
              autoCapitalize="characters"
              autoCorrect={false}
            />

            {/* Department dropdown */}
            <Text style={[styles.label, { marginTop: 14 }]}>Department *</Text>
            <TouchableOpacity
              style={[styles.input, styles.dropdownBtn]}
              onPress={() => { setShowDeptPicker(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              activeOpacity={0.8}
            >
              <Text style={[styles.dropdownBtnText, !department && { color: "#94A3B8" }]}>
                {department || "Select your department"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#94A3B8" />
            </TouchableOpacity>

            {/* Level */}
            <Text style={[styles.label, { marginTop: 14 }]}>Level *</Text>
            <View style={styles.levelRow}>
              {LEVELS.map((l) => (
                <TouchableOpacity
                  key={l}
                  style={[styles.levelChip, level === l && styles.levelChipActive]}
                  onPress={() => { setLevel(l); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.levelChipText, level === l && styles.levelChipTextActive]}>
                    {l}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Date of Birth */}
            <Text style={[styles.label, { marginTop: 14 }]}>Date of Birth *</Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#94A3B8"
              value={dob}
              onChangeText={(t) => {
                let clean = t.replace(/[^0-9]/g, "");
                if (clean.length > 2) clean = clean.slice(0, 2) + "/" + clean.slice(2);
                if (clean.length > 5) clean = clean.slice(0, 5) + "/" + clean.slice(5);
                if (clean.length > 10) clean = clean.slice(0, 10);
                setDob(clean);
              }}
              keyboardType="number-pad"
              maxLength={10}
            />

            {/* Phone */}
            <Text style={[styles.label, { marginTop: 14 }]}>Phone</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 08012345678"
              placeholderTextColor="#94A3B8"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            {/* Email — required */}
            <Text style={[styles.label, { marginTop: 14 }]}>Email Address *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. tolu@example.com"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Password */}
            <Text style={[styles.label, { marginTop: 14 }]}>Password *</Text>
            <View style={[styles.input, styles.inputRow]}>
              <TextInput
                style={{ flex: 1, fontSize: 15, color: "#0F172A", fontFamily: "Inter_400Regular" }}
                placeholder="Min. 6 characters"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowPassword((p) => !p)} style={styles.eyeBtn}>
                <Text style={styles.eyeIcon}>{showPassword ? "🙈" : "👁"}</Text>
              </TouchableOpacity>
            </View>

            {/* Confirm password */}
            <Text style={[styles.label, { marginTop: 14 }]}>Confirm Password *</Text>
            <View style={[styles.input, styles.inputRow]}>
              <TextInput
                style={{ flex: 1, fontSize: 15, color: "#0F172A", fontFamily: "Inter_400Regular" }}
                placeholder="Re-enter password"
                placeholderTextColor="#94A3B8"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowConfirm((p) => !p)} style={styles.eyeBtn}>
                <Text style={styles.eyeIcon}>{showConfirm ? "🙈" : "👁"}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, loading && { opacity: 0.6 }]}
              onPress={handleStudentRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                  <Text style={styles.submitBtnText}>Submit Registration</Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.note}>
              Your account will be reviewed by Admin before you can log in.
            </Text>
          </View>
        )}

        {/* Student department picker modal */}
        <Modal
          visible={showDeptPicker}
          transparent
          animationType="slide"
          statusBarTranslucent
          onRequestClose={() => setShowDeptPicker(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.pickerSheet}>
              <View style={styles.pickerHandle} />
              <Text style={styles.pickerTitle}>Select Department</Text>
              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
                {DEPARTMENTS.map((dept) => (
                  <TouchableOpacity
                    key={dept}
                    style={[styles.pickerItem, department === dept && styles.pickerItemActive]}
                    onPress={() => { setDepartment(dept); setShowDeptPicker(false); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.pickerItemText, department === dept && styles.pickerItemTextActive]}>
                      {dept}
                    </Text>
                    {department === dept && <Ionicons name="checkmark" size={18} color="#7C3AED" />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.pickerCancel} onPress={() => setShowDeptPicker(false)} activeOpacity={0.8}>
                <Text style={styles.pickerCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Admin department picker modal */}
        <Modal
          visible={showTDeptPicker}
          transparent
          animationType="slide"
          statusBarTranslucent
          onRequestClose={() => setShowTDeptPicker(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.pickerSheet}>
              <View style={styles.pickerHandle} />
              <Text style={styles.pickerTitle}>Select Department</Text>
              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
                {DEPARTMENTS.map((dept) => (
                  <TouchableOpacity
                    key={dept}
                    style={[styles.pickerItem, tDepartment === dept && styles.pickerItemActive]}
                    onPress={() => { setTDepartment(dept); setShowTDeptPicker(false); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.pickerItemText, tDepartment === dept && styles.pickerItemTextActive]}>
                      {dept}
                    </Text>
                    {tDepartment === dept && <Ionicons name="checkmark" size={18} color="#7C3AED" />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.pickerCancel} onPress={() => setShowTDeptPicker(false)} activeOpacity={0.8}>
                <Text style={styles.pickerCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* ── Teacher form ── */}
        {role === "teacher" && (
          <View>
            {!!error && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.teacherBanner}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#7C3AED" />
              <Text style={styles.teacherBannerText}>
                Admin accounts are reviewed and approved by <Text style={{ fontFamily: "Inter_700Bold" }}>Super Admin</Text> before activation.
              </Text>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>First Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Dr. Emeka"
                  placeholderTextColor="#94A3B8"
                  value={tFirstName}
                  onChangeText={setTFirstName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Surname *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Okafor"
                  placeholderTextColor="#94A3B8"
                  value={tSurname}
                  onChangeText={setTSurname}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            </View>

            <Text style={[styles.label, { marginTop: 14 }]}>Staff ID *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. STAFF001 or CS/LEC/001"
              placeholderTextColor="#94A3B8"
              value={tStaffId}
              onChangeText={setTStaffId}
              autoCapitalize="characters"
              autoCorrect={false}
            />

            <Text style={[styles.label, { marginTop: 14 }]}>Position / Role *</Text>
            <View style={styles.levelRow}>
              {(["Lecturer", "Course Representative", "Department Executive"] as const).map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.levelChip, tSubRole === r && styles.levelChipActive]}
                  onPress={() => { setTSubRole(r); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.levelChipText, tSubRole === r && styles.levelChipTextActive]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { marginTop: 14 }]}>Phone</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 08012345678"
              placeholderTextColor="#94A3B8"
              value={tPhone}
              onChangeText={setTPhone}
              keyboardType="phone-pad"
            />

            <Text style={[styles.label, { marginTop: 14 }]}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. dr.okafor@university.edu"
              placeholderTextColor="#94A3B8"
              value={tEmail}
              onChangeText={setTEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={[styles.label, { marginTop: 14 }]}>Password *</Text>
            <View style={[styles.input, styles.inputRow]}>
              <TextInput
                style={{ flex: 1, fontSize: 15, color: "#0F172A", fontFamily: "Inter_400Regular" }}
                placeholder="Min. 6 characters"
                placeholderTextColor="#94A3B8"
                value={tPassword}
                onChangeText={setTPassword}
                secureTextEntry={!tShowPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setTShowPassword((p) => !p)} style={styles.eyeBtn}>
                <Text style={styles.eyeIcon}>{tShowPassword ? "🙈" : "👁"}</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { marginTop: 14 }]}>Confirm Password *</Text>
            <View style={[styles.input, styles.inputRow]}>
              <TextInput
                style={{ flex: 1, fontSize: 15, color: "#0F172A", fontFamily: "Inter_400Regular" }}
                placeholder="Re-enter password"
                placeholderTextColor="#94A3B8"
                value={tConfirmPassword}
                onChangeText={setTConfirmPassword}
                secureTextEntry={!tShowConfirm}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setTShowConfirm((p) => !p)} style={styles.eyeBtn}>
                <Text style={styles.eyeIcon}>{tShowConfirm ? "🙈" : "👁"}</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { marginTop: 14 }]}>Department *</Text>
            <TouchableOpacity
              style={[styles.input, styles.dropdownBtn]}
              onPress={() => { setShowTDeptPicker(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              activeOpacity={0.8}
            >
              <Text style={[styles.dropdownBtnText, !tDepartment && { color: "#94A3B8" }]}>
                {tDepartment || "Select your department"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, loading && { opacity: 0.6 }]}
              onPress={handleTeacherRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="send-outline" size={18} color="#fff" />
                  <Text style={styles.submitBtnText}>Submit Teacher Application</Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.note}>
              Your admin account will be reviewed by Super Admin. Login access is granted upon approval.
            </Text>
          </View>
        )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  root: { flex: 1, backgroundColor: "#fff" },
  purpleZone: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  whitePanel: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -28,
    overflow: "hidden",
  },
  panelScroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 24 },
  backLink: {
    flexDirection: "row", alignItems: "center", gap: 6,
    marginBottom: 18, alignSelf: "flex-start",
  },
  backLinkText: { color: "rgba(255,255,255,0.8)", fontFamily: "Inter_600SemiBold", fontSize: 14 },
  hero: { alignItems: "center", marginBottom: 16 },
  heroIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center", marginBottom: 14,
  },
  heroTitle: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#fff", marginBottom: 4 },
  heroSub: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.65)" },
  roleSwitcher: {
    flexDirection: "row", gap: 8, marginBottom: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16, padding: 4,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.12)",
  },
  roleTab: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 7, paddingVertical: 11, borderRadius: 12,
  },
  roleTabActive: { backgroundColor: "#7C3AED" },
  roleTabText: {
    fontSize: 14, fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.5)",
  },
  roleTabTextActive: { color: "#fff" },
  errorBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#FEE2E2", borderRadius: 10, padding: 12, marginBottom: 16,
  },
  errorText: { color: "#DC2626", fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  teacherBanner: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    backgroundColor: "#F5F0FF", borderRadius: 10, padding: 12, marginBottom: 16,
    borderWidth: 1, borderColor: "#DDD6FE",
  },
  teacherBannerText: {
    fontSize: 12, fontFamily: "Inter_400Regular", color: "#5B21B6", flex: 1, lineHeight: 18,
  },
  row: { flexDirection: "row", gap: 10 },
  label: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#374151", marginBottom: 7 },
  input: {
    backgroundColor: "#F8FAFC", borderWidth: 1.5, borderColor: "#E2E8F0",
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, fontFamily: "Inter_400Regular", color: "#0F172A",
  },
  inputRow: { flexDirection: "row", alignItems: "center" },
  eyeBtn: { position: "absolute", right: 12, padding: 4 },
  eyeIcon: { fontSize: 16 },
  levelRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  levelChip: {
    paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20,
    backgroundColor: "#F1F5F9", borderWidth: 1.5, borderColor: "#E2E8F0",
  },
  levelChipActive: { backgroundColor: "#7C3AED20", borderColor: "#7C3AED" },
  levelChipText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#64748B" },
  levelChipTextActive: { color: "#7C3AED" },
  dropdownBtn: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dropdownBtnText: { fontSize: 15, fontFamily: "Inter_400Regular", color: "#0F172A", flex: 1 },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  pickerSheet: {
    backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 36,
  },
  pickerHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: "#E2E8F0", alignSelf: "center", marginBottom: 16,
  },
  pickerTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#0F172A", marginBottom: 12 },
  pickerItem: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 13, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: "#F1F5F9",
  },
  pickerItemActive: { backgroundColor: "#F5F0FF", borderRadius: 10, paddingHorizontal: 10 },
  pickerItemText: { fontSize: 15, fontFamily: "Inter_400Regular", color: "#374151" },
  pickerItemTextActive: { fontFamily: "Inter_600SemiBold", color: "#7C3AED" },
  pickerCancel: {
    marginTop: 16, alignItems: "center", backgroundColor: "#F1F5F9",
    borderRadius: 14, paddingVertical: 14,
  },
  pickerCancelText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#64748B" },
  deptBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#F0F4FF", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 9,
    marginTop: 16, borderWidth: 1, borderColor: "#DBEAFE",
  },
  deptText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#7C3AED" },
  submitBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: "#7C3AED",
    borderRadius: 14, paddingVertical: 15, marginTop: 20,
  },
  submitBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  note: {
    fontSize: 12, fontFamily: "Inter_400Regular", color: "#94A3B8",
    textAlign: "center", marginTop: 12, lineHeight: 18,
  },
  successCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 28, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
    padding: 32, alignItems: "center", gap: 16, width: "100%",
  },
  successTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#fff", textAlign: "center" },
  successBody: {
    fontSize: 14, fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.75)", textAlign: "center", lineHeight: 22,
  },
  infoNote: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", width: "100%",
  },
  infoNoteText: {
    fontSize: 13, fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.85)", flex: 1, lineHeight: 19,
  },
  backBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 14,
    paddingHorizontal: 20, paddingVertical: 12, marginTop: 8,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
  },
  backBtnText: { color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 14 },
});
