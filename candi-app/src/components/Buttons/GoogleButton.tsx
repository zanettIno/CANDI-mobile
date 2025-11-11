import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "expo-router";
import { loginWithGoogle } from "services/authService";

interface GoogleJwtPayload {
  email: string;
  name: string;
  picture: string;
}

export default function GoogleOAuth() {
  const router = useRouter();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      if (!credentialResponse.credential) {
        console.error("Token do Google não encontrado.");
        return;
      }

      const decoded = jwtDecode<GoogleJwtPayload>(credentialResponse.credential);
      console.log("Google user:", decoded);

      const data = await loginWithGoogle(decoded);
      console.log("Login Google bem-sucedido:", data);

      router.push("/screens/(tabs)/home"); // ✅ Redireciona após login Google
    } catch (error) {
      console.error("Erro no login Google:", error);
    }
  };

  return (
    <GoogleOAuthProvider clientId="487323215427-tuo456mbbkleof618do22bkt7f7fk0ug.apps.googleusercontent.com">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => console.log("Falha no login Google")}
      />
    </GoogleOAuthProvider>
  );
}
