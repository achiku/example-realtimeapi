-- CreateTable
CREATE TABLE "UserAccount" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "firstNamePhonetic" TEXT NOT NULL,
    "lasttName" TEXT NOT NULL,
    "lasttNamePhonetic" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "registeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "userAccountId" BIGINT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "term" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    CONSTRAINT "Invoice_userAccountId_fkey" FOREIGN KEY ("userAccountId") REFERENCES "UserAccount" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InvoicePayment" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "invoiceId" BIGINT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "paidAt" DATETIME NOT NULL,
    CONSTRAINT "InvoicePayment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PaymentReminderPhoneCall" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "userAccountId" BIGINT NOT NULL,
    "summary" TEXT NOT NULL,
    "calledAt" DATETIME NOT NULL,
    CONSTRAINT "PaymentReminderPhoneCall_userAccountId_fkey" FOREIGN KEY ("userAccountId") REFERENCES "UserAccount" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
