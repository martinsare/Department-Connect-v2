import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
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

const LEVELS = ["100L", "200L", "300L", "400L", "500L"];
const DEPARTMENT = "Computer Science";

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { students, addStudent } = useData();

  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [matric, setMatric] = useState("");
  const [level, setLevel] = useState("300L");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 24);
  const botPad = insets.bottom + 24;

  const handleRegister = async () => {
    setError("");

    if (!firstName.trim()) return setError("First name is required.");
    if (!surname.trim()) return setError("Surname is required.");
    if (!matric.trim()) return setError("Matric number is required.");
    if (!password) return setError("Password is required.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");

    const matricNorm = matric.trim().toUpperCase();
    const alreadyExists = students.some(
      (s) => s.matricNumber.toUpperCase() === matricNorm
    );
    if (alreadyExists) {
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
      department: DEPARTMENT,
      phone: phone.trim(),
      email: email.trim(),
      dob: "",
      status: "pending" as const,
      submittedAt,
      birthdayPrivacy: false,
      hideYear: false,
    };

    addStudent(newStudent);

    addRegisteredStudent({
      ...newStudent,
      role: "student",
      password,
    });

    setLoading(false);
    setDone(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  if (done) {
    return (
      <LinearGradient
        colors={["#0D0720", "#2D1B69", "#7C3AED"]}
        style={[styles.gradient, { alignItems: "center", justifyContent: "center", padding: 24 }]}
      >
        <View style={styles.successCard}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color="#10B981" />
          </View>
          <Text style={styles.successTitle}>Registration Submitted!</Text>
          <Text style={styles.successBody}>
            Your account is pending approval from Admin. You'll be able to log in once approved.
          </Text>
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
    <LinearGradient colors={["#0D0720", "#2D1B69", "#7C3AED"]} style={styles.gradient}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad, paddingBottom: botPad }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <TouchableOpacity
          style={styles.backLink}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={18} color="rgba(255,255,255,0.8)" />
          <Text style={styles.backLinkText}>Back to Login</Text>
        </TouchableOpacity>

        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="person-add-outline" size={36} color="#fff" />
          </View>
          <Text style={styles.heroTitle}>Create Account</Text>
          <Text style={styles.heroSub}>Fill in your details to request access</Text>
        </View>

        <View style={styles.card}>
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

          {/* Level */}
          <Text style={[styles.label, { marginTop: 14 }]}>Level *</Text>
          <View style={styles.levelRow}>
            {LEVELS.map((l) => (
              <TouchableOpacity
                key={l}
                style={[
                  styles.levelChip,
                  level === l && styles.levelChipActive,
                ]}
                onPress={() => {
                  setLevel(l);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.levelChipText, level === l && styles.levelChipTextActive]}>
                  {l}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

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

          {/* Email */}
          <Text style={[styles.label, { marginTop: 14 }]}>Email</Text>
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

          {/* Department (auto) */}
          <View style={styles.deptBadge}>
            <Ionicons name="school-outline" size={14} color="#7C3AED" />
            <Text style={styles.deptText}>Department: {DEPARTMENT}</Text>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.6 }]}
            onPress={handleRegister}
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
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 20 },
  backLink: {
    flexDirection: "row", alignItems: "center", gap: 6,
    marginBottom: 24, alignSelf: "flex-start",
  },
  backLinkText: {
    color: "rgba(255,255,255,0.8)", fontFamily: "Inter_600SemiBold", fontSize: 14,
  },
  hero: { alignItems: "center", marginBottom: 28 },
  heroIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center",
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 26, fontFamily: "Inter_700Bold", color: "#fff", marginBottom: 4,
  },
  heroSub: {
    fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.65)",
  },
  card: {
    backgroundColor: "#fff", borderRadius: 24,
    padding: 22,
    boxShadow: "0px 12px 24px rgba(0,0,0,0.25)",
    elevation: 12,
    marginBottom: 16,
  },
  errorBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#FEE2E2", borderRadius: 10,
    padding: 12, marginBottom: 16,
  },
  errorText: { color: "#DC2626", fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
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
  successIcon: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: "#10B98115", alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "#10B98130",
  },
  successTitle: {
    fontSize: 24, fontFamily: "Inter_700Bold", color: "#fff", textAlign: "center",
  },
  successBody: {
    fontSize: 14, fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.75)", textAlign: "center", lineHeight: 22,
  },
  backBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 14,
    paddingHorizontal: 20, paddingVertical: 12, marginTop: 8,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
  },
  backBtnText: { color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 14 },
});
