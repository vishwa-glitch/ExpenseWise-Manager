import React, { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { useTypedSelector } from '../hooks/useTypedSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { markNotificationRequestComplete } from '../store/slices/onboardingSlice';

interface NotificationRequestWrapperProps {
  children: React.ReactNode;
}

const NotificationRequestWrapper: React.FC<NotificationRequestWrapperProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const onboardingState = useTypedSelector((state) => state.onboarding);
  const authState = useTypedSelector((state) => state.auth);
  const [hasRequestedPermission, setHasRequestedPermission] = useState(false);

  useEffect(() => {
    const requestNotificationPermission = async () => {
      // Request notification permission when:
      // 1. User is authenticated (logged in)
      // 2. Onboarding is complete (initial 3 screens done)
      // 3. Overlay is not visible (guided tour completed)
      // 4. Haven't requested permission yet in this session
      // 5. User hasn't been asked before (stored flag)
      
      const shouldRequest = authState.isAuthenticated && 
                           onboardingState.isOnboardingComplete && 
                           !onboardingState.isOverlayVisible && 
                           !hasRequestedPermission &&
                           !onboardingState.hasCompletedNotificationRequest;
      
      if (shouldRequest) {
        console.log('🔔 Requesting notification permissions...');
        setHasRequestedPermission(true);
        
        try {
          // Add a small delay to ensure navigation has settled
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { status: existingStatus } = await Notifications.getPermissionsAsync();
          console.log('🔔 Current permission status:', existingStatus);
          
          // Only request if status is undetermined (never asked before)
          if (existingStatus === 'undetermined') {
            console.log('🔔 Showing native permission prompt...');
            const { status } = await Notifications.requestPermissionsAsync();
            console.log('🔔 Permission request result:', status);
            
            if (status === 'granted') {
              console.log('✅ Notification permissions granted');
            } else {
              console.log('⚠️ Notification permissions denied');
            }
          } else {
            console.log('🔔 Permission already determined:', existingStatus);
          }
          
          // Mark as complete regardless of result
          await dispatch(markNotificationRequestComplete());
        } catch (error) {
          console.error('❌ Error requesting notification permissions:', error);
          await dispatch(markNotificationRequestComplete());
        }
      }
    };

    requestNotificationPermission();
  }, [authState.isAuthenticated, onboardingState.isOnboardingComplete, onboardingState.isOverlayVisible, onboardingState.hasCompletedNotificationRequest, hasRequestedPermission, dispatch]);

  return <>{children}</>;
};

export default NotificationRequestWrapper;
