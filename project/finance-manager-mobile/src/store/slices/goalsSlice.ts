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

export const contributeToGoal = createAsyncThunk(
  'goals/contributeToGoal',
  async ({ id, amount }: { id: string; amount: number }) => {
    const response = await apiService.contributeToGoal(id, amount);
    return response;
  }
);

export const startAIGoalSession = createAsyncThunk(
  'goals/startAISession',
  async () => {
    const response = await apiService.startAIGoalSession();
    return response;
  }
);

export const chatWithAI = createAsyncThunk(
  'goals/chatWithAI',
  async ({ sessionId, message }: { sessionId: string; message: string }) => {
    const response = await apiService.chatWithAI(sessionId, message);
    return response;
  }
);

export const finalizeAIGoal = createAsyncThunk(
  'goals/finalizeAIGoal',
  async (sessionId: string) => {
    const response = await apiService.finalizeAIGoal(sessionId);
    return response;
  }
);

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
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
      // Create goal
      .addCase(createGoal.fulfilled, (state, action) => {
        const newGoal = action.payload.goal || action.payload;
        if (newGoal) {
          state.goals.push(newGoal);
        }
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
        state.aiSession = action.payload;
      })
      .addCase(chatWithAI.fulfilled, (state, action) => {
        state.aiSession = action.payload;
      })
      .addCase(finalizeAIGoal.fulfilled, (state, action) => {
        const newGoal = action.payload.goal || action.payload;
        if (newGoal) {
          state.goals.push(newGoal);
        }
        state.aiSession = null;
      });
  },
});

export const { clearError, setSelectedGoal, clearAISession } = goalsSlice.actions;
export default goalsSlice.reducer;