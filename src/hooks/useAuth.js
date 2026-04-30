import { useState, useEffect } from "react";
import { account, OAuthProvider } from "../appwrite";
import { toast } from "sonner";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const loggedInUser = await account.get();
        setUser(loggedInUser);
      } catch (err) {
        setUser(null);
      } finally {
        setIsLoadingAuth(false);
      }
    };
    checkUser();
  }, []);

  const loginWithGoogle = () => {
    account.createOAuth2Session(
      OAuthProvider.Google,
      window.location.origin,
      window.location.origin
    );
  };

  const logout = async () => {
    try {
      await account.deleteSession("current");
      setUser(null);
      toast("Successfully logged out");
    } catch (err) {
      console.error("Logout failed", err);
      toast.error("Logout failed");
    }
  };

  return { user, setUser, loginWithGoogle, logout, isLoadingAuth };
};
