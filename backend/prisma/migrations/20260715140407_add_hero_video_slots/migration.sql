-- CreateTable
CREATE TABLE "HeroVideoSlot" (
    "id" TEXT NOT NULL,
    "slotNumber" INTEGER NOT NULL,
    "videoUrl" TEXT,
    "cloudinaryPublicId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroVideoSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HeroVideoSlot_slotNumber_key" ON "HeroVideoSlot"("slotNumber");

-- Seed: ensure exactly 5 slots always exist (idempotent)
INSERT INTO "HeroVideoSlot" ("id", "slotNumber", "videoUrl", "cloudinaryPublicId", "updatedAt")
VALUES
  (gen_random_uuid()::text, 1, NULL, NULL, NOW()),
  (gen_random_uuid()::text, 2, NULL, NULL, NOW()),
  (gen_random_uuid()::text, 3, NULL, NULL, NOW()),
  (gen_random_uuid()::text, 4, NULL, NULL, NOW()),
  (gen_random_uuid()::text, 5, NULL, NULL, NOW())
ON CONFLICT ("slotNumber") DO NOTHING;
