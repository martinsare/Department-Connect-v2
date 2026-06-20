import React, { useState } from "react";
import {
  Alert,
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
import { useData, type Contribution } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

const LEVELS = ["All", "100L", "200L", "300L", "400L", "500L"];

/* ── Create Contribution Modal ── */
function CreateContributionModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (data: Omit<Contribution, "id" | "status" | "paidDate">) => void;
}) {
  const colors = useColors();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [level, setLevel] = useState("300L");
  const [description, setDescription] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [error, setError] = useState("");

  const handleCreate = () => {
    setError("");
    if (!title.trim()) return setError("Title is required.");
    if (!amount.trim() || isNaN(Number(amount)) || Number(amount) <= 0) return setError("Enter a valid amount.");
    if (!deadline.trim()) return setError("Deadline is required.");
    if (!bankName.trim()) return setError("Bank name is required.");
    if (!accountNumber.trim() || accountNumber.replace(/\s/g, "").length < 10) return setError("Account number must be 10 digits.");
    if (!accountName.trim()) return setError("Account name is required.");

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onCreate({
      title: title.trim(),
      amount: Number(amount),
      deadline: deadline.trim(),
      level,
      description: description.trim(),
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      accountName: accountName.trim(),
    });
    onClose();
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={cm.overlay}>
        <View style={[cm.sheet, { backgroundColor: colors.card }]}>
          <View style={[cm.handle, { backgroundColor: colors.border }]} />
          <View style={cm.header}>
            <Text style={[cm.title, { color: colors.foreground }]}>New Contribution</Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <Ionicons name="close" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {!!error && (
              <View style={cm.errorBanner}>
                <Ionicons name="alert-circle-outline" size={14} color="#DC2626" />
                <Text style={cm.errorText}>{error}</Text>
              </View>
            )}

            <Text style={[cm.sectionLabel, { color: colors.mutedForeground }]}>CONTRIBUTION DETAILS</Text>

            <Text style={[cm.label, { color: colors.foreground }]}>Title *</Text>
            <TextInput
              style={[cm.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
              placeholder="e.g. Class Dues — 2nd Semester"
              placeholderTextColor={colors.mutedForeground}
              value={title}
              onChangeText={setTitle}
              autoCapitalize="words"
            />

            <View style={cm.row}>
              <View style={{ flex: 1 }}>
                <Text style={[cm.label, { color: colors.foreground }]}>Amount (₦) *</Text>
                <TextInput
                  style={[cm.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                  placeholder="e.g. 5000"
                  placeholderTextColor={colors.mutedForeground}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="number-pad"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[cm.label, { color: colors.foreground }]}>Deadline *</Text>
                <TextInput
                  style={[cm.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.mutedForeground}
                  value={deadline}
                  onChangeText={setDeadline}
                />
              </View>
            </View>

            <Text style={[cm.label, { color: colors.foreground }]}>Target Level *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }} contentContainerStyle={{ gap: 8 }}>
              {LEVELS.filter(l => l !== "All").map(l => (
                <TouchableOpacity
                  key={l}
                  style={[cm.levelChip, level === l && cm.levelChipActive]}
                  onPress={() => { setLevel(l); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                  activeOpacity={0.8}
                >
                  <Text style={[cm.levelChipText, level === l && { color: "#fff" }]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[cm.label, { color: colors.foreground }]}>Description (optional)</Text>
            <TextInput
              style={[cm.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border, height: 72, textAlignVertical: "top" }]}
              placeholder="What is this contribution for?"
              placeholderTextColor={colors.mutedForeground}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            <Text style={[cm.sectionLabel, { color: colors.mutedForeground, marginTop: 8 }]}>BANK ACCOUNT DETAILS</Text>
            <View style={[cm.bankNote, { backgroundColor: "#F3EEFF", borderColor: "#DDD6FE" }]}>
              <Ionicons name="information-circle-outline" size={14} color="#7C3AED" />
              <Text style={cm.bankNoteText}>Students will be shown these details when they tap Pay Now.</Text>
            </View>

            <Text style={[cm.label, { color: colors.foreground }]}>Bank Name *</Text>
            <TextInput
              style={[cm.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
              placeholder="e.g. First Bank, GTBank, Access Bank"
              placeholderTextColor={colors.mutedForeground}
              value={bankName}
              onChangeText={setBankName}
              autoCapitalize="words"
            />

            <Text style={[cm.label, { color: colors.foreground }]}>Account Number * (10-digit NUBAN)</Text>
            <TextInput
              style={[cm.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border, letterSpacing: 1.5, fontSize: 17, fontFamily: "Inter_700Bold" }]}
              placeholder="0123456789"
              placeholderTextColor={colors.mutedForeground}
              value={accountNumber}
              onChangeText={v => setAccountNumber(v.replace(/\D/g, "").slice(0, 10))}
              keyboardType="number-pad"
              maxLength={10}
            />

            <Text style={[cm.label, { color: colors.foreground }]}>Account Name *</Text>
            <TextInput
              style={[cm.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
              placeholder="e.g. CS Dept Student Fund"
              placeholderTextColor={colors.mutedForeground}
              value={accountName}
              onChangeText={setAccountName}
              autoCapitalize="words"
            />

            <TouchableOpacity style={cm.createBtn} onPress={handleCreate} activeOpacity={0.85}>
              <LinearGradient colors={["#7C3AED", "#5B21B6"]} style={cm.createGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Ionicons name="add-circle-outline" size={18} color="#fff" />
                <Text style={cm.createBtnText}>Publish Contribution</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const cm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 48, maxHeight: "92%" },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 19, fontFamily: "Inter_700Bold" },
  errorBanner: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FEE2E2", borderRadius: 10, padding: 10, marginBottom: 12 },
  errorText: { color: "#DC2626", fontSize: 12, fontFamily: "Inter_400Regular", flex: 1 },
  sectionLabel: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 0.8, marginBottom: 12, marginTop: 4 },
  label: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 6 },
  input: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: "Inter_400Regular", marginBottom: 14 },
  row: { flexDirection: "row", gap: 12 },
  levelChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#F1F5F9", borderWidth: 1.5, borderColor: "#E2E8F0" },
  levelChipActive: { backgroundColor: "#7C3AED", borderColor: "#7C3AED" },
  levelChipText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#64748B" },
  bankNote: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, borderWidth: 1, padding: 10, marginBottom: 14 },
  bankNoteText: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#5B21B6", flex: 1 },
  createBtn: { marginTop: 8, marginBottom: 8, borderRadius: 14, overflow: "hidden" },
  createGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 15 },
  createBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
});

/* ── Reject Modal ── */
function RejectModal({ contribution, onClose, onReject }: {
  contribution: Contribution;
  onClose: () => void;
  onReject: (reason: string) => void;
}) {
  const colors = useColors();
  const [reason, setReason] = useState("");

  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <View style={rm.overlay}>
        <View style={[rm.card, { backgroundColor: colors.card }]}>
          <Text style={[rm.title, { color: colors.foreground }]}>Reject Payment</Text>
          <Text style={[rm.body, { color: colors.mutedForeground }]}>
            Provide a reason for rejecting <Text style={{ fontFamily: "Inter_600SemiBold" }}>{contribution.title}</Text>. The student will be notified.
          </Text>
          <TextInput
            style={[rm.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
            placeholder="e.g. Wrong amount transferred, name not matching..."
            placeholderTextColor={colors.mutedForeground}
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            autoFocus
          />
          <View style={rm.actions}>
            <TouchableOpacity style={[rm.btn, { backgroundColor: colors.muted }]} onPress={onClose} activeOpacity={0.8}>
              <Text style={[rm.btnText, { color: colors.foreground }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[rm.btn, { backgroundColor: reason.trim() ? "#EF4444" : "#E2E8F0" }]}
              onPress={() => { if (reason.trim()) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); onReject(reason.trim()); } }}
              activeOpacity={0.85}
            >
              <Text style={[rm.btnText, { color: reason.trim() ? "#fff" : "#94A3B8" }]}>Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const rm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", paddingHorizontal: 24 },
  card: { borderRadius: 24, padding: 24, gap: 12 },
  title: { fontSize: 18, fontFamily: "Inter_700Bold" },
  body: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  input: { borderRadius: 12, borderWidth: 1, padding: 12, fontSize: 14, fontFamily: "Inter_400Regular", minHeight: 80 },
  actions: { flexDirection: "row", gap: 10, marginTop: 4 },
  btn: { flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: "center" },
  btnText: { fontSize: 15, fontFamily: "Inter_700Bold" },
});

/* ── Contribution Item (admin view) ── */
function ContributionItem({ item, onConfirm, onReject }: {
  item: Contribution;
  onConfirm: () => void;
  onReject: () => void;
}) {
  const colors = useColors();
  const statusColors = {
    unpaid:    { color: "#F59E0B", bg: "#FEF3C7" },
    pending:   { color: "#7C3AED", bg: "#F3EEFF" },
    confirmed: { color: "#10B981", bg: "#D1FAE5" },
    rejected:  { color: "#EF4444", bg: "#FEE2E2" },
  };
  const sc = statusColors[item.status];
  const label = { unpaid: "Unpaid", pending: "Pending Review", confirmed: "Confirmed", rejected: "Rejected" }[item.status];

  return (
    <View style={[itemS.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={itemS.top}>
        <View style={{ flex: 1 }}>
          <Text style={[itemS.title, { color: colors.foreground }]}>{item.title}</Text>
          <Text style={[itemS.meta, { color: colors.mutedForeground }]}>
            {item.level} · Due {item.deadline} · <Text style={{ fontFamily: "Inter_700Bold" }}>₦{item.amount.toLocaleString()}</Text>
          </Text>
        </View>
        <View style={[itemS.badge, { backgroundColor: sc.bg }]}>
          <Text style={[itemS.badgeText, { color: sc.color }]}>{label}</Text>
        </View>
      </View>

      {/* Bank details summary */}
      <View style={[itemS.bankRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <Ionicons name="card-outline" size={14} color={colors.mutedForeground} />
        <Text style={[itemS.bankText, { color: colors.mutedForeground }]}>
          {item.bankName} · {item.accountNumber} · {item.accountName}
        </Text>
      </View>

      {/* Rejection reason */}
      {item.status === "rejected" && item.rejectionReason && (
        <View style={itemS.rejNote}>
          <Text style={itemS.rejText}>Reason: {item.rejectionReason}</Text>
        </View>
      )}

      {/* Admin actions for pending */}
      {item.status === "pending" && (
        <View style={itemS.actions}>
          <TouchableOpacity style={[itemS.actionBtn, itemS.confirmBtn]} onPress={onConfirm} activeOpacity={0.85}>
            <Ionicons name="checkmark" size={15} color="#fff" />
            <Text style={itemS.actionBtnText}>Confirm Payment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[itemS.actionBtn, itemS.rejectBtn]} onPress={onReject} activeOpacity={0.85}>
            <Ionicons name="close" size={15} color="#EF4444" />
            <Text style={[itemS.actionBtnText, { color: "#EF4444" }]}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const itemS = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 12, gap: 12 },
  top: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  title: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  meta: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 3 },
  badge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, alignSelf: "flex-start" },
  badgeText: { fontSize: 11, fontFamily: "Inter_700Bold" },
  bankRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 10, borderWidth: 1, padding: 10,
  },
  bankText: { fontSize: 12, fontFamily: "Inter_400Regular", flex: 1 },
  rejNote: { backgroundColor: "#FEE2E2", borderRadius: 10, padding: 10 },
  rejText: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#991B1B" },
  actions: { flexDirection: "row", gap: 10 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 12, paddingVertical: 11 },
  confirmBtn: { backgroundColor: "#10B981" },
  rejectBtn: { backgroundColor: "#FEE2E2" },
  actionBtnText: { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold" },
});

/* ── Main Admin Payments Screen ── */
export default function AdminPaymentsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { contributions, confirmPayment, rejectPayment, createContribution } = useData();
  const [levelFilter, setLevelFilter] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [rejectingItem, setRejectingItem] = useState<Contribution | null>(null);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const filtered = levelFilter === "All"
    ? contributions
    : contributions.filter(c => c.level === levelFilter);

  const pendingItems = filtered.filter(c => c.status === "pending");
  const totalConfirmed = filtered.filter(c => c.status === "confirmed").reduce((s, c) => s + c.amount, 0);
  const totalPending = filtered.filter(c => c.status === "pending").reduce((s, c) => s + c.amount, 0);
  const totalOutstanding = filtered.filter(c => c.status === "unpaid").reduce((s, c) => s + c.amount, 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={["#2D1B69", "#7C3AED"]} style={[s.header, { paddingTop: topPad + 20 }]}>
        <View style={s.headerRow}>
          <View>
            <Text style={s.headerTitle}>Payments</Text>
            <Text style={s.headerSub}>Manage contributions & transfers</Text>
          </View>
          <TouchableOpacity
            style={s.addBtn}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowCreate(true); }}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={s.addBtnText}>New</Text>
          </TouchableOpacity>
        </View>

        {/* Summary */}
        <View style={s.summaryRow}>
          {[
            { label: "Confirmed", value: `₦${(totalConfirmed / 1000).toFixed(0)}k`, color: "#34D399" },
            { label: "Pending",   value: pendingItems.length.toString(), color: "#FBBF24" },
            { label: "Outstanding", value: `₦${(totalOutstanding / 1000).toFixed(0)}k`, color: "#F87171" },
          ].map(stat => (
            <View key={stat.label} style={s.summaryCard}>
              <Text style={[s.summaryValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={s.summaryLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* Level filter */}
      <View style={[s.filterBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 10 }}>
          {LEVELS.map(l => {
            const active = levelFilter === l;
            return (
              <TouchableOpacity
                key={l}
                style={[s.filterChip, active && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                onPress={() => { setLevelFilter(l); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                activeOpacity={0.8}
              >
                <Text style={[s.filterChipText, { color: active ? "#fff" : colors.mutedForeground }]}>{l}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={[s.content, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 84 : 100) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Pending review section */}
        {pendingItems.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View style={[s.sectionDot, { backgroundColor: "#7C3AED" }]} />
              <Text style={[s.sectionTitle, { color: colors.foreground }]}>Pending Review ({pendingItems.length})</Text>
            </View>
            {pendingItems.map(item => (
              <ContributionItem
                key={item.id}
                item={item}
                onConfirm={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  confirmPayment(item.id);
                }}
                onReject={() => setRejectingItem(item)}
              />
            ))}
          </View>
        )}

        {/* All contributions */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={[s.sectionDot, { backgroundColor: colors.mutedForeground }]} />
            <Text style={[s.sectionTitle, { color: colors.foreground }]}>All Contributions ({filtered.length})</Text>
          </View>
          {filtered.length === 0 ? (
            <View style={s.empty}>
              <Ionicons name="card-outline" size={40} color={colors.mutedForeground} />
              <Text style={[s.emptyText, { color: colors.mutedForeground }]}>No contributions yet</Text>
              <TouchableOpacity style={[s.emptyBtn, { backgroundColor: colors.primary }]} onPress={() => setShowCreate(true)} activeOpacity={0.85}>
                <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 14 }}>Create First Contribution</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filtered.map(item => (
              <ContributionItem
                key={item.id}
                item={item}
                onConfirm={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); confirmPayment(item.id); }}
                onReject={() => setRejectingItem(item)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {showCreate && (
        <CreateContributionModal
          onClose={() => setShowCreate(false)}
          onCreate={createContribution}
        />
      )}

      {rejectingItem && (
        <RejectModal
          contribution={rejectingItem}
          onClose={() => setRejectingItem(null)}
          onReject={(reason) => {
            rejectPayment(rejectingItem.id, reason);
            setRejectingItem(null);
          }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  headerTitle: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#fff" },
  headerSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.65)", marginTop: 2 },
  addBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 9,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.3)",
  },
  addBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 14 },
  summaryRow: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 16, padding: 14, gap: 4 },
  summaryCard: { flex: 1, alignItems: "center", gap: 4 },
  summaryValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  summaryLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)" },
  filterBar: { paddingHorizontal: 16, borderBottomWidth: 1 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: "#E2E8F0", backgroundColor: "transparent" },
  filterChipText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  content: { padding: 16, gap: 8 },
  section: { gap: 0 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  sectionDot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  empty: { alignItems: "center", paddingVertical: 48, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  emptyBtn: { borderRadius: 12, paddingHorizontal: 20, paddingVertical: 11, marginTop: 4 },
});
