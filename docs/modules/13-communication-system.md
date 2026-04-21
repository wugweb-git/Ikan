# Module: Communication System

## Purpose
Handle all user communication including notifications, messaging, and emails.

## Scope
Owns:
- Notification triggers
- Email delivery (Brevo)
- In-app messaging

Does NOT own:
- Business logic (Rules Engine)
- User data

## Key Concepts
- Notification
- Trigger
- Template
- Channel

## Core Flows
Event → Rules Engine → Communication → Send

## Data Flow
Input: Events, user state  
Output: Notifications

## Dependencies
- Rules Engine
- Integrations

## Consumers
- All modules

## Edge Cases
- Failed delivery
- Duplicate triggers

## Admin / Control
- Template management
- Campaign control
