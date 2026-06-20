import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
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
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

type FilterTab = "all" | "unpaid" | "paid";

function SuccessAnimation({ visible }: { visible: boolean }) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scale, { toValue: 1, useNativeDriver: false, tension: 80, friction: 6 }),
          Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: false }),
        ]),
        Animated.spring(checkScale, { toValue: 1, useNativeDriver: false, tension: 100, friction: 5 }),
      ]).start();
    } else {
      scale.setValue(0);
      opacity.setValue(0);
      checkScale.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[successStyles.container, { opacity }]}>
      <Animated.View style={[successStyles.circle, { transform: [{ scale }] }]}>
        <Animated.View style={{ transform: [{ scale: checkScale }] }}>
          <Ionicons name="checkmark" size={52} color="#fff" />
        </Animated.View>
      </Animated.View>
      <Animated.Text style={[successStyles.title, { opacity }]}>Payment Successful!</Animated.Text>
      <Animated.Text style={[successStyles.sub, { opacity }]}>Receipt has been saved to your inbox</Animated.Text>
    </Animated.View>
  );
}

const successStyles = StyleSheet.create({
  container: { alignItems: "center", paddingVertical: 32, gap: 16 },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0px 8px 16px rgba(16,185,129,0.4)",
    elevation: 10,
  },
  title: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#0F172A" },
  sub: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#64748B", textAlign: "center" },
});

function PaymentModal({
  contribution,
  onClose,
  onSuccess,
}: {
  contribution: Contribution;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const colors = useColors();
  const [step, setStep] = useState<"form" | "processing" | "success">("form");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const dotAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (step === "processing") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dotAnim, { toValue: 1, duration: 600, useNativeDriver: false }),
          Animated.timing(dotAnim, { toValue: 0, duration: 600, useNativeDriver: false }),
        ])
      ).start();
      setTimeout(() => {
        setStep("success");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(onSuccess, 2500);
      }, 2000);
    }
  }, [step]);

  const formatCard = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const canPay = cardNumber.replace(/\s/g, "").length === 16 && expiry.length === 5 && cvv.length >= 3 && name.trim().length > 2;

  return (
    <Modal visible animationType="slide" transparent onRequestClose={step === "form" ? onClose : undefined}>
      <View style={modalStyles.overlay}>
        <View style={[modalStyles.sheet, { backgroundColor: colors.card }]}>
          {step === "form" && (
            <>
              <View style={modalStyles.header}>
                <View>
                  <Text style={[modalStyles.title, { color: colors.foreground }]}>Pay with Card</Text>
                  <Text style={[modalStyles.subtitle, { color: colors.mutedForeground }]}>{contribution.title}</Text>
                </View>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={22} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>

              <View style={[modalStyles.amountBadge, { backgroundColor: colors.primary + "15" }]}>
                <Text style={[modalStyles.amountLabel, { color: colors.mutedForeground }]}>Amount to Pay</Text>
                <Text style={[modalStyles.amount, { color: colors.primary }]}>₦{contribution.amount.toLocaleString()}</Text>
              </View>

              <View style={[modalStyles.paystackBadge, { backgroundColor: "#00C3F7" + "15" }]}>
                <Ionicons name="shield-checkmark" size={14} color="#00C3F7" />
                <Text style={[modalStyles.paystackText, { color: "#00C3F7" }]}>Secured by Paystack</Text>
              </View>

              <Text style={[modalStyles.fieldLabel, { color: colors.mutedForeground }]}>Cardholder Name</Text>
              <TextInput
                style={[modalStyles.field, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                placeholder="Name on card"
                placeholderTextColor={colors.mutedForeground}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />

              <Text style={[modalStyles.fieldLabel, { color: colors.mutedForeground }]}>Card Number</Text>
              <TextInput
                style={[modalStyles.field, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                placeholder="0000 0000 0000 0000"
                placeholderTextColor={colors.mutedForeground}
                value={cardNumber}
                onChangeText={(v) => setCardNumber(formatCard(v))}
                keyboardType="number-pad"
                maxLength={19}
              />

              <View style={modalStyles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={[modalStyles.fieldLabel, { color: colors.mutedForeground }]}>Expiry</Text>
                  <TextInput
                    style={[modalStyles.field, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                    placeholder="MM/YY"
                    placeholderTextColor={colors.mutedForeground}
                    value={expiry}
                    onChangeText={(v) => setExpiry(formatExpiry(v))}
                    keyboardType="number-pad"
                    maxLength={5}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[modalStyles.fieldLabel, { color: colors.mutedForeground }]}>CVV</Text>
                  <TextInput
                    style={[modalStyles.field, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                    placeholder="•••"
                    placeholderTextColor={colors.mutedForeground}
                    value={cvv}
                    onChangeText={(v) => setCvv(v.replace(/\D/g, "").slice(0, 4))}
                    keyboardType="number-pad"
                    secureTextEntry
                    maxLength={4}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[modalStyles.payBtn, { backgroundColor: canPay ? colors.primary : colors.muted, opacity: canPay ? 1 : 0.6 }]}
                onPress={() => {
                  if (!canPay) return;
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setStep("processing");
                }}
                activeOpacity={0.85}
                disabled={!canPay}
              >
                <Ionicons name="lock-closed" size={16} color="#fff" />
                <Text style={modalStyles.payBtnText}>Pay ₦{contribution.amount.toLocaleString()}</Text>
              </TouchableOpacity>
            </>
          )}

          {step === "processing" && (
            <View style={modalStyles.processingContainer}>
              <View style={[modalStyles.processingCircle, { borderColor: colors.primary }]}>
                <Ionicons name="card-outline" size={36} color={colors.primary} />
              </View>
              <Text style={[modalStyles.processingTitle, { color: colors.foreground }]}>Processing Payment</Text>
              <Text style={[modalStyles.processingBody, { color: colors.mutedForeground }]}>
                Please wait, do not close this screen...
              </Text>
              <Animated.Text style={[modalStyles.processingDots, { opacity: dotAnim, color: colors.primary }]}>
                ● ● ●
              </Animated.Text>
            </View>
          )}

          {step === "success" && <SuccessAnimation visible />}
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 48 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  amountBadge: { borderRadius: 14, padding: 16, alignItems: "center", marginBottom: 12 },
  amountLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  amount: { fontSize: 28, fontFamily: "Inter_700Bold", marginTop: 4 },
  paystackBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6,
    alignSelf: "center", marginBottom: 20,
  },
  paystackText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  fieldLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginBottom: 6, marginTop: 12 },
  field: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: "Inter_400Regular" },
  row: { flexDirection: "row", gap: 12 },
  payBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 16, marginTop: 24 },
  payBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  processingContainer: { alignItems: "center", paddingVertical: 40, gap: 16 },
  processingCircle: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, alignItems: "center", justifyContent: "center" },
  processingTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  processingBody: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  processingDots: { fontSize: 18, letterSpacing: 4 },
});

function ContributionCard({
  item,
  onPay,
}: {
  item: Contribution;
  onPay: () => void;
}) {
  const colors = useColors();
  const isPaid = item.status === "paid";

  const daysLeft = Math.ceil(
    (new Date(item.deadline).getTime() - new Date("2026-06-20").getTime()) / 86400000
  );
  const isOverdue = daysLeft < 0 && !isPaid;
  const isUrgent = daysLeft <= 7 && daysLeft >= 0 && !isPaid;

  return (
    <View
      style={[
        cardStyles.card,
        {
          backgroundColor: colors.card,
          borderColor: isPaid ? colors.success + "40" : isOverdue ? "#EF444440" : isUrgent ? "#F59E0B40" : colors.border,
          borderLeftWidth: 4,
          borderLeftColor: isPaid ? colors.success : isOverdue ? "#EF4444" : isUrgent ? "#F59E0B" : colors.border,
        },
      ]}
    >
      <View style={cardStyles.top}>
        <View style={[cardStyles.iconWrap, { backgroundColor: isPaid ? colors.success + "18" : "#F59E0B18" }]}>
          <Ionicons
            name={isPaid ? "checkmark-circle" : "card-outline"}
            size={22}
            color={isPaid ? colors.success : "#F59E0B"}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[cardStyles.title, { color: colors.foreground }]}>{item.title}</Text>
          {item.description ? (
            <Text style={[cardStyles.desc, { color: colors.mutedForeground }]} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
        </View>
        <Text style={[cardStyles.amount, { color: isPaid ? colors.success : colors.foreground }]}>
          ₦{item.amount.toLocaleString()}
        </Text>
      </View>

      <View style={cardStyles.bottom}>
        <View style={cardStyles.metaRow}>
          <Ionicons name="calendar-outline" size={12} color={colors.mutedForeground} />
          <Text style={[cardStyles.meta, { color: isOverdue && !isPaid ? "#EF4444" : colors.mutedForeground }]}>
            {isPaid ? `Paid ${item.paidDate}` : isOverdue ? `Overdue — was due ${item.deadline}` : `Due ${item.deadline}`}
          </Text>
        </View>

        {!isPaid && isUrgent && (
          <View style={[cardStyles.urgentBadge, { backgroundColor: "#FEF3C7" }]}>
            <Text style={cardStyles.urgentText}>Due in {daysLeft}d</Text>
          </View>
        )}

        {isPaid ? (
          <View style={[cardStyles.paidBadge, { backgroundColor: colors.success + "18" }]}>
            <Ionicons name="checkmark" size={12} color={colors.success} />
            <Text style={[cardStyles.paidText, { color: colors.success }]}>Paid</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[cardStyles.payBtn, { backgroundColor: isOverdue ? "#EF4444" : colors.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onPay();
            }}
            activeOpacity={0.85}
          >
            <Text style={cardStyles.payBtnText}>Pay Now</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 12, gap: 12 },
  top: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  iconWrap: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 15, fontFamily: "Inter_600SemiBold", flex: 1 },
  desc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 3, lineHeight: 16 },
  amount: { fontSize: 17, fontFamily: "Inter_700Bold" },
  bottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, flex: 1 },
  meta: { fontSize: 12, fontFamily: "Inter_400Regular" },
  urgentBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  urgentText: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#B45309" },
  paidBadge: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  paidText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  payBtn: { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  payBtnText: { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold" },
});

export default function PaymentsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { contributions, payContribution } = useData();
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [payingItem, setPayingItem] = useState<Contribution | null>(null);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const myContributions = contributions.filter((c) => c.level === user?.level || !user?.level);
  const filtered =
    activeFilter === "all"
      ? myContributions
      : myContributions.filter((c) => c.status === activeFilter);

  const totalOwed = myContributions
    .filter((c) => c.status === "unpaid")
    .reduce((s, c) => s + c.amount, 0);
  const totalPaid = myContributions
    .filter((c) => c.status === "paid")
    .reduce((s, c) => s + c.amount, 0);
  const unpaidCount = myContributions.filter((c) => c.status === "unpaid").length;

  const FILTERS: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unpaid", label: "Unpaid" },
    { key: "paid", label: "Paid" },
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
            <Text style={styles.summaryLabel}>Total Owed</Text>
            <Text style={[styles.summaryValue, { color: totalOwed > 0 ? "#FBBF24" : "#34D399" }]}>
              {totalOwed > 0 ? `₦${totalOwed.toLocaleString()}` : "All Paid"}
            </Text>
            {unpaidCount > 0 && (
              <Text style={styles.summaryCount}>{unpaidCount} outstanding</Text>
            )}
          </View>
          <View style={[styles.divider]} />
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Paid</Text>
            <Text style={[styles.summaryValue, { color: "#34D399" }]}>
              ₦{totalPaid.toLocaleString()}
            </Text>
            <Text style={styles.summaryCount}>
              {myContributions.filter((c) => c.status === "paid").length} payments
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={[styles.filterRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterTab,
              activeFilter === f.key && [styles.filterTabActive, { borderBottomColor: colors.primary }],
            ]}
            onPress={() => {
              setActiveFilter(f.key);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterText,
                { color: activeFilter === f.key ? colors.primary : colors.mutedForeground },
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 84 : 100) },
        ]}
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
            <ContributionCard
              key={item.id}
              item={item}
              onPay={() => setPayingItem(item)}
            />
          ))
        )}
      </ScrollView>

      {payingItem && (
        <PaymentModal
          contribution={payingItem}
          onClose={() => setPayingItem(null)}
          onSuccess={() => {
            payContribution(payingItem.id);
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
  filterText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  content: { padding: 16 },
  emptyContainer: { alignItems: "center", paddingTop: 60, paddingHorizontal: 32, gap: 16 },
  emptyIconWrap: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "center" },
  emptyBody: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
});
