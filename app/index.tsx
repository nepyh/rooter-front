import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { Input, Button, Text } from '@/components';
import { Stack, Row } from '@/components';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
