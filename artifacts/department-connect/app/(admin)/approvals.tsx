import React, { useState } from "react";
import {
  FlatList,
  Modal,
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
import { useData, type StudentRecord } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

export default function ApprovalsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { students, approveStudent, rejectStudent } = useData();
  const [rejectTarget, setRejectTarget] = useState<StudentRecord | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const pending = students
    .filter((s) => s.status === "pending")
    .map((s) => ({
      ...s,
      daysWaiting: Math.floor(
        (new Date("2026-06-20").getTime() - new Date(s.submittedAt ?? "2026-06-20").getTime()) / 86400000
      ),
    }))
    .sort((a, b) => b.daysWaiting - a.daysWaiting);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={["#2D1B69", "#7C3AED"]}
        style={[styles.header, { paddingTop: topPad + 20 }]}
      >
        <Text style={styles.title}>Approvals</Text>
        <Text style={styles.subtitle}>
          {pending.length === 0 ? "All caught up!" : `${pending.length} student${pending.length !== 1 ? "s" : ""} awaiting review`}
        </Text>
      </LinearGradient>

      <FlatList
        data={pending}
        keyExtractor={(s) => s.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 84 : 90) },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="checkmark-done-circle" size={64} color={colors.success} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>All Clear</Text>
            <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>
              No pending approvals at this time.
            </Text>
          </View>
        }
        renderItem={({ item: s }) => (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardTop}>
              <View style={styles.avatarSmall}>
                <Text style={styles.avatarSmallText}>{s.firstName[0]}{s.surname[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.studentName, { color: colors.foreground }]}>{s.firstName} {s.surname}</Text>
                <Text style={[styles.studentMeta, { color: colors.mutedForeground }]}>{s.matricNumber}  ·  {s.level}</Text>
              </View>
              <View style={[styles.daysBadge, { backgroundColor: s.daysWaiting >= 2 ? "#FEF3C7" : colors.secondary }]}>
                <Text style={[styles.daysText, { color: s.daysWaiting >= 2 ? "#B45309" : colors.mutedForeground }]}>
                  {s.daysWaiting}d
                </Text>
              </View>
            </View>

            <View style={[styles.infoGrid, { borderTopColor: colors.border }]}>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Phone</Text>
                <Text style={[styles.infoValue, { color: colors.foreground }]}>{s.phone}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>DOB</Text>
                <Text style={[styles.infoValue, { color: colors.foreground }]}>{s.dob}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Submitted</Text>
                <Text style={[styles.infoValue, { color: colors.foreground }]}>{s.submittedAt}</Text>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.rejectBtn, { borderColor: colors.destructive }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setRejectTarget(s);
                  setRejectReason("");
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="close" size={16} color={colors.destructive} />
                <Text style={[styles.rejectBtnText, { color: colors.destructive }]}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.approveBtn, { backgroundColor: colors.success }]}
                onPress={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  approveStudent(s.id);
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="checkmark" size={16} color="#fff" />
                <Text style={styles.approveBtnText}>Approve</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal
        visible={!!rejectTarget}
        transparent
        animationType="slide"
        onRequestClose={() => setRejectTarget(null)}
      >
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Reject Account</Text>
            <Text style={[styles.modalSub, { color: colors.mutedForeground }]}>
              Provide a reason for rejecting {rejectTarget?.firstName} {rejectTarget?.surname}
            </Text>
            <TextInput
              style={[styles.reasonInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
              placeholder="Enter rejection reason..."
              placeholderTextColor={colors.mutedForeground}
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalCancel, { borderColor: colors.border }]}
                onPress={() => setRejectTarget(null)}
              >
                <Text style={[styles.modalCancelText, { color: colors.foreground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirm, { backgroundColor: colors.destructive }]}
                onPress={() => {
                  if (!rejectReason.trim()) return;
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                  rejectStudent(rejectTarget!.id, rejectReason.trim());
                  setRejectTarget(null);
                }}
              >
                <Text style={styles.modalConfirmText}>Confirm Rejection</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#fff" },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.65)", marginTop: 4 },
  list: { padding: 16, gap: 12 },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  emptyBody: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  card: { borderRadius: 18, borderWidth: 1, overflow: "hidden" },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  avatarSmall: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "#EDE9FE", alignItems: "center", justifyContent: "center",
  },
  avatarSmallText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#7C3AED" },
  studentName: { fontSize: 15, fontFamily: "Inter_700Bold" },
  studentMeta: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  daysBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  daysText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  infoGrid: {
    flexDirection: "row",
    borderTopWidth: 1,
    padding: 14,
    gap: 4,
  },
  infoItem: { flex: 1 },
  infoLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  infoValue: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  actions: { flexDirection: "row", gap: 10, padding: 14, paddingTop: 0 },
  rejectBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingVertical: 12,
  },
  rejectBtnText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  approveBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 12,
    paddingVertical: 12,
  },
  approveBtnText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modal: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 4 },
  modalSub: { fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 16 },
  reasonInput: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    minHeight: 80,
    marginBottom: 16,
  },
  modalActions: { flexDirection: "row", gap: 12 },
  modalCancel: { flex: 1, borderRadius: 14, borderWidth: 1.5, paddingVertical: 14, alignItems: "center" },
  modalCancelText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  modalConfirm: { flex: 2, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  modalConfirmText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },
});
