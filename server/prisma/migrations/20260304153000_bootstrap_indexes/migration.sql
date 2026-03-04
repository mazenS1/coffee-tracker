-- Speed up first-load coffee query pattern:
-- WHERE user_id = ? ORDER BY createdAt DESC, id DESC LIMIT N
CREATE INDEX IF NOT EXISTS "coffees_user_id_createdAt_id_idx"
ON "coffees"("user_id", "createdAt" DESC, "id" DESC);

-- Speed up roaster list lookups by visibility + alphabetical order.
CREATE INDEX IF NOT EXISTS "roasters_user_id_name_idx"
ON "roasters"("user_id", "name");
