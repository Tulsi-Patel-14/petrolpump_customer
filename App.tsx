import React from 'react';
import { LogBox } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';

// Ignore specific warnings for the NFP
LogBox.ignoreLogs([
  'Warning: SafeAreaProvider: `ref` is not a prop.',
  'Warning: Function components cannot be given refs.',
]);

import { SafeAreaProvider } from 'react-native-safe-area-context';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
}

export default App;
