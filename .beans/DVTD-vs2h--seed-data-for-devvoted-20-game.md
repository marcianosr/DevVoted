---
# DVTD-vs2h
title: Seed data for DevVoted 2.0 game
status: todo
type: task
priority: normal
created_at: 2026-07-24T15:27:12Z
updated_at: 2026-07-24T15:27:25Z
parent: DVTD-u35m
---

Create comprehensive seed data including polls, configs, categories, and test user accounts for the new 2.0 game

## Seed Data Categories

### Polls
- [ ] Create 50+ diverse dev/tech trivia polls across categories
- [ ] Mix difficulty levels: easy, medium, hard
- [ ] Include code examples in poll questions (QuestionMarkdown)
- [ ] Ensure coverage of all categories:
  - JavaScript/TypeScript
  - React/Frontend
  - Backend/Databases
  - DevOps/Infrastructure
  - Testing/QA
  - Performance
  - Security
  - Web Standards
- [ ] Validate poll answers and explanations are clear

### Configs
- [ ] Create full config roster (20-30 configs):
  - Copilot (legendary, 2x coverage)
  - Code Coverage (uncommon, +0.5 coverage)
  - ESLint (defense, prevents bugs)
  - Stylelint (defense)
  - Intellisense (storage economy)
  - IndexedDB (storage economy)
  - Plus 5-10 new configs for 2.0
- [ ] Set rarity tiers and costs
- [ ] Define unlock conditions/thresholds
- [ ] Create descriptions and explanations

### Categories
- [ ] Ensure database has all 8+ dev categories
- [ ] Set category colors/themes (using Kanto palette)
- [ ] Create category badges/icons
- [ ] Seed category coverage thresholds

### Test Users
- [ ] Create 5-10 test accounts with different progression states:
  - Beginner (0 runs, no upgrades)
  - Active player (20+ runs, some configs unlocked)
  - Veteran (100+ runs, maxed configs)
  - Power user (daily player, full progression)
- [ ] Assign vault KB balances
- [ ] Set unlocked configs per user
- [ ] Create run history with varied results

### Runs/Pipeline Data
- [ ] Create sample run data for testing:
  - Completed runs with results
  - Failed runs (various gate levels)
  - Runs with different configs
  - Runs with streak data
  - Runs with coverage breakdowns
- [ ] Include timestamps for realistic data
- [ ] Set up community leaderboard data

## Seed Script

### Database Seeding
- [ ] Create npm run db:seed script
- [ ] Seed in logical order (categories → polls → configs → users → runs)
- [ ] Use factories from @/src/test/createMockDataFactory.ts
- [ ] Handle relationships (foreign keys)
- [ ] Idempotent: safe to run multiple times

### Development vs Production
- [ ] Seed dev database with full test data
- [ ] Seed prod database with initial polls only (no test users)
- [ ] Clear script to distinguish environments
- [ ] Document seed process in README

## Data Quality Checks

### Validation
- [ ] All polls have valid questions and answers
- [ ] All configs have descriptions
- [ ] No missing required fields
- [ ] Categories are consistent and complete
- [ ] Test data is realistic (not absurd edge cases)

### Coverage
- [ ] Every category has 5+ polls
- [ ] Every rarity has 3-5 configs
- [ ] Test users cover all progression states
- [ ] Run data spans date range (not all today)

## Documentation
- [ ] Document seed data structure in README
- [ ] List test user credentials (email/password)
- [ ] Explain how to reset/reseed database
- [ ] Include sample data queries for verification
