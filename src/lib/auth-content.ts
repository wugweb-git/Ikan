export const authContent = {
  hero: {
    title: "Your Mental Health Journey Starts Here",
    description: "Access evidence-based assessments, personalized insights, and professional support to enhance your wellbeing and resilience.",
    imageAlt: "Peaceful meditation scene representing mental wellness",
    features: {
      secure: "Private & Secure",
      evidenceBased: "Evidence-Based",
      professional: "Professional Support"
    }
  },
  titles: {
    welcomeBack: "Welcome Back",
    createAccount: "Create Account",
    resetPassword: "Reset Password",
    welcome: "Welcome",
    iKan: "iKan"
  },
  subtitles: {
    signIn: "Sign in to continue your mental health journey",
    join: "Join thousands improving their mental wellbeing",
    reset: "Enter your email to receive reset instructions",
    companion: "Your mental health companion"
  },
  form: {
    labels: {
      fullName: "Full Name",
      email: "Email",
      emailAddress: "Email Address",
      password: "Password",
      confirmPassword: "Confirm Password",
      phone: "Phone (Optional)",
      rememberMe: "Remember me"
    },
    placeholders: {
      fullName: "Enter your full name",
      email: "Enter your email",
      emailAddress: "your@email.com",
      password: "Enter your password",
      createPassword: "Create a password",
      createPasswordSecure: "Create a secure password (min 8 characters)",
      confirmPassword: "Confirm your password",
      phone: "Enter your phone number"
    },
    buttons: {
      signIn: "Sign In",
      createAccount: "Create Account",
      sendReset: "Send Reset Email",
      processing: "Processing...",
      signingIn: "Signing In...",
      creatingAccount: "Creating Account...",
      demoAccount: "Use Demo Account (demo@ikan.health / password123)"
    },
    links: {
      forgotPassword: "Forgot password?",
      backToSignIn: "Back to sign in",
      noAccount: "Don't have an account?",
      hasAccount: "Already have an account?",
      signUpAction: "Sign up",
      signInAction: "Sign in"
    },
    social: {
      continueWith: "Or continue with",
      signUpWith: "Or sign up with",
      google: "Continue with Google",
      linkedin: "Continue with LinkedIn",
      apple: "Continue with Apple",
      googleSignup: "Sign up with Google",
      linkedinSignup: "Sign up with LinkedIn",
      appleSignup: "Sign up with Apple"
    },
    tabs: {
      signIn: "Sign In",
      signUp: "Sign Up"
    },
    footer: "By continuing, you agree to our Terms of Service and Privacy Policy"
  },
  messages: {
    success: {
      welcomeBack: "Welcome back!",
      welcomeBackDesc: "You have successfully signed in.",
      accountCreated: "Account created!",
      accountCreatedDesc: "Welcome to iKan. Your mental health journey begins now.",
      welcomeIkan: "Welcome to iKan!",
      welcomeIkanDesc: "Your account has been created successfully.",
      resetSent: "Reset email sent",
      resetSentDesc: "Check your email for password reset instructions.",
      socialWelcome: "Welcome!",
      socialDesc: (provider: string) => `Signing in with ${provider}...`
    },
    errors: {
      missingEmail: "Missing email",
      missingEmailDesc: "Please enter your email address",
      missingPassword: "Missing password",
      missingPasswordDesc: "Please enter your password",
      missingName: "Missing name",
      missingNameDesc: "Please enter your full name", // Used in LoginScreen
      nameRequired: "Name is required", // Used in AuthForm
      passwordMismatch: "Passwords do not match",
      passwordMismatchDesc: "Please ensure both passwords are identical", // LoginScreen
      passwordMismatchSimple: "Passwords do not match", // AuthForm
      passwordShort: "Password too short",
      passwordShortDesc: "Password must be at least 8 characters long",
      passwordShortSimple: "Password must be at least 6 characters",
      invalidEmail: "Please enter a valid email address",
      invalidPhone: "Please enter a valid phone number",
      signInFailed: "Sign in failed",
      signInFailedDesc: "Please check your credentials and try again.",
      signUpFailed: "Sign up failed",
      signUpFailedDesc: "Failed to create account. Please try again.",
      resetFailed: "Reset failed",
      resetFailedDesc: "Failed to send reset email. Please try again.",
      socialFailed: "Social sign-in failed",
      socialFailedDesc: (provider: string) => `Failed to sign in with ${provider}. Please try again.`
    },
    info: {
      sessionExpired: "Session Expired",
      sessionExpiredDesc: "Please sign in again to continue using iKan.",
      signInRequired: "Sign In Required",
      signInRequiredDesc: "Please sign in to access this feature."
    }
  }
};
