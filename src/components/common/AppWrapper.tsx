import React, { useEffect } from 'react';
import { useAppUpdate } from '../../hooks/useAppUpdate';
import AppUpdateOverlay from './AppUpdateOverlay';
import AppNavigator from '../../navigation/AppNavigator';
import UpdateTestPanel from './UpdateTestPanel';

const AppWrapper: React.FC = () => {
  const { isUpdateRequired, isLoading } = useAppUpdate();

  // If an update is required, show the overlay and block app usage
  if (isUpdateRequired) {
    return <AppUpdateOverlay visible={true} />;
  }

  // If still loading, show the app normally (update check is in progress)
  if (isLoading) {
    return <AppNavigator />;
  }

  // No update required, show the app normally
  return (
    <>
      <AppNavigator />
      <UpdateTestPanel />
    </>
  );
};

export default AppWrapper;
