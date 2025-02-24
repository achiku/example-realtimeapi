/*
  Warnings:

  - You are about to drop the column `lasttName` on the `UserAccount` table. All the data in the column will be lost.
  - You are about to drop the column `lasttNamePhonetic` on the `UserAccount` table. All the data in the column will be lost.
  - Added the required column `lastName` to the `UserAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastNamePhonetic` to the `UserAccount` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserAccount" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "firstNamePhonetic" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "lastNamePhonetic" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "registeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_UserAccount" ("email", "firstName", "firstNamePhonetic", "id", "phoneNumber", "registeredAt") SELECT "email", "firstName", "firstNamePhonetic", "id", "phoneNumber", "registeredAt" FROM "UserAccount";
DROP TABLE "UserAccount";
ALTER TABLE "new_UserAccount" RENAME TO "UserAccount";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
