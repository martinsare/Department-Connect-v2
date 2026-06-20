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
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "@/components/Avatar";
import {
  registeredTeachersStore,
  updateRegisteredTeacherStatus,
  type RegisteredTeacher,
} from "@/context/registeredTeachersStore";
import { useAuth } from "@/context/AuthContext";

export default function ApprovalsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addAdmin } = useAuth();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const [, forceUpdate] = useState(0);
  const refresh = () => forceUpdate((n) => n + 1);

  const [rejectTarget, setRejectTarget] = useState<RegisteredTeacher | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const pending = registeredTeachersStore.filter((t) => t.status === "pending");
  const processed = registeredTeachersStore.filter((t) => t.status !== "pending");

  const handleApprove = (teacher: RegisteredTeacher) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateRegisteredTeacherStatus(teacher.id, "active");
    addAdmin({
      id: teacher.id,
      firstName: teacher.firstName,
      surname: teacher.surname,
      role: "admin",
      subRole: "Lecturer",
      staffId: teacher.staffId,
      department: teacher.department,
      phone: teacher.phone,
      email: teacher.email,
      dob: teacher.dob,
      status: "active",
      birthdayPrivacy: false,
      hideYear: false,
      password: teacher.password,
    });
    refresh();
  };

  const handleReject = () => {
    if (!rejectTarget) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    updateRegisteredTeacherStatus(rejectTarget.id, "rejected");
    setRejectTarget(null);
    setRejectReason("");
    refresh();
  };

  const renderTeacher = ({ item: t, isPending }: { item: RegisteredTeacher; isPending: boolean }) => (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardTop}>
        <Avatar
          initials={`${t.firstName[0]}${t.surname[0]}`}
          size={46}
          backgroundColor="#7C3AED20"
          textColor="#7C3AED"
        />
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: colors.foreground }]}>
            {t.firstName} {t.surname}
          </Text>
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>
            {t.staffId}  ·  {t.subRole}
          </Text>
          {t.email ? (
            <Text style={[styles.email, { color: colors.mutedForeground }]}>{t.email}</Text>
          ) : null}
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: isPending ? "#F59E0B20" : t.status === "active" ? "#10B98120" : "#EF444420" },
        ]}>
          <Text style={[
            styles.statusText,
            { color: isPending ? "#F59E0B" : t.status === "active" ? "#10B981" : "#EF4444" },
          ]}>
            {isPending ? "Pending" : t.status === "active" ? "Approved" : "Rejected"}
          </Text>
        </View>
      </View>

      <Text style={[styles.submitted, { color: colors.mutedForeground }]}>
        Submitted {new Date(t.submittedAt).toLocaleDateString()}
      </Text>

      {isPending && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.rejectBtn, { borderColor: "#EF4444" }]}
            onPress={() => { setRejectTarget(t); setRejectReason(""); }}
            activeOpacity={0.8}
          >
            <Ionicons name="close-circle-outline" size={15} color="#EF4444" />
            <Text style={[styles.actionText, { color: "#EF4444" }]}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.approveBtn, { backgroundColor: "#10B981" }]}
            onPress={() => handleApprove(t)}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle-outline" size={15} color="#fff" />
            <Text style={[styles.actionText, { color: "#fff" }]}>Approve</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={[styles.header, { paddingTop: topPad + 20 }]}
      >
        <Text style={styles.headerTitle}>Admin Approvals</Text>
        <Text style={styles.headerSub}>
          Review and approve admin registration requests
        </Text>
      </LinearGradient>

      <FlatList
        data={[
          ...pending.map((t) => ({ ...t, _isPending: true })),
          ...processed.map((t) => ({ ...t, _isPending: false })),
        ]}
        keyExtractor={(t) => t.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 100 : 120) },
        ]}
        ListHeaderComponent={
          pending.length > 0 ? (
            <View style={[styles.sectionHeader, { backgroundColor: colors.muted }]}>
              <Ionicons name="hourglass-outline" size={14} color="#F59E0B" />
              <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
                {pending.length} Pending{pending.length !== 1 ? "" : ""}
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
              <Ionicons name="person-add-outline" size={40} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Admin Requests</Text>
            <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>
              Admin registration requests will appear here for review.
            </Text>
          </View>
        }
        renderItem={({ item }) =>
          renderTeacher({ item, isPending: (item as any)._isPending })
        }
      />

      {/* Reject modal */}
      <Modal
        visible={!!rejectTarget}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setRejectTarget(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Reject Application</Text>
            <Text style={[styles.modalSub, { color: colors.mutedForeground }]}>
              {rejectTarget?.firstName} {rejectTarget?.surname}
            </Text>
            <Text style={[styles.label, { color: colors.foreground }]}>Reason (optional)</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
              placeholder="e.g. Incomplete information provided..."
              placeholderTextColor={colors.mutedForeground}
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={3}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalCancel, { borderColor: colors.border }]}
                onPress={() => setRejectTarget(null)}
                activeOpacity={0.8}
              >
                <Text style={[styles.modalCancelText, { color: colors.foreground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalReject}
                onPress={handleReject}
                activeOpacity={0.8}
              >
                <Text style={styles.modalRejectText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingBottom: 28 },
  headerTitle: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#fff", marginBottom: 4 },
  headerSub: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)" },
  list: { padding: 16, gap: 12 },
  sectionHeader: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, marginBottom: 4,
  },
  sectionLabel: { fontSize: 13, fontFamily: "Inter_700Bold" },
  card: {
    borderRadius: 16, borderWidth: 1, padding: 16, gap: 10,
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  name: { fontSize: 15, fontFamily: "Inter_700Bold" },
  meta: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  email: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontFamily: "Inter_700Bold" },
  submitted: { fontSize: 12, fontFamily: "Inter_400Regular" },
  actions: { flexDirection: "row", gap: 10, marginTop: 4 },
  rejectBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, borderWidth: 1.5, borderRadius: 10, paddingVertical: 10,
  },
  approveBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, borderRadius: 10, paddingVertical: 10,
  },
  actionText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  empty: { alignItems: "center", paddingTop: 60, gap: 14 },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: "center", justifyContent: "center",
  },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  emptyBody: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modalSheet: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36, gap: 14,
  },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 4 },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  modalSub: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: -8 },
  label: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  textArea: {
    borderRadius: 12, borderWidth: 1.5, padding: 14,
    fontSize: 14, fontFamily: "Inter_400Regular", minHeight: 80,
    textAlignVertical: "top",
  },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 4 },
  modalCancel: {
    flex: 1, borderWidth: 1.5, borderRadius: 12,
    paddingVertical: 13, alignItems: "center",
  },
  modalCancelText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  modalReject: {
    flex: 1, backgroundColor: "#EF4444", borderRadius: 12,
    paddingVertical: 13, alignItems: "center",
  },
  modalRejectText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
});
