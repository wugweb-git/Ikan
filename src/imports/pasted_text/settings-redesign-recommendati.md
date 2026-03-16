Right now the page is trying to be:

profile

settings

payments

legal

privacy controls

security

preferences

enterprise profile

all in one screen.

That is why it feels heavy, hardcoded, and messy.

Let me break this down like a product redesign, not just UI tweaks.

🚨 Core Problems
1️⃣ Too many sections in one page

You currently have 9 different system modules in the same screen.

Profile
Payments
Organization
Preferences
Notifications
Privacy
Security
Legal

These are separate product domains.

Example:
Stripe dashboard does not mix security + payments + privacy + legal together.

2️⃣ Hardcoded data smell

Examples in screenshots:

Alex Johnson
demo1@ikan.com
+1 (555) 100-0001
₹1197 total spent
3 programs purchased
Chrome on macOS
Current location —

These are clearly UI placeholders.

This makes the product feel fake or unfinished.

3️⃣ Too many toggles (cognitive overload)

You currently show ~20 toggles:

Auto play videos
Content recommendations
Show achievements
Push notifications
Mood reminders
Assessment reminders
Program updates
Achievement alerts
Email notifications
Weekly progress
New resources
Consultant messages
In-app notifications
Sound
Vibration
Quiet hours
Analytics
Personalized content
Marketing emails
Research participation

Users do not want to configure 20 things.

4️⃣ Legal pages inside dashboard

This should not be inside settings.

Privacy Policy
Terms
Return Policy
Cancellation Policy

These belong in:

Footer
or
Help Center
🧠 Correct Product Structure

You should split this into 4 clean sections.

1️⃣ Profile (User Identity)

Only personal info.

Profile
----------------
Photo
Name
Email
Phone
Bio

Personal Details
DOB
Gender
City
Zip

Emergency Contact
Name
Phone
Relationship

Remove everything else.

2️⃣ Account & Security
Account
----------------
Change Email
Change Password
Two Factor Authentication

Active Sessions
Devices

Connected Accounts
Google
LinkedIn
3️⃣ Notifications & Preferences

Merge these two.

Notifications
----------------
Mood Reminder
Assessment Reminder
Program Updates

Email Notifications
Weekly Progress
New Resources

Everything else remove.

Users rarely configure more than 5 options.

4️⃣ Billing

Separate page.

Billing
----------------
Total Spent
Programs Purchased
Active Programs

Transaction History
Invoices
Payment Methods
5️⃣ Privacy

Separate page.

Privacy
----------------
Usage Analytics
Personalized Content
Third Party Research

Export Data
Delete Account
6️⃣ Organization (Only if corporate user)

Only show if:

user_type = corporate
Organization
----------------
Company
Department
Manager
Corporate Plan
🎯 New Sidebar Structure

Instead of your current one:

Account
Preferences
System
Legal

Use this:

Profile
Billing
Notifications
Security
Privacy
Organization (optional)

Legal should not appear here.

✨ UI Improvements
Remove cards stacking everywhere

Current UI looks like:

Card
Card
Card
Card
Card
Card

Instead group sections.

Example:

PROFILE
--------------------------------

ACCOUNT SECURITY
--------------------------------

NOTIFICATIONS
--------------------------------

PRIVACY
--------------------------------
Remove this (bad UX)
Security Tips
Your privacy matters
Need help with payments

Those are marketing / help content, not settings.

📉 Result if you keep current design

Users will feel:

too complex
too many settings
too many cards
fake data

This kills trust, especially for a mental health platform.

🚀 My recommendation (important)

Instead of redesigning this page, do this:

Build Settings 2.0 architecture
/settings/profile
/settings/billing
/settings/security
/settings/notifications
/settings/privacy

Each page small and focused.