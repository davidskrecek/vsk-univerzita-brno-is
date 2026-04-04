-- CreateTable
CREATE TABLE "sport" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "is_competitive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "head_official_personnel_id" INTEGER,

    CONSTRAINT "sport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personnel" (
    "id" SERIAL NOT NULL,
    "sport_id" INTEGER,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(30),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "personnel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainer" (
    "personnel_id" INTEGER NOT NULL,
    "category" VARCHAR(100),

    CONSTRAINT "trainer_pkey" PRIMARY KEY ("personnel_id")
);

-- CreateTable
CREATE TABLE "official" (
    "personnel_id" INTEGER NOT NULL,
    "position" VARCHAR(100) NOT NULL,

    CONSTRAINT "official_pkey" PRIMARY KEY ("personnel_id")
);

-- CreateTable
CREATE TABLE "editor_role" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "permissions" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "editor_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "editor" (
    "personnel_id" INTEGER NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "editor_role_id" INTEGER NOT NULL,
    "last_login_at" TIMESTAMP(3),
    "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "editor_pkey" PRIMARY KEY ("personnel_id")
);

-- CreateTable
CREATE TABLE "editor_managed_sport" (
    "editor_personnel_id" INTEGER NOT NULL,
    "sport_id" INTEGER NOT NULL,

    CONSTRAINT "editor_managed_sport_pkey" PRIMARY KEY ("editor_personnel_id","sport_id")
);

-- CreateTable
CREATE TABLE "post" (
    "id" SERIAL NOT NULL,
    "author_personnel_id" INTEGER NOT NULL,
    "sport_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "image_url" VARCHAR(1024),
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "published_at" TIMESTAMP(3),

    CONSTRAINT "post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_media" (
    "id" SERIAL NOT NULL,
    "post_id" INTEGER NOT NULL,
    "media_url" VARCHAR(1024) NOT NULL,
    "media_type" VARCHAR(20) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event" (
    "id" SERIAL NOT NULL,
    "author_personnel_id" INTEGER NOT NULL,
    "sport_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "location" VARCHAR(255),
    "event_type" VARCHAR(50),
    "ticket_url" VARCHAR(1024),
    "map_url" VARCHAR(1024),
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "is_cancelled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_order" (
    "id" SERIAL NOT NULL,
    "requester_personnel_id" INTEGER NOT NULL,
    "partner_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "details" TEXT NOT NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'submitted',
    "notified_official_personnel_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "partner_order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_invitation" (
    "id" SERIAL NOT NULL,
    "personnel_id" INTEGER NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_by_personnel_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" SERIAL NOT NULL,
    "actor_personnel_id" INTEGER NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "action" VARCHAR(30) NOT NULL,
    "payload" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sport_name_key" ON "sport"("name");

-- CreateIndex
CREATE UNIQUE INDEX "personnel_email_key" ON "personnel"("email");

-- CreateIndex
CREATE UNIQUE INDEX "editor_role_name_key" ON "editor_role"("name");

-- CreateIndex
CREATE INDEX "ix_editor_managed_sport_sport" ON "editor_managed_sport"("sport_id");

-- CreateIndex
CREATE INDEX "ix_post_sport_created" ON "post"("sport_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "ix_post_published" ON "post"("is_published", "published_at" DESC);

-- CreateIndex
CREATE INDEX "ix_event_sport_start" ON "event"("sport_id", "start_time");

-- CreateIndex
CREATE INDEX "ix_event_public_start" ON "event"("is_public", "start_time");

-- CreateIndex
CREATE INDEX "ix_partner_order_status_created" ON "partner_order"("status", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "account_invitation_token_hash_key" ON "account_invitation"("token_hash");

-- CreateIndex
CREATE INDEX "ix_account_invitation_personnel_expires" ON "account_invitation"("personnel_id", "expires_at");

-- AddForeignKey
ALTER TABLE "sport" ADD CONSTRAINT "sport_head_official_personnel_id_fkey" FOREIGN KEY ("head_official_personnel_id") REFERENCES "personnel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personnel" ADD CONSTRAINT "personnel_sport_id_fkey" FOREIGN KEY ("sport_id") REFERENCES "sport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainer" ADD CONSTRAINT "trainer_personnel_id_fkey" FOREIGN KEY ("personnel_id") REFERENCES "personnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "official" ADD CONSTRAINT "official_personnel_id_fkey" FOREIGN KEY ("personnel_id") REFERENCES "personnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editor" ADD CONSTRAINT "editor_personnel_id_fkey" FOREIGN KEY ("personnel_id") REFERENCES "personnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editor" ADD CONSTRAINT "editor_editor_role_id_fkey" FOREIGN KEY ("editor_role_id") REFERENCES "editor_role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editor_managed_sport" ADD CONSTRAINT "editor_managed_sport_editor_personnel_id_fkey" FOREIGN KEY ("editor_personnel_id") REFERENCES "editor"("personnel_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editor_managed_sport" ADD CONSTRAINT "editor_managed_sport_sport_id_fkey" FOREIGN KEY ("sport_id") REFERENCES "sport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_author_personnel_id_fkey" FOREIGN KEY ("author_personnel_id") REFERENCES "personnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_sport_id_fkey" FOREIGN KEY ("sport_id") REFERENCES "sport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_media" ADD CONSTRAINT "post_media_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_author_personnel_id_fkey" FOREIGN KEY ("author_personnel_id") REFERENCES "personnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_sport_id_fkey" FOREIGN KEY ("sport_id") REFERENCES "sport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_order" ADD CONSTRAINT "partner_order_requester_personnel_id_fkey" FOREIGN KEY ("requester_personnel_id") REFERENCES "personnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_order" ADD CONSTRAINT "partner_order_notified_official_personnel_id_fkey" FOREIGN KEY ("notified_official_personnel_id") REFERENCES "personnel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_invitation" ADD CONSTRAINT "account_invitation_personnel_id_fkey" FOREIGN KEY ("personnel_id") REFERENCES "personnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_invitation" ADD CONSTRAINT "account_invitation_created_by_personnel_id_fkey" FOREIGN KEY ("created_by_personnel_id") REFERENCES "personnel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_personnel_id_fkey" FOREIGN KEY ("actor_personnel_id") REFERENCES "personnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
