import { ThemedText } from "@/components/ThemedText";
import { useAuthStore } from "@/store/auth.store";
import { useUIStore } from "@/store/ui.store";
import * as AuthSession from "expo-auth-session";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

const CLIENT_ID = "your client id";
const FITBIT_AUTH_URL = "https://www.fitbit.com/oauth2/authorize";
const FITBIT_TOKEN_URL = "https://api.fitbit.com/oauth2/token";

// use a cast to "any" so TypeScript doesn't complain about "useProxy" in some SDK types
const redirectUri = (AuthSession as any).makeRedirectUri({
  scheme: "healthsyncfitbit",
  path: "auth",
  // useProxy: true, // useProxy is used for development with Expo Go, then in html it will be onPress={() => promptAsync({ useProxy: true } as any)}
});

export default function ConnectFitbit() {
  const router = useRouter();

  // Auth store
  const { providerTokens, setProviderToken } = useAuthStore();
  const accessToken = providerTokens.fitbit?.accessToken;

  // UI store
  const { loading, setLoading, setError } = useUIStore();

  // Debug: cek redirect URI
  React.useEffect(() => {
    console.log("Redirect URI yang digunakan:", redirectUri);
  }, []);

  // Monitor accessToken changes and log
  React.useEffect(() => {
    console.log("Current accessToken:", accessToken);
  }, [accessToken]);

  // Setup AuthRequest
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: ["activity", "heartrate", "sleep", "profile"],
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
    },
    { authorizationEndpoint: FITBIT_AUTH_URL }
  );

  // Log OAuth URL saat request ready
  React.useEffect(() => {
    if (request) {
      console.log("Request:", request);
      console.log("Full OAuth URL:", request.url);
      console.log("Redirect URI:", redirectUri);
    }
  }, [request]);

  // Handle response errors dan cancel
  useEffect(() => {
    if (response) {
      console.log("Response type:", response.type);

      if (response.type === "error") {
        console.error("Auth Error:", response.error);
        setError("auth", response.error?.message || "Unknown error");
        Alert.alert(
          "Auth Error",
          response.error?.message || "Unknown error occurred"
        );
        setLoading("auth", false);
      } else if (response.type === "cancel") {
        console.log("Auth cancelled by user");
        setLoading("auth", false);
      }
    }
  }, [response, setError, setLoading]);

  // Exchange the code for an access token
  useEffect(() => {
    const exchangeToken = async () => {
      if (response?.type === "success" && response.params.code) {
        try {
          setLoading("auth", true);
          const code = response.params.code;
          console.log("Authorization Code:", code);

          const body = new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: "027cb24e2f79f0073e08b1c1b9946c79",
            grant_type: "authorization_code",
            redirect_uri: redirectUri,
            code,
            code_verifier: request?.codeVerifier || "",
          }).toString();

          const res = await fetch(FITBIT_TOKEN_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body,
          });

          const json = await res.json();
          console.log("Token response:", json);

          if (json.access_token) {
            console.log("Setting access token:", json.access_token);
            // Save tokens in the auth store
            setProviderToken("fitbit", {
              accessToken: json.access_token,
              refreshToken: json.refresh_token,
              expiresAt: Date.now() + json.expires_in * 1000,
            });
            Alert.alert("Fitbit has been successfully connected!");
            console.log("masuk?");
            router.replace("/(tabs)/home");
            // router.replace("/home");
          } else {
            console.log("Failed to get access token:", json);
            setError("auth", JSON.stringify(json, null, 2));
            Alert.alert("Token exchange failed", JSON.stringify(json, null, 2));
          }
        } catch (e: any) {
          setError("auth", e.message);
          Alert.alert("Error", e.message);
        } finally {
          setLoading("auth", false);
        }
      }
    };

    exchangeToken();
  }, [response, request?.codeVerifier, setProviderToken, setLoading, setError]);

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
          <ThemedText type="subtitle" style={styles.description}>
            You need to connect your Fitbit account first {"\n"}
            to display your daily activity data.{"\n"}
          </ThemedText>
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            onPress={() => promptAsync()}
            disabled={!request || loading.auth}
          >
            <View
              style={{
                width: "100%",
                height: 44,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 8,
                backgroundColor: "#3B9797",
              }}
            >
              <ThemedText type="defaultSemiBold" lightColor="#fff">
                Connect with Fitbit
              </ThemedText>
            </View>
          </Pressable>
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
  buttonContainer: {
    width: "75%",
    gap: 12,
    alignSelf: "center",
  },
  description: {
    textAlign: "center",
    fontSize: 18,
    lineHeight: 24,
  },
});
