import { Redirect, Stack } from 'expo-router';

import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuth } from '../../src/context/auth-context';

export default function AuthLayout() {
  const { status, user } = useAuth();

  if (status === 'loading') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (status === 'authenticated' && user?.role === 'CUSTOMER') {
    return <Redirect href="/customer" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,

    alignItems: 'center',

    justifyContent: 'center',

    backgroundColor: '#F7F7F8',
  },
});
