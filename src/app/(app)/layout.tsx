import { requireApprovedUser } from "@/lib/guards";
import { AppShell } from "@/components/layout/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireApprovedUser();
  return <AppShell user={user}>{children}</AppShell>;
}
