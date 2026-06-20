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
import { useData, type EventCategory, type ClassStatus } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

const CATEGORY_META: Record<EventCategory, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap; description: string }> = {
  lecture: { label: "Lecture Session", color: "#7C3AED", icon: "school-outline", description: "Academic class session" },
  big_event: { label: "Big Event", color: "#F59E0B", icon: "megaphone-outline", description: "High-visibility department event" },
  small_event: { label: "Small Event", color: "#8B5CF6", icon: "people-circle-outline", description: "Targeted group activity" },
  extra: { label: "Extra / Notice", color: "#10B981", icon: "receipt-outline", description: "Financial or admin notice" },
};

const TARGET_OPTIONS = ["All Students", "100L", "200L", "300L", "400L", "500L"];
const REMINDER_OPTIONS = ["None", "24 hours before", "1 hour before", "Both"];
const VENUE_OPTIONS = ["LT1", "LT2", "LT3", "Lab 1", "Faculty Building", "Sports Complex", "Online (WhatsApp)", "Online (Zoom)", "Other"];

type CreateMode = "event" | "class";

export default function EventsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { events, classes, createEvent, createClass } = useData();
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [createMode, setCreateMode] = useState<CreateMode>("event");

  const [newTitle, setNewTitle] = useState("");
  const [newCat, setNewCat] = useState<EventCategory>("big_event");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newVenue, setNewVenue] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTarget, setNewTarget] = useState("All Students");
  const [newReminder, setNewReminder] = useState("Both");

  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [classDate, setClassDate] = useState("");
  const [classStart, setClassStart] = useState("");
  const [classEnd, setClassEnd] = useState("");
  const [classVenue, setClassVenue] = useState("LT1");
  const [classLevel, setClassLevel] = useState("300L");

  const [activeTab, setActiveTab] = useState<"events" | "classes">("events");

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const sortedEvents = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const sortedClasses = [...classes].sort((a, b) => b.date.localeCompare(a.date));

  const resetForm = () => {
    setNewTitle(""); setNewDate(""); setNewTime(""); setNewVenue("");
    setNewDescription(""); setNewTarget("All Students"); setNewReminder("Both");
    setNewCat("big_event");
    setCourseCode(""); setCourseName(""); setClassDate(""); setClassStart("");
    setClassEnd(""); setClassVenue("LT1"); setClassLevel("300L");
  };

  const handleCreateEvent = () => {
    if (!newTitle.trim() || !newDate.trim() || !newVenue.trim()) {
      Alert.alert("Missing Fields", "Please fill in title, date and venue.");
      return;
    }
    createEvent({
      title: newTitle.trim(),
      category: newCat,
      date: newDate.trim(),
      time: newTime.trim() || "TBD",
      venue: newVenue.trim(),
      description: newDescription.trim(),
      targetAudience: newTarget,
      reminderSchedule: newReminder,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowCreate(false);
    resetForm();
    Alert.alert("Event Created", `"${newTitle}" has been posted and notifications sent.`);
  };

  const handleCreateClass = () => {
    if (!courseCode.trim() || !courseName.trim() || !classDate.trim() || !classStart.trim()) {
      Alert.alert("Missing Fields", "Please fill in course code, name, date and start time.");
      return;
    }
    createClass({
      courseCode: courseCode.toUpperCase().trim(),
      courseName: courseName.trim(),
      lecturerId: user?.id ?? "a1",
      date: classDate.trim(),
      startTime: classStart.trim(),
      endTime: classEnd.trim() || "TBD",
      venue: classVenue,
      status: "upcoming" as ClassStatus,
      attendanceOpen: false,
      attendanceCount: 0,
      level: classLevel,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowCreate(false);
    resetForm();
    Alert.alert("Class Scheduled", `${courseCode.toUpperCase()} scheduled for ${classDate}.`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={["#2D1B69", "#7C3AED"]}
        style={[styles.header, { paddingTop: topPad + 20 }]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Events & Classes</Text>
            <Text style={styles.subtitle}>{sortedEvents.length} events · {sortedClasses.length} sessions</Text>
          </View>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowCreate(true);
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={20} color="#7C3AED" />
            <Text style={styles.createBtnText}>Create</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabBar}>
          {(["events", "classes"] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tabBtn, activeTab === t && styles.tabBtnActive]}
              onPress={() => setActiveTab(t)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabBtnText, activeTab === t && styles.tabBtnTextActive]}>
                {t === "events" ? "Events" : "Classes"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {activeTab === "events" ? (
        <FlatList
          data={sortedEvents}
          keyExtractor={(ev) => ev.id}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + (Platform.OS === "web" ? 84 : 90) },
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No events yet</Text>
            </View>
          }
          renderItem={({ item: ev }) => {
            const meta = CATEGORY_META[ev.category];
            return (
              <View style={[styles.eventCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.catTag, { backgroundColor: meta.color + "20" }]}>
                  <Ionicons name={meta.icon} size={14} color={meta.color} />
                  <Text style={[styles.catText, { color: meta.color }]}>{meta.label}</Text>
                </View>
                <Text style={[styles.eventTitle, { color: colors.foreground }]}>{ev.title}</Text>
                <View style={styles.eventMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={13} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{ev.date}  ·  {ev.time}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="location-outline" size={13} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{ev.venue}</Text>
                  </View>
                  {ev.targetAudience && (
                    <View style={styles.metaItem}>
                      <Ionicons name="people-outline" size={13} color={colors.mutedForeground} />
                      <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{ev.targetAudience}</Text>
                    </View>
                  )}
                </View>
                {ev.description ? (
                  <Text style={[styles.description, { color: colors.mutedForeground }]} numberOfLines={2}>
                    {ev.description}
                  </Text>
                ) : null}
              </View>
            );
          }}
        />
      ) : (
        <FlatList
          data={sortedClasses}
          keyExtractor={(c) => c.id}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + (Platform.OS === "web" ? 84 : 90) },
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="school-outline" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No class sessions yet</Text>
            </View>
          }
          renderItem={({ item: c }) => {
            const statusColors: Record<string, string> = {
              upcoming: colors.primary,
              ongoing: colors.success,
              completed: colors.mutedForeground,
              cancelled: colors.destructive,
            };
            const col = statusColors[c.status];
            return (
              <View style={[styles.classCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.classStatus, { backgroundColor: col + "20" }]}>
                  <View style={[styles.classDot, { backgroundColor: col }]} />
                  <Text style={[styles.classStatusText, { color: col }]}>{c.status}</Text>
                </View>
                <Text style={[styles.courseCode, { color: colors.primary }]}>{c.courseCode}</Text>
                <Text style={[styles.courseName, { color: colors.foreground }]}>{c.courseName}</Text>
                <View style={styles.classMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={13} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{c.date}  ·  {c.startTime}–{c.endTime}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="location-outline" size={13} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{c.venue}  ·  {c.level}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="people-outline" size={13} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{c.attendanceCount} checked in</Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}

      <Modal visible={showCreate} transparent animationType="slide" onRequestClose={() => { setShowCreate(false); resetForm(); }}>
        <View style={modalStyles.overlay}>
          <View style={[modalStyles.sheet, { backgroundColor: colors.card }]}>
            <View style={modalStyles.header}>
              <Text style={[modalStyles.title, { color: colors.foreground }]}>Create New</Text>
              <TouchableOpacity onPress={() => { setShowCreate(false); resetForm(); }}>
                <Ionicons name="close" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <View style={modalStyles.modeRow}>
              {(["event", "class"] as CreateMode[]).map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[modalStyles.modeBtn, createMode === m && { backgroundColor: colors.primary }]}
                  onPress={() => setCreateMode(m)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={m === "event" ? "megaphone-outline" : "school-outline"}
                    size={16}
                    color={createMode === m ? "#fff" : colors.mutedForeground}
                  />
                  <Text style={[modalStyles.modeBtnText, { color: createMode === m ? "#fff" : colors.mutedForeground }]}>
                    {m === "event" ? "Event / Notice" : "Class Session"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {createMode === "event" ? (
                <>
                  <Text style={[modalStyles.label, { color: colors.mutedForeground }]}>Event Title *</Text>
                  <TextInput
                    style={[modalStyles.field, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                    placeholder="e.g. Departmental Week"
                    placeholderTextColor={colors.mutedForeground}
                    value={newTitle}
                    onChangeText={setNewTitle}
                  />

                  <Text style={[modalStyles.label, { color: colors.mutedForeground }]}>Category *</Text>
                  <View style={modalStyles.catRow}>
                    {(Object.entries(CATEGORY_META) as [EventCategory, typeof CATEGORY_META[EventCategory]][]).map(([key, meta]) => (
                      <TouchableOpacity
                        key={key}
                        style={[
                          modalStyles.catChoice,
                          { backgroundColor: newCat === key ? meta.color : colors.muted, borderColor: newCat === key ? meta.color : colors.border },
                        ]}
                        onPress={() => setNewCat(key)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name={meta.icon} size={13} color={newCat === key ? "#fff" : colors.mutedForeground} />
                        <Text style={[modalStyles.catChoiceText, { color: newCat === key ? "#fff" : colors.mutedForeground }]}>{meta.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={modalStyles.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={[modalStyles.label, { color: colors.mutedForeground }]}>Date * <Text style={modalStyles.hint}>(YYYY-MM-DD)</Text></Text>
                      <TextInput
                        style={[modalStyles.field, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                        placeholder="2026-07-15"
                        placeholderTextColor={colors.mutedForeground}
                        value={newDate}
                        onChangeText={setNewDate}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[modalStyles.label, { color: colors.mutedForeground }]}>Time</Text>
                      <TextInput
                        style={[modalStyles.field, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                        placeholder="9:00 AM"
                        placeholderTextColor={colors.mutedForeground}
                        value={newTime}
                        onChangeText={setNewTime}
                      />
                    </View>
                  </View>

                  <Text style={[modalStyles.label, { color: colors.mutedForeground }]}>Venue *</Text>
                  <TextInput
                    style={[modalStyles.field, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                    placeholder="e.g. Faculty Building"
                    placeholderTextColor={colors.mutedForeground}
                    value={newVenue}
                    onChangeText={setNewVenue}
                  />

                  <Text style={[modalStyles.label, { color: colors.mutedForeground }]}>Description</Text>
                  <TextInput
                    style={[modalStyles.field, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border, minHeight: 80, textAlignVertical: "top" }]}
                    placeholder="Event details..."
                    placeholderTextColor={colors.mutedForeground}
                    value={newDescription}
                    onChangeText={setNewDescription}
                    multiline
                  />

                  <Text style={[modalStyles.label, { color: colors.mutedForeground }]}>Target Audience</Text>
                  <View style={modalStyles.catRow}>
                    {TARGET_OPTIONS.map((t) => (
                      <TouchableOpacity
                        key={t}
                        style={[modalStyles.catChoice, { backgroundColor: newTarget === t ? colors.primary : colors.muted, borderColor: newTarget === t ? colors.primary : colors.border }]}
                        onPress={() => setNewTarget(t)}
                        activeOpacity={0.8}
                      >
                        <Text style={[modalStyles.catChoiceText, { color: newTarget === t ? "#fff" : colors.mutedForeground }]}>{t}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={[modalStyles.label, { color: colors.mutedForeground }]}>Reminders</Text>
                  <View style={modalStyles.catRow}>
                    {REMINDER_OPTIONS.map((r) => (
                      <TouchableOpacity
                        key={r}
                        style={[modalStyles.catChoice, { backgroundColor: newReminder === r ? colors.primary : colors.muted, borderColor: newReminder === r ? colors.primary : colors.border }]}
                        onPress={() => setNewReminder(r)}
                        activeOpacity={0.8}
                      >
                        <Text style={[modalStyles.catChoiceText, { color: newReminder === r ? "#fff" : colors.mutedForeground }]}>{r}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[modalStyles.submitBtn, { backgroundColor: colors.primary }]}
                    onPress={handleCreateEvent}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="megaphone-outline" size={18} color="#fff" />
                    <Text style={modalStyles.submitText}>Create & Notify Students</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={modalStyles.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={[modalStyles.label, { color: colors.mutedForeground }]}>Course Code *</Text>
                      <TextInput
                        style={[modalStyles.field, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                        placeholder="CSC301"
                        placeholderTextColor={colors.mutedForeground}
                        value={courseCode}
                        onChangeText={(v) => setCourseCode(v.toUpperCase())}
                        autoCapitalize="characters"
                        maxLength={8}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[modalStyles.label, { color: colors.mutedForeground }]}>Level</Text>
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                        {["100L", "200L", "300L", "400L", "500L"].map((l) => (
                          <TouchableOpacity
                            key={l}
                            style={[modalStyles.smallChip, { backgroundColor: classLevel === l ? colors.primary : colors.muted, borderColor: classLevel === l ? colors.primary : colors.border }]}
                            onPress={() => setClassLevel(l)}
                            activeOpacity={0.8}
                          >
                            <Text style={[modalStyles.smallChipText, { color: classLevel === l ? "#fff" : colors.mutedForeground }]}>{l}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>

                  <Text style={[modalStyles.label, { color: colors.mutedForeground }]}>Course Name *</Text>
                  <TextInput
                    style={[modalStyles.field, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                    placeholder="e.g. Data Structures"
                    placeholderTextColor={colors.mutedForeground}
                    value={courseName}
                    onChangeText={setCourseName}
                  />

                  <View style={modalStyles.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={[modalStyles.label, { color: colors.mutedForeground }]}>Date * <Text style={modalStyles.hint}>(YYYY-MM-DD)</Text></Text>
                      <TextInput
                        style={[modalStyles.field, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                        placeholder="2026-06-25"
                        placeholderTextColor={colors.mutedForeground}
                        value={classDate}
                        onChangeText={setClassDate}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <View style={modalStyles.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={[modalStyles.label, { color: colors.mutedForeground }]}>Start Time *</Text>
                      <TextInput
                        style={[modalStyles.field, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                        placeholder="8:00 AM"
                        placeholderTextColor={colors.mutedForeground}
                        value={classStart}
                        onChangeText={setClassStart}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[modalStyles.label, { color: colors.mutedForeground }]}>End Time</Text>
                      <TextInput
                        style={[modalStyles.field, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                        placeholder="10:00 AM"
                        placeholderTextColor={colors.mutedForeground}
                        value={classEnd}
                        onChangeText={setClassEnd}
                      />
                    </View>
                  </View>

                  <Text style={[modalStyles.label, { color: colors.mutedForeground }]}>Venue</Text>
                  <View style={modalStyles.catRow}>
                    {VENUE_OPTIONS.map((v) => (
                      <TouchableOpacity
                        key={v}
                        style={[modalStyles.catChoice, { backgroundColor: classVenue === v ? colors.primary : colors.muted, borderColor: classVenue === v ? colors.primary : colors.border }]}
                        onPress={() => setClassVenue(v)}
                        activeOpacity={0.8}
                      >
                        <Text style={[modalStyles.catChoiceText, { color: classVenue === v ? "#fff" : colors.mutedForeground }]}>{v}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[modalStyles.submitBtn, { backgroundColor: "#7C3AED" }]}
                    onPress={handleCreateClass}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="school-outline" size={18} color="#fff" />
                    <Text style={modalStyles.submitText}>Schedule Class</Text>
                  </TouchableOpacity>
                </>
              )}
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
  createBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8,
  },
  createBtnText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#7C3AED" },
  tabBar: { flexDirection: "row", gap: 8 },
  tabBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)" },
  tabBtnActive: { backgroundColor: "rgba(255,255,255,0.95)" },
  tabBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.7)" },
  tabBtnTextActive: { color: "#7C3AED" },
  content: { padding: 16, gap: 12 },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  eventCard: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 10 },
  catTag: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, alignSelf: "flex-start" },
  catText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  eventTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  eventMeta: { gap: 4 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  description: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  classCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 8 },
  classStatus: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  classDot: { width: 6, height: 6, borderRadius: 3 },
  classStatusText: { fontSize: 11, fontFamily: "Inter_600SemiBold", textTransform: "capitalize" },
  courseCode: { fontSize: 13, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  courseName: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  classMeta: { gap: 4 },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, maxHeight: "92%" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  modeRow: { flexDirection: "row", gap: 10, marginBottom: 8 },
  modeBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 12, backgroundColor: "#F1F5F9" },
  modeBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  label: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginBottom: 6, marginTop: 14 },
  hint: { fontFamily: "Inter_400Regular", fontSize: 10 },
  field: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontFamily: "Inter_400Regular" },
  row: { flexDirection: "row", gap: 12 },
  catRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catChoice: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  catChoiceText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  smallChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  smallChipText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 15, marginTop: 20, marginBottom: 12 },
  submitText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
});
