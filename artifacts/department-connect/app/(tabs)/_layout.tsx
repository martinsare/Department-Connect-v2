import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function TabsLayout() {
  const { user } = useAuth();
  if (!user) return <Redirect href="/login" />;
  if (user.role === "student") return <Redirect href="/(student)/" />;
  if (user.role === "admin") return <Redirect href="/(admin)/" />;
  return <Redirect href="/(developer)/" />;
}
