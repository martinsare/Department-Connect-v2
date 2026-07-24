import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "cpu", selected: "cpu.fill" }} />
        <Label>System</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="users">
        <Icon sf={{ default: "person.2", selected: "person.2.fill" }} />
        <Label>Users</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="approvals">
        <Icon sf={{ default: "checkmark.seal", selected: "checkmark.seal.fill" }} />
        <Label>Approvals</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="logs">
        <Icon sf={{ default: "list.bullet.clipboard", selected: "list.bullet.clipboard.fill" }} />
        <Label>Logs</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="config">
        <Icon sf={{ default: "gearshape", selected: "gearshape.fill" }} />
        <Label>Config</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.card,
          borderTopWidth: 0,
          elevation: 0,
          paddingBottom: safeAreaInsets.bottom,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={80} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border }]} />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "System",
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView name={focused ? "cpu.fill" : "cpu"} tintColor={color} size={22} />
            ) : (
              <Ionicons name={focused ? "hardware-chip" : "hardware-chip-outline"} size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: "Users",
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView name={focused ? "person.2.fill" : "person.2"} tintColor={color} size={22} />
            ) : (
              <Ionicons name={focused ? "people" : "people-outline"} size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="approvals"
        options={{
          title: "Approvals",
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView name={focused ? "checkmark.seal.fill" : "checkmark.seal"} tintColor={color} size={22} />
            ) : (
              <Ionicons name={focused ? "shield-checkmark" : "shield-checkmark-outline"} size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="logs"
        options={{
          title: "Logs",
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView name={focused ? "list.bullet.clipboard.fill" : "list.bullet.clipboard"} tintColor={color} size={22} />
            ) : (
              <Ionicons name={focused ? "list" : "list-outline"} size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="config"
        options={{
          title: "Config",
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView name={focused ? "gearshape.fill" : "gearshape"} tintColor={color} size={22} />
            ) : (
              <Ionicons name={focused ? "settings" : "settings-outline"} size={22} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

export default function DeveloperTabLayout() {
  if (isLiquidGlassAvailable()) return <NativeTabLayout />;
  return <ClassicTabLayout />;
}
