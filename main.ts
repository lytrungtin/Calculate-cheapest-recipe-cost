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
    let nutrientsAtCheapestCost: Record<string, any> = {};
  
    // Use for..of loop to iterate over ingredients array
    for (const ingredient of recipe.ingredients) {
      const products: Product[] = GetProductsForIngredient(ingredient.name);
      if (products.length === 0) {
        console.log(`No products found for ingredient: ${ingredient.name}`);
        continue;
      }
  
      // Use let instead of const for variables that might change
      let nutrientFactsInBaseUnits: NutrientFact | null = null;
      let nutrientAmountPerBaseUnit: number | null = null;
      let nutrientUnitOfMeasure: string | null = null;
  
      // Use for..of loop to iterate over products array
      for (const product of products) {
        const costPerBaseUnit = GetCostPerBaseUnit(product, ingredient);
        if (costPerBaseUnit === null) {
          console.log(`No cost per base unit found for product: ${product.name}`);
          continue;
        }
  
        // Optimize GetNutrientFactInBaseUnits helper function to take in fewer arguments
        const nutrientFacts = GetNutrientFactInBaseUnits(product);
        if (nutrientFacts === null) {
          console.log(`No nutrient information found for product: ${product.name}`);
          continue;
        }
  
        // Use Math.min function to determine cheapest cost instead of if statement
        cheapestCost = Math.min(cheapestCost, costPerBaseUnit);
        nutrientFactsInBaseUnits = nutrientFacts;
        nutrientAmountPerBaseUnit = nutrientFacts[ingredient.unit][ingredient.nutrientName];
        nutrientUnitOfMeasure = ingredient.unit;
      }
  
      // Use optional chaining to avoid null checks when accessing properties of an object
      if (nutrientFactsInBaseUnits?.[ingredient.unit]?.[ingredient.nutrientName] !== undefined && nutrientUnitOfMeasure !== null) {
        if (!nutrientsAtCheapestCost[ingredient.nutrientName]) {
          nutrientsAtCheapestCost[ingredient.nutrientName] = {
            nutrientName: ingredient.nutrientName,
            quantityAmount: {
              uomAmount: 0,
              uomName: nutrientUnitOfMeasure,
              uomType: "mass"
            },
            quantityPer: {
              uomAmount: 100,
              uomName: nutrientUnitOfMeasure,
              uomType: "mass"
            }
          };
        }
  
        // Use destructuring to simplify code
        const { uomAmount } = nutrientFactsInBaseUnits[ingredient.unit][ingredient.nutrientName];
        nutrientsAtCheapestCost[ingredient.nutrientName].quantityAmount.uomAmount += uomAmount;
      }
    }
  
    recipeSummary[recipe.name] = {
      cheapestCost: cheapestCost,
      // Use Object.values and optional chaining to simplify code
      nutrientsAtCheapestCost: Object.values(nutrientsAtCheapestCost)
    };
  }

/*
 * YOUR CODE ABOVE THIS, DO NOT MODIFY BELOW
 * */
RunTest(recipeSummary);
