import { useSignUp } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from '@/tw';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  if (!isLoaded) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    setIsLoading(true);
    setErrors({});

    try {
      await signUp.create({
        emailAddress,
        password,
        firstName: fullName.split(' ')[0],
        lastName: fullName.split(' ')[1] || '',
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      const newErrors: Record<string, string> = {};
      if (err.errors) {
        err.errors.forEach((e: any) => {
          newErrors[e.code] = e.message;
        });
      }
      setErrors(newErrors);
    } finally {
      setIsLoading(false);
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;

    setIsLoading(true);
    setErrors({});

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace('/(tabs)/home');
      }
    } catch (err: any) {
      const newErrors: Record<string, string> = {};
      if (err.errors) {
        err.errors.forEach((e: any) => {
          newErrors[e.code] = e.message;
        });
      }
      setErrors(newErrors);
    } finally {
      setIsLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView className="flex-1 px-6 py-8">
          <Text className="text-2xl font-bold mb-2">Verify Email</Text>
          <Text className="text-gray-600 mb-6">
            We've sent a verification code to {emailAddress}
          </Text>

          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
            placeholder="Enter verification code"
            value={code}
            onChangeText={setCode}
            editable={!isLoading}
          />

          {errors.code && <Text className="text-red-500 text-sm mb-4">{errors.code}</Text>}

          <Pressable
            className="bg-blue-500 rounded-lg py-3 items-center mb-4"
            onPress={onPressVerify}
            disabled={isLoading}
          >
            <Text className="text-white font-semibold">
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </Text>
          </Pressable>

          <Pressable onPress={() => setPendingVerification(false)}>
            <Text className="text-blue-500 text-center">Back to Sign Up</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6 py-8">
        <Text className="text-3xl font-bold mb-2">Create Account</Text>
        <Text className="text-gray-600 mb-8">Join our learning community</Text>

        <View className="mb-4">
          <Text className="text-sm font-semibold mb-2">Full Name</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3"
            placeholder="Enter your full name"
            value={fullName}
            onChangeText={setFullName}
            editable={!isLoading}
          />
          {errors.name && <Text className="text-red-500 text-sm mt-1">{errors.name}</Text>}
        </View>

        <View className="mb-4">
          <Text className="text-sm font-semibold mb-2">Email</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3"
            placeholder="Enter your email"
            value={emailAddress}
            onChangeText={setEmailAddress}
            keyboardType="email-address"
            editable={!isLoading}
            autoCapitalize="none"
          />
          {errors.email_address && (
            <Text className="text-red-500 text-sm mt-1">{errors.email_address}</Text>
          )}
        </View>

        <View className="mb-6">
          <Text className="text-sm font-semibold mb-2">Password</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />
          {errors.password && <Text className="text-red-500 text-sm mt-1">{errors.password}</Text>}
        </View>

        <Pressable
          className="bg-blue-500 rounded-lg py-3 items-center mb-4"
          onPress={onSignUpPress}
          disabled={isLoading}
        >
          <Text className="text-white font-semibold">
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </Text>
        </Pressable>

        <Pressable onPress={() => router.push('/sign-in')}>
          <Text className="text-center text-gray-600">
            Already have an account?{' '}
            <Text className="text-blue-500 font-semibold">Sign In</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
