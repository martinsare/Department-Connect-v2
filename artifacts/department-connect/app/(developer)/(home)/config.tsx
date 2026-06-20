import React, { useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

type Feature = {
  id: string;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  enabled: boolean;
  dangerous?: boolean;
};

export default function ConfigScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const [features, setFeatures] = useState<Feature[]>([
    { id: "qr_attendance", label: "QR Attendance", description: "Allow students to scan QR codes for attendance", icon: "qr-code-outline", enabled: true },
    { id: "birthday_notifs", label: "Birthday Notifications", description: "Send birthday push notifications to all users", icon: "gift-outline", enabled: true },
    { id: "paystack", label: "Paystack Payments", description: "Enable Paystack payment gateway for contributions", icon: "card-outline", enabled: true },
    { id: "push_notifs", label: "Push Notifications", description: "Send FCM push notifications to devices", icon: "notifications-outline", enabled: true },
    { id: "approval_flow", label: "Approval Flow", description: "Require Admin approval before student accounts become active", icon: "shield-checkmark-outline", enabled: true },
    { id: "analytics", label: "Analytics Dashboard", description: "Show attendance and payment analytics to Admin users", icon: "stats-chart-outline", enabled: true },
    { id: "maintenance_mode", label: "Maintenance Mode", description: "Put the app in read-only maintenance mode for all users", icon: "construct-outline", enabled: false, dangerous: true },
  ]);

  const toggleFeature = (id: string) => {
    const feature = features.find((f) => f.id === id);
    if (!feature) return;

    if (feature.dangerous && !feature.enabled) {
      Alert.alert(
        "Enable Maintenance Mode?",
        "This will put the entire app in read-only mode. Students and admins will not be able to make changes until you turn this off.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Enable",
            style: "destructive",
            onPress: () => {
              setFeatures((prev) => prev.map((f) => f.id === id ? { ...f, enabled: true } : f));
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            },
          },
        ]
      );
    } else {
      setFeatures((prev) => prev.map((f) => f.id === id ? { ...f, enabled: !f.enabled } : f));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={["#1a1a2e", "#16213e", "#0f3460"]}
        style={[styles.header, { paddingTop: topPad + 20 }]}
      >
        <Text style={styles.title}>System Config</Text>
        <Text style={styles.subtitle}>Feature flags and system settings</Text>

        <View style={styles.envBadge}>
          <View style={[styles.envDot, { backgroundColor: "#34D399" }]} />
          <Text style={styles.envText}>Production · v2.0.0</Text>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 84 : 90) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Feature Flags</Text>
          {features.map((f, i) => (
            <View
              key={f.id}
              style={[
                styles.featureRow,
                i < features.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
              ]}
            >
              <View style={[styles.featureIcon, { backgroundColor: (f.enabled ? colors.primary : colors.muted) + "30" }]}>
                <Ionicons name={f.icon} size={16} color={f.enabled ? colors.primary : colors.mutedForeground} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.featureLabelRow}>
                  <Text style={[styles.featureLabel, { color: colors.foreground }]}>{f.label}</Text>
                  {f.dangerous && (
                    <View style={styles.dangerTag}>
                      <Text style={styles.dangerTagText}>Destructive</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.featureDesc, { color: colors.mutedForeground }]}>{f.description}</Text>
              </View>
              <Switch
                value={f.enabled}
                onValueChange={() => toggleFeature(f.id)}
                trackColor={{ false: colors.border, true: f.dangerous ? "#EF4444" : colors.primary }}
                thumbColor="#fff"
              />
            </View>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>System Info</Text>
          {[
            { label: "App Version", value: "v2.0.0" },
            { label: "Build", value: "2026.06.20.001" },
            { label: "Environment", value: "Production" },
            { label: "Database", value: "Supabase (PostgreSQL)" },
            { label: "Push Service", value: "Firebase Cloud Messaging" },
            { label: "Payments", value: "Paystack (Connected)" },
          ].map((item, i) => (
            <View
              key={item.label}
              style={[
                styles.infoRow,
                i < 5 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
              ]}
            >
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>{item.value}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.dangerBtn, { backgroundColor: "#FEF2F2", borderColor: "#FECACA" }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            Alert.alert(
              "Clear All Caches",
              "This will flush session tokens, image caches, and API response caches. The app will reload all data from source. Continue?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Clear Now",
                  style: "destructive",
                  onPress: () => {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    Alert.alert("Caches Cleared", "All caches have been flushed successfully. Build: 2026.06.20.001");
                  },
                },
              ]
            );
          }}
          activeOpacity={0.85}
        >
          <Ionicons name="warning-outline" size={16} color="#DC2626" />
          <Text style={styles.dangerText}>Clear All Caches</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#fff" },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.55)", marginTop: 2, marginBottom: 16 },
  envBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.1)", alignSelf: "flex-start", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  envDot: { width: 8, height: 8, borderRadius: 4 },
  envText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#fff" },
  content: { padding: 16, gap: 12 },
  card: { borderRadius: 18, borderWidth: 1, overflow: "hidden" },
  cardTitle: { fontSize: 14, fontFamily: "Inter_700Bold", padding: 16, paddingBottom: 12 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  featureIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  featureLabelRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  featureLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  dangerTag: { backgroundColor: "#FEE2E2", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  dangerTagText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#DC2626" },
  featureDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14 },
  infoLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  infoValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  dangerBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, borderWidth: 1, padding: 16 },
  dangerText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#DC2626" },
});
