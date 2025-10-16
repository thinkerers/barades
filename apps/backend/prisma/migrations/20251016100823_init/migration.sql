-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('Beginner', 'Intermediate', 'Expert');

-- CreateEnum
CREATE TYPE "SessionLevel" AS ENUM ('Beginner', 'Intermediate', 'Advanced', 'Open to all');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('pending', 'confirmed', 'cancelled');

-- CreateEnum
CREATE TYPE "GroupRole" AS ENUM ('member', 'admin');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('Bar', 'Cafe', 'Game Store', 'Community Center', 'Private');

-- CreateEnum
CREATE TYPE "Playstyle" AS ENUM ('Casual', 'Competitive', 'Story-driven', 'Social');

-- CreateEnum
CREATE TYPE "TagColor" AS ENUM ('red', 'green', 'purple', 'blue', 'gray');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "bio" TEXT,
    "avatar" TEXT,
    "skillLevel" "SkillLevel",
    "preferences" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "game" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "recurrenceRule" TEXT,
    "recurrenceEndDate" TIMESTAMP(3),
    "online" BOOLEAN NOT NULL DEFAULT false,
    "level" "SessionLevel" NOT NULL,
    "playersMax" INTEGER NOT NULL DEFAULT 4,
    "playersCurrent" INTEGER NOT NULL DEFAULT 0,
    "tagColor" "TagColor" NOT NULL DEFAULT 'gray',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "hostId" TEXT NOT NULL,
    "locationId" TEXT,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT NOT NULL,
    "type" "LocationType" NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amenities" TEXT[],
    "capacity" INTEGER,
    "openingHours" JSONB,
    "icon" TEXT NOT NULL DEFAULT 'store',
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "games" TEXT[],
    "location" TEXT NOT NULL,
    "playstyle" "Playstyle" NOT NULL,
    "description" TEXT NOT NULL,
    "recruiting" BOOLEAN NOT NULL DEFAULT true,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorId" TEXT,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_members" (
    "id" TEXT NOT NULL,
    "role" "GroupRole" NOT NULL DEFAULT 'member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" TEXT NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'pending',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "polls" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dates" TEXT[],
    "votes" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "polls_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "sessions_date_idx" ON "sessions"("date");

-- CreateIndex
CREATE INDEX "sessions_hostId_idx" ON "sessions"("hostId");

-- CreateIndex
CREATE INDEX "sessions_game_idx" ON "sessions"("game");

-- CreateIndex
CREATE INDEX "locations_city_idx" ON "locations"("city");

-- CreateIndex
CREATE INDEX "locations_lat_lon_idx" ON "locations"("lat", "lon");

-- CreateIndex
CREATE UNIQUE INDEX "group_members_userId_groupId_key" ON "group_members"("userId", "groupId");

-- CreateIndex
CREATE INDEX "reservations_status_idx" ON "reservations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "reservations_sessionId_userId_key" ON "reservations"("sessionId", "userId");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "polls" ADD CONSTRAINT "polls_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
