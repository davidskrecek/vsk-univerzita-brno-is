/*
  Warnings:

  - You are about to drop the `partner_order` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "partner_order" DROP CONSTRAINT "partner_order_notified_official_personnel_id_fkey";

-- DropForeignKey
ALTER TABLE "partner_order" DROP CONSTRAINT "partner_order_requester_personnel_id_fkey";

-- DropTable
DROP TABLE "partner_order";

-- CreateTable
CREATE TABLE "order_locks" (
    "id" TEXT NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_locks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "link" (
    "id" SERIAL NOT NULL,
    "url" VARCHAR(1024) NOT NULL,
    "alias" VARCHAR(255),
    "post_id" INTEGER,
    "event_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "link_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ix_link_post" ON "link"("post_id");

-- CreateIndex
CREATE INDEX "ix_link_event" ON "link"("event_id");

-- AddForeignKey
ALTER TABLE "link" ADD CONSTRAINT "link_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link" ADD CONSTRAINT "link_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
