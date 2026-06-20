import React from "react";
import { StyleSheet, View } from "react-native";
import LottieView from "lottie-react-native";

export function PendingAnimation() {
  return (
    <View style={s.container}>
      <LottieView
        source={require("../assets/animations/pending.json")}
        autoPlay
        loop
        style={s.lottie}
      />
    </View>
  );
}

export function SuccessAnimation() {
  return (
    <View style={s.container}>
      <LottieView
        source={require("../assets/animations/success.json")}
        autoPlay
        loop={false}
        style={s.lottie}
      />
    </View>
  );
}

export function RejectedAnimation() {
  return (
    <View style={s.container}>
      <LottieView
        source={require("../assets/animations/rejected.json")}
        autoPlay
        loop={false}
        style={s.lottie}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    width: 220,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
  },
  lottie: {
    width: 220,
    height: 220,
  },
});
