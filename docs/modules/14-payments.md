# Module: Payments

## Purpose
Handle payment processing and access control.

## Scope
Owns:
- Payment flow
- Verification
- Access unlocking

## Key Concepts
- Transaction
- Payment status

## Core Flows
User → Payment → Verification → Access

## Data Flow
Input: Payment request  
Output: Access state

## Dependencies
- Razorpay (integration)

## Consumers
- Equip
- Dashboard

## Edge Cases
- Failed payments
- Duplicate transactions

## Admin / Control
- Payment monitoring
