-- ============================================
-- Row Level Security Setup for Barades
-- ============================================
-- STATUS: Exécuté le 15/10/2025 sur la base de production
-- Ce fichier est conservé comme documentation et pour référence future
-- 
-- Architecture: Frontend (Angular) → Backend (NestJS) → Supabase
-- - Frontend NEVER accesses Supabase directly (all requests via NestJS API)
-- - Backend uses service_role key which bypasses RLS by design
-- - RLS enabled to secure PostgREST API (blocked for anon/authenticated)
--
-- SECURITY CRITICAL:
-- - service_role key grants FULL database access (bypasses RLS)
-- - NEVER embed service_role key in client-side code
-- - Store in environment variables or secrets manager (e.g., Doppler, Vault)
-- - Rotate immediately if leaked
-- - This key is used ONLY by the trusted NestJS backend
--
-- Trust Model:
-- - Authentication: Handled by NestJS (Passport.js + custom JWT)
--     * Users register/login via NestJS endpoints (/auth/signup, /auth/login)
--     * NestJS validates credentials and issues custom JWTs
--     * Frontend stores JWT and sends it in Authorization header
--     * NestJS validates JWT on each request (Guards)
-- - Authorization: Handled by NestJS Guards and DTOs
-- - Data Validation: Handled by NestJS Pipes and class-validator
-- - RLS: Active but backend bypasses it (policies below for future evolution)
--
-- NOTE: This project uses NestJS custom auth, NOT Supabase Auth.
-- If migrating to Supabase Auth later, uncomment the policies below and
-- ensure NestJS passes Supabase JWTs instead of custom ones.
--
-- JWT Claims Structure (issued by NestJS):
-- - sub: user UUID (maps to users.id)
-- - role: "authenticated" | "anon" (Supabase standard)
-- - user_role: "user" | "admin" (custom claim for admin checks)
-- - iat/exp: standard JWT timestamps
--
-- Column Types (for policy reference):
-- - users.id: uuid
-- - sessions.hostId: uuid (references users.id) -- Prisma uses camelCase
-- - reservations.userId: uuid (references users.id) -- Prisma uses camelCase
-- - reservations.sessionId: uuid (references sessions.id) -- Prisma uses camelCase
-- - groups.creatorId: uuid (references users.id) -- Prisma uses camelCase
--
-- NOTE: Prisma keeps camelCase in PostgreSQL by default.
-- If you want snake_case, add @map("host_id") in schema.prisma
-- ============================================

-- ============================================
-- 1. Enable RLS on all tables
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. Create indexes for RLS performance
-- ============================================
-- These indexes optimize policy checks and common queries

-- Sessions: optimize host lookups and date-based queries
CREATE INDEX IF NOT EXISTS idx_sessions_hostId ON public.sessions("hostId");
CREATE INDEX IF NOT EXISTS idx_sessions_date ON public.sessions(date);
CREATE INDEX IF NOT EXISTS idx_sessions_host_date ON public.sessions("hostId", date); -- Compound for "my upcoming sessions"

-- Reservations: optimize user and session lookups
CREATE INDEX IF NOT EXISTS idx_reservations_userId ON public.reservations("userId");
CREATE INDEX IF NOT EXISTS idx_reservations_sessionId ON public.reservations("sessionId");
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status); -- Filter by pending/confirmed
CREATE INDEX IF NOT EXISTS idx_reservations_session_status ON public.reservations("sessionId", status); -- Compound for "session participants by status"

-- Group members: optimize membership checks
CREATE INDEX IF NOT EXISTS idx_group_members_userId ON public.group_members("userId");
CREATE INDEX IF NOT EXISTS idx_group_members_groupId ON public.group_members("groupId");

-- Groups: optimize creator lookups
CREATE INDEX IF NOT EXISTS idx_groups_creatorId ON public.groups("creatorId");

-- ============================================
-- 3. Optional: Public read-only access
-- ============================================
-- Uncomment these ONLY if you want to expose public data via PostgREST
-- (NOT needed for TFE since frontend goes through NestJS)

-- SECURITY NOTE: Exposing sessions publicly may leak sensitive scheduling info.
-- Consider creating a sanitized view instead:
--
-- CREATE VIEW public.sessions_public AS
-- SELECT id, title, game, date, level, players_max, players_current, online, tag_color
-- FROM public.sessions
-- WHERE date > NOW(); -- Only future sessions
--
-- Then grant SELECT on the view:
-- CREATE POLICY "anon_read_sessions_public" ON public.sessions_public
--   FOR SELECT TO anon USING (true);

-- Example (NOT recommended for production without sanitization):
-- CREATE POLICY "anon_read_sessions" ON public.sessions
--   FOR SELECT
--   TO anon
--   USING (true);

-- Allow anonymous users to browse game locations
-- CREATE POLICY "anon_read_locations" ON public.locations
--   FOR SELECT
--   TO anon
--   USING (true);

-- ============================================
-- 4. Future: Authenticated user policies
-- ============================================
-- Examples for if you later allow direct Supabase client access.
-- ALL POLICIES BELOW ARE COMMENTED — backend uses service_role (bypasses RLS).
--
-- IMPORTANT: Use (SELECT auth.uid()) for planner stability.
-- Column types: id/hostId/userId/sessionId/creatorId are UUID (Prisma camelCase)

-- ----------------
-- USERS table
-- ----------------

-- Users can read their own profile
-- CREATE POLICY "auth_select_own_profile" ON public.users
--   FOR SELECT
--   TO authenticated
--   USING ((SELECT auth.uid())::uuid = id);

-- Users can update their own profile (bio, avatar, skillLevel, etc.)
-- CREATE POLICY "auth_update_own_profile" ON public.users
--   FOR UPDATE
--   TO authenticated
--   USING ((SELECT auth.uid())::uuid = id)
--   WITH CHECK ((SELECT auth.uid())::uuid = id);

-- ----------------
-- SESSIONS table
-- ----------------

-- Authenticated users can read all sessions (for discovery)
-- SECURITY NOTE: This exposes all session data. Consider restricting fields via a view.
-- CREATE POLICY "auth_select_all_sessions" ON public.sessions
--   FOR SELECT
--   TO authenticated
--   USING (true);

-- Hosts can insert sessions for themselves
-- CREATE POLICY "auth_insert_own_sessions" ON public.sessions
--   FOR INSERT
--   TO authenticated
--   WITH CHECK ((SELECT auth.uid())::uuid = "hostId");

-- Hosts can update their own sessions
-- CREATE POLICY "auth_update_own_sessions" ON public.sessions
--   FOR UPDATE
--   TO authenticated
--   USING ((SELECT auth.uid())::uuid = "hostId")
--   WITH CHECK ((SELECT auth.uid())::uuid = "hostId");

-- Hosts can delete their own sessions
-- CREATE POLICY "auth_delete_own_sessions" ON public.sessions
--   FOR DELETE
--   TO authenticated
--   USING ((SELECT auth.uid())::uuid = "hostId");

-- ----------------
-- RESERVATIONS  table
-- ----------------

-- Users can read their own reservations
-- CREATE POLICY "auth_select_own_reservations" ON public.reservations
--   FOR SELECT
--   TO authenticated
--   USING ((SELECT auth.uid())::uuid = "userId");

-- Users can insert reservations for themselves
-- CREATE POLICY "auth_insert_own_reservations" ON public.reservations
--   FOR INSERT
--   TO authenticated
--   WITH CHECK ((SELECT auth.uid())::uuid = "userId");

-- Users can update their own reservations (e.g., cancel)
-- CREATE POLICY "auth_update_own_reservations" ON public.reservations
--   FOR UPDATE
--   TO authenticated
--   USING ((SELECT auth.uid())::uuid = "userId")
--   WITH CHECK ((SELECT auth.uid())::uuid = "userId");

-- Users can delete their own reservations
-- CREATE POLICY "auth_delete_own_reservations" ON public.reservations
--   FOR DELETE
--   TO authenticated
--   USING ((SELECT auth.uid())::uuid = "userId");

-- Hosts can read reservations for their sessions (to manage participants)
-- Requires JOIN — use SECURITY DEFINER function for performance and clarity:
--
-- CREATE OR REPLACE FUNCTION is_session_host(p_session_id uuid) 
-- RETURNS boolean 
-- LANGUAGE SQL 
-- STABLE 
-- SECURITY DEFINER 
-- SET search_path = public, pg_temp  -- Prevent search_path hijacking
-- AS $$
--   SELECT EXISTS (
--     SELECT 1 FROM public.sessions
--     WHERE id = p_session_id AND "hostId" = (SELECT auth.uid())::uuid
--   );
-- $$;
--
-- -- Revoke execute from public roles to prevent abuse
-- REVOKE EXECUTE ON FUNCTION is_session_host(uuid) FROM anon, authenticated;
--
-- -- Then use in policy
-- CREATE POLICY "auth_hosts_select_session_reservations" ON public.reservations
--   FOR SELECT
--   TO authenticated
--   USING (is_session_host("sessionId"));

-- ----------------
-- GROUPS table
-- ----------------

-- Authenticated users can read all groups (for discovery)
-- CREATE POLICY "auth_select_all_groups" ON public.groups
--   FOR SELECT
--   TO authenticated
--   USING (true);

-- Creators can insert groups
-- CREATE POLICY "auth_insert_own_groups" ON public.groups
--   FOR INSERT
--   TO authenticated
--   WITH CHECK ((SELECT auth.uid())::uuid = "creatorId");

-- Creators (or admins) can update their groups
-- CREATE POLICY "auth_update_own_groups" ON public.groups
--   FOR UPDATE
--   TO authenticated
--   USING ((SELECT auth.uid())::uuid = "creatorId")
--   WITH CHECK ((SELECT auth.uid())::uuid = "creatorId");

-- Creators can delete their groups
-- CREATE POLICY "auth_delete_own_groups" ON public.groups
--   FOR DELETE
--   TO authenticated
--   USING ((SELECT auth.uid())::uuid = "creatorId");

-- ----------------
-- GROUP_MEMBERS table
-- ----------------

-- Users can read memberships for groups they belong to
-- (Requires checking if user is member — consider SECURITY DEFINER function)

-- Users can insert themselves into groups (join)
-- CREATE POLICY "auth_join_groups" ON public.group_members
--   FOR INSERT
--   TO authenticated
--   WITH CHECK ((SELECT auth.uid())::uuid = "userId");

-- Users can delete their own memberships (leave)
-- CREATE POLICY "auth_leave_groups" ON public.group_members
--   FOR DELETE
--   TO authenticated
--   USING ((SELECT auth.uid())::uuid = "userId");

-- ----------------
-- POLLS table
-- ----------------

-- Group members can read polls in their groups
-- (Requires membership check — use SECURITY DEFINER function)

-- Group admins can insert polls
-- (Requires checking if user is admin of group — use SECURITY DEFINER function)

-- ============================================
-- 5. Optional: Admin role policies
-- ============================================
-- If your JWT contains a role claim (e.g., user_role: 'admin'), you can grant
-- admins full access by checking the claim:
--
-- CREATE POLICY "admin_full_access_sessions" ON public.sessions
--   FOR ALL
--   TO authenticated
--   USING (
--     (auth.jwt() ->> 'user_role') = 'admin'
--     OR (SELECT auth.uid())::uuid = "hostId"
--   );
--
-- For additional security and auditability, consider a DB-side admins table:
--
-- CREATE TABLE public.admins (
--   user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
--   granted_at timestamptz DEFAULT now(),
--   granted_by uuid REFERENCES public.users(id)
-- );
--
-- CREATE OR REPLACE FUNCTION is_admin(p_user_id uuid)
-- RETURNS boolean
-- LANGUAGE SQL
-- STABLE
-- SECURITY DEFINER
-- SET search_path = public, pg_temp  -- Prevent search_path hijacking
-- AS $$
--   SELECT EXISTS (SELECT 1 FROM public.admins WHERE user_id = p_user_id);
-- $$;
--
-- REVOKE EXECUTE ON FUNCTION is_admin(uuid) FROM anon, authenticated;
--
-- Then in policy:
-- CREATE POLICY "admin_or_owner_sessions" ON public.sessions
--   FOR ALL
--   TO authenticated
--   USING (
--     is_admin((SELECT auth.uid())::uuid)
--     OR (SELECT auth.uid())::uuid = host_id
--   );

-- ============================================
-- Testing RLS policies
-- ============================================
-- To test policies with different JWT contexts:
--
-- 1. Get JWT from your NestJS /auth/login endpoint
-- 2. In Supabase SQL Editor, set the JWT (must match NestJS structure):
--    SET request.jwt.claims = '{
--      "sub": "user-uuid-here",
--      "role": "authenticated",
--      "user_role": "user",
--      "iat": 1234567890,
--      "exp": 9999999999
--    }';
--    
--    For admin testing:
--    SET request.jwt.claims = '{"sub": "admin-uuid", "role": "authenticated", "user_role": "admin"}';
--    
-- 3. Run queries as that user:
--    SELECT * FROM public.sessions; -- Should respect RLS
--    
-- 4. Reset:
--    RESET request.jwt.claims;
--    
--    Or use SET LOCAL within a transaction for isolated testing:
--    BEGIN;
--      SET LOCAL request.jwt.claims = '{"sub": "uuid", "role": "authenticated"}';
--      SELECT * FROM public.sessions;
--    ROLLBACK;
--
-- For service_role testing:
-- - Use the connection with service_role key (bypasses all RLS)

-- ============================================
-- Pre-flight checklist before enabling RLS
-- ============================================
-- Run these checks BEFORE executing this script in production:
--
-- [ ] 1. Backend uses service_role key (not anon key)
--        - Verify DATABASE_URL uses correct credentials
--        - Test backend can connect and query after RLS is enabled
--
-- [ ] 2. Backup current schema (including RLS policies and functions)
--        pg_dump -h host -U user -d dbname --schema-only > backup_with_rls.sql
--        Note: This captures tables, policies, and functions but verify SECURITY DEFINER
--        functions are included. Test restore in dev before relying on backup.
--
-- [ ] 3. Test in staging/dev environment first
--        - Apply script to dev database
--        - Run integration tests
--        - Verify no breaking changes
--
-- [ ] 4. Verify all cron jobs / background tasks use service_role
--        - Check any scheduled Supabase SQL functions
--        - Ensure migration tools use DIRECT_URL (not pooler)
--
-- [ ] 5. Plan rollback strategy
--        - Keep this script to re-run if needed
--        - Know how to disable RLS quickly if issues:
--          ALTER TABLE public.sessions DISABLE ROW LEVEL SECURITY;
--
-- [ ] 6. Monitor access patterns after deployment
--        - Check Supabase logs for unexpected access denials
--        - Set up alerts for high-frequency anon requests

-- ============================================
-- Maintenance notes
-- ============================================
-- - Review and audit RLS policies quarterly
-- - Monitor for unexpected access patterns (many SELECTs from anon)
-- - Rotate service_role key if leaked (Supabase Dashboard → Settings → API)
-- - Document any policy changes in version control commit messages
--
-- Optional: Add audit logging for sensitive tables
-- CREATE TABLE IF NOT EXISTS audit.access_log (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   table_name text NOT NULL,
--   operation text NOT NULL, -- INSERT/UPDATE/DELETE (not SELECT)
--   user_id uuid,
--   role text, -- authenticated/service_role
--   accessed_at timestamptz DEFAULT now()
-- );
--
-- Note: PostgreSQL does not support triggers on SELECT operations.
-- For read/audit logging, use one of these approaches:
--
-- 1) pgaudit extension (recommended for DB-level SELECT auditing):
--    ALTER SYSTEM SET pgaudit.log = 'read';
--    ALTER SYSTEM SET pgaudit.log_catalog = off;
--    SELECT pg_reload_conf();
--
-- 2) Application-level logging in NestJS (preferred for your architecture):
--    Use interceptors to log all Prisma queries with user context
--
-- 3) Postgres statistics (pg_stat_statements):
--    CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
--    -- Query with: SELECT * FROM pg_stat_statements WHERE query LIKE '%sessions%';
--
-- Example trigger for INSERT/UPDATE/DELETE only:
-- CREATE TRIGGER audit_sessions_modifications
--   AFTER INSERT OR UPDATE OR DELETE ON public.sessions
--   FOR EACH ROW
--   EXECUTE FUNCTION audit.log_modification('sessions');
--
-- Monitor modification patterns:
-- SELECT table_name, operation, COUNT(*) as mod_count
-- FROM audit.access_log
-- WHERE accessed_at > NOW() - INTERVAL '1 hour'
-- GROUP BY table_name, operation
-- ORDER BY mod_count DESC;
