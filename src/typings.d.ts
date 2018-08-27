/*
// won't use since inverse mapping for string enum is not available

enum Difficulty {
  Normal = "普通",
  Easy = "簡単"
}

enum Genre {
   Ethnic = "エスニック",
   French = "フレンチ",
   Chinese = "中華風",
   Japanese = "和風",
   Western = "洋風"
}
*/

interface Ingredient {
    name: string;
    detail?: string;
    amount?: string;
    marking?: string;
}
    
interface Recipe {
    id: number;
    title: string;
    cook_duration: number;
    calorie: number;
    genre: string;
    kind: string;
    difficulty: string;
    prep_duration: number;
    comment: string;
    ingredients: Ingredient[]
    yield: number;
    instructions: string[]
}

declare module "*/recipes.json" {
    const value: Recipe[];
    export = value;
}

interface IngredientGroup {
    genre: string;
    options: string[];
}

declare module "*/ingredients.json" {
    const value: IngredientGroup[];
    export = value;
}
