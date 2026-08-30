ALTER TABLE "Customer"
  ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "verificationToken" TEXT,
  ADD COLUMN "verificationTokenExpiry" TIMESTAMP(3),
  ADD COLUMN "verificationEmailSentAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Customer_verificationToken_key" ON "Customer"("verificationToken");

CREATE TABLE "Subscriber" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "unsubscribeToken" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Subscriber_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Subscriber_email_key" ON "Subscriber"("email");
CREATE UNIQUE INDEX "Subscriber_unsubscribeToken_key" ON "Subscriber"("unsubscribeToken");
