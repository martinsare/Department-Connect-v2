import React, { useState } from "react";
import {
  ActivityIndicator,
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
import * as Haptics from "expo-haptics";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useAuth } from "@/context/AuthContext";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login, isLoading } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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
    <LinearGradient colors={["#070D1F", "#0D2B7E", "#1B4FD8"]} style={styles.gradient}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[styles.scroll, { paddingTop: topPad, paddingBottom: botPad }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Image source={require("../assets/images/icon.png")} style={styles.logo} />
          <Text style={styles.appName}>Department Connect</Text>
          <Text style={styles.tagline}>Your Academic Community</Text>
        </View>

        <View style={styles.card}>
          {!!error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Text style={styles.formLabel}>Matric Number or Surname</Text>
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

          <Text style={[styles.formLabel, { marginTop: 16 }]}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            placeholderTextColor="#94A3B8"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

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
              <View style={styles.demoChip}>
                <Text style={styles.demoChipLabel}>Student</Text>
                <Text style={styles.demoChipValue}>Adeyemi</Text>
              </View>
              <View style={styles.demoChip}>
                <Text style={styles.demoChipLabel}>Admin</Text>
                <Text style={styles.demoChipValue}>Ibrahim</Text>
              </View>
              <View style={styles.demoChip}>
                <Text style={styles.demoChipLabel}>Developer</Text>
                <Text style={styles.demoChipValue}>Martins</Text>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollViewCompat>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24 },
  hero: { alignItems: "center", marginBottom: 40 },
  logo: { width: 80, height: 80, borderRadius: 20, marginBottom: 16 },
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  errorBanner: {
    backgroundColor: "#FEE2E2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: "#DC2626", fontSize: 14, fontFamily: "Inter_400Regular" },
  formLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#374151", marginBottom: 8 },
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
  btn: {
    backgroundColor: "#1B4FD8",
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
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  demoChipLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#64748B", marginBottom: 2 },
  demoChipValue: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#1B4FD8" },
});
