// src/types/diet.ts

export interface MacroSplit {
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealItem {
  meal: string; // e.g. "Breakfast"
  food: string; // e.g. "Oatmeal with Whey"
}

// This matches the JSON structure your Python AI generates
export interface AiDietPlanData {
  caloriesTarget: number;
  macros: MacroSplit;
  meals: MealItem[];
}

// This matches the Spring Boot DTO
export interface DietPlanResponse {
  dietPlanId: number;
  userId: number;
  createdDate: string;
  status: 'ACTIVE' | 'ARCHIVED';
  planData: string; // This is the stringified JSON we need to parse
}

export interface MacroSplit {
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealItem {
  meal: string;
  food: string;
  calories: number; // New
  macros: MacroSplit; // New
}

export interface AiDietPlanData {
  caloriesTarget: number;
  macros: MacroSplit;
  meals: MealItem[];
}

export interface DietPlanResponse {
  dietPlanId: number;
  userId: number;
  createdDate: string;
  status: 'ACTIVE' | 'ARCHIVED';
  planData: string;
}