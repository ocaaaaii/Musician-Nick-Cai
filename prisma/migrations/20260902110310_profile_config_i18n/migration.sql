-- Hand-edited: preserve existing zh-TW content under the "zh-TW" key
-- instead of the default drop+recreate, since this table holds real
-- production content. See
-- openspec/changes/profile-i18n-content/design.md, Decision 4.
ALTER TABLE "ProfileConfig"
  ALTER COLUMN "heroTitle" TYPE JSONB USING jsonb_build_object('zh-TW', "heroTitle"),
  ALTER COLUMN "heroSubtitle" TYPE JSONB USING jsonb_build_object('zh-TW', "heroSubtitle"),
  ALTER COLUMN "aboutBio" TYPE JSONB USING jsonb_build_object('zh-TW', "aboutBio"),
  ALTER COLUMN "styleTags" TYPE JSONB USING jsonb_build_object('zh-TW', to_jsonb("styleTags"));
