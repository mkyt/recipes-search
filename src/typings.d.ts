import { ExecFileSyncOptionsWithBufferEncoding } from "child_process";

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

declare module "*/recipes.json" {
    const value: Recipe[];
    export = value;
}

interface IngredientItem {
    value: string;
    kana?: string;
    alt?: string[];
}

interface IngredientGroup {
    genre: string;
    options: IngredientItem[];
}

declare module "*/ingredients.json" {
    const value: IngredientGroup[];
    export = value;
}


declare module "*/romaji_fsm.json" {
    const value: RomajiFSM;
    export = value;
}

interface Eaten2Regexp {
    [index:string]: string;
}
declare module "*/eaten2regex.json" {
    const value: Eaten2Regexp;
    export = value;
}