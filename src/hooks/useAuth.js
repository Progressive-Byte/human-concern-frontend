// Re-export from AuthContext so existing imports of this hook keep working.
// All auth state (user, loading, isAuthenticated, login, register, logout)
// now comes from the global AuthProvider in the root layout.
export { useAuth as default, useAuth } from "@/context/AuthContext";
