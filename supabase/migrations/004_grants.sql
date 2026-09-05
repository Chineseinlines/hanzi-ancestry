-- ============================================================
-- 004: Table Privileges for anon / authenticated
--
-- 001-003 只建了表和 RLS 策略，但没有给 anon/authenticated
-- 任何表级 GRANT → 线上所有 REST 请求返回 401
-- (permission denied for table public.profiles)。
--
-- 行级安全由 RLS 策略负责，表级授权全开是 Supabase 标准做法。
-- ============================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON ALL TABLES IN SCHEMA public
  TO anon, authenticated, service_role;

-- 以后新建的表自动获得同样授权（004 之后的迁移不用再写 GRANT）
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES
  TO anon, authenticated, service_role;

-- 函数执行权限（delete_my_account 等在 002 已单独授权，这里兜底）
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public
  TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS
  TO anon, authenticated, service_role;
