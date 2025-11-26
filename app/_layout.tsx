import * as Linking from "expo-linking";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    // Handle deep links
    const subscription = Linking.addEventListener("url", (event) => {
      // Parse the URL
      const { hostname, path } = Linking.parse(event.url);

      // If the path is 'auth', navigate to the auth page
      if (hostname === "auth" || path === "auth") {
        router.replace("/auth");
      }
    });

    return () => {
      subscription.remove();
    };
  }, [router]);
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" />
        <Stack screenOptions={{ headerShown: false }}>
          {/* Page without tab bar */}
          <Stack.Screen name="index" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="connectFitbit" />

          {/* Page with tab bar */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
