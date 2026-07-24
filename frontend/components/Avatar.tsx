import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import type { ViewStyle } from "react-native";

type AvatarProps = {
  uri?: string | null;
  initials: string;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
  onPress?: () => void;
  style?: ViewStyle;
  borderWidth?: number;
  borderColor?: string;
};

export function Avatar({
  uri,
  initials,
  size = 40,
  backgroundColor = "rgba(124,58,237,0.2)",
  textColor = "#7C3AED",
  onPress,
  style,
  borderWidth = 0,
  borderColor = "transparent",
}: AvatarProps) {
  const circleStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    overflow: "hidden",
    borderWidth,
    borderColor,
    ...style,
  };

  const inner = uri ? (
    <Image
      source={{ uri }}
      style={{ width: size, height: size }}
      resizeMode="cover"
    />
  ) : (
    <View
      style={{
        flex: 1,
        backgroundColor,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontSize: Math.round(size * 0.36),
          fontFamily: "Inter_700Bold",
          color: textColor,
        }}
      >
        {initials}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={circleStyle} onPress={onPress} activeOpacity={0.8}>
        {inner}
      </TouchableOpacity>
    );
  }
  return <View style={circleStyle}>{inner}</View>;
}
