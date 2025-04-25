import API from './api';

//mealPlan types
export interface MealPlan {
  meal_plan_id: number;
  user_id: number;
  meal_plan_name: string;
  date: string;
}

export interface Meal {
  meal_id: number;
  meal_plan_id: number;
  meal_type: string;
  total_calories: number;
}

export interface MealItem {
  food_id: number;
  meal_id: number;
  food_name: string;
  calories: number;
  proteins: number;
  carbohydrates: number;
  fats: number;
}

export const getMealPlans = async (): Promise<MealPlan[]> => {
  const response = await API.get('/api/food/mealplans');
  return response.data;
};

export const getMealPlanById = async (planId: number): Promise<{plan: MealPlan, meals: Meal[]}> => {
  const response = await API.get(`/api/food/mealplans/${planId}`);
  return response.data;
};

export const createMealPlan = async (planName: string): Promise<MealPlan> => {
  const response = await API.post('/api/food/mealplans', { meal_plan_name: planName });
  return response.data;
};

export const deleteMealPlan = async (planId: number) => {
  try {
    console.log('📡 Deleting meal plan with ID:', planId);
    const response = await API.delete(`/api/food/mealplans/${planId}`);
    console.log('Delete response status:', response.status);
    return response.data;
  } catch (err) {
    console.error('Delete request failed:', err);
    throw err;
  }
};

export const getMeals = async (planId: number): Promise<Meal[]> => {
  const response = await API.get(`/api/food/mealplans/${planId}/meals`);
  return response.data;
};

export const getMealById = async (planId: number, mealId: number): Promise<{meal: Meal, foods: MealItem[]}> => {
  const response = await API.get(`/api/food/mealplans/${planId}/meals/${mealId}`);
  return response.data;
};

export const createMeal = async (planId: number, mealType: string, totalCalories: number = 0): Promise<Meal> => {
  const response = await API.post(`/api/food/mealplans/${planId}/meals`, { 
    meal_type: mealType,
    total_calories: totalCalories
  });
  return response.data;
};

export const deleteMeal = async (planId: number, mealId: number): Promise<void> => {
  await API.delete(`/api/food/mealplans/${planId}/meals/${mealId}`);
};

export const getFoods = async (planId: number, mealId: number): Promise<MealItem[]> => {
  const response = await API.get(`/api/food/mealplans/${planId}/meals/${mealId}/foods`);
  return response.data;
};

export const createFood = async (
  planId: number,
  mealId: number,
  item: { 
    food_name: string, 
    calories?: number, 
    proteins?: number, 
    carbohydrates?: number, 
    fats?: number
  }
): Promise<MealItem> => {
  const response = await API.post(`/api/food/mealplans/${planId}/meals/${mealId}/foods`, item);
  return response.data;
};

export const updateFood = async (
  planId: number,
  mealId: number,
  foodId: number,
  updates: {
    food_name?: string,
    calories?: number,
    proteins?: number,
    carbohydrates?: number,
    fats?: number
  }
): Promise<MealItem> => {
  const response = await API.put(`/api/food/mealplans/${planId}/meals/${mealId}/foods/${foodId}`, updates);
  return response.data;
};

export const deleteFood = async (planId: number, mealId: number, foodId: number): Promise<void> => {
  await API.delete(`/api/food/mealplans/${planId}/meals/${mealId}/foods/${foodId}`);
};