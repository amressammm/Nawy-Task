-- CreateTable
CREATE TABLE "apartments" (
    "id" SERIAL NOT NULL,
    "unit_name" TEXT NOT NULL,
    "unit_number" TEXT NOT NULL,
    "project" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" INTEGER NOT NULL,
    "area_sqm" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "apartments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "apartments_created_at_idx" ON "apartments"("created_at");
