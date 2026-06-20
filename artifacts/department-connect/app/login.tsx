import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path, Ellipse } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useAuth } from "@/context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { PendingAnimation, RejectedAnimation } from "@/components/AnimatedStatus";

const { width: W } = Dimensions.get("window");

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login, isLoading } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [holdingState, setHoldingState] = useState<"pending" | "rejected" | null>(null);

  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslate = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, { toValue: 1, useNativeDriver: false, tension: 60, friction: 7 }),
      Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: false }),
      Animated.timing(formOpacity, { toValue: 1, duration: 600, useNativeDriver: false, delay: 200 }),
      Animated.timing(formTranslate, { toValue: 0, duration: 500, useNativeDriver: false, delay: 200 }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      setError("Please enter your identifier and password");
      return;
    }
    setError("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const result = await login(identifier.trim(), password);
    if (!result.success) {
      const msg = result.error ?? "Invalid credentials";
      if (msg.includes("pending approval")) setHoldingState("pending");
      else if (msg.includes("rejected")) setHoldingState("rejected");
      else setError(msg);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const botPad = insets.bottom + 24;

  if (holdingState) {
    const isPending = holdingState === "pending";
    return (
      <LinearGradient colors={["#0D0720", "#2D1B69", "#4C1D95"]} style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <View style={styles.holdingCard}>
          {isPending ? <PendingAnimation /> : <RejectedAnimation />}
          <Text style={styles.holdingTitle}>{isPending ? "Account Pending Approval" : "Account Rejected"}</Text>
          <Text style={styles.holdingBody}>
            {isPending
              ? "Your account is currently pending approval. You will be notified once an admin reviews your request."
              : "Your account was rejected. Please contact your Admin for more information and to resubmit your details."}
          </Text>
          <TouchableOpacity style={styles.holdingBackBtn} onPress={() => { setHoldingState(null); setIdentifier(""); setPassword(""); }} activeOpacity={0.85}>
            <Ionicons name="arrow-back" size={16} color="#fff" />
            <Text style={styles.holdingBackText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      {/* Wave header */}
      <View style={styles.waveContainer}>
        <Svg width={W} height={220} viewBox={`0 0 ${W} 220`} style={StyleSheet.absoluteFill}>
          <Path
            d={`M0,0 L${W},0 L${W},140 Q${W * 0.75},200 ${W * 0.5},160 Q${W * 0.25},120 0,175 Z`}
            fill="#2D1B69"
          />
          <Path
            d={`M0,0 L${W},0 L${W},120 Q${W * 0.75},175 ${W * 0.5},138 Q${W * 0.25},100 0,155 Z`}
            fill="#7C3AED"
            opacity={0.55}
          />
          <Ellipse cx={W * 0.85} cy={30} rx={60} ry={55} fill="#9F67FF" opacity={0.18} />
          <Ellipse cx={W * 0.1} cy={15} rx={45} ry={40} fill="#6D28D9" opacity={0.22} />
        </Svg>

        {/* Logo centred on wave */}
        <Animated.View style={[styles.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
          <View style={styles.logoOuter}>
            <View style={styles.logoCircle}>
              <Image source={require("../assets/images/icon.png")} style={styles.logo} resizeMode="cover" />
            </View>
          </View>
          <Text style={styles.appName}>Department Connect</Text>
          <Text style={styles.tagline}>Your Academic Community</Text>
        </Animated.View>
      </View>

      {/* Form */}
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[styles.formScroll, { paddingBottom: botPad }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: formOpacity, transform: [{ translateY: formTranslate }] }}>
          <Text style={styles.formHeading}>Welcome back 👋</Text>
          <Text style={styles.formSub}>Sign in to access your dashboard</Text>

          {!!error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={15} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Text style={styles.label}>Matric Number or Surname</Text>
          <View style={styles.inputRow}>
            <Ionicons name="person-outline" size={18} color="#A78BFA" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. ART2500001 or Adeyemi"
              placeholderTextColor="#CBD5E1"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <View style={styles.labelRow}>
            <Text style={styles.label}>Password</Text>
            <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push("/forgot-password"); }} activeOpacity={0.7}>
              <Text style={styles.forgotLink}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={18} color="#A78BFA" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Enter password"
              placeholderTextColor="#CBD5E1"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity onPress={() => setShowPassword(p => !p)} style={styles.eyeBtn} activeOpacity={0.7}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.btn, isLoading && { opacity: 0.6 }]} onPress={handleLogin} disabled={isLoading} activeOpacity={0.85}>
            <LinearGradient colors={["#7C3AED", "#5B21B6"]} style={styles.btnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sign In</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.altLink} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push("/register"); }} activeOpacity={0.7}>
            <Text style={styles.altLinkText}>New student? </Text>
            <Text style={styles.altLinkAccent}>Create Account</Text>
          </TouchableOpacity>

          <View style={styles.demo}>
            <Text style={styles.demoTitle}>Demo Credentials (password: "password")</Text>
            <View style={styles.demoRow}>
              {[
                { role: "Student", hint: "Adeyemi", icon: "school-outline" as const },
                { role: "Admin", hint: "Ibrahim", icon: "shield-checkmark-outline" as const },
                { role: "Dev", hint: "Martins", icon: "code-slash-outline" as const },
              ].map(d => (
                <TouchableOpacity key={d.role} style={styles.demoChip} activeOpacity={0.8}
                  onPress={() => { setIdentifier(d.hint); setPassword("password"); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
                  <Ionicons name={d.icon} size={16} color="#7C3AED" />
                  <Text style={styles.demoChipLabel}>{d.role}</Text>
                  <Text style={styles.demoChipValue}>{d.hint}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.demoHint}>Tap any chip to auto-fill</Text>
          </View>
        </Animated.View>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FAFAFA" },

  waveContainer: { width: "100%", height: 220, marginBottom: 8 },

  logoWrap: { alignItems: "center", paddingTop: 20 },
  logoOuter: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 2, borderColor: "rgba(255,255,255,0.5)",
    alignItems: "center", justifyContent: "center",
    marginBottom: 10,
  },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#fff",
    overflow: "hidden", alignItems: "center", justifyContent: "center",
  },
  logo: { width: 64, height: 64, borderRadius: 14 },
  appName: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: -0.3 },
  tagline: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.75)", marginTop: 2 },

  formScroll: { flexGrow: 1, paddingHorizontal: 24 },
  formHeading: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#1E1B4B", marginBottom: 4 },
  formSub: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#64748B", marginBottom: 20 },

  errorBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#FEF2F2", borderRadius: 12, padding: 12,
    marginBottom: 16, borderWidth: 1, borderColor: "#FECACA",
  },
  errorText: { color: "#DC2626", fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },

  label: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#374151", marginBottom: 8 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16, marginBottom: 8 },
  forgotLink: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#7C3AED" },

  inputRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#fff", borderRadius: 14,
    borderWidth: 1.5, borderColor: "#E8E0FF",
    paddingHorizontal: 14, paddingVertical: 2,
    marginBottom: 4,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1, fontSize: 15, fontFamily: "Inter_400Regular",
    color: "#1E1B4B", paddingVertical: 13,
  },
  eyeBtn: { padding: 4 },

  btn: { marginTop: 22, borderRadius: 16, overflow: "hidden" },
  btnGrad: { paddingVertical: 16, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: 0.3 },

  altLink: { flexDirection: "row", justifyContent: "center", marginTop: 16 },
  altLinkText: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#64748B" },
  altLinkAccent: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#7C3AED" },

  demo: { marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#F1F5F9" },
  demoTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#94A3B8", marginBottom: 10, textAlign: "center", textTransform: "uppercase", letterSpacing: 0.5 },
  demoRow: { flexDirection: "row", gap: 8 },
  demoChip: {
    flex: 1, backgroundColor: "#F5F3FF", borderRadius: 12,
    paddingVertical: 10, paddingHorizontal: 8, alignItems: "center",
    borderWidth: 1, borderColor: "#DDD6FE", gap: 3,
  },
  demoChipLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#64748B" },
  demoChipValue: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#7C3AED" },
  demoHint: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#CBD5E1", textAlign: "center", marginTop: 8 },

  holdingCard: {
    backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 28,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
    padding: 32, alignItems: "center", gap: 16, width: "100%",
  },
  holdingTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff", textAlign: "center" },
  holdingBody: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.75)", textAlign: "center", lineHeight: 22 },
  holdingBackBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 14,
    paddingHorizontal: 20, paddingVertical: 12, marginTop: 8,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
  },
  holdingBackText: { color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 14 },
});
