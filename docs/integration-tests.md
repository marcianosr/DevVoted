# Integration Tests TODO

This document tracks integration tests that should be implemented to validate end-to-end behavior and user flows.

## Game Mechanics

### Reroll System

- [ ] **Rerolls persist within round but reset at CI gates**
  - Buy 2 rerolls using storage
  - Answer poll 1 (verify still have 2 rerolls)
  - Answer poll 2 (verify still have 2 rerolls)
  - Answer poll 3 - CI gate (verify rerolls reset to 0)
  - Related: `processPollAnswer.service.ts:121-124`

- [ ] **Reroll cost increases following fibonacci sequence**
  - Buy first reroll (costs 1KB)
  - Buy second reroll (costs 1KB)
  - Buy third reroll (costs 2KB)
  - Buy fourth reroll (costs 3KB)
  - Verify `totalRerolls` and `rerollStorageUsed` track correctly

### CI Gates & Thresholds

- [ ] **Run ends when failing threshold without protection**
  - Start run
  - Answer 3 polls with low coverage
  - Verify run ends at gate 1 (poll 3)
  - Verify `status` changes to "finished"

- [ ] **Try/Catch config prevents run failure once**
  - Start run with try/catch config
  - Answer 3 polls with low coverage
  - Verify run continues (config consumed)
  - Fail next gate without try/catch
  - Verify run ends

- [ ] **OR gate evaluation (gates 1-4)**
  - Verify player can pass by specializing in 1 category OR diversifying across multiple

- [ ] **AND gate evaluation (gates 5+)**
  - Verify player must meet multiple requirements using different categories

### Coverage & Scoring

- [ ] **Coverage accumulates correctly with config bonuses**
  - Start run with `.js-config`
  - Answer JS poll correctly
  - Verify coverage includes +2 bonus
  - Answer non-JS poll
  - Verify no bonus applied

- [ ] **Streak tracking across correct/incorrect answers**
  - Answer 3 polls correctly
  - Verify streak = 3 and bestStreak = 3
  - Answer 1 poll incorrectly
  - Verify streak = 0 but bestStreak = 3

### Config System

- [ ] **Configs persist across round until consumed/removed**
  - Purchase config from shop
  - Verify activeConfigIds includes config
  - Use one-time config (e.g., try/catch)
  - Verify config removed after use

## User Flows

### Run Lifecycle

- [ ] **Complete run flow from start to finish**
  - Create new run
  - Answer multiple polls across gates
  - Pass all thresholds
  - Complete run successfully
  - Verify stats saved to user performance

- [ ] **Daily poll selection is deterministic**
  - Get daily poll on Christmas (2024-12-25)
  - Verify same poll returned for same date seed
  - Get daily poll on birthday (2024-05-13)
  - Verify different poll than Christmas

### Shop & Economy

- [ ] **Purchase with insufficient storage fails**
  - Attempt to buy item costing more than available storage
  - Verify purchase rejected
  - Verify storage unchanged

- [ ] **Purchase with sufficient storage succeeds**
  - Buy reroll with enough storage
  - Verify storage decremented
  - Verify reroll count incremented

## Notes

- Consider using Playwright or similar for E2E tests
- May need test database setup/teardown utilities
- Consider test user fixtures (Rare characters: Kazooie, Banjo, Mumbo, etc.)
