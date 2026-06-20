import React from "react";
import { StyleSheet, Text, View } from "react-native";
import LottieView from "lottie-react-native";

interface Props {
  message?: string;
  subMessage?: string;
}

export function LottieEmpty({
  message = "Nothing here yet",
  subMessage,
}: Props) {
  return (
    <View style={s.container}>
      <LottieView
        source={require("../assets/animations/empty.json")}
        autoPlay
        loop
        style={s.lottie}
      />
      <Text style={s.message}>{message}</Text>
      {subMessage ? <Text style={s.subMessage}>{subMessage}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 56,
    paddingHorizontal: 32,
  },
  lottie: {
    width: 200,
    height: 160,
  },
  message: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 8,
  },
  subMessage: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
  },
});
