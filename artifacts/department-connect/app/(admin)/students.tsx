import React, { useState } from "react";
import {
  Alert,
  FlatList,
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
import { useData, type StudentStatus } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

const LEVELS = ["All", "100L", "200L", "300L", "400L", "500L"];
const LEVEL_OPTIONS = ["100L", "200L", "300L", "400L", "500L"];

const STATUS_COLORS: Record<StudentStatus, string> = {
  active: "#10B981",
  pending: "#F59E0B",
  rejected: "#EF4444",
  suspended: "#6B7280",
};

const MATRIC_REGEX = /^[A-Z]{3}[0-9]{7}$/;
const PHONE_REGEX = /^0[7-9][0-9]{9}$/;

type FormErrors = {
  firstName?: string;
  surname?: string;
  matricNumber?: string;
  dob?: string;
  phone?: string;
  level?: string;
};

export default function StudentsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { students, addStudent } = useData();
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [detailStudent, setDetailStudent] = useState<typeof students[0] | null>(null);

  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [matricNumber, setMatricNumber] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [level, setLevel] = useState("300L");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const filtered = students.filter((s) => {
    const matchSearch =
      !search.trim() ||
      s.firstName.toLowerCase().includes(search.toLowerCase()) ||
      s.surname.toLowerCase().includes(search.toLowerCase()) ||
      s.matricNumber.toLowerCase().includes(search.toLowerCase());
    const matchLevel = levelFilter === "All" || s.level === levelFilter;
    return matchSearch && matchLevel;
  });

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const resetForm = () => {
    setFirstName("");
    setSurname("");
    setMatricNumber("");
    setDob("");
    setPhone("");
    setEmail("");
    setLevel("300L");
    setFormErrors({});
    setSubmitting(false);
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!firstName.trim()) errors.firstName = "First name is required";
    if (!surname.trim()) errors.surname = "Surname is required";
    if (!MATRIC_REGEX.test(matricNumber.toUpperCase()))
      errors.matricNumber = "Format: ART2500001 (3 letters + 7 digits)";
    if (!dob.match(/^\d{4}-\d{2}-\d{2}$/))
      errors.dob = "Format: YYYY-MM-DD (e.g. 2002-05-15)";
    if (!PHONE_REGEX.test(phone))
      errors.phone = "Must be 11 digits starting with 070/080/081/090/091";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAdd = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    const existing = students.find(
      (s) => s.matricNumber.toUpperCase() === matricNumber.toUpperCase()
    );
    if (existing) {
      setFormErrors({ matricNumber: "This matric number is already registered" });
      setSubmitting(false);
      return;
    }
    addStudent({
      firstName: firstName.trim(),
      surname: surname.trim(),
      matricNumber: matricNumber.toUpperCase(),
      level,
      department: "Computer Science",
      phone: phone.trim(),
      email: email.trim(),
      dob,
      status: "pending",
      submittedAt: new Date().toISOString().split("T")[0],
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowAdd(false);
    resetForm();
    Alert.alert(
      "Student Added",
      `${firstName} ${surname} has been registered with Pending Approval status.`
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={["#2D1B69", "#7C3AED"]}
        style={[styles.header, { paddingTop: topPad + 20 }]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Students</Text>
            <Text style={styles.subtitle}>{students.length} total enrolled</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowAdd(true);
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="person-add-outline" size={18} color="#7C3AED" />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color={colors.mutedForeground} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or matric..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {!!search && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <View style={[styles.levelRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <FlatList
          horizontal
          data={LEVELS}
          keyExtractor={(l) => l}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.levelChip,
                {
                  backgroundColor: levelFilter === item ? colors.primary : colors.muted,
                  borderColor: levelFilter === item ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setLevelFilter(item)}
              activeOpacity={0.8}
            >
              <Text style={[styles.levelChipText, { color: levelFilter === item ? "#fff" : colors.mutedForeground }]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(s) => s.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 84 : 90) },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No students found</Text>
          </View>
        }
        renderItem={({ item: s }) => {
          const statusColor = STATUS_COLORS[s.status];
          return (
            <TouchableOpacity
              style={[styles.studentCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setDetailStudent(s); }}
              activeOpacity={0.85}
            >
              <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.avatarText, { color: colors.primary }]}>{s.firstName[0]}{s.surname[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.studentName, { color: colors.foreground }]}>{s.firstName} {s.surname}</Text>
                <Text style={[styles.studentMeta, { color: colors.mutedForeground }]}>{s.matricNumber}  ·  {s.dob}</Text>
                <View style={styles.studentBottom}>
                  <Text style={[styles.studentLevel, { color: colors.primary }]}>{s.level}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
                    <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                    <Text style={[styles.statusText, { color: statusColor }]}>{s.status}</Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          );
        }}
      />

      {/* Student Detail Modal */}
      <Modal visible={!!detailStudent} transparent animationType="slide" statusBarTranslucent onRequestClose={() => setDetailStudent(null)}>
        <View style={addStyles.overlay}>
          <View style={[addStyles.sheet, { backgroundColor: colors.card }]}>
            <View style={[{ width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 20, backgroundColor: colors.border }]} />
            {detailStudent && (() => {
              const sc = STATUS_COLORS[detailStudent.status];
              const initials = `${detailStudent.firstName[0]}${detailStudent.surname[0]}`;
              return (
                <>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 20 }}>
                    <View style={[styles.avatar, { backgroundColor: colors.secondary, width: 56, height: 56, borderRadius: 28 }]}>
                      <Text style={[styles.avatarText, { color: colors.primary, fontSize: 20 }]}>{initials}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground }}>{detailStudent.firstName} {detailStudent.surname}</Text>
                      <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 2 }}>{detailStudent.matricNumber}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setDetailStudent(null)}>
                      <Ionicons name="close" size={22} color={colors.mutedForeground} />
                    </TouchableOpacity>
                  </View>

                  {/* Status badge */}
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 20 }}>
                    <View style={[styles.statusBadge, { backgroundColor: sc + "20", paddingHorizontal: 12, paddingVertical: 6 }]}>
                      <View style={[styles.statusDot, { backgroundColor: sc }]} />
                      <Text style={[styles.statusText, { color: sc, fontSize: 13 }]}>{detailStudent.status.charAt(0).toUpperCase() + detailStudent.status.slice(1)}</Text>
                    </View>
                    <View style={{ flex: 1 }} />
                    <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: colors.primary }}>{detailStudent.level}</Text>
                    <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>· {detailStudent.department}</Text>
                  </View>

                  {/* Info rows */}
                  {[
                    { label: "Date of Birth", value: detailStudent.dob, icon: "calendar-outline" as const },
                    { label: "Phone", value: detailStudent.phone || "—", icon: "call-outline" as const },
                    { label: "Email", value: detailStudent.email || "—", icon: "mail-outline" as const },
                    { label: "Submitted", value: detailStudent.submittedAt || "—", icon: "time-outline" as const },
                  ].map((row, i, arr) => (
                    <View key={row.label} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: colors.border }}>
                      <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: colors.muted, alignItems: "center", justifyContent: "center" }}>
                        <Ionicons name={row.icon} size={16} color={colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 0.5 }}>{row.label}</Text>
                        <Text style={{ fontSize: 14, fontFamily: "Inter_400Regular", color: colors.foreground, marginTop: 2 }}>{row.value}</Text>
                      </View>
                    </View>
                  ))}

                  <TouchableOpacity
                    style={{ marginTop: 24, borderRadius: 14, paddingVertical: 14, backgroundColor: colors.muted, alignItems: "center" }}
                    onPress={() => setDetailStudent(null)}
                    activeOpacity={0.8}
                  >
                    <Text style={{ fontSize: 15, fontFamily: "Inter_700Bold", color: colors.foreground }}>Close</Text>
                  </TouchableOpacity>
                </>
              );
            })()}
          </View>
        </View>
      </Modal>

      <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => { setShowAdd(false); resetForm(); }}>
        <View style={addStyles.overlay}>
          <View style={[addStyles.sheet, { backgroundColor: colors.card }]}>
            <View style={addStyles.header}>
              <Text style={[addStyles.title, { color: colors.foreground }]}>Add New Student</Text>
              <TouchableOpacity onPress={() => { setShowAdd(false); resetForm(); }}>
                <Ionicons name="close" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={addStyles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={[addStyles.label, { color: colors.mutedForeground }]}>First Name *</Text>
                  <TextInput
                    style={[addStyles.field, { backgroundColor: colors.muted, color: colors.foreground, borderColor: formErrors.firstName ? "#EF4444" : colors.border }]}
                    placeholder="e.g. Tolu"
                    placeholderTextColor={colors.mutedForeground}
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                  />
                  {formErrors.firstName ? <Text style={addStyles.error}>{formErrors.firstName}</Text> : null}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[addStyles.label, { color: colors.mutedForeground }]}>Surname *</Text>
                  <TextInput
                    style={[addStyles.field, { backgroundColor: colors.muted, color: colors.foreground, borderColor: formErrors.surname ? "#EF4444" : colors.border }]}
                    placeholder="e.g. Adeyemi"
                    placeholderTextColor={colors.mutedForeground}
                    value={surname}
                    onChangeText={setSurname}
                    autoCapitalize="words"
                  />
                  {formErrors.surname ? <Text style={addStyles.error}>{formErrors.surname}</Text> : null}
                </View>
              </View>

              <Text style={[addStyles.label, { color: colors.mutedForeground }]}>Matric Number * <Text style={addStyles.hint}>(e.g. ART2500001)</Text></Text>
              <TextInput
                style={[addStyles.field, { backgroundColor: colors.muted, color: colors.foreground, borderColor: formErrors.matricNumber ? "#EF4444" : colors.border }]}
                placeholder="ART2500001"
                placeholderTextColor={colors.mutedForeground}
                value={matricNumber}
                onChangeText={(v) => setMatricNumber(v.toUpperCase())}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={10}
              />
              {formErrors.matricNumber ? <Text style={addStyles.error}>{formErrors.matricNumber}</Text> : null}

              <Text style={[addStyles.label, { color: colors.mutedForeground }]}>Date of Birth * <Text style={addStyles.hint}>(YYYY-MM-DD)</Text></Text>
              <TextInput
                style={[addStyles.field, { backgroundColor: colors.muted, color: colors.foreground, borderColor: formErrors.dob ? "#EF4444" : colors.border }]}
                placeholder="e.g. 2002-05-15"
                placeholderTextColor={colors.mutedForeground}
                value={dob}
                onChangeText={setDob}
                keyboardType="numeric"
                maxLength={10}
              />
              {formErrors.dob ? <Text style={addStyles.error}>{formErrors.dob}</Text> : null}

              <Text style={[addStyles.label, { color: colors.mutedForeground }]}>Phone Number * <Text style={addStyles.hint}>(080XXXXXXXX)</Text></Text>
              <TextInput
                style={[addStyles.field, { backgroundColor: colors.muted, color: colors.foreground, borderColor: formErrors.phone ? "#EF4444" : colors.border }]}
                placeholder="08012345678"
                placeholderTextColor={colors.mutedForeground}
                value={phone}
                onChangeText={(v) => setPhone(v.replace(/\D/g, "").slice(0, 11))}
                keyboardType="phone-pad"
                maxLength={11}
              />
              {formErrors.phone ? <Text style={addStyles.error}>{formErrors.phone}</Text> : null}

              <Text style={[addStyles.label, { color: colors.mutedForeground }]}>Email <Text style={addStyles.hint}>(optional — recovery only)</Text></Text>
              <TextInput
                style={[addStyles.field, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                placeholder="student@example.com"
                placeholderTextColor={colors.mutedForeground}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={[addStyles.label, { color: colors.mutedForeground }]}>Level *</Text>
              <View style={addStyles.levelRow}>
                {LEVEL_OPTIONS.map((l) => (
                  <TouchableOpacity
                    key={l}
                    style={[
                      addStyles.levelChip,
                      {
                        backgroundColor: level === l ? colors.primary : colors.muted,
                        borderColor: level === l ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setLevel(l)}
                    activeOpacity={0.8}
                  >
                    <Text style={[addStyles.levelChipText, { color: level === l ? "#fff" : colors.mutedForeground }]}>{l}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={[addStyles.statusNote, { backgroundColor: "#FEF3C7" }]}>
                <Ionicons name="information-circle-outline" size={16} color="#B45309" />
                <Text style={addStyles.statusNoteText}>
                  Account will be created with <Text style={{ fontFamily: "Inter_700Bold" }}>Pending Approval</Text> status. A Lecturer or Course Rep must approve before the student can log in.
                </Text>
              </View>

              <TouchableOpacity
                style={[addStyles.submitBtn, { backgroundColor: submitting ? colors.muted : colors.primary }]}
                onPress={handleAdd}
                activeOpacity={0.85}
                disabled={submitting}
              >
                {submitting ? (
                  <Text style={addStyles.submitText}>Creating Account...</Text>
                ) : (
                  <>
                    <Ionicons name="person-add-outline" size={18} color="#fff" />
                    <Text style={addStyles.submitText}>Create Student Account</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#fff" },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.65)", marginTop: 2 },
  addBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8,
  },
  addBtnText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#7C3AED" },
  searchBar: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#fff",
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, gap: 10,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: "#0F172A" },
  levelRow: { paddingVertical: 12, borderBottomWidth: 1 },
  levelChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  levelChipText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  list: { padding: 16, gap: 10 },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  studentCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 16, borderWidth: 1, padding: 14,
  },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  studentName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  studentMeta: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  studentBottom: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  studentLevel: { fontSize: 12, fontFamily: "Inter_700Bold" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold", textTransform: "capitalize" },
});

const addStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, maxHeight: "92%" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  row: { flexDirection: "row", gap: 12 },
  label: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginBottom: 6, marginTop: 16 },
  hint: { fontFamily: "Inter_400Regular", fontSize: 11 },
  field: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontFamily: "Inter_400Regular" },
  error: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#EF4444", marginTop: 4 },
  levelRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  levelChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  levelChipText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  statusNote: { flexDirection: "row", alignItems: "flex-start", gap: 8, borderRadius: 12, padding: 12, marginTop: 20 },
  statusNoteText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", color: "#92400E", lineHeight: 17 },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 16, marginTop: 20 },
  submitText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
});
