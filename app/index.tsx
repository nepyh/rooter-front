import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { Input, Button, Text } from '@/components';
import { Stack, Row } from '@/components';
import { useRouter } from 'expo-router';

export default function App() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <Button onPress={() => router.push('/Login')}> 로그인 </Button>
      <Button onPress={() => router.push('/Signup')}> 회원가입 </Button>
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
