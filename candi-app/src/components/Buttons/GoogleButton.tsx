import { useEffect } from "react";
import { Button, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import { loginWithGoogle } from "services/authService";
import { jwtDecode } from "jwt-decode";

WebBrowser.maybeCompleteAuthSession();

interface GoogleJwtPayload {
  email: string;
  name: string;
  picture: string;
}

export default function GoogleOAuth() {
  const router = useRouter();
  
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: "487323215427-tuo456mbbkleof618do22bkt7f7fk0ug.apps.googleusercontent.com",
    // For iOS, add iosClientId
    // For Android, add androidClientId
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      handleGoogleSuccess(id_token);
    }
  }, [response]);

  const handleGoogleSuccess = async (idToken: string) => {
    try {
      const decoded = jwtDecode<GoogleJwtPayload>(idToken);
      console.log("Google user:", decoded);

      const data = await loginWithGoogle(decoded);
      console.log("Login Google bem-sucedido:", data);

      router.push("/screens/(tabs)/home");
    } catch (error) {
      console.error("Erro no login Google:", error);
    }
  };

  return (
    <View>
      <Button
        disabled={!request}
        title="Login com Google"
        onPress={() => promptAsync()}
      />
    </View>
  );
}