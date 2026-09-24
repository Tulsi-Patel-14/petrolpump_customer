import React from 'react';
import { LogBox } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';

// Ignore specific warnings for the NFP
LogBox.ignoreLogs([
  'Warning: SafeAreaProvider: `ref` is not a prop.',
  'Warning: Function components cannot be given refs.',
]);

function App(): React.JSX.Element {
  return <RootNavigator />;
}

export default App;
