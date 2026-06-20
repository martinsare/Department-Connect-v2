import React, { useState } from "react";
import {
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
import { useData, type EventCategory } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

const CATEGORY_META: Record<EventCategory, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  lecture: { label: "Lecture", color: "#3B82F6", icon: "school-outline" },
  big_event: { label: "Big Event", color: "#F59E0B", icon: "megaphone-outline" },
  small_event: { label: "Small Event", color: "#8B5CF6", icon: "people-circle-outline" },
  extra: { label: "Extra", color: "#10B981", icon: "receipt-outline" },
};

export default function EventsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { events } = useData();
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCat, setNewCat] = useState<EventCategory>("big_event");
  const [newDate, setNewDate] = useState("");
  const [newVenue, setNewVenue] = useState("");

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const upcoming = [...events].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={["#0D2B7E", "#1B4FD8"]}
        style={[styles.header, { paddingTop: topPad + 20 }]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Events</Text>
            <Text style={styles.subtitle}>{upcoming.length} upcoming</Text>
          </View>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowCreate(true);
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={20} color="#1B4FD8" />
            <Text style={styles.createBtnText}>Create</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 84 : 90) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {upcoming.map((ev) => {
          const meta = CATEGORY_META[ev.category];
          return (
            <View key={ev.id} style={[styles.eventCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
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
              <Text style={[styles.description, { color: colors.mutedForeground }]} numberOfLines={2}>
                {ev.description}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      <Modal visible={showCreate} transparent animationType="slide" onRequestClose={() => setShowCreate(false)}>
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Create Event</Text>
              <TouchableOpacity onPress={() => setShowCreate(false)}>
                <Ionicons name="close" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Event Title</Text>
            <TextInput
              style={[styles.field, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
              placeholder="e.g. Departmental Week"
              placeholderTextColor={colors.mutedForeground}
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Category</Text>
            <View style={styles.catRow}>
              {(Object.entries(CATEGORY_META) as [EventCategory, typeof CATEGORY_META[EventCategory]][]).map(([key, meta]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.catChoice,
                    {
                      backgroundColor: newCat === key ? meta.color : colors.muted,
                      borderColor: newCat === key ? meta.color : colors.border,
                    },
                  ]}
                  onPress={() => setNewCat(key)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.catChoiceText, { color: newCat === key ? "#fff" : colors.mutedForeground }]}>
                    {meta.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Date (YYYY-MM-DD)</Text>
            <TextInput
              style={[styles.field, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
              placeholder="e.g. 2026-07-15"
              placeholderTextColor={colors.mutedForeground}
              value={newDate}
              onChangeText={setNewDate}
            />

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Venue</Text>
            <TextInput
              style={[styles.field, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
              placeholder="e.g. Faculty Building"
              placeholderTextColor={colors.mutedForeground}
              value={newVenue}
              onChangeText={setNewVenue}
            />

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.primary }]}
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setShowCreate(false);
                setNewTitle("");
                setNewDate("");
                setNewVenue("");
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.submitText}>Create Event</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#fff" },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.65)", marginTop: 2 },
  createBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8,
  },
  createBtnText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#1B4FD8" },
  content: { padding: 16, gap: 12 },
  eventCard: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 10 },
  catTag: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, alignSelf: "flex-start" },
  catText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  eventTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  eventMeta: { gap: 4 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  description: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modal: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  fieldLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginBottom: 8, marginTop: 12 },
  field: { borderRadius: 12, borderWidth: 1, padding: 12, fontSize: 14, fontFamily: "Inter_400Regular" },
  catRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catChoice: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  catChoiceText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  submitBtn: { borderRadius: 14, paddingVertical: 15, alignItems: "center", marginTop: 20 },
  submitText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
});
