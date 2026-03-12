ALTER TABLE "Product"
ALTER COLUMN "description" TYPE JSONB
USING to_jsonb("description");