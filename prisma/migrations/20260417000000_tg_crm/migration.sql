-- Add new LeadStatus values for Telegram Mini CRM
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'IN_PROGRESS';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'DONE';

-- Add Telegram CRM fields to Lead
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "tgMessageId" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "tgUserId"    TEXT;
