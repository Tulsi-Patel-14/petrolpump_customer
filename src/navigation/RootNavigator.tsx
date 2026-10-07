import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import CustomerNavigator from './CustomerNavigator';
import { useAuthStore } from '../store/authStore';
import LoadingScreen from '../components/LoadingScreen';

const RootNavigator = () => {
  const { isAuthenticated, checkSession, user } = useAuthStore();
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        // Add a 10 second timeout so the app never hangs forever
        await Promise.race([
          checkSession(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Session check timed out')), 10000)
          )
        ]);
      } catch (e) {
        console.warn('Session check failed or timed out, continuing as logged out.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [checkSession]);

  if (loading) {
    return <LoadingScreen message="Starting FuelApp..." />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <CustomerNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator;
