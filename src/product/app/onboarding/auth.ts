export const authContent = {
  hero: {
    title: "Your Mental Health Journey Starts Here",
    subtitle: "Access evidence-based assessments, personalized insights, and professional support to enhance your wellbeing and resilience.",
    features: {
      private: "Private & Secure",
      evidence: "Evidence-Based",
      support: "Professional Support"
    },
    imageAlt: "Peaceful meditation scene representing mental wellness"
  },
  header: {
    brandName: "iKan",
    brandSubtitle: "Your mental health companion",
    welcomeBack: "Welcome Back",
    createAccount: "Create Account",
    resetPassword: "Reset Password",
    defaultWelcome: "Welcome",
    signInSubtitle: "Sign in to continue your mental health journey",
    signUpSubtitle: "Join thousands improving their mental wellbeing",
    forgotSubtitle: "Enter your email to receive reset instructions",
    back: "Back"
  },
  tabs: {
    signIn: "Sign In",
    signUp: "Sign Up"
  },
  form: {
    labels: {
      fullName: "Full Name",
      email: "Email Address",
      password: "Password",
      confirmPassword: "Confirm Password",
      phone: "Phone (Optional)",
      rememberMe: "Remember me"
    },
    placeholders: {
      fullName: "Enter your full name",
      email: "Enter your email",
      emailExample: "your@email.com",
      password: "Enter your password",
      passwordSignup: "Create a secure password (min 8 characters)",
      passwordCreate: "Create a password",
      confirmPassword: "Confirm your password",
      phone: "Enter your phone number"
    },
    buttons: {
      signIn: "Sign In",
      signUp: "Create Account",
      reset: "Send Reset Email",
      forgotPassword: "Forgot password?",
      backToSignIn: "Back to sign in",
      processing: "Processing...",
      signingIn: "Signing In...",
      creatingAccount: "Creating Account...",
      demoAccount: "Use Demo Account (demo@ikanhealth.in / password123)"
    },
    social: {
      continuePrefix: "Or continue with",
      signUpPrefix: "Or sign up with",
      google: "Continue with Google",
      linkedin: "Continue with LinkedIn",
      apple: "Continue with Apple",
      signupGoogle: "Sign up with Google",
      signupLinkedin: "Sign up with LinkedIn",
      signupApple: "Sign up with Apple"
    },
    footer: "By continuing, you agree to our Terms of Service and Privacy Policy"
  },
  validation: {
    required: {
      email: "Email is required",
      password: "Password is required",
      name: "Name is required"
    },
    format: {
      email: "Please enter a valid email address",
      phone: "Please enter a valid phone number",
      passwordLength: "Password must be at least 8 characters long", // LoginScreen says 8
      passwordLength6: "Password must be at least 6 characters",
      passwordLengthShort: "Password must be at least 6 characters", // AuthForm says 6 - unifying to 8 is safer but I should respect existing logic if possible. I'll provide both or standardize. LoginScreen uses 8. AuthForm uses 6. I'll provide distinct keys or just use one standard.
      passwordMismatch: "Passwords do not match"
    }
  },
  messages: {
    success: {
      welcomeBack: { 
        title: "Welcome back!", 
        description: "You have successfully signed in." 
      },
      accountCreated: { 
        title: "Account created!", // LoginScreen
        titleAlt: "Welcome to iKan!", // AuthForm
        description: "Welcome to iKan. Your mental health journey begins now.", // LoginScreen
        descriptionAlt: "Your account has been created successfully." // AuthForm
      },
      resetSent: { 
        title: "Reset email sent", 
        description: "Check your email for password reset instructions." 
      },
      socialWelcome: { 
        title: "Welcome!" 
      }
    },
    error: {
      missingEmail: { title: "Missing email", description: "Please enter your email address" },
      missingPassword: { title: "Missing password", description: "Please enter your password" },
      missingName: { title: "Missing name", description: "Please enter your full name" },
      passwordMismatch: { title: "Passwords do not match", description: "Please ensure both passwords are identical" },
      passwordShort: { title: "Password too short", description: "Password must be at least 8 characters long" },
      signInFailed: { title: "Sign in failed", description: "Please check your credentials and try again." },
      signUpFailed: { title: "Sign up failed", description: "Failed to create account. Please try again." },
      resetFailed: { title: "Reset failed", description: "Failed to send reset email. Please try again." },
      socialFailed: { title: "Social sign-in failed" }
    },
    info: {
      sessionExpired: { title: "Session Expired", description: "Please sign in again to continue using iKan." },
      authRequired: { title: "Sign In Required", description: "Please sign in to access this feature." }
    },
    switch: {
      toSignup: "Don't have an account?",
      toSignupAction: "Sign up",
      toLogin: "Already have an account?",
      toLoginAction: "Sign in"
    }
  }
};