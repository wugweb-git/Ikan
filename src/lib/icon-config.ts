export const iconConfig = {
  "name": "iKan - icons",
  "description": "Map to Figma Icon components. Ensure Figma file has Icon/Name/Variant components to match these paths.",
  "icon": {
    "home": {
      "roundedOutline": "Icon/Home/RoundedOutline",
      "roundedFilled": "Icon/Home/RoundedFilled"
    },
    "library": {
      "roundedOutline": "Icon/Library/RoundedOutline",
      "roundedFilled": "Icon/Library/RoundedFilled"
    },
    "tools": {
      "roundedOutline": "Icon/Tools/RoundedOutline",
      "roundedFilled": "Icon/Tools/RoundedFilled"
    },
    "account": {
      "roundedOutline": "Icon/Account/RoundedOutline",
      "roundedFilled": "Icon/Account/RoundedFilled"
    },
    "arrowRight": {
      "outline": "Icon/ArrowRight/Outline",
      "filled": "Icon/ArrowRight/Filled"
    },
    "more": {
      "outline": "Icon/More/Outline",
      "filled": "Icon/More/Filled"
    },
    "delete": {
      "outline": "Icon/Delete/Outline",
      "filled": "Icon/Delete/Filled"
    },
    "search": {
      "outline": "Icon/Search/Outline"
    },
    "settings": {
      "outline": "Icon/Settings/Outline",
      "filled": "Icon/Settings/Filled"
    },
    "dashboard": {
      "outline": "Icon/Dashboard/Outline",
      "filled": "Icon/Dashboard/Filled"
    },
    "assignment": {
      "outline": "Icon/Assignment/Outline",
      "filled": "Icon/Assignment/Filled"
    },
    "article": {
      "outline": "Icon/Article/Outline",
      "filled": "Icon/Article/Filled"
    },
    "info": {
      "outline": "Icon/Info/Outline",
      "filled": "Icon/Info/Filled"
    },
    "checkCircle": {
      "outline": "Icon/CheckCircle/Outline",
      "filled": "Icon/CheckCircle/Filled"
    },
    "error": {
      "outline": "Icon/Error/Outline",
      "filled": "Icon/Error/Filled"
    },
    "warning": {
      "outline": "Icon/Warning/Outline",
      "filled": "Icon/Warning/Filled"
    },
    "calendar": {
      "default": "Icon/Calendar/Default"
    },
    "chat": {
      "default": "Icon/Chat/Default"
    },
    "widget": {
      "default": "Icon/Widget/Default"
    },
    "bookmark": {
      "outline": "Icon/Bookmark/Outline",
      "filled": "Icon/Bookmark/Filled"
    },
    "star": {
      "outline": "Icon/Star/Outline",
      "filled": "Icon/Star/Filled"
    },
    "arrowLeft": {
      "outline": "Icon/ArrowLeft/Outline"
    },
    "wrench": {
      "outline": "Icon/Wrench/Outline",
      "roundedOutline": "Icon/Wrench/RoundedOutline"
    },
    "clock": {
      "outline": "Icon/Clock/Outline",
      "default": "Icon/Clock/Default"
    },
    "list": {
      "outline": "Icon/List/Outline",
      "default": "Icon/List/Default"
    },
    "play": {
      "outline": "Icon/Play/Outline",
      "default": "Icon/Play/Default"
    },
    "creditCard": {
      "outline": "Icon/CreditCard/Outline",
      "default": "Icon/CreditCard/Default"
    },
    "lock": {
      "outline": "Icon/Lock/Outline",
      "default": "Icon/Lock/Default"
    },
    "eye": {
      "outline": "Icon/Eye/Outline",
      "default": "Icon/Eye/Default"
    },
    "clipboard": {
      "outline": "Icon/Clipboard/Outline",
      "default": "Icon/Clipboard/Default"
    },
    "tag": {
      "outline": "Icon/Tag/Outline",
      "default": "Icon/Tag/Default"
    },
    "heart": {
      "outline": "Icon/Heart/Outline",
      "default": "Icon/Heart/Default"
    },
    "message": {
      "outline": "Icon/Message/Outline",
      "default": "Icon/Message/Default"
    },
    "mail": {
      "outline": "Icon/Mail/Outline",
      "default": "Icon/Mail/Default"
    },
    "phone": {
      "outline": "Icon/Phone/Outline",
      "default": "Icon/Phone/Default"
    },
    "map": {
      "outline": "Icon/Map/Outline",
      "default": "Icon/Map/Default"
    },
    "camera": {
      "outline": "Icon/Camera/Outline",
      "default": "Icon/Camera/Default"
    },
    "userCircle": {
      "outline": "Icon/UserCircle/Outline",
      "default": "Icon/UserCircle/Default"
    },
    "users": {
      "outline": "Icon/Users/Outline",
      "default": "Icon/Users/Default"
    },
    "link": {
      "outline": "Icon/Link/Outline",
      "default": "Icon/Link/Default"
    },
    "edit": {
      "outline": "Icon/Edit/Outline",
      "default": "Icon/Edit/Default"
    },
    "check": {
      "outline": "Icon/Check/Outline",
      "default": "Icon/Check/Default"
    },
    "sliders": {
      "outline": "Icon/Sliders/Outline",
      "default": "Icon/Sliders/Default"
    },
    "briefcase": {
      "outline": "Icon/Briefcase/Outline",
      "default": "Icon/Briefcase/Default"
    },
    "x": {
      "outline": "Icon/X/Outline"
    }
  }
} as const;

export type IconName = keyof typeof iconConfig.icon;
export type IconVariant<T extends IconName> = keyof typeof iconConfig.icon[T];

export default iconConfig;