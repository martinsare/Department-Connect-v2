import React, { useRef, useState } from "react";
import {
  Alert,
  Clipboard,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useData, type Contribution } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

type FilterTab = "all" | "unpaid" | "pending" | "confirmed";

/* ── Status helpers ── */
const STATUS_CONFIG = {
  unpaid:    { label: "Unpaid",    color: "#F59E0B", bg: "#FEF3C7", icon: "card-outline"          as const },
  pending:   { label: "Pending",   color: "#7C3AED", bg: "#F3EEFF", icon: "time-outline"           as const },
  confirmed: { label: "Confirmed", color: "#10B981", bg: "#D1FAE5", icon: "checkmark-circle"       as const },
  rejected:  { label: "Rejected",  color: "#EF4444", bg: "#FEE2E2", icon: "close-circle-outline"   as const },
};

/* ── Bank Transfer Modal ── */
function BankTransferModal({
  contribution,
  onClose,
  onPaid,
}: {
  contribution: Contribution;
  onClose: () => void;
  onPaid: () => void;
}) {
  const colors = useColors();
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const copyAccount = () => {
    Clipboard.setString(contribution.accountNumber);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaid = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setConfirmed(true);
    setTimeout(() => {
      onPaid();
    }, 1200);
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={[mStyles.overlay]}>
        <View style={[mStyles.sheet, { backgroundColor: colors.card }]}>
          {/* Handle */}
          <View style={[mStyles.handle, { backgroundColor: colors.border }]} />

          {/* Header */}
          <View style={mStyles.header}>
            <View>
              <Text style={[mStyles.title, { color: colors.foreground }]}>Bank Transfer</Text>
              <Text style={[mStyles.subtitle, { color: colors.mutedForeground }]}>{contribution.title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={mStyles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          {/* Amount */}
          <View style={[mStyles.amountBox, { backgroundColor: "#7C3AED18" }]}>
            <Text style={[mStyles.amountLabel, { color: colors.mutedForeground }]}>Amount to Transfer</Text>
            <Text style={mStyles.amount}>₦{contribution.amount.toLocaleString()}</Text>
          </View>

          {/* Bank details */}
          <View style={[mStyles.detailsCard, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Text style={[mStyles.detailsTitle, { color: colors.foreground }]}>Transfer to this account</Text>

            <View style={mStyles.detailRow}>
              <Text style={[mStyles.detailLabel, { color: colors.mutedForeground }]}>Bank Name</Text>
              <Text style={[mStyles.detailValue, { color: colors.foreground }]}>{contribution.bankName}</Text>
            </View>

            <View style={[mStyles.detailRow, mStyles.accountRow]}>
              <View style={{ flex: 1 }}>
                <Text style={[mStyles.detailLabel, { color: colors.mutedForeground }]}>Account Number</Text>
                <Text style={[mStyles.accountNumber, { color: colors.foreground }]}>{contribution.accountNumber}</Text>
              </View>
              <TouchableOpacity
                style={[mStyles.copyBtn, { backgroundColor: copied ? "#10B98118" : "#7C3AED18", borderColor: copied ? "#10B981" : "#7C3AED" }]}
                onPress={copyAccount}
                activeOpacity={0.8}
              >
                <Ionicons name={copied ? "checkmark" : "copy-outline"} size={15} color={copied ? "#10B981" : "#7C3AED"} />
                <Text style={[mStyles.copyText, { color: copied ? "#10B981" : "#7C3AED" }]}>
                  {copied ? "Copied!" : "Copy"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={mStyles.detailRow}>
              <Text style={[mStyles.detailLabel, { color: colors.mutedForeground }]}>Account Name</Text>
              <Text style={[mStyles.detailValue, { color: colors.foreground }]}>{contribution.accountName}</Text>
            </View>
          </View>

          {/* Instruction note */}
          <View style={[mStyles.noteBox, { backgroundColor: "#FEF3C7", borderColor: "#F59E0B40" }]}>
            <Ionicons name="information-circle-outline" size={16} color="#B45309" />
            <Text style={mStyles.noteText}>
              Transfer the exact amount and use your <Text style={{ fontFamily: "Inter_700Bold" }}>full name</Text> as the payment reference.
            </Text>
          </View>

          {/* I Have Paid button */}
          {!confirmed ? (
            <TouchableOpacity style={mStyles.paidBtn} onPress={handlePaid} activeOpacity={0.85}>
              <LinearGradient colors={["#7C3AED", "#5B21B6"]} style={mStyles.paidGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Ionicons name="checkmark-done-outline" size={18} color="#fff" />
                <Text style={mStyles.paidBtnText}>I Have Paid</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={[mStyles.paidBtn, { overflow: "hidden", borderRadius: 16 }]}>
              <LinearGradient colors={["#10B981", "#059669"]} style={mStyles.paidGrad}>
                <Ionicons name="checkmark-circle" size={18} color="#fff" />
                <Text style={mStyles.paidBtnText}>Submitted — Awaiting Confirmation</Text>
              </LinearGradient>
            </View>
          )}

          <Text style={[mStyles.footNote, { color: colors.mutedForeground }]}>
            Your payment will be marked as <Text style={{ fontFamily: "Inter_600SemiBold", color: "#7C3AED" }}>Pending</Text> until Admin confirms your transfer.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const mStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  closeBtn: { padding: 4 },
  amountBox: { borderRadius: 14, padding: 16, alignItems: "center", marginBottom: 16 },
  amountLabel: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 4 },
  amount: { fontSize: 30, fontFamily: "Inter_700Bold", color: "#7C3AED" },
  detailsCard: {
    borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 14, gap: 14,
  },
  detailsTitle: { fontSize: 13, fontFamily: "Inter_700Bold", marginBottom: 2 },
  detailRow: {},
  accountRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  detailLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginBottom: 3 },
  detailValue: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  accountNumber: { fontSize: 20, fontFamily: "Inter_700Bold", letterSpacing: 1.5 },
  copyBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7,
  },
  copyText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  noteBox: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 16,
  },
  noteText: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#92400E", flex: 1, lineHeight: 18 },
  paidBtn: { marginBottom: 12, borderRadius: 16, overflow: "hidden" },
  paidGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16 },
  paidBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  footNote: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 17 },
});

/* ── Contribution Card ── */
function ContributionCard({ item, onPay }: { item: Contribution; onPay: () => void }) {
  const colors = useColors();
  const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.unpaid;

  const daysLeft = Math.ceil(
    (new Date(item.deadline).getTime() - new Date("2026-06-20").getTime()) / 86400000
  );
  const isOverdue = daysLeft < 0 && item.status === "unpaid";
  const isUrgent = daysLeft <= 7 && daysLeft >= 0 && item.status === "unpaid";

  const leftColor =
    item.status === "confirmed" ? colors.success
    : item.status === "pending"  ? "#7C3AED"
    : item.status === "rejected" ? "#EF4444"
    : isOverdue                  ? "#EF4444"
    : isUrgent                   ? "#F59E0B"
    : colors.border;

  return (
    <View style={[cardS.card, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: leftColor }]}>
      <View style={cardS.top}>
        <View style={[cardS.iconWrap, { backgroundColor: cfg.bg }]}>
          <Ionicons name={cfg.icon} size={21} color={cfg.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[cardS.title, { color: colors.foreground }]}>{item.title}</Text>
          {item.description ? (
            <Text style={[cardS.desc, { color: colors.mutedForeground }]} numberOfLines={2}>{item.description}</Text>
          ) : null}
        </View>
        <Text style={[cardS.amount, { color: item.status === "confirmed" ? colors.success : colors.foreground }]}>
          ₦{item.amount.toLocaleString()}
        </Text>
      </View>

      <View style={cardS.bottom}>
        <View style={cardS.metaRow}>
          <Ionicons name="calendar-outline" size={12} color={colors.mutedForeground} />
          <Text style={[cardS.meta, { color: isOverdue ? "#EF4444" : colors.mutedForeground }]}>
            {item.status === "confirmed"
              ? `Confirmed ${item.paidDate ?? ""}`
              : isOverdue
              ? `Overdue — was due ${item.deadline}`
              : `Due ${item.deadline}`}
          </Text>
        </View>

        <View style={cardS.right}>
          {item.status === "unpaid" && isUrgent && (
            <View style={cardS.urgentBadge}>
              <Text style={cardS.urgentText}>Due in {daysLeft}d</Text>
            </View>
          )}

          {item.status === "confirmed" && (
            <View style={[cardS.badge, { backgroundColor: "#D1FAE5" }]}>
              <Ionicons name="checkmark" size={12} color="#10B981" />
              <Text style={[cardS.badgeText, { color: "#10B981" }]}>Confirmed</Text>
            </View>
          )}

          {item.status === "pending" && (
            <View style={[cardS.badge, { backgroundColor: "#F3EEFF" }]}>
              <Ionicons name="time-outline" size={12} color="#7C3AED" />
              <Text style={[cardS.badgeText, { color: "#7C3AED" }]}>Awaiting Admin</Text>
            </View>
          )}

          {item.status === "rejected" && (
            <TouchableOpacity
              style={[cardS.payBtn, { backgroundColor: "#EF4444" }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPay(); }}
              activeOpacity={0.85}
            >
              <Text style={cardS.payBtnText}>Pay Again</Text>
            </TouchableOpacity>
          )}

          {item.status === "unpaid" && (
            <TouchableOpacity
              style={[cardS.payBtn, { backgroundColor: isOverdue ? "#EF4444" : "#7C3AED" }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPay(); }}
              activeOpacity={0.85}
            >
              <Text style={cardS.payBtnText}>Pay Now</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {item.status === "rejected" && item.rejectionReason && (
        <View style={cardS.rejectedNote}>
          <Ionicons name="alert-circle-outline" size={13} color="#EF4444" />
          <Text style={cardS.rejectedText}>Rejected: {item.rejectionReason}</Text>
        </View>
      )}
    </View>
  );
}

const cardS = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, borderLeftWidth: 4, padding: 16, marginBottom: 12, gap: 12 },
  top: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  iconWrap: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 15, fontFamily: "Inter_600SemiBold", flex: 1 },
  desc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 3, lineHeight: 16 },
  amount: { fontSize: 17, fontFamily: "Inter_700Bold" },
  bottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, flex: 1 },
  meta: { fontSize: 12, fontFamily: "Inter_400Regular" },
  right: { flexDirection: "row", alignItems: "center", gap: 8 },
  urgentBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: "#FEF3C7" },
  urgentText: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#B45309" },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  payBtn: { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  payBtnText: { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold" },
  rejectedNote: {
    flexDirection: "row", alignItems: "flex-start", gap: 6,
    backgroundColor: "#FEE2E2", borderRadius: 10, padding: 10,
  },
  rejectedText: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#991B1B", flex: 1, lineHeight: 17 },
});

/* ── Main Screen ── */
export default function PaymentsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { contributions, submitPayment } = useData();
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [payingItem, setPayingItem] = useState<Contribution | null>(null);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const myContributions = contributions.filter((c) => c.level === user?.level || !user?.level);

  const filtered = activeFilter === "all"
    ? myContributions
    : myContributions.filter((c) => c.status === activeFilter);

  const totalOwed = myContributions
    .filter((c) => c.status === "unpaid" || c.status === "rejected")
    .reduce((s, c) => s + c.amount, 0);
  const totalConfirmed = myContributions
    .filter((c) => c.status === "confirmed")
    .reduce((s, c) => s + c.amount, 0);
  const pendingCount = myContributions.filter((c) => c.status === "pending").length;
  const unpaidCount = myContributions.filter((c) => c.status === "unpaid").length;

  const FILTERS: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unpaid", label: "Unpaid" },
    { key: "pending", label: "Pending" },
    { key: "confirmed", label: "Confirmed" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={[styles.header, { paddingTop: topPad + 20 }]}
      >
        <Text style={styles.headerTitle}>Bills & Payments</Text>
        <Text style={styles.headerSub}>{user?.level} · {user?.department}</Text>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Outstanding</Text>
            <Text style={[styles.summaryValue, { color: totalOwed > 0 ? "#FBBF24" : "#34D399" }]}>
              {totalOwed > 0 ? `₦${totalOwed.toLocaleString()}` : "All Clear"}
            </Text>
            {unpaidCount > 0 && (
              <Text style={styles.summaryCount}>{unpaidCount} unpaid</Text>
            )}
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Confirmed</Text>
            <Text style={[styles.summaryValue, { color: "#34D399" }]}>
              ₦{totalConfirmed.toLocaleString()}
            </Text>
            {pendingCount > 0 && (
              <Text style={styles.summaryCount}>{pendingCount} awaiting admin</Text>
            )}
          </View>
        </View>
      </LinearGradient>

      <View style={[styles.filterRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterTab, activeFilter === f.key && [styles.filterTabActive, { borderBottomColor: colors.primary }]]}
            onPress={() => { setActiveFilter(f.key); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, { color: activeFilter === f.key ? colors.primary : colors.mutedForeground }]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 84 : 100) }]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconWrap, { backgroundColor: colors.success + "18" }]}>
              <Ionicons name="checkmark-circle" size={52} color={colors.success} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              {activeFilter === "unpaid" ? "No Outstanding Bills!" : "No Records Found"}
            </Text>
            <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>
              {activeFilter === "unpaid"
                ? "You have no pending payments at this time. Great job staying current!"
                : "No payment records found for this filter."}
            </Text>
          </View>
        ) : (
          filtered.map((item) => (
            <ContributionCard key={item.id} item={item} onPay={() => setPayingItem(item)} />
          ))
        )}
      </ScrollView>

      {payingItem && (
        <BankTransferModal
          contribution={payingItem}
          onClose={() => setPayingItem(null)}
          onPaid={() => {
            submitPayment(payingItem.id);
            setPayingItem(null);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerTitle: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#fff" },
  headerSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.65)", marginTop: 2, marginBottom: 20 },
  summaryRow: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 18, padding: 16 },
  summaryCard: { flex: 1, alignItems: "center", gap: 4 },
  divider: { width: 1, backgroundColor: "rgba(255,255,255,0.2)", marginHorizontal: 16 },
  summaryLabel: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.65)" },
  summaryValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  summaryCount: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.5)" },
  filterRow: { flexDirection: "row", borderBottomWidth: 1 },
  filterTab: { flex: 1, paddingVertical: 14, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  filterTabActive: { borderBottomWidth: 2 },
  filterText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  content: { padding: 16 },
  emptyContainer: { alignItems: "center", paddingTop: 60, paddingHorizontal: 32, gap: 16 },
  emptyIconWrap: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "center" },
  emptyBody: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
});
