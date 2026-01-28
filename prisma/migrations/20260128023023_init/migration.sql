-- CreateTable
CREATE TABLE "mc_server_info" (
    "id" SERIAL NOT NULL,
    "guild_id" BIGINT NOT NULL,
    "required_role" BIGINT NOT NULL,
    "image_url" TEXT NOT NULL,
    "api_url" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mc_server_info_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mc_server_info_guild_id_key" ON "mc_server_info"("guild_id");
