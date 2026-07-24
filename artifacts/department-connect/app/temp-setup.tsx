/**
 * TEMPORARY PAGE — DELETE AFTER CREATING YOUR SUPERADMIN ACCOUNT
 * Access at: /temp-setup
 */
import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, Alert,
} from "react-native";
import { api } from "@/utils/apiClient";

export default function TempSetup() {
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [staffId, setStaffId] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!firstName || !surname || !password) {
      Alert.alert("Error", "First name, surname and password are required.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post<any>("/api/auth/register", {
        role: "developer",
        first_name: firstName.trim(),
        surname: surname.trim(),
        staff_id: staffId.trim() || undefined,
        department: department.trim() || "Administration",
        password,
        status: "active",
      });

      setResult(`✅ Superadmin created!\n\nLogin with:\n  Surname: ${surname.trim()}\n  Password: ${password}\n\nDelete this page now.`);
    } catch (e: any) {
      setResult(`❌ ${e?.message ?? "Something went wrong"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={s.container}>
      <View style={s.warning}>
        <Text style={s.warningText}>⚠️ TEMP PAGE — DELETE AFTER USE</Text>
      </View>

      <Text style={s.title}>Create Superadmin</Text>
      <Text style={s.sub}>This creates a Developer-role account with active status.</Text>

      {[
        { label: "First Name *", value: firstName, set: setFirstName, placeholder: "e.g. Sare" },
        { label: "Surname *", value: surname, set: setSurname, placeholder: "e.g. Martins" },
        { label: "Staff ID", value: staffId, set: setStaffId, placeholder: "e.g. STF001" },
        { label: "Department", value: department, set: setDepartment, placeholder: "e.g. Computer Science" },
        { label: "Password *", value: password, set: setPassword, placeholder: "Min. 6 characters", secure: true },
      ].map(({ label, value, set, placeholder, secure }: any) => (
        <View key={label} style={s.field}>
          <Text style={s.label}>{label}</Text>
          <TextInput
            style={s.input}
            value={value}
            onChangeText={set}
            placeholder={placeholder}
            secureTextEntry={secure}
            autoCapitalize="none"
          />
        </View>
      ))}

      <TouchableOpacity style={s.btn} onPress={handleCreate} disabled={loading} activeOpacity={0.85}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Create Superadmin</Text>}
      </TouchableOpacity>

      {result && (
        <View style={[s.resultBox, result.startsWith("✅") ? s.success : s.error]}>
          <Text style={s.resultText}>{result}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { padding: 24, paddingTop: 60, backgroundColor: "#F8FAFC", flexGrow: 1 },
  warning: { backgroundColor: "#FEF3C7", borderRadius: 10, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: "#F59E0B" },
  warningText: { color: "#92400E", fontWeight: "700", textAlign: "center", fontSize: 13 },
  title: { fontSize: 26, fontWeight: "800", color: "#1E1B4B", marginBottom: 6 },
  sub: { fontSize: 13, color: "#64748B", marginBottom: 28 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 },
  input: { backgroundColor: "#fff", borderWidth: 1.5, borderColor: "#E2E8F0", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#1E1B4B" },
  btn: { backgroundColor: "#7C3AED", borderRadius: 12, paddingVertical: 15, alignItems: "center", marginTop: 8 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  resultBox: { marginTop: 20, borderRadius: 12, padding: 16, borderWidth: 1 },
  success: { backgroundColor: "#F0FDF4", borderColor: "#86EFAC" },
  error: { backgroundColor: "#FEF2F2", borderColor: "#FCA5A5" },
  resultText: { fontSize: 14, lineHeight: 22, color: "#1E1B4B" },
});
