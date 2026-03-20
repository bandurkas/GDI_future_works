-- CreateTable
CREATE TABLE "UserPermission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "permission_key" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserPermission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "AppUser" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AppUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "role" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "google_id" TEXT,
    "avatar_url" TEXT,
    "last_login" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_AppUser" ("created_at", "email", "id", "is_active", "name", "password_hash", "role", "updated_at") SELECT "created_at", "email", "id", "is_active", "name", "password_hash", "role", "updated_at" FROM "AppUser";
DROP TABLE "AppUser";
ALTER TABLE "new_AppUser" RENAME TO "AppUser";
CREATE UNIQUE INDEX "AppUser_email_key" ON "AppUser"("email");
CREATE UNIQUE INDEX "AppUser_google_id_key" ON "AppUser"("google_id");
CREATE TABLE "new_Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_whatsapp" TEXT NOT NULL,
    "city" TEXT,
    "country" TEXT,
    "source" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "tags" TEXT,
    "follow_up_date" DATETIME,
    "google_id" TEXT,
    "avatar_url" TEXT,
    "last_login" DATETIME,
    "account_manager_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "deleted_at" DATETIME,
    CONSTRAINT "Client_account_manager_id_fkey" FOREIGN KEY ("account_manager_id") REFERENCES "AppUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Client" ("avatar_url", "city", "country", "created_at", "deleted_at", "email", "follow_up_date", "full_name", "google_id", "id", "last_login", "phone_whatsapp", "source", "status", "tags", "updated_at") SELECT "avatar_url", "city", "country", "created_at", "deleted_at", "email", "follow_up_date", "full_name", "google_id", "id", "last_login", "phone_whatsapp", "source", "status", "tags", "updated_at" FROM "Client";
DROP TABLE "Client";
ALTER TABLE "new_Client" RENAME TO "Client";
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");
CREATE UNIQUE INDEX "Client_google_id_key" ON "Client"("google_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "UserPermission_user_id_permission_key_key" ON "UserPermission"("user_id", "permission_key");
