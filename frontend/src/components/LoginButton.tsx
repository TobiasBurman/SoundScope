import { loginWithGoogle, logout } from "../services/authService"
import { useAuth } from "../hooks/useAuth";

const LoginButton = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <img
          src={user.photoURL || ""}
          className="w-8 h-8 rounded-full"
        />
        <span className="text-sm text-gray-300">
          {user.displayName}
        </span>
        <button
          onClick={logout}
          className="text-sm text-gray-300 hover:text-white"
        >
          Log out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={loginWithGoogle}
      className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-gray-200"
    >
      Sign in with Google
    </button>
  );
};

export default LoginButton;
