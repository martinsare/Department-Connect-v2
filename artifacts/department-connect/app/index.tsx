import React, { useState } from "react";
import { View } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import SplashLoader from "@/components/SplashLoader";

export default function Index() {
  const { user, isLoading } = useAuth();
  const [splashDone, setSplashDone] = useState(false);

  const showSplash = !splashDone;

  if (showSplash) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0D0720" }}>
        <SplashLoader onDone={() => setSplashDone(true)} />
      </View>
    );
  }

  if (isLoading) return null;

  if (!user) return <Redirect href="/login" />;
  if (user.role === "student") return <Redirect href="/(student)/" />;
  if (user.role === "admin") return <Redirect href="/(admin)/" />;
  return <Redirect href="/(developer)/" />;
}
