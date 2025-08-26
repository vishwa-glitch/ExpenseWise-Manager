import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

interface GoalsState {
  goals: any[];
  selectedGoal: any | null;
  aiSession: any | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: GoalsState = {
  goals: [],
  selectedGoal: null,
  aiSession: null,
  goalProgress: null,
  goalPredictions: null,
  isLoading: false,
  error: null,
};

export const fetchGoals = createAsyncThunk(
  'goals/fetchGoals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getGoals();
      return response;
    } catch (error: any) {
      // Handle 404 errors gracefully for goals
      if (error.response?.status === 404) {
        console.log('🎯 Goals endpoint not available (404) - using empty goals list');
        return { goals: [] };
      }
      return rejectWithValue(error.message);
    }
  }
);

export const fetchGoal = createAsyncThunk(
  'goals/fetchGoal',
  async (id: string) => {
    const response = await apiService.getGoal(id);
    return response;
  }
);

export const createGoal = createAsyncThunk(
  'goals/createGoal',
  async (goalData: any) => {
    const response = await apiService.createGoal(goalData);
    return response;
  }
);

export const updateGoal = createAsyncThunk(
  'goals/updateGoal',
  async ({ id, data }: { id: string; data: any }) => {
    const response = await apiService.updateGoal(id, data);
    return response;
  }
);

export const deleteGoal = createAsyncThunk(
  'goals/deleteGoal',
  async (id: string) => {
    await apiService.deleteGoal(id);
    return id;
  }
);

export const fetchGoalProgress = createAsyncThunk(
  'goals/fetchGoalProgress',
  async (id: string) => {
    const response = await apiService.getGoalProgress(id);
    return response;
  }
);

export const fetchGoalPredictions = createAsyncThunk(
  'goals/fetchGoalPredictions',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getGoalPredictions(id);
      return response;
    } catch (error: any) {
      // Handle 404 errors gracefully for predictions
      if (error.response?.status === 404) {
        console.log('🎯 Goal predictions endpoint not available (404) - using fallback data');
        return {
          estimated_completion_date: null,
          monthly_contribution_needed: 0,
          probability_of_success: 0,
          suggestions: []
        };
      }
      return rejectWithValue(error.message);
    }
  }
);

export const contributeToGoal = createAsyncThunk(
  'goals/contributeToGoal',
  async ({ id, amount, accountId, description }: { 
    id: string; 
    amount: number; 
    accountId: string; 
    description?: string; 
  }) => {
    if (!accountId) {
      throw new Error('Account ID is required for goal contribution');
    }
    const response = await apiService.contributeToGoal(id, amount, accountId, description);
    return response;
  }
);

export const startAIGoalSession = createAsyncThunk(
  'goals/startAISession',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.startAIGoalSession();
      return response;
    } catch (error: any) {
      console.error('❌ startAIGoalSession error:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.error || 
        error.message || 
        'Failed to start AI goal session'
      );
    }
  }
);

export const chatWithAI = createAsyncThunk(
  'goals/chatWithAI',
  async ({ sessionId, message }: { sessionId: string; message: string }, { rejectWithValue }) => {
    try {
      if (!sessionId) {
        throw new Error('No active AI session. Please restart the session.');
      }
      console.log('🤖 Redux: Sending chat message to AI:', { sessionId, message });
      const response = await apiService.chatWithAI(sessionId, message);
      console.log('🤖 Redux: AI chat response received:', response);
      return response;
    } catch (error: any) {
      console.error('❌ chatWithAI error:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.error || 
        error.message || 
        'Failed to send message'
      );
    }
  }
);

export const finalizeAIGoal = createAsyncThunk(
  'goals/finalizeAIGoal',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      if (!sessionId) {
        throw new Error('No active AI session. Please restart the session.');
      }
      const response = await apiService.finalizeAIGoal(sessionId);
      return response;
    } catch (error: any) {
      console.error('❌ finalizeAIGoal error:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.error || 
        error.message || 
        'Failed to create goal'
      );
    }
  }
);

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearGoalProgress: (state) => {
      state.goalProgress = null;
    },
    clearGoalPredictions: (state) => {
      state.goalPredictions = null;
    },
    setSelectedGoal: (state, action) => {
      state.selectedGoal = action.payload;
    },
    clearAISession: (state) => {
      state.aiSession = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch goals
      .addCase(fetchGoals.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.isLoading = false;
        state.goals = action.payload.goals || [];
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to fetch goals';
        // Set empty array on error
        state.goals = [];
      })
      // Fetch single goal
      .addCase(fetchGoal.fulfilled, (state, action) => {
        state.selectedGoal = action.payload.goal;
      })
      // Fetch goal progress
      .addCase(fetchGoalProgress.fulfilled, (state, action) => {
        state.goalProgress = action.payload.progress || action.payload;
      })
      // Fetch goal predictions
      .addCase(fetchGoalPredictions.fulfilled, (state, action) => {
        state.goalPredictions = action.payload.predictions || action.payload;
      })
      // Create goal
      .addCase(createGoal.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createGoal.fulfilled, (state, action) => {
        state.isLoading = false;
        const newGoal = action.payload.goal || action.payload;
        if (newGoal) {
          state.goals.push(newGoal);
        }
        state.error = null;
      })
      .addCase(createGoal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to create goal';
      })
      // Update goal
      .addCase(updateGoal.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateGoal.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedGoal = action.payload.goal || action.payload;
        if (updatedGoal) {
          const index = state.goals.findIndex(g => g.id === updatedGoal.id);
          if (index !== -1) {
            state.goals[index] = updatedGoal;
          }
          
          // Also update selectedGoal if it matches
          if (state.selectedGoal && state.selectedGoal.id === updatedGoal.id) {
            state.selectedGoal = updatedGoal;
          }
        }
        state.error = null;
      })
      .addCase(updateGoal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to update goal';
      })
      // Delete goal
      .addCase(deleteGoal.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.isLoading = false;
        state.goals = state.goals.filter(g => g.id !== action.payload);
        if (state.selectedGoal && state.selectedGoal.id === action.payload) {
          state.selectedGoal = null;
        }
        state.error = null;
      })
      .addCase(deleteGoal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to delete goal';
      })
      // Contribute to goal
      .addCase(contributeToGoal.fulfilled, (state, action) => {
        const updatedGoal = action.payload.goal || action.payload;
        if (updatedGoal) {
          const index = state.goals.findIndex(g => g.id === updatedGoal.id);
          if (index !== -1) {
            state.goals[index] = updatedGoal;
          }
        }
      })
      // AI Session
      .addCase(startAIGoalSession.fulfilled, (state, action) => {
        state.isLoading = false;
        console.log('🚀 Redux: AI session started:', action.payload);
        state.aiSession = action.payload;
        state.error = null;
      })
      .addCase(startAIGoalSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startAIGoalSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to start AI session';
        state.aiSession = null;
      })
      .addCase(chatWithAI.fulfilled, (state, action) => {
        state.isLoading = false;
        console.log('💬 Redux: AI chat response processed:', action.payload);
        state.aiSession = action.payload;
        state.error = null;
      })
      .addCase(chatWithAI.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(chatWithAI.rejected, (state, action) => {
        state.isLoading = false;
        console.error('❌ Redux: AI chat failed:', action.error);
        state.error = action.error.message || 'Failed to chat with AI';
      })
      .addCase(finalizeAIGoal.fulfilled, (state, action) => {
        state.isLoading = false;
        const newGoal = action.payload.goal || action.payload;
        if (newGoal) {
          state.goals.push(newGoal);
        }
        state.aiSession = null;
        state.error = null;
      })
      .addCase(finalizeAIGoal.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(finalizeAIGoal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to create goal';
      });
  }
});

export const { 
  clearError, 
  setSelectedGoal, 
  clearAISession, 
  clearGoalProgress, 
  clearGoalPredictions 
} = goalsSlice.actions;
export default goalsSlice.reducer;