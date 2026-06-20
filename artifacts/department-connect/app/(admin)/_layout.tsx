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
        <Icon sf={{ default: "rectangle.grid.2x2", selected: "rectangle.grid.2x2.fill" }} />
        <Label>Dashboard</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="classes">
        <Icon sf={{ default: "qrcode", selected: "qrcode" }} />
        <Label>Classes</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="students">
        <Icon sf={{ default: "person.3", selected: "person.3.fill" }} />
        <Label>Students</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="approvals">
        <Icon sf={{ default: "checkmark.seal", selected: "checkmark.seal.fill" }} />
        <Label>Approvals</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="events">
        <Icon sf={{ default: "calendar.badge.plus", selected: "calendar.badge.plus" }} />
        <Label>Events</Label>
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
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView name={focused ? "rectangle.grid.2x2.fill" : "rectangle.grid.2x2"} tintColor={color} size={22} />
            ) : (
              <Ionicons name={focused ? "grid" : "grid-outline"} size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="classes"
        options={{
          title: "Classes",
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView name="qrcode" tintColor={color} size={22} />
            ) : (
              <Ionicons name={focused ? "qr-code" : "qr-code-outline"} size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="students"
        options={{
          title: "Students",
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView name={focused ? "person.3.fill" : "person.3"} tintColor={color} size={22} />
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
              <Ionicons name={focused ? "checkmark-done-circle" : "checkmark-done-circle-outline"} size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: "Events",
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView name="calendar.badge.plus" tintColor={color} size={22} />
            ) : (
              <Ionicons name={focused ? "calendar" : "calendar-outline"} size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen name="analytics" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
    </Tabs>
  );
}

export default function AdminTabLayout() {
  if (isLiquidGlassAvailable()) return <NativeTabLayout />;
  return <ClassicTabLayout />;
}
