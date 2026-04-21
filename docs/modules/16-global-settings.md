# Module: Global Settings

## Purpose
Control system-wide configurations.

## Scope
Owns:
- Feature flags
- Config values

## Key Concepts
- Config
- Flag

## Core Flows
Admin → Update → Apply

## Data Flow
Input: Config changes  
Output: System behavior

## Dependencies
- KV store

## Consumers
- All modules

## Edge Cases
- Invalid config

## Admin / Control
- Full control
