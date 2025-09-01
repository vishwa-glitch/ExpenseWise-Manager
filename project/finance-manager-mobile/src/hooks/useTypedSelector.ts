import { useSelector, TypedUseSelectorHook } from 'react-redux';
import { RootState } from '../store';

export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

// Custom selector for user data that prioritizes profile data over auth data
export const useUserData = () => {
  return useTypedSelector((state) => {
    const authUser = state.auth.user;
    const userProfile = state.user.profile;
    
    // Use profile data if available, otherwise fall back to auth user data
    const user = userProfile || authUser;
    
    return {
      user,
      authUser,
      userProfile,
      isAuthenticated: state.auth.isAuthenticated,
      isLoading: state.user.isLoading,
    };
  });
};