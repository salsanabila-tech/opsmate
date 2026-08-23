import { Redirect, Stack } from 'expo-router';

import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuth } from '../../src/context/auth-context';

export default function TechnicianLayout() {
  const { status, user } = useAuth();

  if (status === 'loading') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  if (user.role !== 'TECHNICIAN') {
    return <Redirect href="/" />;
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
  },
});
