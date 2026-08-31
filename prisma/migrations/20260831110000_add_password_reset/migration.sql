ALTER TABLE "Customer"
ADD COLUMN "passwordResetToken" TEXT,
ADD COLUMN "passwordResetTokenExpiry" TIMESTAMP(3),
ADD COLUMN "passwordResetEmailSentAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Customer_passwordResetToken_key" ON "Customer"("passwordResetToken");
