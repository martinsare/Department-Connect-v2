import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
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
import * as Haptics from "expo-haptics";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useAuth } from "@/context/AuthContext";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login, isLoading } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslate = useRef(new Animated.Value(40)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, useNativeDriver: false, tension: 70, friction: 7 }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: false }),
      ]),
      Animated.parallel([
        Animated.spring(cardTranslate, { toValue: 0, useNativeDriver: false, tension: 80, friction: 8 }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 350, useNativeDriver: false }),
      ]),
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
      setError(result.error ?? "Invalid credentials");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 24);
  const botPad = insets.bottom + (Platform.OS === "web" ? 34 : 0) + 24;

  return (
    <LinearGradient colors={["#0D0720", "#2D1B69", "#7C3AED"]} style={styles.gradient}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[styles.scroll, { paddingTop: topPad, paddingBottom: botPad }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.hero, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
          <View style={styles.logoContainer}>
            <Image source={require("../assets/images/icon.png")} style={styles.logo} resizeMode="cover" />
            <View style={styles.logoGlow} />
          </View>
          <Text style={styles.appName}>Department Connect</Text>
          <Text style={styles.tagline}>Your Academic Community</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            { opacity: cardOpacity, transform: [{ translateY: cardTranslate }] },
          ]}
        >
          <Text style={styles.cardTitle}>Welcome Back</Text>
          <Text style={styles.cardSubtitle}>Sign in to access your dashboard</Text>

          {!!error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Text style={styles.formLabel}>Matric Number or Surname</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="e.g. ART2500001 or Adeyemi"
              placeholderTextColor="#94A3B8"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <Text style={[styles.formLabel, { marginTop: 16 }]}>Password</Text>
          <View style={[styles.inputWrap, styles.inputRow]}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Enter password"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity onPress={() => setShowPassword((p) => !p)} style={styles.eyeBtn}>
              <Text style={styles.eyeIcon}>{showPassword ? "🙈" : "👁"}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.btn, isLoading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.demo}>
            <Text style={styles.demoTitle}>Demo Credentials  (password: "password")</Text>
            <View style={styles.demoRow}>
              {[
                { role: "Student", hint: "Adeyemi", icon: "school-outline" as const },
                { role: "Admin", hint: "Ibrahim", icon: "shield-checkmark-outline" as const },
                { role: "Dev", hint: "Martins", icon: "code-slash-outline" as const },
              ].map((d) => (
                <TouchableOpacity
                  key={d.role}
                  style={styles.demoChip}
                  activeOpacity={0.8}
                  onPress={() => {
                    setIdentifier(d.hint);
                    setPassword("password");
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Ionicons name={d.icon} size={18} color="#7C3AED" />
                  <Text style={styles.demoChipLabel}>{d.role}</Text>
                  <Text style={styles.demoChipValue}>{d.hint}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.demoHint}>Tap any chip to auto-fill</Text>
          </View>
        </Animated.View>
      </KeyboardAwareScrollViewCompat>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24 },
  hero: { alignItems: "center", marginBottom: 36 },
  logoContainer: { position: "relative", marginBottom: 16 },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  logoGlow: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    bottom: 0,
    borderRadius: 20,
    backgroundColor: "#3B82F6",
    opacity: 0.3,
    zIndex: -1,
  },
  appName: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.65)",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    boxShadow: "0px 12px 24px rgba(0,0,0,0.25)",
    elevation: 12,
  },
  cardTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#0F172A", marginBottom: 4 },
  cardSubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#64748B", marginBottom: 20 },
  errorBanner: {
    backgroundColor: "#FEE2E2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: "#DC2626", fontSize: 14, fontFamily: "Inter_400Regular" },
  formLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#374151", marginBottom: 8 },
  inputWrap: { borderRadius: 12, overflow: "hidden" },
  inputRow: { flexDirection: "row", alignItems: "center" },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#0F172A",
  },
  eyeBtn: { position: "absolute", right: 12, padding: 4 },
  eyeIcon: { fontSize: 16 },
  btn: {
    backgroundColor: "#7C3AED",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 24,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: 0.2 },
  demo: { marginTop: 24, borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingTop: 16 },
  demoTitle: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#94A3B8", marginBottom: 10, textAlign: "center" },
  demoRow: { flexDirection: "row", gap: 8, justifyContent: "center" },
  demoChip: {
    flex: 1,
    backgroundColor: "#F0F4FF",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    gap: 2,
  },
  demoChipIcon: { fontSize: 18 },
  demoChipLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#64748B" },
  demoChipValue: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#7C3AED" },
  demoHint: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#CBD5E1", textAlign: "center", marginTop: 8 },
});
