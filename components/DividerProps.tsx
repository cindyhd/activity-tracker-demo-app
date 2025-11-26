import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface DividerProps {
  text?: string;
}

export const LoginDivider: React.FC<DividerProps> = ({ text = "or" }) => {
  return (
    <View style={styles.dividerContainer}>
      <View style={styles.line} />
      <Text style={styles.dividerText}>{text}</Text>
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#D3D3D3",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#888",
    fontSize: 14,
    fontWeight: "500",
  },
});
