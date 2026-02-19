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
          className="w-7 h-7 rounded-full ring-1 ring-white/10"
        />
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {user.displayName}
        </span>
        <button
          onClick={logout}
          className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          Log out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={loginWithGoogle}
      className="px-4 py-2 rounded-lg bg-gray-900 dark:bg-white/10 text-white text-sm font-medium hover:bg-gray-700 hover:dark:bg-white/15"
    >
      Sign in with Google
    </button>
  );
};

export default LoginButton;
