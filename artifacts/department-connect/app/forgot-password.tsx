import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path, Ellipse } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { SuccessAnimation } from "@/components/AnimatedStatus";

const { width: W } = Dimensions.get("window");

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const botPad = insets.bottom + 24;

  const handleSubmit = async () => {
    if (!identifier.trim()) {
      setError("Please enter your matric number, staff ID, or email.");
      return;
    }
    setError("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  if (sent) {
    return (
      <LinearGradient colors={["#0D0720", "#2D1B69", "#4C1D95"]} style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <View style={styles.sentCard}>
          <SuccessAnimation />
          <Text style={styles.sentTitle}>Reset Link Sent!</Text>
          <Text style={styles.sentBody}>
            Password reset instructions have been sent to the contact information associated with your account.
          </Text>
          <View style={styles.demoNote}>
            <Ionicons name="information-circle-outline" size={16} color="#A78BFA" />
            <Text style={styles.demoNoteText}>
              <Text style={{ fontFamily: "Inter_700Bold" }}>Demo app: </Text>
              Your password remains <Text style={{ fontFamily: "Inter_700Bold" }}>"password"</Text>. Contact Admin to change it.
            </Text>
          </View>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.replace("/login")} activeOpacity={0.85}>
            <Ionicons name="arrow-back" size={16} color="#fff" />
            <Text style={styles.backBtnText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      {/* Wave header */}
      <View style={styles.waveContainer}>
        <Svg width={W} height={200} viewBox={`0 0 ${W} 200`} style={StyleSheet.absoluteFill}>
          <Path
            d={`M0,0 L${W},0 L${W},130 Q${W * 0.75},185 ${W * 0.5},148 Q${W * 0.25},110 0,160 Z`}
            fill="#2D1B69"
          />
          <Path
            d={`M0,0 L${W},0 L${W},110 Q${W * 0.75},160 ${W * 0.5},126 Q${W * 0.25},92 0,140 Z`}
            fill="#7C3AED"
            opacity={0.55}
          />
          <Ellipse cx={W * 0.88} cy={25} rx={50} ry={45} fill="#9F67FF" opacity={0.18} />
          <Ellipse cx={W * 0.08} cy={12} rx={40} ry={35} fill="#6D28D9" opacity={0.22} />
        </Svg>

        {/* Back button on wave */}
        <TouchableOpacity style={styles.backLink} onPress={() => router.back()} activeOpacity={0.7}>
          <View style={styles.backCircle}>
            <Ionicons name="arrow-back" size={18} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* Hero icon on wave */}
        <View style={styles.heroIconWrap}>
          <View style={styles.heroIconOuter}>
            <View style={styles.heroIconInner}>
              <Ionicons name="lock-open-outline" size={28} color="#7C3AED" />
            </View>
          </View>
        </View>
      </View>

      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[styles.formScroll, { paddingBottom: botPad }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Forgot Password?</Text>
        <Text style={styles.sub}>Enter your details and we'll send you reset instructions.</Text>

        {!!error && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={15} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Text style={styles.label}>Matric Number, Staff ID, or Email</Text>
        <View style={styles.inputRow}>
          <Ionicons name="mail-outline" size={18} color="#A78BFA" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g. ART2500001 or you@example.com"
            placeholderTextColor="#CBD5E1"
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />
        </View>

        <TouchableOpacity style={[styles.btn, loading && { opacity: 0.6 }]} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
          <LinearGradient colors={["#7C3AED", "#5B21B6"]} style={styles.btnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="send-outline" size={16} color="#fff" />
                <Text style={styles.btnText}>Send Reset Instructions</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.altLink} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.altLinkText}>Remembered it? </Text>
          <Text style={styles.altLinkAccent}>Back to Sign In</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FAFAFA" },

  waveContainer: { width: "100%", height: 200 },
  backLink: { position: "absolute", top: 16, left: 20 },
  backCircle: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center", justifyContent: "center",
  },

  heroIconWrap: { alignItems: "center", marginTop: 56 },
  heroIconOuter: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 2, borderColor: "rgba(255,255,255,0.45)",
    alignItems: "center", justifyContent: "center",
  },
  heroIconInner: {
    width: 62, height: 62, borderRadius: 31,
    backgroundColor: "#fff",
    alignItems: "center", justifyContent: "center",
  },

  formScroll: { flexGrow: 1, paddingHorizontal: 24 },
  heading: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#1E1B4B", marginBottom: 6, marginTop: 20 },
  sub: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#64748B", marginBottom: 24, lineHeight: 21 },

  errorBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#FEF2F2", borderRadius: 12, padding: 12,
    marginBottom: 16, borderWidth: 1, borderColor: "#FECACA",
  },
  errorText: { color: "#DC2626", fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },

  label: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#374151", marginBottom: 8 },
  inputRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#fff", borderRadius: 14,
    borderWidth: 1.5, borderColor: "#E8E0FF",
    paddingHorizontal: 14, paddingVertical: 2, marginBottom: 4,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", color: "#1E1B4B", paddingVertical: 13 },

  btn: { marginTop: 22, borderRadius: 16, overflow: "hidden" },
  btnGrad: { paddingVertical: 16, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 },
  btnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },

  altLink: { flexDirection: "row", justifyContent: "center", marginTop: 18 },
  altLinkText: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#64748B" },
  altLinkAccent: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#7C3AED" },

  sentCard: {
    backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 28,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
    padding: 32, alignItems: "center", gap: 16, width: "100%",
  },
  sentTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#fff", textAlign: "center" },
  sentBody: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.75)", textAlign: "center", lineHeight: 22 },
  demoNote: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", width: "100%",
  },
  demoNoteText: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.85)", flex: 1, lineHeight: 19 },
  backBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 14,
    paddingHorizontal: 24, paddingVertical: 13, marginTop: 4,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
  },
  backBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 15 },
});
