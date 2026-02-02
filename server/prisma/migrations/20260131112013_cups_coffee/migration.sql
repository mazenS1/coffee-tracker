/*
  Warnings:

  - Added the required column `updatedAt` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RoastLevel" AS ENUM ('LIGHT', 'MEDIUM', 'MEDIUM_DARK', 'DARK');

-- CreateEnum
CREATE TYPE "ProcessingMethod" AS ENUM ('WASHED', 'NATURAL', 'HONEY', 'ANAEROBIC', 'OTHER');

-- CreateEnum
CREATE TYPE "BrewMethod" AS ENUM ('FILTER', 'ESPRESSO', 'POUR_OVER', 'AEROPRESS', 'CHEMEX', 'V60', 'FRENCH_PRESS', 'MOKA', 'OTHER');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "roasters" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roasters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coffees" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "roaster_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roast_level" "RoastLevel" NOT NULL,
    "origin" TEXT NOT NULL,
    "processing_method" "ProcessingMethod" NOT NULL,
    "elevation" TEXT NOT NULL,
    "variety" TEXT NOT NULL,
    "notes" TEXT,
    "flavor_profile" TEXT,
    "rating" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "weight" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coffees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cups" (
    "id" TEXT NOT NULL,
    "coffee_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "notes" TEXT,
    "grams" DECIMAL(65,30) NOT NULL,
    "temperature" DECIMAL(65,30) NOT NULL,
    "time" DECIMAL(65,30) NOT NULL,
    "body" TEXT NOT NULL,
    "acidity" TEXT NOT NULL,
    "sweetness" TEXT NOT NULL,
    "bitterness" TEXT NOT NULL,
    "balance" TEXT NOT NULL,
    "aftertaste" TEXT,
    "aroma" TEXT NOT NULL,
    "brew_method" "BrewMethod" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "roasters_name_idx" ON "roasters"("name");

-- CreateIndex
CREATE INDEX "coffees_name_idx" ON "coffees"("name");

-- CreateIndex
CREATE INDEX "coffees_user_id_idx" ON "coffees"("user_id");

-- CreateIndex
CREATE INDEX "coffees_roaster_id_idx" ON "coffees"("roaster_id");

-- CreateIndex
CREATE INDEX "cups_coffee_id_idx" ON "cups"("coffee_id");

-- AddForeignKey
ALTER TABLE "coffees" ADD CONSTRAINT "coffees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coffees" ADD CONSTRAINT "coffees_roaster_id_fkey" FOREIGN KEY ("roaster_id") REFERENCES "roasters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cups" ADD CONSTRAINT "cups_coffee_id_fkey" FOREIGN KEY ("coffee_id") REFERENCES "coffees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
