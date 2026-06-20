import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const ONBOARDING_KEY = "dc_onboarding_done";

const SLIDES = [
  {
    image: require("../assets/images/onboard1.webp"),
    title: "Welcome to\nDepartment Connect",
    subtitle: "Your all-in-one academic management platform. Stay connected with your department community.",
    accent: "#7C3AED",
  },
  {
    image: require("../assets/images/onboard2.webp"),
    title: "Track Classes\n& Attendance",
    subtitle: "Never miss a class. Scan QR codes for instant attendance, view your records anytime.",
    accent: "#6D28D9",
  },
  {
    image: require("../assets/images/onboard3.webp"),
    title: "Stay Updated\nInstantly",
    subtitle: "Get real-time announcements, event notifications, and important updates from your department.",
    accent: "#5B21B6",
  },
  {
    image: require("../assets/images/onboard4.webp"),
    title: "Your Academic\nCommunity",
    subtitle: "Connect with classmates, access resources, and manage contributions — all in one place.",
    accent: "#4C1D95",
  },
];

const ILLUS_HEIGHT = SCREEN_H * 0.50;
const BOTTOM_HEIGHT = SCREEN_H - ILLUS_HEIGHT;

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const botPad = insets.bottom + 20;

  const goToSlide = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 100, useNativeDriver: false }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: false }),
    ]).start();
    scrollRef.current?.scrollTo({ x: index * SCREEN_W, animated: true });
    setActiveIndex(index);
  };

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) goToSlide(activeIndex + 1);
    else handleGetStarted();
  };

  const handleGetStarted = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    router.replace("/login");
  };

  const handleScroll = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    if (idx !== activeIndex) setActiveIndex(idx);
  };

  const slide = SLIDES[activeIndex];
  const isLast = activeIndex === SLIDES.length - 1;

  return (
    <View style={styles.root}>
      {/* Purple gradient — top illustration zone */}
      <LinearGradient
        colors={["#0D0720", "#2D1B69", "#4C1D95"]}
        style={[styles.purpleZone, { paddingTop: topPad }]}
      >
        {/* Skip */}
        <View style={styles.topBar}>
          <View />
          {!isLast && (
            <TouchableOpacity onPress={handleGetStarted} style={styles.skipBtn} activeOpacity={0.7}>
              <Text style={styles.skipText}>Skip</Text>
              <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          )}
        </View>

        {/* Illustrations */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
          style={styles.illustrationScroll}
          contentContainerStyle={{ alignItems: "center" }}
        >
          {SLIDES.map((s, i) => (
            <View key={i} style={styles.illustrationSlide}>
              <Image source={s.image} style={styles.illustration} resizeMode="contain" />
            </View>
          ))}
        </ScrollView>
      </LinearGradient>

      {/* White bottom panel */}
      <Animated.View style={[styles.whitePanel, { paddingBottom: botPad, opacity: fadeAnim }]}>
        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => goToSlide(i)} activeOpacity={0.7}>
              <View style={[styles.dot, i === activeIndex && styles.dotActive]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Title */}
        <Text style={styles.title}>{slide.title}</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>{slide.subtitle}</Text>

        {/* Next / Get Started */}
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: slide.accent }]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          {isLast ? (
            <>
              <Ionicons name="rocket-outline" size={18} color="#fff" />
              <Text style={styles.nextBtnText}>Get Started</Text>
            </>
          ) : (
            <>
              <Text style={styles.nextBtnText}>Next</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>

        {/* Sign in link */}
        {isLast && (
          <TouchableOpacity
            onPress={() => router.push("/login")}
            style={styles.signinLink}
            activeOpacity={0.7}
          >
            <Text style={styles.signinLinkText}>Already have an account? </Text>
            <Text style={styles.signinLinkAccent}>Sign In</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },

  /* Purple top zone */
  purpleZone: {
    height: ILLUS_HEIGHT,
  },
  topBar: {
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  skipBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  skipText: {
    color: "rgba(255,255,255,0.8)",
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  illustrationScroll: { flex: 1, flexGrow: 0 },
  illustrationSlide: {
    width: SCREEN_W,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  illustration: {
    width: SCREEN_W * 0.82,
    height: "100%",
  },

  /* White bottom panel */
  whitePanel: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 24,
    marginTop: -28,
    boxShadow: "0px -4px 20px rgba(45,27,105,0.12)",
    elevation: 8,
  },

  /* Dots */
  dots: { flexDirection: "row", gap: 8, marginBottom: 16 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E2E8F0",
  },
  dotActive: {
    width: 28,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#7C3AED",
  },

  /* Text */
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#0F172A",
    lineHeight: 36,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#64748B",
    lineHeight: 22,
    marginBottom: 24,
  },

  /* Button */
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 14,
    boxShadow: "0px 6px 18px rgba(124,58,237,0.35)",
    elevation: 6,
  },
  nextBtnText: { color: "#fff", fontSize: 17, fontFamily: "Inter_700Bold" },

  /* Sign in */
  signinLink: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signinLinkText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#94A3B8",
  },
  signinLinkAccent: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: "#7C3AED",
  },
});

export { ONBOARDING_KEY };
