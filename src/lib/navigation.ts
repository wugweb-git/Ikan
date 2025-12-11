export const navigationConfig = {
  "name": "iKan - navigation",
  "desktop": {
    "top_nav": [
      { "label": "Home", "icon": "{icon.home.roundedOutline}", "route": "/dashboard", "state": "default", "ariaLabel": "Go to dashboard" },
      { "label": "Assessments", "icon": "{icon.checkCircle.outline}", "route": "/assessments" },
      { "label": "Programs", "icon": "{icon.tools.roundedOutline}", "route": "/equip-programs" },
      { "label": "Library", "icon": "{icon.library.roundedOutline}", "route": "/library" },
      { "label": "Consultation", "icon": "{icon.chat.default}", "route": "/consultation" }
    ],
    "profile_dropdown": [{ "label": "Account", "route": "/account" }, { "label": "Settings", "route": "/settings" }, { "label": "Help & Support", "route": "/help" }, { "label": "Logout", "action": "logout" }]
  },
  "mobile": {
    "bottom_nav": [
      { "label": "Home", "icon": "{icon.home.roundedOutline}", "route": "/dashboard", "state": "active" },
      { "label": "Assessments", "icon": "{icon.checkCircle.outline}", "route": "/assessments" },
      { "label": "Programs", "icon": "{icon.tools.roundedOutline}", "route": "/equip-programs" },
      { "label": "Library", "icon": "{icon.library.roundedOutline}", "route": "/library" },
      { "label": "Account", "icon": "{icon.account.roundedOutline}", "route": "/account" }
    ],
    "account_sheet": [{ "label": "Profile", "route": "/account" }, { "label": "Settings", "route": "/settings" }, { "label": "Consultation", "route": "/consultation" }, { "label": "Help & Support", "route": "/help" }, { "label": "Logout", "action": "logout" }],
    "animations": ["motion.keyframes.slideUp", "motion.keyframes.fadeIn"]
  }
} as const;

export const screensConfig = {
  "name": "iKan - screens",
  "screens": {
    "Dashboard": {
      "sections": ["TopSectionUserPersonalized", "WellbeingSnapshotWidget", "ActivityFeedWidget", "ResourceGridBlock", "NeedsAttentionWidget", "SupportWidget"]
    },
    "Assessments": {
      "components": ["AssessmentCard", "ModalAssessmentIntro", "AssessmentFlowBlock"]
    },
    "EquipPrograms": {
      "components": ["EquipCard", "EquipCalendarBlock", "ProgressBar", "Tabs"]
    },
    "Consultation": {
      "components": ["ConsultationDirectoryBlock", "ConsultationSessionDetails", "SupportChatBlock"]
    },
    "Library": {
      "components": ["ResourceGridBlock", "ResourceListBlock", "BlogCard"]
    },
    "Account": {
      "components": ["AccountDetailsSection", "UserAvatar", "TextInput", "SwitchToggle", "SideNavAccount"]
    }
  }
} as const;

export type NavItem = {
  label: string;
  icon?: string;
  route: string;
  state?: string;
  ariaLabel?: string;
  children?: { label: string; route: string }[];
  action?: string;
};

export type ScreenName = keyof typeof screensConfig.screens;

export default { navigationConfig, screensConfig };