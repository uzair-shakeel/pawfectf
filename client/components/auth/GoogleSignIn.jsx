"use client";
import { useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../lib/auth/AuthContext";

const GoogleSignIn = ({
  onSuccess,
  onError,
  buttonText = "Continue with Google",
}) => {
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = useCallback(
    async (response) => {
      try {
        const result = await signInWithGoogle({
          idToken: response.credential,
        });

        if (result.success) {
          toast.success("Google Zalogowano pomyślnie!");
          onSuccess?.(result);
        } else {
          toast.error(result.error || "Google sign in failed");
          onError?.(result.error);
        }
      } catch (error) {
        console.error("Google sign in error:", error);
        toast.error("Google sign in failed");
        onError?.("Google sign in failed");
      }
    },
    [signInWithGoogle, onSuccess, onError]
  );

  useEffect(() => {
    // Load Google Identity Services
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleGoogleSignIn,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-button"),
          {
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "rectangular",
            width: "100%",
          }
        );
      }
    };

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [handleGoogleSignIn]);

  return (
    <div className="w-full">
      <div id="google-signin-button" className="w-full"></div>
    </div>
  );
};

export default GoogleSignIn;
