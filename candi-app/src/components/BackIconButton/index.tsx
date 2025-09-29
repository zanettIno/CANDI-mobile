import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

type BackIconButtonProps = {
  color: string;
  bottom?: number;
  left?: number;
  onPress?: () => void;
};

export default function BackIconButton({
  color,
  bottom = 0,
  left = 0,
  onPress,
}: BackIconButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress ? onPress : () => router.back()}
      style={[styles.button, { bottom, left }]}
    >
      <MaterialIcons name="chevron-left" size={40} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
  },
});
