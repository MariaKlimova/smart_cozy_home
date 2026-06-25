import { Stack, router } from 'expo-router';
import { useEffect } from 'react';

export default function BedroomSensorsRedirectRoute() {
  useEffect(() => {
    router.replace({ pathname: '/bedroom', params: { tab: 'sensors' } });
  }, []);

  return <Stack.Screen options={{ headerShown: false }} />;
}
