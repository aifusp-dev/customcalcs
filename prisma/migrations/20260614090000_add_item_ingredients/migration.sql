-- CreateTable
CREATE TABLE "item_ingredients" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "item_ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "item_ingredients_itemId_ingredientId_key" ON "item_ingredients"("itemId", "ingredientId");

-- AddForeignKey
ALTER TABLE "item_ingredients" ADD CONSTRAINT "item_ingredients_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_ingredients" ADD CONSTRAINT "item_ingredients_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
