import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

interface NotificationsState {
  notifications: any[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getNotifications();
      return response;
    } catch (error: any) {
      // Handle 404 errors gracefully
      if (error.response?.status === 404) {
        console.log('🔔 Notifications endpoint not available (404) - using empty notifications list');
        return { notifications: [] };
      }
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUnreadNotifications = createAsyncThunk(
  'notifications/fetchUnreadNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getUnreadNotifications();
      return response;
    } catch (error: any) {
      // Handle 404 errors gracefully
      if (error.response?.status === 404) {
        console.log('🔔 Unread notifications endpoint not available (404) - using count 0');
        return { count: 0 };
      }
      return rejectWithValue(error.message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id: string) => {
    await apiService.markNotificationAsRead(id);
    return id;
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    decrementUnreadCount: (state) => {
      if (state.unreadCount > 0) {
        state.unreadCount -= 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.notifications || [];
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to fetch notifications';
        state.notifications = [];
      })
      // Fetch unread notifications
      .addCase(fetchUnreadNotifications.fulfilled, (state, action) => {
        state.unreadCount = action.payload.count || 0;
      })
      .addCase(fetchUnreadNotifications.rejected, (state) => {
        state.unreadCount = 0;
      })
      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(n => n.id === action.payload);
        if (index !== -1) {
          state.notifications[index].read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
  },
});

export const { clearError, decrementUnreadCount } = notificationsSlice.actions;
export default notificationsSlice.reducer;