BEGIN;

ALTER TABLE attendances
    DROP CONSTRAINT IF EXISTS chk_attendances_status;

ALTER TABLE attendances
    ADD CONSTRAINT chk_attendances_status
    CHECK (status IN ('Present', 'Late', 'Leave', 'Absent'));

ALTER TABLE attendances
    ALTER COLUMN recorded_by DROP NOT NULL;

ALTER TABLE attendances
    ADD COLUMN IF NOT EXISTS leave_time TIME NULL;

COMMIT;
