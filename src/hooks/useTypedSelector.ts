import { useSelector, TypedUseSelectorHook } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

// Memoized selector for user data to prevent unnecessary re-renders
const selectUserData = createSelector(
  [
    (state: RootState) => state.auth.user,
    (state: RootState) => state.user.profile,
    (state: RootState) => state.auth.isAuthenticated,
    (state: RootState) => state.user.isLoading,
  ],
  (authUser, userProfile, isAuthenticated, isLoading) => {
    // Use profile data if available, otherwise fall back to auth user data
    const user = userProfile || authUser;
    
    return {
      user,
      authUser,
      userProfile,
      isAuthenticated,
      isLoading,
    };
  }
);

// Custom selector for user data that prioritizes profile data over auth data
export const useUserData = () => {
  return useTypedSelector(selectUserData);
};