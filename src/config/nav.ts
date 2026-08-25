export type NavItem = {
  title: string;
  href: string;
  roles: string[]; // Which roles can see this link
};

export const navConfig: NavItem[] = [
  {
    title: 'Overview',
    href: '/dashboard',
    roles: ['admin', 'advertiser', 'viewer','superadmin'], // Everyone sees this
  },
  {
    title: 'Create campaign',
    href: '/dashboard/campaigns/new',
    roles: ['admin', 'advertiser','superadmin'],
  },
  {
    title: 'Approve campaigns',
    href: '/dashboard/moderation',
    roles: ['admin', 'superadmin'], 
  },
  {
    title: 'User Management',
    href: '/dashboard/users',
    roles: ['admin','superadmin'], // Only admins see this
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    roles: ['superadmin'],
  },
];