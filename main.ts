import {
    GetProductsForIngredient,
    GetRecipes
} from "./supporting-files/data-access";
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


// Loop through each recipe
for (const recipe of recipeData) {
    // Initialize variables for cheapest cost and nutrient facts at the cheapest cost
    let cheapestCost = 0;
    const nutrientsAtCheapestCost: Record<string, any> = {};
  
    // Loop through each line item in the recipe
    for (const lineItem of recipe.lineItems) {
        // Get the list of products for the current ingredient
        const products = GetProductsForIngredient(lineItem.ingredient);
        if (!products.length) {
            console.log(`No products found for ingredient: ${lineItem.ingredient.ingredientName}`);
            continue;
        }
        // Initialize variables for cheapest product cost and product
        let cheapestProductCost = Infinity;
        let cheapestProduct;
        // Loop through each product for the current ingredient
        for (const product of products) {
            // Loop through each supplier product for the current product
            for (const supplierProduct of product.supplierProducts) {
                // Get the cost per base unit for the current supplier product
                const costPerBaseUnit = GetCostPerBaseUnit(supplierProduct);
                if (costPerBaseUnit === null) {
                    console.log(`No cost per base unit found for product: ${product.productName}`);
                    continue;
                }
                // Update the cheapest product cost and product if the current cost per base unit is lower
                cheapestProductCost = Math.min(cheapestProductCost, costPerBaseUnit);
                if (cheapestProductCost === costPerBaseUnit) {
                    cheapestProduct = product
                }
            }
        }
        // If a cheapest product was found, update the nutrient facts at the cheapest cost
        if (cheapestProduct !== undefined) {
            for (const nutrientFact of cheapestProduct.nutrientFacts) {
                // Get the nutrient fact in base units
                const nutrientFactInBaseUnits = GetNutrientFactInBaseUnits(nutrientFact);
                const nutrientAmount = nutrientFactInBaseUnits.quantityAmount;
                if (nutrientAmount !== undefined) {
                    // Update the nutrients at the cheapest cost for the current nutrient fact
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
   // Sort the nutrients by name
   const sortedNutrients = Object.fromEntries(
    Object.entries(nutrientsAtCheapestCost)
      .sort(([a], [b]) => a.localeCompare(b))
  );
  
  // Add the recipe summary to the overall recipe summary object
  recipeSummary[recipe.recipeName] = {
    cheapestCost,
    nutrientsAtCheapestCost: sortedNutrients
  };
}

/*
 * YOUR CODE ABOVE THIS, DO NOT MODIFY BELOW
 * */
RunTest(recipeSummary);