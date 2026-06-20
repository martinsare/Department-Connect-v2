import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/context/AuthContext";
import SplashLoader from "@/components/SplashLoader";
import { ONBOARDING_KEY } from "./onboarding";

export default function Index() {
  const { user, isLoading } = useAuth();
  const [splashDone, setSplashDone] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((val) => {
      setOnboardingDone(!!val);
      setOnboardingChecked(true);
    });
  }, []);

  if (!splashDone) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0D0720" }}>
        <SplashLoader onDone={() => setSplashDone(true)} />
      </View>
    );
  }

  if (isLoading || !onboardingChecked) return null;

  if (!onboardingDone && !user) return <Redirect href="/onboarding" />;

  if (!user) return <Redirect href="/login" />;
  if (user.role === "student") return <Redirect href="/(student)/" />;
  if (user.role === "admin") return <Redirect href="/(admin)/" />;
  return <Redirect href="/(developer)/" />;
}
