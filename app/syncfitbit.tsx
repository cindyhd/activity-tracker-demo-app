import { ThemedText } from "@/components/ThemedText";
import { Button, StyleSheet, View } from "react-native";

export default function SyncFitbit() {
  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Sync with Fitbit
      </ThemedText>
      <View style={styles.buttonContainer}>
        <Button title="Connect to Fitbit" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 32,
  },
  buttonContainer: {
    width: "75%",
  },
});
