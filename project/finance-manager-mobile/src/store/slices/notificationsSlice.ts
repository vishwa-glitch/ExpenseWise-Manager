import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

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
      // Since we don't have backend integration, return empty notifications
      console.log('🔔 Using local notifications - no backend integration');
      return { notifications: [] };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUnreadNotifications = createAsyncThunk(
  'notifications/fetchUnreadNotifications',
  async (_, { rejectWithValue }) => {
    try {
      // Since we don't have backend integration, return 0 unread
      console.log('🔔 Using local notifications - no backend integration');
      return { count: 0 };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id: string) => {
    // Since we don't have backend integration, just return the id
    console.log('🔔 Marking notification as read locally:', id);
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
    addLocalNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    markLocalNotificationAsRead: (state, action) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        state.notifications[index].read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
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

export const { 
  clearError, 
  decrementUnreadCount, 
  addLocalNotification, 
  markLocalNotificationAsRead, 
  clearAllNotifications 
} = notificationsSlice.actions;
export default notificationsSlice.reducer;