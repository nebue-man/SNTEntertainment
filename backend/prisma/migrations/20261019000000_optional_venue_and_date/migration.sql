-- Make venue and eventDate optional on Event
ALTER TABLE "Event" ALTER COLUMN "venue" DROP NOT NULL;
ALTER TABLE "Event" ALTER COLUMN "eventDate" DROP NOT NULL;
