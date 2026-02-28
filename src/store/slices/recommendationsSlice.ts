import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

interface RecommendationsState {
  recommendations: any[];
  history: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: RecommendationsState = {
  recommendations: [],
  history: [],
  isLoading: false,
  error: null,
};

export const fetchRecommendations = createAsyncThunk(
  'recommendations/fetchRecommendations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getRecommendations();
      return response;
    } catch (error: any) {
      // Handle 404 errors gracefully for recommendations
      if (error.response?.status === 404) {
        console.log('💡 Recommendations endpoint not available (404) - using empty recommendations list');
        return { recommendations: [] };
      }
      return rejectWithValue(error.message);
    }
  }
);

export const dismissRecommendation = createAsyncThunk(
  'recommendations/dismissRecommendation',
  async (id: string) => {
    await apiService.dismissRecommendation(id);
    return id;
  }
);

export const actOnRecommendation = createAsyncThunk(
  'recommendations/actOnRecommendation',
  async (id: string) => {
    await apiService.actOnRecommendation(id);
    return id;
  }
);

const recommendationsSlice = createSlice({
  name: 'recommendations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch recommendations
      .addCase(fetchRecommendations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recommendations = action.payload.recommendations || [];
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to fetch recommendations';
        // Set empty array on error
        state.recommendations = [];
      })
      // Dismiss recommendation
      .addCase(dismissRecommendation.fulfilled, (state, action) => {
        state.recommendations = state.recommendations.filter(r => r.id !== action.payload);
      })
      // Act on recommendation
      .addCase(actOnRecommendation.fulfilled, (state, action) => {
        const index = state.recommendations.findIndex(r => r.id === action.payload);
        if (index !== -1) {
          state.recommendations[index].status = 'acted';
        }
      });
  },
});

export const { clearError } = recommendationsSlice.actions;
export default recommendationsSlice.reducer;