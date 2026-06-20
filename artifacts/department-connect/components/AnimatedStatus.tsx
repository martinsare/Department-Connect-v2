import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/* ─── Pending ─────────────────────────────────────────────── */
export function PendingAnimation() {
  const scale1 = useRef(new Animated.Value(0.6)).current;
  const scale2 = useRef(new Animated.Value(0.6)).current;
  const scale3 = useRef(new Animated.Value(0.6)).current;
  const opacity1 = useRef(new Animated.Value(0.8)).current;
  const opacity2 = useRef(new Animated.Value(0.4)).current;
  const opacity3 = useRef(new Animated.Value(0.15)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(iconScale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: false }).start();
    Animated.timing(iconOpacity, { toValue: 1, duration: 400, useNativeDriver: false }).start();

    const pulse = (scale: Animated.Value, opacity: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(scale, { toValue: 1, duration: 900, useNativeDriver: false }),
            Animated.timing(opacity, { toValue: 0, duration: 900, useNativeDriver: false }),
          ]),
          Animated.parallel([
            Animated.timing(scale, { toValue: 0.6, duration: 0, useNativeDriver: false }),
            Animated.timing(opacity, { toValue: 0.8, duration: 0, useNativeDriver: false }),
          ]),
        ])
      ).start();

    pulse(scale1, opacity1, 0);
    pulse(scale2, opacity2, 280);
    pulse(scale3, opacity3, 560);

    Animated.loop(
      Animated.timing(rotate, { toValue: 1, duration: 2400, useNativeDriver: false })
    ).start();
  }, []);

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <View style={s.container}>
      <Animated.View style={[s.ring, s.ring3, { transform: [{ scale: scale3 }], opacity: opacity3, borderColor: "#F59E0B" }]} />
      <Animated.View style={[s.ring, s.ring2, { transform: [{ scale: scale2 }], opacity: opacity2, borderColor: "#F59E0B" }]} />
      <Animated.View style={[s.ring, s.ring1, { transform: [{ scale: scale1 }], opacity: opacity1, borderColor: "#F59E0B" }]} />
      <Animated.View style={[s.iconBg, { backgroundColor: "#FEF3C7", transform: [{ scale: iconScale }], opacity: iconOpacity }]}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Ionicons name="hourglass-outline" size={52} color="#F59E0B" />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

/* ─── Success ─────────────────────────────────────────────── */
export function SuccessAnimation() {
  const scale = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const ring1 = useRef(new Animated.Value(0.4)).current;
  const ring1Op = useRef(new Animated.Value(0.8)).current;
  const ring2 = useRef(new Animated.Value(0.4)).current;
  const ring2Op = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1, tension: 65, friction: 6, useNativeDriver: false }),
      Animated.spring(iconScale, { toValue: 1, tension: 80, friction: 5, useNativeDriver: false }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ring1, { toValue: 1, duration: 1000, useNativeDriver: false }),
          Animated.timing(ring1Op, { toValue: 0, duration: 1000, useNativeDriver: false }),
        ]),
        Animated.parallel([
          Animated.timing(ring1, { toValue: 0.4, duration: 0, useNativeDriver: false }),
          Animated.timing(ring1Op, { toValue: 0.8, duration: 0, useNativeDriver: false }),
        ]),
      ])
    ).start();

    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(ring2, { toValue: 1, duration: 1000, useNativeDriver: false }),
            Animated.timing(ring2Op, { toValue: 0, duration: 1000, useNativeDriver: false }),
          ]),
          Animated.parallel([
            Animated.timing(ring2, { toValue: 0.4, duration: 0, useNativeDriver: false }),
            Animated.timing(ring2Op, { toValue: 0.5, duration: 0, useNativeDriver: false }),
          ]),
        ])
      ).start();
    }, 400);
  }, []);

  return (
    <View style={s.container}>
      <Animated.View style={[s.ring, s.ring3, { transform: [{ scale: ring2 }], opacity: ring2Op, borderColor: "#10B981" }]} />
      <Animated.View style={[s.ring, s.ring2, { transform: [{ scale: ring1 }], opacity: ring1Op, borderColor: "#10B981" }]} />
      <Animated.View style={[s.iconBg, { backgroundColor: "#D1FAE5", transform: [{ scale: scale }] }]}>
        <Animated.View style={{ transform: [{ scale: iconScale }] }}>
          <Ionicons name="checkmark-circle" size={60} color="#10B981" />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

/* ─── Rejected ────────────────────────────────────────────── */
export function RejectedAnimation() {
  const scale = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1, tension: 65, friction: 6, useNativeDriver: false }),
      Animated.spring(iconScale, { toValue: 1, tension: 80, friction: 5, useNativeDriver: false }),
      Animated.sequence([
        Animated.timing(shake, { toValue: 10, duration: 60, useNativeDriver: false }),
        Animated.timing(shake, { toValue: -10, duration: 60, useNativeDriver: false }),
        Animated.timing(shake, { toValue: 8, duration: 60, useNativeDriver: false }),
        Animated.timing(shake, { toValue: -8, duration: 60, useNativeDriver: false }),
        Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: false }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={s.container}>
      <Animated.View style={[s.iconBg, { backgroundColor: "#FEE2E2", transform: [{ scale: scale }, { translateX: shake }] }]}>
        <Animated.View style={{ transform: [{ scale: iconScale }] }}>
          <Ionicons name="close-circle" size={60} color="#EF4444" />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

/* ─── Styles ──────────────────────────────────────────────── */
const RING_SIZE = 140;
const s = StyleSheet.create({
  container: { width: RING_SIZE + 80, height: RING_SIZE + 80, alignItems: "center", justifyContent: "center" },
  ring: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 2,
  },
  ring1: { width: RING_SIZE, height: RING_SIZE },
  ring2: { width: RING_SIZE + 30, height: RING_SIZE + 30 },
  ring3: { width: RING_SIZE + 60, height: RING_SIZE + 60 },
  iconBg: {
    width: 100, height: 100, borderRadius: 50,
    alignItems: "center", justifyContent: "center",
  },
});
