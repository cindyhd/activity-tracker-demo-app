import { LoginDivider } from "@/components/DividerProps";
import SignInWithGoogleButton from "@/components/SignInWithGoogleButton";
import { ThemedText } from "@/components/ThemedText";
import { useGoogleSignIn } from "@/hooks/useGoogleSignIn";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Link } from "expo-router";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

GoogleSignin.configure({
  webClientId: "YOUR_WEB_CLIENT_ID",
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  offlineAccess: true,
  forceCodeForRefreshToken: true,
});

export default function Index() {
  const handleGoogleSignIn = useGoogleSignIn();
  const [email, setEmail] = useState<any>(null);
  const [password, setPassword] = useState<any>(null);
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#DCF2F1",
      }}
    >
      <View style={styles.contentContainer}>
        <View style={styles.titleContainer}>
          <ThemedText type="subtitle" style={styles.title}>
            Welcome to MoveMate
          </ThemedText>
          <ThemedText style={styles.description}>
            Your daily activity companion{"\n"}
          </ThemedText>
        </View>

        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#DDF6D2"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor="#DDF6D2"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => {}} activeOpacity={0.7}>
            <ThemedText style={styles.forgotText}>Forgot Password?</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.loginButton}
            activeOpacity={0.85}
            // onPress={handleLogin}
          >
            <ThemedText type="defaultSemiBold" darkColor="#000">
              Login
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <LoginDivider />
          <SignInWithGoogleButton onPress={handleGoogleSignIn} />
        </View>

        <Text style={styles.signupText}>
          Create an account?{" "}
          <Link href="/home" style={styles.linkText}>
            Sign Up
          </Link>
        </Text>
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
    gap: 30,
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    fontSize: 30,
  },
  inputWrapper: {
    width: "85%",
  },
  input: {
    width: "100%",
    height: 50,
    borderRadius: 8,
    backgroundColor: "#5A827E",
    paddingHorizontal: 18,
    color: "#eef1f6",
    marginBottom: 18,
  },
  forgotText: {
    color: "#84AE92",
    fontSize: 14,
    marginTop: 4,
    marginBottom: 18,
    textAlign: "right",
  },
  buttonContainer: {
    width: "85%",
    gap: 12,
    alignSelf: "center",
  },
  loginButton: {
    width: "100%",
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#84AE92",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  description: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  signupText: {
    color: "#84AE92",
    fontSize: 14,
  },
  linkText: {
    marginLeft: 20,
    color: "#5A827E",
    textDecorationLine: "underline",
    fontWeight: "600",
  },
});
