import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import Svg, {
  Circle,
  Rect,
  Path,
  G,
  Line,
  Ellipse,
} from "react-native-svg";

export default function EmptyClassesIllustration({ size = 160 }: { size?: number }) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -10, duration: 1800, useNativeDriver: false }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1800, useNativeDriver: false }),
      ])
    ).start();

    const stagger = (anim: Animated.Value, delay: number) => {
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: false }),
            Animated.timing(anim, { toValue: 0.2, duration: 900, useNativeDriver: false }),
          ])
        ).start();
      }, delay);
    };
    stagger(dot1Anim, 0);
    stagger(dot2Anim, 300);
    stagger(dot3Anim, 600);
  }, []);

  const s = size;

  return (
    <View style={{ width: s, height: s, alignItems: "center", justifyContent: "center" }}>
      {/* Floating sparkle dots */}
      <Animated.View
        style={{
          position: "absolute", top: s * 0.08, left: s * 0.12,
          width: 8, height: 8, borderRadius: 4,
          backgroundColor: "#C4B5FD",
          opacity: dot1Anim,
          transform: [{ scale: dot1Anim }],
        }}
      />
      <Animated.View
        style={{
          position: "absolute", top: s * 0.15, right: s * 0.1,
          width: 6, height: 6, borderRadius: 3,
          backgroundColor: "#F59E0B",
          opacity: dot2Anim,
          transform: [{ scale: dot2Anim }],
        }}
      />
      <Animated.View
        style={{
          position: "absolute", bottom: s * 0.18, left: s * 0.08,
          width: 5, height: 5, borderRadius: 2.5,
          backgroundColor: "#A78BFA",
          opacity: dot3Anim,
          transform: [{ scale: dot3Anim }],
        }}
      />

      {/* Floating main illustration */}
      <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
        <Svg width={s * 0.72} height={s * 0.72} viewBox="0 0 120 120">
          {/* Shadow ellipse */}
          <Ellipse cx="60" cy="108" rx="28" ry="6" fill="rgba(124,58,237,0.10)" />

          {/* Calendar body */}
          <Rect x="14" y="22" width="92" height="80" rx="12" ry="12" fill="#EDE9FE" />
          <Rect x="14" y="22" width="92" height="28" rx="12" ry="12" fill="#7C3AED" />
          {/* Clip the bottom corners of header */}
          <Rect x="14" y="38" width="92" height="12" fill="#7C3AED" />

          {/* Ring clips on header */}
          <Rect x="35" y="14" width="10" height="18" rx="5" ry="5" fill="#5B21B6" />
          <Rect x="75" y="14" width="10" height="18" rx="5" ry="5" fill="#5B21B6" />

          {/* Month dots on header */}
          <Circle cx="45" cy="33" r="3" fill="rgba(255,255,255,0.5)" />
          <Circle cx="60" cy="33" r="3" fill="rgba(255,255,255,0.9)" />
          <Circle cx="75" cy="33" r="3" fill="rgba(255,255,255,0.5)" />

          {/* Day grid - row 1 */}
          <Circle cx="34" cy="62" r="5" fill="#DDD6FE" />
          <Circle cx="52" cy="62" r="5" fill="#DDD6FE" />
          <Circle cx="70" cy="62" r="5" fill="#DDD6FE" />
          <Circle cx="88" cy="62" r="5" fill="#DDD6FE" />

          {/* Day grid - row 2 */}
          <Circle cx="34" cy="80" r="5" fill="#DDD6FE" />
          <Circle cx="52" cy="80" r="5" fill="#DDD6FE" />

          {/* Highlighted "free day" circle */}
          <Circle cx="70" cy="80" r="9" fill="#7C3AED" />
          <Path
            d="M65 80 L68 83 L75 76"
            stroke="#fff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          <Circle cx="88" cy="80" r="5" fill="#DDD6FE" />

          {/* Day grid - row 3 */}
          <Circle cx="34" cy="98" r="5" fill="#DDD6FE" />
          <Circle cx="52" cy="98" r="5" fill="#EDE9FE" />
        </Svg>
      </Animated.View>
    </View>
  );
}
