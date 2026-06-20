import React, { useEffect, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface SplashLoaderProps {
  onDone: () => void;
}

export default function SplashLoader({ onDone }: SplashLoaderProps) {
  const fillAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;
  const dotAnim1 = useRef(new Animated.Value(0.3)).current;
  const dotAnim2 = useRef(new Animated.Value(0.3)).current;
  const dotAnim3 = useRef(new Animated.Value(0.3)).current;

  const CIRCLE_SIZE = 130;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, { toValue: 1, duration: 1200, useNativeDriver: false, easing: Easing.inOut(Easing.quad) }),
        Animated.timing(waveAnim, { toValue: 0, duration: 1200, useNativeDriver: false, easing: Easing.inOut(Easing.quad) }),
      ])
    ).start();

    const dotDelay = 250;
    const dotDuration = 500;
    const pulseDot = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: dotDuration, useNativeDriver: false }),
          Animated.timing(anim, { toValue: 0.3, duration: dotDuration, useNativeDriver: false }),
        ])
      ).start();
    pulseDot(dotAnim1, 0);
    pulseDot(dotAnim2, dotDelay);
    pulseDot(dotAnim3, dotDelay * 2);

    Animated.timing(fillAnim, {
      toValue: 1,
      duration: 2400,
      delay: 300,
      useNativeDriver: false,
      easing: Easing.out(Easing.cubic),
    }).start(() => {
      setTimeout(() => {
        Animated.timing(fadeOut, {
          toValue: 0,
          duration: 350,
          useNativeDriver: false,
        }).start(onDone);
      }, 300);
    });
  }, []);

  const fillHeight = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, CIRCLE_SIZE],
  });

  const waveTopRadius = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [60, 30],
  });

  const waveTopRadiusRight = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 60],
  });

  return (
    <Animated.View style={[styles.root, { opacity: fadeOut }]}>
      <LinearGradient colors={["#0D0720", "#2D1B69", "#4C1D95"]} style={StyleSheet.absoluteFill} />

      <View style={styles.center}>
        <View style={[styles.circleOuter, { width: CIRCLE_SIZE + 16, height: CIRCLE_SIZE + 16, borderRadius: (CIRCLE_SIZE + 16) / 2 }]}>
          <View style={[styles.circle, { width: CIRCLE_SIZE, height: CIRCLE_SIZE, borderRadius: CIRCLE_SIZE / 2 }]}>
            <View style={[styles.circleInner, { width: CIRCLE_SIZE, height: CIRCLE_SIZE }]}>
              <Animated.View
                style={[
                  styles.liquidFill,
                  {
                    height: fillHeight,
                    borderTopLeftRadius: waveTopRadius,
                    borderTopRightRadius: waveTopRadiusRight,
                  },
                ]}
              />
              <Image
                source={require("../assets/images/icon.png")}
                style={[styles.icon, { width: CIRCLE_SIZE * 0.72, height: CIRCLE_SIZE * 0.72 }]}
                resizeMode="cover"
              />
            </View>
          </View>
        </View>

        <Text style={styles.appName}>Department Connect</Text>
        <Text style={styles.tagline}>Your Academic Community</Text>

        <View style={styles.dotsRow}>
          <Animated.View style={[styles.dot, { opacity: dotAnim1 }]} />
          <Animated.View style={[styles.dot, { opacity: dotAnim2 }]} />
          <Animated.View style={[styles.dot, { opacity: dotAnim3 }]} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  center: { alignItems: "center", gap: 0 },
  circleOuter: {
    backgroundColor: "rgba(124,58,237,0.25)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(167,139,250,0.4)",
    marginBottom: 28,
  },
  circle: {
    backgroundColor: "#F5F3FF",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  circleInner: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  liquidFill: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#7C3AED",
    zIndex: 1,
  },
  icon: {
    borderRadius: 18,
    zIndex: 2,
  },
  appName: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.55)",
    marginBottom: 36,
  },
  dotsRow: { flexDirection: "row", gap: 8 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#A78BFA",
  },
});
