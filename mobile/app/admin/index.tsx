import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../../src/context/auth-context';

export default function AdminHomeScreen() {
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>ADMIN</Text>

        <Text style={styles.title}>Halo, {user?.name}</Text>

        <Text style={styles.subtitle}>Authentication berhasil. Admin dashboard akan dibangun pada tahap berikutnya.</Text>

        <Pressable
          style={styles.button}
          onPress={() => {
            void signOut();
          }}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F7F8',
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#6B7280',
  },

  title: {
    marginTop: 8,
    fontSize: 30,
    fontWeight: '700',
    color: '#111827',
  },

  subtitle: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 24,
    color: '#6B7280',
  },

  button: {
    alignItems: 'center',
    marginTop: 32,
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: '#111827',
  },

  buttonText: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
