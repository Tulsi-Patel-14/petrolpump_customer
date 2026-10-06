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
      await checkSession();
      setLoading(false);
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
