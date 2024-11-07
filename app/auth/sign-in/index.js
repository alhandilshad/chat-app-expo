import { View, Text, TextInput, StyleSheet, TouchableOpacity, ToastAndroid, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';
import GradientButton from '../../../components/GradientButton'
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../../config/firebaseConfig';

const { width, height } = Dimensions.get('window');

export default function signIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
    const navigation = useNavigation();
    const router = useRouter();

    useEffect(() => {
        navigation.setOptions({
            headerShown: false,
        })
    }, [])

    const handleSignIn = () => {
      console.log('button is clicked')
      if (!email || !password) {
        ToastAndroid.show('Please fill in all the fields', ToastAndroid.LONG);
        return;
      }
      signInWithEmailAndPassword(auth, email, password)
        .then((response) => {
          router.replace('/(tabs)/home')
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(errorMessage)
          if(errorCode === 'auth/invalid-credential'){
            ToastAndroid.show('Invalid email or password', ToastAndroid.LONG);
          }
        });
    }

  return (
    <View style={{
        padding: width * 0.06,
        paddingTop: height * 0.05,
        backgroundColor: 'white',
        height: '100%',
    }}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={{
        fontSize: width * 0.08,
        marginTop: height * 0.03,
      }}>Let's Sign You In</Text>
      <Text style={{
        fontSize: width * 0.08,
        color: 'gray',
        marginTop: height * 0.02,
      }}>Welcome Back</Text>

      <View style={{
        marginTop: height * 0.05,
      }}>
        <Text>Email</Text>
        <TextInput placeholder='Enter email' style={styles.input} onChangeText={setEmail} />
      </View>

      <View style={{
        marginTop: height * 0.05,
        marginBottom: height * 0.07,
      }}>
        <Text>Password</Text>
        <TextInput placeholder='Enter password' secureTextEntry={true} style={styles.input} onChangeText={setPassword} />
      </View>

      <GradientButton text='Sign In' click={handleSignIn} />

      <TouchableOpacity onPress={() => router.replace('/auth/sign-up')} style={{
        paddingVertical: height * 0.025,
        backgroundColor: 'white',
        color: 'white',
        borderRadius: 15,
        marginTop: height * 0.03,
        borderWidth: 1.5,
        borderColor: 'blue',
      }}>
        <Text style={{
          color: 'blue',
          textAlign: 'center',
          fontSize: width * 0.04,
        }}>Create Account</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  input: {
    padding: height * 0.020,
    borderWidth: 1.3,
    borderRadius: 15,
    borderColor: 'blue',
  }
})