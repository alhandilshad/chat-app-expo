import { View, Text, TextInput, StyleSheet, TouchableOpacity, ToastAndroid, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';
import GradientButton from '../../../components/GradientButton'

const { width, height } = Dimensions.get('window');

export default function signIn() {
    const navigation = useNavigation();
    const router = useRouter();

    useEffect(() => {
        navigation.setOptions({
            headerShown: false,
        })
    }, [])

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
        <TextInput placeholder='Enter email' style={styles.input} />
      </View>

      <View style={{
        marginTop: height * 0.05,
        marginBottom: height * 0.07,
      }}>
        <Text>Password</Text>
        <TextInput placeholder='Enter password' secureTextEntry={true} style={styles.input} />
      </View>

      <GradientButton text='Sign In' />

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