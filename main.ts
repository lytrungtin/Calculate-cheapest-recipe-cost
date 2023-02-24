import {
    GetProductsForIngredient,
    GetRecipes
} from "./supporting-files/data-access";
import {NutrientFact, Product} from "./supporting-files/models";
import {
    GetCostPerBaseUnit,
    GetNutrientFactInBaseUnits
} from "./supporting-files/helpers";
import {RunTest, ExpectedRecipeSummary} from "./supporting-files/testing";

console.clear();
console.log("Expected Result Is:", ExpectedRecipeSummary);

const recipeData = GetRecipes(); // the list of 1 recipe you should calculate the information for
const recipeSummary: any = {}; // the final result to pass into the test function

/*
 * YOUR CODE GOES BELOW THIS, DO NOT MODIFY ABOVE
 * (You can add more imports if needed)
 * */
for (const recipe of recipeData) {
  let cheapestCost = Infinity;
  const nutrientsAtCheapestCost: Record<string, any> = {};

  for (const lineItem of recipe.lineItems) {
    const products = GetProductsForIngredient(lineItem.ingredient);
    if (!products.length) {
      console.log(`No products found for ingredient: ${lineItem.ingredient.ingredientName}`);
      continue;
    }

    let nutrientFactInBaseUnits: NutrientFact | null = null;
    let nutrientUnitOfMeasure: string | null = null;


    for (const product of products) {
      for (const supplierProduct of product.supplierProducts) {
        const costPerBaseUnit = GetCostPerBaseUnit(supplierProduct);
        if (costPerBaseUnit === null) {
          console.log(`No cost per base unit found for product: ${product.productName}`);
          continue;
        }

        cheapestCost = Math.min(cheapestCost, costPerBaseUnit);
      }

      const nutrientFact = product.nutrientFacts
        .map(nf => GetNutrientFactInBaseUnits(nf))
        .find(nf => nf !== null);
      if (nutrientFact === null) {
        console.log(`No nutrient information found for product: ${product.productName}`);
        continue;
      }

      nutrientFactInBaseUnits = nutrientFact;
      nutrientUnitOfMeasure = lineItem.unitOfMeasure;
      const nutrientAmount = nutrientFactInBaseUnits?.[nutrientUnitOfMeasure!]?.[nutrientFactInBaseUnits.nutrientName];
      if (nutrientAmount !== undefined) {
        nutrientsAtCheapestCost[nutrientFactInBaseUnits.nutrientName] ||= {
          nutrientName: nutrientFactInBaseUnits.nutrientName,
          quantityAmount: {
            uomAmount: 0,
            uomName: nutrientUnitOfMeasure!,
            uomType: "mass"
          },
          quantityPer: {
            uomAmount: 100,
            uomName: nutrientUnitOfMeasure!,
            uomType: "mass"
          }
        };
        nutrientsAtCheapestCost[nutrientFactInBaseUnits.nutrientName].quantityAmount.uomAmount += nutrientAmount.uomAmount;
      }
    }
  }

  recipeSummary[recipe.recipeName] = {
    cheapestCost,
    nutrientsAtCheapestCost: Object.values(nutrientsAtCheapestCost)
  };
}

/*
 * YOUR CODE ABOVE THIS, DO NOT MODIFY BELOW
 * */
RunTest(recipeSummary);
