import { View, Text, Image } from 'react-native';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import GradientButton from '@/components/GradientButton';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const router = useRouter()
  return (
    <View style={{
        height: '100%',
        backgroundColor: 'white',
        padding: 20,
        paddingTop: 50
    }}>
      <MaskedView
        maskElement={
          <Text style={{
            fontSize: 32,
            fontWeight: 'bold',
            textAlign: 'center',
            color: 'black', // This color won’t display but is required for MaskedView to work.
          }}>
            Beep-One
          </Text>
        }
      >
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          colors={['#3b82f6', '#9333ea']}
          style={{
            height: 40, // Adjust height to match the text component
            justifyContent: 'center',
          }}
        />
      </MaskedView>
      <Image style={{
        width: '100%',
        marginTop: 30,
        height: 240
      }} source={require('@/assets/images/images.png')}></Image>
      <Text style={{
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 30
      }}>Let's start the chat</Text>
      <Text style={{
        marginTop: 10,
        color: '#777',
        textAlign: 'center',
        marginBottom: 50
      }}>Connect with freinds and family securely and private. Enjoy!</Text>

      <GradientButton text='Get Started' click={() => router.push('/auth/sign-in')} />
    </View>
  )
}