-- Migration: Add unique constraint on run_gate_history (run_id, gate_number)
-- Purpose: Prevent duplicate gate entries for the same run

-- Step 1: Delete duplicate entries (keeping the one with lowest id)
DELETE FROM run_gate_history a
USING run_gate_history b
WHERE a.run_id = b.run_id 
  AND a.gate_number = b.gate_number 
  AND a.id > b.id;

-- Step 2: Add unique index to prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS run_gate_unique ON run_gate_history (run_id, gate_number);
