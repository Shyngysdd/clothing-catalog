-- CreateTable
CREATE TABLE "LookFavorite" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "lookId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LookFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LookFavorite_customerId_lookId_key" ON "LookFavorite"("customerId", "lookId");

-- CreateIndex
CREATE INDEX "LookFavorite_lookId_idx" ON "LookFavorite"("lookId");

-- AddForeignKey
ALTER TABLE "LookFavorite" ADD CONSTRAINT "LookFavorite_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LookFavorite" ADD CONSTRAINT "LookFavorite_lookId_fkey" FOREIGN KEY ("lookId") REFERENCES "Look"("id") ON DELETE CASCADE ON UPDATE CASCADE;
