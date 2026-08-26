import { Redirect, Stack } from 'expo-router';

import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuth } from '../../src/context/auth-context';

export default function CustomerLayout() {
  const { status, user } = useAuth();

  if (status === 'loading') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (status === 'unauthenticated' || !user) {
    return <Redirect href="/auth/login" />;
  }

  if (user.role !== 'CUSTOMER' || !user.customerId) {
    return <Redirect href="/auth/login" />;
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
