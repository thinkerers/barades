-- Migration: Add authentication fields to User table
-- Generated: 2025-10-15 (Jour 4)
-- Description: Rename password to passwordHash, add firstName and lastName for JWT payload

-- Add firstName and lastName columns (optional for now)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "firstName" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastName" TEXT;

-- Rename password column to passwordHash
ALTER TABLE "User" RENAME COLUMN "password" TO "passwordHash";

-- Update comment to reflect argon2 instead of bcrypt
COMMENT ON COLUMN "User"."passwordHash" IS 'Password hashed with argon2';
