// Route Configuration for iKan PWA
// Defines public vs private routes and navigation behavior

export interface RouteConfig {
  path: string;
  label: string;
  isPublic: boolean;
  requiresAuth: boolean;
  showInNavigation: boolean;
  showInPublicNav: boolean;
  showInPrivateNav: boolean;
  icon?: string;
  description?: string;
}

export const routes: RouteConfig[] = [
  // Public Marketing Routes
  {
    path: '/',
    label: 'Home',
    isPublic: true,
    requiresAuth: false,
    showInNavigation: true,
    showInPublicNav: true,
    showInPrivateNav: false,
    icon: 'home',
    description: 'Welcome to iKan mental health platform'
  },
  {
    path: '/assessment',
    label: 'Assessment',
    isPublic: true,
    requiresAuth: false,
    showInNavigation: true,
    showInPublicNav: true,
    showInPrivateNav: true,
    icon: 'assignment',
    description: 'Browse all mental health assessments'
  },
  {
    path: '/equip',
    label: 'Equip',
    isPublic: true,
    requiresAuth: false,
    showInNavigation: true,
    showInPublicNav: true,
    showInPrivateNav: true,
    icon: 'tools',
    description: 'Browse all mental health programs'
  },
  {
    path: '/resource',
    label: 'Resource',
    isPublic: true,
    requiresAuth: false,
    showInNavigation: false,
    showInPublicNav: false,
    showInPrivateNav: false,
    icon: 'library',
    description: 'Mental health resources and articles'
  },
  {
    path: '/consultation',
    label: "Let's Talk",
    isPublic: true,
    requiresAuth: false,
    showInNavigation: true,
    showInPublicNav: true,
    showInPrivateNav: true,
    icon: 'chat',
    description: 'Book professional consultations'
  },
  {
    path: '/consultation-detail',
    label: 'Consultant Detail',
    isPublic: true,
    requiresAuth: false,
    showInNavigation: false,
    showInPublicNav: false,
    showInPrivateNav: false,
    description: 'Individual consultant profile and booking'
  },
  {
    path: '/about',
    label: 'About Us',
    isPublic: true,
    requiresAuth: false,
    showInNavigation: true,
    showInPublicNav: true,
    showInPrivateNav: false,
    description: 'Learn about our mission'
  },
  {
    path: '/faq',
    label: 'FAQs',
    isPublic: true,
    requiresAuth: false,
    showInNavigation: true,
    showInPublicNav: true,
    showInPrivateNav: false,
    description: 'Frequently asked questions'
  },
  {
    path: '/contact',
    label: "Let's Talk",
    isPublic: true,
    requiresAuth: false,
    showInNavigation: true,
    showInPublicNav: true,
    showInPrivateNav: false,
    description: 'Get in touch with us'
  },
  {
    path: '/privacy',
    label: 'Privacy Policy',
    isPublic: true,
    requiresAuth: false,
    showInNavigation: true,
    showInPublicNav: true,
    showInPrivateNav: false,
    description: 'Privacy policy and data handling'
  },
  {
    path: '/terms',
    label: 'Terms of Use',
    isPublic: true,
    requiresAuth: false,
    showInNavigation: true,
    showInPublicNav: true,
    showInPrivateNav: false,
    description: 'Terms and conditions'
  },
  {
    path: '/assessment-landing',
    label: 'Assessment Landing',
    isPublic: true,
    requiresAuth: false,
    showInNavigation: false,
    showInPublicNav: false,  
    showInPrivateNav: false,
    description: 'Individual assessment landing page'
  },
  {
    path: '/equip-detail',
    label: 'Program Detail',
    isPublic: true,
    requiresAuth: false,
    showInNavigation: false,
    showInPublicNav: false,
    showInPrivateNav: false,
    description: 'Individual program detail page'
  },
  {
    path: '/equip-programs-landing',
    label: 'Program Landing',
    isPublic: true,
    requiresAuth: false,
    showInNavigation: false,
    showInPublicNav: false,
    showInPrivateNav: false,
    description: 'Individual program landing page'
  },
  {
    path: '/route-test',
    label: 'Route Test',
    isPublic: true,
    requiresAuth: false,
    showInNavigation: false,
    showInPublicNav: false,
    showInPrivateNav: false,
    description: 'Route testing dashboard for development'
  },
  {
    path: '/login',
    label: 'Sign In',
    isPublic: true,
    requiresAuth: false,
    showInNavigation: false,
    showInPublicNav: false,
    showInPrivateNav: false,
    description: 'User login and authentication'
  },

  // Private App Routes
  {
    path: '/dashboard',
    label: 'Home',
    isPublic: false,
    requiresAuth: true,
    showInNavigation: true,
    showInPublicNav: false,
    showInPrivateNav: true,
    icon: 'home',
    description: 'Your personal dashboard'
  },
  {
    path: '/mood-journal',
    label: 'Mood Journal',
    isPublic: false,
    requiresAuth: true,
    showInNavigation: true,
    showInPublicNav: false,
    showInPrivateNav: true,
    icon: 'heart',
    description: 'Track your daily mood and thoughts'
  },


  // Private Flow Routes (with navigation enabled)
  {
    path: '/assessment-flow',
    label: 'Assessment Flow',
    isPublic: false,
    requiresAuth: true,
    showInNavigation: true,
    showInPublicNav: false,
    showInPrivateNav: true,
    description: 'Assessment in progress'
  },
  {
    path: '/assessment-results',
    label: 'Assessment Results',
    isPublic: false,
    requiresAuth: true,
    showInNavigation: true,
    showInPublicNav: false,
    showInPrivateNav: true,
    description: 'Assessment results and recommendations'
  },
  {
    path: '/equip-program-onboarding',
    label: 'Program Onboarding',
    isPublic: false,
    requiresAuth: true,
    showInNavigation: false,
    showInPublicNav: false,
    showInPrivateNav: false,
    description: 'Program onboarding flow'
  },
  {
    path: '/equip-program-flow',
    label: 'Program Flow',
    isPublic: false,
    requiresAuth: true,
    showInNavigation: false,
    showInPublicNav: false,
    showInPrivateNav: false,
    description: 'Program activities'
  },
  {
    path: '/equip-program-completion',
    label: 'Program Completion',
    isPublic: false,
    requiresAuth: true,
    showInNavigation: false,
    showInPublicNav: false,
    showInPrivateNav: false,
    description: 'Program completion celebration'
  },
  {
    path: '/resource-detail',
    label: 'Resource Detail',
    isPublic: true,
    requiresAuth: false,
    showInNavigation: false,
    showInPublicNav: false,
    showInPrivateNav: false,
    description: 'Detailed resource view'
  },
  {
    path: '/account',
    label: 'Account',
    isPublic: false,
    requiresAuth: true,
    showInNavigation: true,
    showInPublicNav: false,
    showInPrivateNav: true,
    description: 'Account settings and preferences'
  },

  // Admin Routes
  {
    path: '/admin',
    label: 'Admin Dashboard',
    isPublic: false,
    requiresAuth: true,
    showInNavigation: false,
    showInPublicNav: false,
    showInPrivateNav: false,
    description: 'Administrative dashboard'
  },
  {
    path: '/admin/resources',
    label: 'Resource Manager',
    isPublic: false,
    requiresAuth: true,
    showInNavigation: false,
    showInPublicNav: false,
    showInPrivateNav: false,
    description: 'Manage library resources'
  },
  {
    path: '/admin/equip',
    label: 'Equip Manager',
    isPublic: false,
    requiresAuth: true,
    showInNavigation: false,
    showInPublicNav: false,
    showInPrivateNav: false,
    description: 'Manage Equip programs'
  },
  {
    path: '/admin/users',
    label: 'User Manager',
    isPublic: false,
    requiresAuth: true,
    showInNavigation: false,
    showInPublicNav: false,
    showInPrivateNav: false,
    description: 'Manage users'
  },
  {
    path: '/admin/consultants',
    label: 'Consultant Manager',
    isPublic: false,
    requiresAuth: true,
    showInNavigation: false,
    showInPublicNav: false,
    showInPrivateNav: false,
    description: 'Manage consultants'
  },
  {
    path: '/admin/assessments',
    label: 'Assessment Manager',
    isPublic: false,
    requiresAuth: true,
    showInNavigation: false,
    showInPublicNav: false,
    showInPrivateNav: false,
    description: 'Manage assessments'
  },
  {
    path: '/admin/analytics',
    label: 'Analytics',
    isPublic: false,
    requiresAuth: true,
    showInNavigation: false,
    showInPublicNav: false,
    showInPrivateNav: false,
    description: 'System analytics'
  },
  {
    path: '/admin/settings',
    label: 'Settings',
    isPublic: false,
    requiresAuth: true,
    showInNavigation: false,
    showInPublicNav: false,
    showInPrivateNav: false,
    description: 'System settings'
  },
  {
    path: '/admin/pages',
    label: 'Page Manager',
    isPublic: false,
    requiresAuth: true,
    showInNavigation: false,
    showInPublicNav: false,
    showInPrivateNav: false,
    description: 'Manage CMS pages'
  },
  {
    path: '/admin/media',
    label: 'Media Manager',
    isPublic: false,
    requiresAuth: true,
    showInNavigation: false,
    showInPublicNav: false,
    showInPrivateNav: false,
    description: 'Manage media assets'
  },
  {
    path: '/admin/crud',
    label: 'CRUD Testing',
    isPublic: false,
    requiresAuth: true,
    showInNavigation: false,
    showInPublicNav: false,
    showInPrivateNav: false,
    description: 'Database testing tool'
  }
];

// Helper functions
export const getPublicRoutes = (): RouteConfig[] => {
  return routes.filter(route => route.isPublic);
};

export const getPrivateRoutes = (): RouteConfig[] => {
  return routes.filter(route => !route.isPublic);
};

export const getPublicNavigationRoutes = (): RouteConfig[] => {
  return routes.filter(route => route.showInPublicNav);
};

export const getPrivateNavigationRoutes = (): RouteConfig[] => {
  return routes.filter(route => route.showInPrivateNav);
};

export const isPublicRoute = (path: string): boolean => {
  // Handle dynamic routes like /consultation/:id
  if (path.startsWith('/consultation/')) {
    return true; // Consultant detail pages are public
  }
  
  const route = routes.find(r => r.path === path);
  return route?.isPublic ?? false;
};

export const requiresAuth = (path: string): boolean => {
  // Handle dynamic routes like /consultation/:id
  if (path.startsWith('/consultation/')) {
    return false; // Consultant detail pages don't require auth
  }
  
  const route = routes.find(r => r.path === path);
  return route?.requiresAuth ?? true; // Default to requiring auth for safety
};

export const getRouteConfig = (path: string): RouteConfig | undefined => {
  return routes.find(r => r.path === path);
};

// Default route configurations
export const DEFAULT_PUBLIC_ROUTE = '/';
export const DEFAULT_PRIVATE_ROUTE = '/dashboard';
export const LOGIN_ROUTE = '/login';

// Corporate/footer routes that don't need navigation but are public
export const corporateRoutes = [
  { path: '/privacy', label: 'Privacy Policy' },
  { path: '/terms', label: 'Terms of Use' }
];