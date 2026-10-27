ALTER TABLE "relay_environment_links" ALTER COLUMN "environment_label" SET DEFAULT 'JCode Environment';
UPDATE "relay_environment_links" SET "environment_label" = 'JCode Environment' WHERE "environment_label" = 'JCode Environment';
