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
    // Initialize variables for the cheapest cost and nutrients at the cheapest cost
    let cheapestCost = 0;
    const nutrientsAtCheapestCost = new Map<string, any>();
  
    // Loop through the line items in the recipe
    for (const lineItem of recipe.lineItems) {
      // Get products for the ingredient in the line item
      const products = GetProductsForIngredient(lineItem.ingredient);
      // If no products are found, log an error message and continue to the next line item
      if (!products.length) {
        console.log(`No products found for ingredient: ${lineItem.ingredient.ingredientName}`);
        continue;
      }
  
      // Initialize variables for the cheapest product and its cost
      let cheapestProductCost = Infinity;
      let cheapestProduct;
  
      // Loop through each product and its supplier products to find the cheapest cost per base unit
      for (const product of products) {
        for (const supplierProduct of product.supplierProducts) {
          const costPerBaseUnit = GetCostPerBaseUnit(supplierProduct);
          // If no cost per base unit is found, log an error message and continue to the next supplier product
          if (costPerBaseUnit === null) {
            console.log(`No cost per base unit found for product: ${product.productName}`);
            continue;
          }
          // Update the cheapest product and its cost if the current product is cheaper
          cheapestProductCost = Math.min(cheapestProductCost, costPerBaseUnit);
          if (cheapestProductCost === costPerBaseUnit) {
            cheapestProduct = product
          }
        }
      }
  
      // If a cheapest product is found, loop through its nutrient facts to update the nutrients at the cheapest cost
      if (cheapestProduct !== undefined) {
        for (const nutrientFact of cheapestProduct.nutrientFacts) {
          const nutrientFactInBaseUnits = GetNutrientFactInBaseUnits(nutrientFact);
          const nutrientAmount = nutrientFactInBaseUnits.quantityAmount;
          // If the nutrient amount is defined, update the nutrients at the cheapest cost
          if (nutrientAmount !== undefined) {
            const nutrientName = nutrientFactInBaseUnits.nutrientName;
            // If the nutrient is not already in the map, add it with initial values for quantity amount and quantity per
            if (!nutrientsAtCheapestCost.has(nutrientName)) {
              nutrientsAtCheapestCost.set(nutrientName, {
                nutrientName: nutrientName,
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
              });
            }
            // Update the quantity amount for the nutrient in the map
            const nutrientDetails = nutrientsAtCheapestCost.get(nutrientName);
            nutrientDetails.quantityAmount.uomAmount += nutrientAmount.uomAmount;
          }
        }
      } 
  
      // Calculate the cost of the line item based on the cheapest product and its unit of measure, and add it to the total cheapest cost
      cheapestCost += cheapestProductCost * lineItem.unitOfMeasure.uomAmount;
    }
  
   // Sort the nutrients at the cheapest cost alphabetically and add them to the recipe summary
  const sortedNutrients = Object.fromEntries(
    [...nutrientsAtCheapestCost].sort(([a], [b]) => a.localeCompare(b))
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