import SignInWithGoogleButton from "@/components/SignInWithGoogleButton";
import { ThemedText } from "@/components/ThemedText";
import { useGoogleSignIn } from "@/hooks/useGoogleSignIn";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { StatusBar, StyleSheet, View } from "react-native";

GoogleSignin.configure({
  webClientId: "YOUR_WEB_CLIENT_ID",
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  offlineAccess: true,
  forceCodeForRefreshToken: true,
});

export default function Index() {
  const handleSignIn = useGoogleSignIn();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <StatusBar barStyle="dark-content" />

      <View style={styles.contentContainer}>
        <View style={styles.titleContainer}>
          <ThemedText type="subtitle" style={styles.title}>
            Welcome to MoveMate
          </ThemedText>
          <ThemedText style={styles.description}>
            Your daily activity companion.{"\n"}
          </ThemedText>
        </View>

        <View style={styles.buttonContainer}>
          <SignInWithGoogleButton onPress={handleSignIn} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    alignItems: "center",
    gap: 12,
  },
  contentContainer: {
    width: "100%",
    gap: 32,
  },
  title: {
    textAlign: "center",
    fontSize: 30,
  },
  buttonContainer: {
    width: "75%",
    gap: 12,
    alignSelf: "center",
  },
  description: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
});
