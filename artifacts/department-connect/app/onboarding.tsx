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
import { ONBOARDING_STORAGE_KEY } from "@/data/seedData";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const ONBOARDING_KEY = ONBOARDING_STORAGE_KEY;

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

const ILLUS_H = SCREEN_H * 0.50;

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
    <View style={[styles.root, { paddingTop: topPad }]}>
      {/* Skip */}
      <View style={styles.topBar}>
        <View />
        {!isLast && (
          <TouchableOpacity onPress={handleGetStarted} style={styles.skipBtn} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip</Text>
            <Ionicons name="chevron-forward" size={13} color="#7C3AED" />
          </TouchableOpacity>
        )}
      </View>

      {/* Illustrations */}
      <View style={{ height: ILLUS_H }}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
          style={{ flex: 1 }}
        >
          {SLIDES.map((s, i) => (
            <View key={i} style={{ width: SCREEN_W, alignItems: "center", justifyContent: "center" }}>
              <Image source={s.image} style={styles.illustration} resizeMode="contain" />
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <Animated.View style={[styles.content, { paddingBottom: botPad, opacity: fadeAnim }]}>
        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => goToSlide(i)} activeOpacity={0.7}>
              <View style={[styles.dot, i === activeIndex && styles.dotActive]} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>

        <TouchableOpacity onPress={handleNext} activeOpacity={0.85} style={styles.nextBtnWrap}>
          <LinearGradient
            colors={[slide.accent, "#5B21B6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextBtn}
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
          </LinearGradient>
        </TouchableOpacity>

        {isLast && (
          <TouchableOpacity onPress={() => router.push("/login")} style={styles.signinLink} activeOpacity={0.7}>
            <Text style={styles.signinText}>Already have an account? </Text>
            <Text style={styles.signinAccent}>Sign In</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },

  topBar: {
    paddingHorizontal: 20,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 4,
  },
  skipBtn: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "#F3EEFF",
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1, borderColor: "#DDD6FE",
  },
  skipText: { color: "#7C3AED", fontFamily: "Inter_600SemiBold", fontSize: 13 },

  illustration: { width: SCREEN_W * 0.8, height: SCREEN_H * 0.42 },

  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 16,
  },

  dots: { flexDirection: "row", gap: 7, marginBottom: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#E2E8F0" },
  dotActive: { width: 28, height: 8, borderRadius: 4, backgroundColor: "#7C3AED" },

  title: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#1E1B4B", lineHeight: 36, marginBottom: 10 },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#64748B", lineHeight: 22, marginBottom: 24 },

  nextBtnWrap: { borderRadius: 16, overflow: "hidden", marginBottom: 14 },
  nextBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, paddingVertical: 16,
  },
  nextBtnText: { color: "#fff", fontSize: 17, fontFamily: "Inter_700Bold" },

  signinLink: { flexDirection: "row", justifyContent: "center" },
  signinText: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#94A3B8" },
  signinAccent: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#7C3AED" },
});

export { ONBOARDING_KEY };
