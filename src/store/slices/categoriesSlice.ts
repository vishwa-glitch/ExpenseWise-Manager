import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

interface CategoriesState {
  categories: any[];
  hierarchy: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  categories: [],
  hierarchy: [],
  isLoading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async () => {
    const response = await apiService.getCategories();
    return response;
  }
);

export const fetchCategoryHierarchy = createAsyncThunk(
  'categories/fetchHierarchy',
  async () => {
    const response = await apiService.getCategoryHierarchy();
    return response;
  }
);

export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (categoryData: any) => {
    const response = await apiService.createCategory(categoryData);
    return response;
  }
);

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, data }: { id: string; data: any }) => {
    const response = await apiService.updateCategory(id, data);
    return response;
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id: string) => {
    await apiService.deleteCategory(id);
    return id;
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle both array response and object with categories property
        if (Array.isArray(action.payload)) {
          state.categories = action.payload;
        } else if (action.payload.categories && Array.isArray(action.payload.categories)) {
          state.categories = action.payload.categories;
        } else {
          console.warn('Unexpected categories response format:', action.payload);
          state.categories = [];
        }
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch categories';
        // Set empty array on error to prevent undefined issues
        state.categories = [];
      })
      // Fetch hierarchy
      .addCase(fetchCategoryHierarchy.fulfilled, (state, action) => {
        if (Array.isArray(action.payload)) {
          state.hierarchy = action.payload;
        } else if (action.payload.hierarchy && Array.isArray(action.payload.hierarchy)) {
          state.hierarchy = action.payload.hierarchy;
        } else {
          state.hierarchy = [];
        }
      })
      // Create category
      .addCase(createCategory.fulfilled, (state, action) => {
        const newCategory = action.payload.category || action.payload;
        if (newCategory) {
          state.categories.push(newCategory);
        }
      })
      // Update category
      .addCase(updateCategory.fulfilled, (state, action) => {
        const updatedCategory = action.payload.category || action.payload;
        if (updatedCategory) {
          const index = state.categories.findIndex(cat => cat.id === updatedCategory.id);
          if (index !== -1) {
            state.categories[index] = updatedCategory;
          }
        }
      })
      // Delete category
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(cat => cat.id !== action.payload);
      });
  },
});

export const { clearError } = categoriesSlice.actions;
export default categoriesSlice.reducer;