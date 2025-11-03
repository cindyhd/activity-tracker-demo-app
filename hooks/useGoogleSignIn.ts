import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { router } from "expo-router";
import { useState } from "react";

interface UserState {
  userInfo: any | null;
}

export const useGoogleSignIn = () => {
  const [state, setState] = useState<UserState>({ userInfo: null });

  const handleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      console.log("RESPONSE", response);
      if (isSuccessResponse(response)) {
        setState({ userInfo: response.data });
        router.push("/syncfitbit");
      } else {
        // sign in was cancelled by user
      }
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            // operation (eg. sign in) already in progress
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            // Android only, play services not available or outdated
            break;
          default:
          // some other error happened
        }
      } else {
        // an error that's not related to google sign in occurred
      }
    }
  };

  return handleSignIn;
};
