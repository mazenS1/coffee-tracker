import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { arSA } from '@clerk/localizations';
import './index.css';
import App from './App.tsx';

document.documentElement.lang = 'ar';
document.documentElement.dir = 'rtl';
document.body.dir = 'rtl';

// Clerk publishable key from environment variables
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key');
}

/**
 * Arabic localization customization
 * We extend the default Arabic localization with custom translations
 * that fit our coffee-themed app better.
 */
const arabicLocalization = {
  ...arSA,
  signIn: {
    ...arSA.signIn,
    start: {
      ...arSA.signIn?.start,
      title: 'تسجيل الدخول',
      subtitle: 'مرحباً بعودتك إلى دفتر القهوة',
      actionText: 'ليس لديك حساب؟',
      actionLink: 'إنشاء حساب',
    },
  },
  signUp: {
    ...arSA.signUp,
    start: {
      ...arSA.signUp?.start,
      title: 'إنشاء حساب جديد',
      subtitle: 'ابدأ رحلتك مع القهوة المختصة',
      actionText: 'لديك حساب بالفعل؟',
      actionLink: 'تسجيل الدخول',
    },
  },
  userButton: {
    ...arSA.userButton,
    action__manageAccount: 'إدارة الحساب',
    action__signOut: 'تسجيل الخروج',
  },
  userProfile: {
    ...arSA.userProfile,
    start: {
      ...arSA.userProfile?.start,
      headerTitle__account: 'الحساب',
      headerTitle__security: 'الأمان',
      profileSection: {
        title: 'الملف الشخصي',
      },
    },
  },
};

/**
 * Global Clerk appearance configuration
 * Applied to all Clerk components (UserButton, UserProfile, etc.)
 * Matches our coffee theme with warm browns, creams, and Arabic typography.
 */
const clerkAppearance = {
  variables: {
    colorPrimary: '#4a2c17',
    colorBackground: 'var(--bg-card, #ffffff)',
    colorText: 'var(--text-primary, #1a0f0a)',
    colorTextSecondary: 'var(--text-secondary, #4a2c17)',
    colorInputBackground: 'var(--bg-secondary, #f5e6d3)',
    colorInputText: 'var(--text-primary, #1a0f0a)',
    colorDanger: '#dc3545',
    fontFamily: "'Tajawal', sans-serif",
    fontFamilyButtons: "'Tajawal', sans-serif",
    fontSize: '1rem',
    borderRadius: '12px',
    spacingUnit: '1rem',
  },
  elements: {
    // Root styling
    rootBox: {
      fontFamily: "'Tajawal', sans-serif",
    },
    card: {
      background: 'var(--bg-card, #ffffff)',
      border: '1px solid var(--border, rgba(74, 44, 23, 0.1))',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(26, 15, 10, 0.15)',
    },
    
    // User Button specific
    userButtonAvatarBox: {
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      border: '2px solid var(--accent, #c68b3c)',
    },
    userButtonPopoverCard: {
      background: 'var(--bg-card, #ffffff)',
      border: '1px solid var(--border, rgba(74, 44, 23, 0.1))',
      borderRadius: '16px',
      boxShadow: '0 12px 40px rgba(26, 15, 10, 0.2)',
      direction: 'rtl',
    },
    userButtonPopoverActions: {
      direction: 'rtl',
    },
    userButtonPopoverActionButton: {
      fontFamily: "'Tajawal', sans-serif",
      color: 'var(--text-primary, #1a0f0a)',
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      transition: 'background 0.2s ease',
      '&:hover': {
        background: 'var(--bg-secondary, #f5e6d3)',
      },
    },
    userButtonPopoverActionButtonIcon: {
      color: 'var(--accent, #c68b3c)',
    },
    userButtonPopoverActionButtonText: {
      fontFamily: "'Tajawal', sans-serif",
      fontWeight: '500',
    },
    userButtonPopoverFooter: {
      borderTop: '1px solid var(--border, rgba(74, 44, 23, 0.1))',
    },
    
    // User Profile modal
    modalContent: {
      background: 'var(--bg-card, #ffffff)',
      direction: 'rtl',
    },
    navbar: {
      background: 'var(--bg-secondary, #f5e6d3)',
      borderRight: 'none',
      borderLeft: '1px solid var(--border, rgba(74, 44, 23, 0.1))',
    },
    navbarButton: {
      fontFamily: "'Tajawal', sans-serif",
      color: 'var(--text-secondary, #4a2c17)',
      '&:hover': {
        background: 'rgba(198, 139, 60, 0.1)',
      },
    },
    navbarButtonIcon: {
      color: 'var(--accent, #c68b3c)',
    },
    pageScrollBox: {
      padding: '1.5rem',
    },
    page: {
      direction: 'rtl',
    },
    profilePage: {
      direction: 'rtl',
    },
    formFieldLabel: {
      fontFamily: "'Tajawal', sans-serif",
      fontWeight: '600',
      color: 'var(--text-secondary, #4a2c17)',
      textAlign: 'right',
    },
    formFieldInput: {
      fontFamily: "'Tajawal', sans-serif",
      background: 'var(--bg-secondary, #f5e6d3)',
      border: '1px solid var(--border, rgba(74, 44, 23, 0.1))',
      borderRadius: '12px',
      direction: 'rtl',
      textAlign: 'right',
      '&:focus': {
        borderColor: 'var(--accent, #c68b3c)',
        boxShadow: '0 0 0 3px rgba(198, 139, 60, 0.15)',
      },
    },
    formButtonPrimary: {
      background: 'linear-gradient(135deg, #4a2c17, #2d1810)',
      fontFamily: "'Tajawal', sans-serif",
      fontWeight: '600',
      borderRadius: '12px',
      boxShadow: '0 4px 16px rgba(45, 24, 16, 0.25)',
      '&:hover': {
        boxShadow: '0 6px 24px rgba(45, 24, 16, 0.35)',
      },
    },
    headerTitle: {
      fontFamily: "'Reem Kufi', sans-serif",
      color: 'var(--text-primary, #1a0f0a)',
    },
    headerSubtitle: {
      fontFamily: "'Tajawal', sans-serif",
      color: 'var(--text-secondary, #4a2c17)',
    },
    
    // Avatar
    avatarBox: {
      border: '2px solid var(--accent, #c68b3c)',
    },
    avatarImage: {
      borderRadius: '50%',
    },
    
    // Badges and tags
    badge: {
      fontFamily: "'Tajawal', sans-serif",
      background: 'rgba(198, 139, 60, 0.15)',
      color: 'var(--text-primary, #1a0f0a)',
    },
  },
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY} 
      afterSignOutUrl="/"
      localization={arabicLocalization}
      appearance={clerkAppearance}
    >
      <App />
    </ClerkProvider>
  </StrictMode>
);
