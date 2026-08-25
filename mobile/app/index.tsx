import { Redirect } from 'expo-router';

import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuth } from '../src/context/auth-context';

export default function IndexScreen() {
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

  return <Redirect href="/technician" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,

    alignItems: 'center',

    justifyContent: 'center',

    backgroundColor: '#F7F7F8',
  },
});
