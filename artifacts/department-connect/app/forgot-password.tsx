import React, { useState } from "react";
import {
  ActivityIndicator,
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
import { router } from "expo-router";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { SuccessAnimation } from "@/components/AnimatedStatus";

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 24);
  const botPad = insets.bottom + 24;

  const handleSubmit = async () => {
    if (!identifier.trim()) {
      setError("Please enter your matric number, staff ID, or email.");
      return;
    }
    setError("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  if (sent) {
    return (
      <LinearGradient
        colors={["#0D0720", "#2D1B69", "#7C3AED"]}
        style={[styles.gradient, { alignItems: "center", justifyContent: "center", padding: 24 }]}
      >
        <View style={styles.sentCard}>
          <SuccessAnimation />
          <Text style={styles.sentTitle}>Reset Link Sent!</Text>
          <Text style={styles.sentBody}>
            Password reset instructions have been sent to the contact information associated with your account.
          </Text>
          <View style={styles.demoNote}>
            <Ionicons name="information-circle-outline" size={16} color="#7C3AED" />
            <Text style={styles.demoNoteText}>
              <Text style={{ fontFamily: "Inter_700Bold" }}>Demo app: </Text>
              Your password remains <Text style={{ fontFamily: "Inter_700Bold" }}>"password"</Text>. Contact Admin to change it.
            </Text>
          </View>
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
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[styles.scroll, { paddingTop: topPad, paddingBottom: botPad }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.backLink} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={18} color="rgba(255,255,255,0.8)" />
          <Text style={styles.backLinkText}>Back to Login</Text>
        </TouchableOpacity>

        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="lock-open-outline" size={36} color="#fff" />
          </View>
          <Text style={styles.heroTitle}>Forgot Password?</Text>
          <Text style={styles.heroSub}>Enter your details and we'll send reset instructions</Text>
        </View>

        <View style={styles.card}>
          {!!error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Text style={styles.label}>Matric Number, Staff ID, or Email</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. ART2500001 or you@example.com"
            placeholderTextColor="#94A3B8"
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />

          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="send-outline" size={16} color="#fff" />
                <Text style={styles.btnText}>Send Reset Instructions</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollViewCompat>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24 },
  backLink: {
    flexDirection: "row", alignItems: "center", gap: 6,
    marginBottom: 32, alignSelf: "flex-start",
  },
  backLinkText: { color: "rgba(255,255,255,0.8)", fontFamily: "Inter_600SemiBold", fontSize: 14 },
  hero: { alignItems: "center", marginBottom: 32 },
  heroIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center", marginBottom: 16,
  },
  heroTitle: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#fff", marginBottom: 6 },
  heroSub: {
    fontSize: 14, fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.65)", textAlign: "center",
  },
  card: {
    backgroundColor: "#fff", borderRadius: 24, padding: 24,
    boxShadow: "0px 12px 24px rgba(0,0,0,0.25)", elevation: 12,
  },
  errorBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#FEE2E2", borderRadius: 10, padding: 12, marginBottom: 16,
  },
  errorText: { color: "#DC2626", fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  label: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#374151", marginBottom: 8 },
  input: {
    backgroundColor: "#F8FAFC", borderWidth: 1.5, borderColor: "#E2E8F0",
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, fontFamily: "Inter_400Regular", color: "#0F172A",
  },
  btn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: "#7C3AED", borderRadius: 14,
    paddingVertical: 15, marginTop: 20,
  },
  btnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  sentCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 28, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
    padding: 32, alignItems: "center", gap: 16, width: "100%",
  },
  sentTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#fff", textAlign: "center" },
  sentBody: {
    fontSize: 14, fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.75)", textAlign: "center", lineHeight: 22,
  },
  demoNote: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", width: "100%",
  },
  demoNoteText: {
    fontSize: 13, fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.85)", flex: 1, lineHeight: 19,
  },
  backBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 14,
    paddingHorizontal: 24, paddingVertical: 13, marginTop: 4,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
  },
  backBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 15 },
});
