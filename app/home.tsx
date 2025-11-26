import { ThemedText } from "@/components/ThemedText";
import { useActivityStore } from "@/store/activity.store";
import { useAuthStore } from "@/store/auth.store";
import { useUIStore } from "@/store/ui.store";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function Home() {
  // Auth store
  const { providerTokens } = useAuthStore();
  const accessToken = providerTokens.fitbit?.accessToken;

  // Activity store
  const { setDailyData } = useActivityStore();

  // UI store
  const { loading, setLoading, setError } = useUIStore();

  // Local state
  const [fitbitData, setFitbitData] = useState<any>(null);
  const [activityData, setActivityData] = useState<any>(null);

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
      console.log("profile data:", data);
      setFitbitData(data);

      // Save profile data to the activity store
      const today = new Date().toISOString().split("T")[0];
      setDailyData(today, "fitbit", {
        profile: data.user,
      });
    } catch (e: any) {
      setError("profile", e.message);
      Alert.alert("Failed to retrieve data.", e.message);
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
      console.log("activity data:", data);
      setActivityData(data);

      // Save profile data to the activity store
      setDailyData(today, "fitbit", {
        activities: data,
      });
    } catch (e: any) {
      setError("activity", e.message);
      Alert.alert("Failed to retrieve activity data.", e.message);
    } finally {
      setLoading("activity", false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#FFC4C4",
      }}
    >
      <View style={styles.contentContainer}>
        <View style={styles.titleContainer}>
          <ThemedText type="subtitle" style={styles.title}>
            Good day, {fitbitData ? fitbitData.user.displayName : "User"}!
          </ThemedText>
          <ThemedText style={styles.description}>
            Track your daily activity and stay healthy{"\n"}
          </ThemedText>
        </View>
      </View>
      <ScrollView>
        {accessToken && (
          <View style={{ marginTop: 20 }}>
            <Text style={{ color: "green", marginBottom: 10 }}>
              Access Token successfully obtained!
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                gap: 10,
              }}
            >
              <Button
                title="Fetch Profile Data"
                onPress={fetchFitbitData}
                disabled={loading.profile}
              />
              <Button
                title="Fetch Activity Data"
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
              Profile Data:
            </Text>
            <Text selectable style={{ fontFamily: "monospace" }}>
              {JSON.stringify(fitbitData, null, 2)}
            </Text>
          </View>
        )}

        {activityData && (
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
              Today&apos;s Activity Data:
            </Text>
            <Text selectable style={{ fontFamily: "monospace" }}>
              {JSON.stringify(activityData, null, 2)}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    alignItems: "flex-start",
    gap: 8,
    marginTop: 30,
    marginLeft: 16,
  },
  contentContainer: {
    width: "100%",
    gap: 32,
  },
  title: {
    textAlign: "center",
    fontSize: 30,
  },
  description: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
});
