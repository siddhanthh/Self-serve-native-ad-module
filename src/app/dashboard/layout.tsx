import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { navConfig } from '@/config/nav';
import DashboardShell from '@/components/DashboardShell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Get user data from JWT
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  let userRole = 'viewer';
  let userEmail = 'Loading...';

  if (token) {
    const payload = await verifyToken(token);
    if (payload) {
      userRole = payload.role as string;
      userEmail = payload.email as string;
    }
  }

  // Extract the first letter of the email for the avatar
  const initial = userEmail !== 'Loading...' ? userEmail.charAt(0).toUpperCase() : 'U';

  // 2. Filter Nav items
  const allowedNavItems = navConfig.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <DashboardShell
      userEmail={userEmail}
      userRole={userRole}
      initial={initial}
      allowedNavItems={allowedNavItems}
    >
      {children}
    </DashboardShell>
  );
}