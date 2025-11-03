import { useActivityStore } from "@/store/activity.store";
import { useAuthStore } from "@/store/auth.store";
import { useUIStore } from "@/store/ui.store";
import * as AuthSession from "expo-auth-session";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const CLIENT_ID = "23TP8Y";
const FITBIT_AUTH_URL = "https://www.fitbit.com/oauth2/authorize";
const FITBIT_TOKEN_URL = "https://api.fitbit.com/oauth2/token";

const redirectUri = AuthSession.makeRedirectUri({
  scheme: "healthsyncfitbit", // bisa diganti sesuai app.json -> expo.scheme
});

export default function SyncFitbit() {
  // Auth store
  const { providerTokens, setProviderToken } = useAuthStore();
  const accessToken = providerTokens.fitbit?.accessToken;

  // Activity store
  const { setDailyData } = useActivityStore();

  // UI store
  const { loading, setLoading, setError } = useUIStore();

  // Local state
  const [fitbitData, setFitbitData] = useState<any>(null);
  const [activityData, setActivityData] = useState<any>(null);

  // 🔍 Debug: cek redirect URI (jalankan sekali saat mount untuk menghindari double log di StrictMode)
  React.useEffect(() => {
    console.log("👉 Redirect URI yang digunakan:", redirectUri);
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

  // Exchange the code for an access token
  useEffect(() => {
    const exchangeToken = async () => {
      if (response?.type === "success" && response.params.code) {
        try {
          setLoading("auth", true);
          const code = response.params.code;

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

  // Retrieve profile data
  const fetchFitbitData = async () => {
    if (!accessToken) {
      Alert.alert("Not logged in. Please connect your Fitbit first.");
      return;
    }

    setLoading("profile", true);
    try {
      const res = await fetch("https://api.fitbit.com/1/user/-/profile.json", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      setFitbitData(data);

      // Save profile data to the activity store
      const today = new Date().toISOString().split("T")[0];
      setDailyData(today, "fitbit", {
        profile: data.user,
      });
    } catch (e: any) {
      setError("profile", e.message);
      Alert.alert("Failed to retrieve data", e.message);
    } finally {
      setLoading("profile", false);
    }
  };

  // Get today's activity data
  const fetchActivityData = async () => {
    if (!accessToken) {
      Alert.alert("Not logged in. Please connect your Fitbit first.");
      return;
    }

    setLoading("activity", true);
    try {
      // Get today's activity data
      const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
      const res = await fetch(
        `https://api.fitbit.com/1/user/-/activities/date/${today}.json`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const data = await res.json();
      setActivityData(data);

      // Save profile data to the activity store
      setDailyData(today, "fitbit", {
        activities: data,
      });
    } catch (e: any) {
      setError("activity", e.message);
      Alert.alert("Gagal mengambil data aktivitas", e.message);
    } finally {
      setLoading("activity", false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
        Sync with Fitbit
      </Text>

      <Button
        title="Connect to Fitbit"
        onPress={() => promptAsync()}
        disabled={!request || loading.auth}
      />

      {accessToken && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ color: "green", marginBottom: 10 }}>
            Access Token berhasil diperoleh
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <Button
              title="Ambil Data Profil"
              onPress={fetchFitbitData}
              disabled={loading.profile}
            />
            <Button
              title="Ambil Data Aktivitas"
              onPress={fetchActivityData}
              disabled={loading.activity}
            />
          </View>
        </View>
      )}

      {(loading.auth || loading.profile || loading.activity) && (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      )}

      {fitbitData && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
            Data Profil:
          </Text>
          <Text selectable style={{ fontFamily: "monospace" }}>
            {JSON.stringify(fitbitData, null, 2)}
          </Text>
        </View>
      )}

      {activityData && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
            Data Aktivitas Hari Ini:
          </Text>
          <Text selectable style={{ fontFamily: "monospace" }}>
            {JSON.stringify(activityData, null, 2)}
          </Text>
        </View>
      )}
    </ScrollView>
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
