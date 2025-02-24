/*
  Warnings:

  - The primary key for the `Invoice` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Invoice` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `userAccountId` on the `Invoice` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `InvoicePayment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `InvoicePayment` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `invoiceId` on the `InvoicePayment` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `PaymentReminderPhoneCall` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `PaymentReminderPhoneCall` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `userAccountId` on the `PaymentReminderPhoneCall` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `UserAccount` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `UserAccount` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Invoice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userAccountId" INTEGER NOT NULL,
    "amount" DECIMAL NOT NULL,
    "term" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    CONSTRAINT "Invoice_userAccountId_fkey" FOREIGN KEY ("userAccountId") REFERENCES "UserAccount" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Invoice" ("amount", "dueDate", "id", "term", "userAccountId") SELECT "amount", "dueDate", "id", "term", "userAccountId" FROM "Invoice";
DROP TABLE "Invoice";
ALTER TABLE "new_Invoice" RENAME TO "Invoice";
CREATE TABLE "new_InvoicePayment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "invoiceId" INTEGER NOT NULL,
    "amount" DECIMAL NOT NULL,
    "paidAt" DATETIME NOT NULL,
    CONSTRAINT "InvoicePayment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_InvoicePayment" ("amount", "id", "invoiceId", "paidAt") SELECT "amount", "id", "invoiceId", "paidAt" FROM "InvoicePayment";
DROP TABLE "InvoicePayment";
ALTER TABLE "new_InvoicePayment" RENAME TO "InvoicePayment";
CREATE TABLE "new_PaymentReminderPhoneCall" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userAccountId" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "calledAt" DATETIME NOT NULL,
    CONSTRAINT "PaymentReminderPhoneCall_userAccountId_fkey" FOREIGN KEY ("userAccountId") REFERENCES "UserAccount" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PaymentReminderPhoneCall" ("calledAt", "id", "summary", "userAccountId") SELECT "calledAt", "id", "summary", "userAccountId" FROM "PaymentReminderPhoneCall";
DROP TABLE "PaymentReminderPhoneCall";
ALTER TABLE "new_PaymentReminderPhoneCall" RENAME TO "PaymentReminderPhoneCall";
CREATE TABLE "new_UserAccount" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "firstNamePhonetic" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "lastNamePhonetic" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "registeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_UserAccount" ("email", "firstName", "firstNamePhonetic", "id", "lastName", "lastNamePhonetic", "phoneNumber", "registeredAt") SELECT "email", "firstName", "firstNamePhonetic", "id", "lastName", "lastNamePhonetic", "phoneNumber", "registeredAt" FROM "UserAccount";
DROP TABLE "UserAccount";
ALTER TABLE "new_UserAccount" RENAME TO "UserAccount";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
