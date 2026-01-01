# Testing Category Weights

The category weight system allows configs to influence which poll categories appear more often.

## How It Works

1. **Midnight Snapshot**: Weights are calculated from all active runs' configs and stored in `daily_polls.category_weights`
2. **Poll Selection**: When selecting a poll, stored weights influence category probability
3. **Global Pool**: All players' configs contribute to the global weight pool

## Quick Test

### 1. Set up a config with weight bonus

In `src/domains/configs/data/configs.ts`, add `categoryWeightBonus` to a config:

```typescript
{
  id: ".html-config",
  targetCategories: ["html"],
  categoryWeightBonus: 0.25,  // +25% weight for HTML polls
  // ... other fields
}
```

### 2. Install the config in an active run

Either via the shop, or directly in DB:

```sql
UPDATE runs
SET active_config_ids = active_config_ids || '".html-config"'
WHERE id = YOUR_RUN_ID AND status = 'active';
```

### 3. Run the test script

```bash
npx tsx scripts/test-weights.ts
```

This will:
- Show active runs and their configs
- Calculate and display weights
- Create a fresh snapshot for the target date

### 4. Update target date

In `scripts/test-weights.ts`, change `TARGET_DATE`:

```typescript
const TARGET_DATE = "2026-01-06";  // Use YYYY-MM-DD format!
```

### 5. Test in app

Temporarily hardcode the date in `src/domains/polls/services/dailyPoll.service.ts`:

```typescript
const dateSeed = getDateSeed("2026-01-06");  // Match TARGET_DATE
```

Then refresh your app and check server console for debug output.

## Date Format

**Always use `YYYY-MM-DD`** (ISO format):
- ✅ `"2026-01-06"`
- ❌ `"06-01-2026"`

## Weight Values Reference

| Bonus | Weight | Approx. Effect |
|-------|--------|----------------|
| 0.1   | 1.1    | ~10% more likely |
| 0.25  | 1.25   | ~25% more likely |
| 0.5   | 1.5    | ~50% more likely |
| 1.0   | 2.0    | ~2x more likely |
| 99    | 100    | ~95% of the time (testing only!) |

## Cleanup

After testing, remember to:
1. Remove hardcoded date from `dailyPoll.service.ts`
2. Remove debug console.logs from `queries.ts` (search for "🔍 DEBUG")
3. Reset any extreme `categoryWeightBonus` values (like 99)
