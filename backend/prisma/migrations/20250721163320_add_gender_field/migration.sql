-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "nickname" TEXT,
    "avatarUrl" TEXT,
    "inviteCode" TEXT NOT NULL,
    "invitedBy" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "users_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "technician_profiles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "realName" TEXT NOT NULL,
    "gender" TEXT,
    "age" INTEGER NOT NULL,
    "height" TEXT,
    "weight" TEXT,
    "experience" TEXT,
    "services" TEXT NOT NULL,
    "photos" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "rating" REAL NOT NULL DEFAULT 5.0,
    "orderCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "technician_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "orders" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderNumber" TEXT NOT NULL,
    "customerId" INTEGER NOT NULL,
    "technicianId" INTEGER,
    "serviceType" TEXT NOT NULL,
    "serviceDuration" INTEGER NOT NULL,
    "totalAmount" REAL NOT NULL,
    "depositAmount" REAL NOT NULL,
    "finalAmount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "serviceAddress" TEXT NOT NULL,
    "contactInfo" TEXT NOT NULL,
    "scheduledTime" DATETIME NOT NULL,
    "completedAt" DATETIME,
    "cancelReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "orders_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT NOT NULL,
    "transactionId" TEXT,
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "commissions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "orderId" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "percentage" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "level" INTEGER NOT NULL,
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "commissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "commissions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cities" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_inviteCode_key" ON "users"("inviteCode");

-- CreateIndex
CREATE UNIQUE INDEX "technician_profiles_userId_key" ON "technician_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");
