-- AlterTable
ALTER TABLE "roasters" ADD COLUMN "user_id" TEXT;

-- CreateIndex
CREATE INDEX "roasters_user_id_idx" ON "roasters"("user_id");

-- AddForeignKey
ALTER TABLE "roasters" ADD CONSTRAINT "roasters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
