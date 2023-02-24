import {
    GetProductsForIngredient,
    GetRecipes
} from "./supporting-files/data-access";
import {NutrientFact} from "./supporting-files/models";
import {
    GetCostPerBaseUnit,
    GetNutrientFactInBaseUnits
} from "./supporting-files/helpers";
import {RunTest, ExpectedRecipeSummary} from "./supporting-files/testing";

console.clear();
console.log("Expected Result Is:", JSON.stringify(ExpectedRecipeSummary, null, 2));

const recipeData = GetRecipes(); // the list of 1 recipe you should calculate the information for
const recipeSummary: any = {}; // the final result to pass into the test function

/*
 * YOUR CODE GOES BELOW THIS, DO NOT MODIFY ABOVE
 * (You can add more imports if needed)
 * */

for (const recipe of recipeData) {
    let cheapestCost = 0;
    const nutrientsAtCheapestCost: Record<string, any> = {};
  
    for (const lineItem of recipe.lineItems) {
      const products = GetProductsForIngredient(lineItem.ingredient);
      if (!products.length) {
        console.log(`No products found for ingredient: ${lineItem.ingredient.ingredientName}`);
        continue;
      }
      let nutrientFactInBaseUnits: NutrientFact | null = null;
      let cheapestProductCost = Infinity;
      let cheapestProduct;
      for (const product of products) {
        for (const supplierProduct of product.supplierProducts) {
          const costPerBaseUnit = GetCostPerBaseUnit(supplierProduct);
          if (costPerBaseUnit === null) {
            console.log(`No cost per base unit found for product: ${product.productName}`);
            continue;
          }
          cheapestProductCost = Math.min(cheapestProductCost, costPerBaseUnit);
          if (cheapestProductCost === costPerBaseUnit) {
            cheapestProduct = product
          }
        }
    }
    if (cheapestProduct !== undefined) {
      for (const nutrientFact of cheapestProduct.nutrientFacts) {
        nutrientFactInBaseUnits = GetNutrientFactInBaseUnits(nutrientFact);
        const nutrientAmount = nutrientFactInBaseUnits.quantityAmount;
        if (nutrientAmount !== undefined) {
          nutrientsAtCheapestCost[nutrientFactInBaseUnits.nutrientName] ||= {
            nutrientName: nutrientFactInBaseUnits.nutrientName,
            quantityAmount: {
              uomAmount: 0,
              uomName: nutrientAmount.uomName,
              uomType: "mass"
            },
            quantityPer: {
              uomAmount: 100,
              uomName: nutrientAmount.uomName,
              uomType: "mass"
            }
          };
          nutrientsAtCheapestCost[nutrientFactInBaseUnits.nutrientName].quantityAmount.uomAmount += nutrientAmount.uomAmount;
        }
      }
    } 
    cheapestCost += cheapestProductCost*lineItem.unitOfMeasure.uomAmount;
  }

  const sortedNutrients = Object.fromEntries(
    Object.entries(nutrientsAtCheapestCost)
      .sort(([a], [b]) => a.localeCompare(b))
  );
  
  recipeSummary[recipe.recipeName] = {
    cheapestCost,
    nutrientsAtCheapestCost: sortedNutrients
  };
}

/*
 * YOUR CODE ABOVE THIS, DO NOT MODIFY BELOW
 * */
RunTest(recipeSummary);