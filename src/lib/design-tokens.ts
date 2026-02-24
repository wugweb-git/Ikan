export default {
  "meta": {
    "name": "iKan merged tokens",
    "version": "1.0.0",
    "author": "iKan Product",
    "primaryFont": "Inter",
    "colorFormat": "hex"
  },
  "colors": {
    "primary": { "default": "#2A2A2A", "on": "#FFFFFF" },
    "accent": { "default": "#E9EBEF", "on": "#2A2A2A" },
    "background": { "page": "#F5F5F5", "card": "#FFFFFF", "muted": "#F0F0F0", "input": "#F3F3F5" },
    "text": { "primary": "#151515", "muted": "#717182", "inverse": "#FFFFFF" },
    "border": { "default": "#0000001A", "light": "#0000000D" },
    "status": {
      "success": "#22C55E",
      "success-light": "#DCFCE7",
      "danger": "#D4183D",
      "danger-light": "#FEECEE",
      "warning": "#EAB308",
      "warning-light": "#FFF7D6",
      "info": "#8B5CF6",
      "info-light": "#F3F4F6"
    },
    "grey": {
      "0": "#FFFFFF",
      "1": "#F5F5F5",
      "2": "#E4E4E4",
      "3": "#D9D9D9",
      "4": "#BDBDBD",
      "5": "#9E9E9E",
      "6": "#757575",
      "7": "#545454",
      "8": "#333333",
      "9": "#1A1A1A",
      "10": "#0D0D0D"
    },
    "neutral": {
      "100": "#FAFAFA",
      "200": "#F5F5F5",
      "300": "#E5E5E5",
      "400": "#8B8B8B",
      "500": "#4A4A4A",
      "600": "#2A2A2A",
      "700": "#1A1A1A"
    },
    "charts": ["#2A2A2A","#4A4A4A","#6A6A6A","#8A8A8A","#AAAAAA"]
  },
  "typography": {
    "fontFamily": { "base": "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif", "mono": "ui-monospace, SFMono-Regular, Menlo, Monaco, 'Courier New', monospace" },
    "size": { "xs": "12px", "sm": "14px", "md": "16px", "lg": "18px", "xl": "20px", "2xl": "24px", "3xl": "32px", "4xl": "48px" },
    "lineHeight": { "xs": 1.2, "sm": 1.4, "md": 1.5, "lg": 1.6 },
    "weight": { "regular": 400, "medium": 500 },
    "letterSpacing": { "tight": "-0.025em", "normal": "0", "wide": "0.06em" }
  },
  "spacing": { "unit": 4, "0": "0px", "1": "4px", "2": "8px", "3": "12px", "4": "16px", "5": "20px", "6": "24px", "7": "28px", "8": "32px" },
  "radius": { "xs": "2px", "sm": "6px", "md": "12px", "lg": "16px", "pill": "9999px" },
  "shadow": {
    "xs": "0 1px 2px rgba(0,0,0,0.04)",
    "sm": "0 2px 6px rgba(0,0,0,0.06)",
    "md": "0 6px 20px rgba(0,0,0,0.08)",
    "lg": "0 20px 40px rgba(0,0,0,0.12)"
  },
  "borders": { "thin": "1px solid #0000001A", "thick": "2px solid #0000001A" },
  "breakpoints": { "sm": "640px", "md": "768px", "lg": "1024px", "xl": "1280px" },
  "zIndex": { "nav": 50, "sticky": 60, "modal": 100, "tooltip": 200, "toast": 40, "overlay": 20 },
  "transitions": { "fast": "150ms cubic-bezier(.4,0,.2,1)", "base": "200ms cubic-bezier(.4,0,.2,1)", "slow": "400ms cubic-bezier(.4,0,.2,1)" },

  "motion": {
    "duration": { "fast": "150ms", "normal": "300ms", "slow": "500ms" },
    "easing": { "inOut": "cubic-bezier(0.4,0,0.2,1)", "linear": "linear", "easeIn": "cubic-bezier(0.4,0,1,1)", "easeOut": "cubic-bezier(0,0,0.2,1)" },
    "keyframes": {
      "fadeIn": "0%{opacity:0;transform:translateY(6px)}100%{opacity:1;transform:translateY(0)}",
      "fadeOut": "0%{opacity:1}100%{opacity:0}",
      "slideUp": "0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)}",
      "slideDown": "0%{opacity:0;transform:translateY(-8px)}100%{opacity:1;transform:translateY(0)}",
      "slideLeft": "0%{opacity:0;transform:translateX(8px)}100%{opacity:1;transform:translateX(0)}",
      "slideRight": "0%{opacity:0;transform:translateX(-8px)}100%{opacity:1;transform:translateX(0)}",
      "scaleIn": "0%{opacity:0;transform:scale(.96)}100%{opacity:1;transform:scale(1)}",
      "pulse": "0%{transform:scale(1);opacity:1}50%{transform:scale(1.03);opacity:.95}100%{transform:scale(1);opacity:1}",
      "bounce": "0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}",
      "wiggle": "0%{transform:rotate(0)}25%{transform:rotate(-6deg)}75%{transform:rotate(6deg)}100%{transform:rotate(0)}",
      "spin": "0%{transform:rotate(0)}100%{transform:rotate(360deg)}",
      "ripple": "0%{transform:scale(.6);opacity:.35}100%{transform:scale(1.6);opacity:0}"
    }
  },

  "emojiSet": {
    "1": { "id": "awful", "label": "Awful", "char": "😫", "twemoji": "1f62b.svg" },
    "2": { "id": "bad", "label": "Bad", "char": "😕", "twemoji": "1f615.svg" },
    "3": { "id": "meh", "label": "Meh", "char": "😐", "twemoji": "1f610.svg" },
    "4": { "id": "good", "label": "Good", "char": "🙂", "twemoji": "1f642.svg" },
    "5": { "id": "great", "label": "Great", "char": "😄", "twemoji": "1f604.svg" }
  },

  "energyScale": {
    "1": { "id": "exhausted", "label": "Exhausted", "char": "🪫", "severity": "danger" },
    "2": { "id": "tired", "label": "Tired", "char": "😴", "severity": "warning" },
    "3": { "id": "moderate", "label": "Moderate", "char": "⚡", "severity": "neutral" },
    "4": { "id": "energetic", "label": "Energetic", "char": "💪", "severity": "success" },
    "5": { "id": "charged", "label": "Charged!", "char": "🔥", "severity": "success" }
  },

  "stressScale": {
    "1": { "id": "chill", "label": "Chill", "char": "😌", "severity": "success" },
    "2": { "id": "mild", "label": "Mild", "char": "🤔", "severity": "info" },
    "3": { "id": "medium", "label": "Medium", "char": "😤", "severity": "warning" },
    "4": { "id": "high", "label": "High", "char": "😰", "severity": "warning" },
    "5": { "id": "extreme", "label": "Yikes!", "char": "🤯", "severity": "danger" }
  },

  "contextTags": [
    { "id": "work", "label": "Work", "char": "💼" },
    { "id": "sleep", "label": "Sleep", "char": "😴" },
    { "id": "health", "label": "Health", "char": "🏃" },
    { "id": "relationships", "label": "Relationships", "char": "❤️" },
    { "id": "studies", "label": "Studies", "char": "📚" },
    { "id": "finances", "label": "Finances", "char": "💰" },
    { "id": "fun", "label": "Fun", "char": "🎉" },
    { "id": "other", "label": "Other", "char": "✨" }
  ],

  "aliases": {
    "color": {
      "text.primary": "{colors.text.primary}",
      "text.muted": "{colors.text.muted}",
      "bg.canvas": "{colors.background.page}",
      "bg.surface": "{colors.background.card}",
      "bg.popover": "{colors.background.card}",
      "accent.default": "{colors.accent.default}",
      "accent.on": "{colors.accent.on}",
      "primary.default": "{colors.primary.default}",
      "primary.on": "{colors.primary.on}",
      "danger.default": "{colors.status.danger}"
    },
    "space": { "xs": "{spacing.1}", "sm": "{spacing.2}", "md": "{spacing.4}", "lg": "{spacing.6}" },
    "radius": { "control": "{radius.md}", "card": "{radius.lg}" }
  },

  "semantic": {
    "button.primary": {
      "bg": "{aliases.color.primary.default}",
      "fg": "{aliases.color.primary.on}",
      "radius": "{aliases.radius.control}",
      "paddingX": "{aliases.space.md}",
      "paddingY": "{aliases.space.sm}"
    },
    "input.default": {
      "bg": "{colors.background.input}",
      "fg": "{aliases.color.text.primary}",
      "radius": "{aliases.radius.control}",
      "border": "{borders.thin}"
    },
    "card.default": {
      "bg": "{aliases.color.bg.surface}",
      "fg": "{aliases.color.text.primary}",
      "radius": "{aliases.radius.card}",
      "padding": "{aliases.space.md}"
    },
    "notification.bg.info": "{colors.accent.default}",
    "notification.fg.info": "{colors.accent.on}",
    "notification.bg.success": "{colors.status.success}",
    "notification.fg.success": "{colors.background.card}"
  },

  "layout": {
    "breakpoints": { "xs": "360px", "sm": "640px", "md": "768px", "lg": "1024px", "xl": "1280px" },
    "constraints": {
      "component": { "min": "240px", "max": "760px" },
      "card": { "min": "280px", "max": "520px" },
      "input": { "min": "240px", "max": "560px" },
      "content": { "min": "640px", "max": "1200px" },
      "navMobile": { "min": "360px", "max": "100vw" },
      "navDesktop": { "min": "960px", "max": "100vw" }
    }
  }
};