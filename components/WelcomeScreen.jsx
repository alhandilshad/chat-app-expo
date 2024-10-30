import { View, Text, Image } from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient';
import { MaskedView } from '@react-native-masked-view/masked-view';

export default function WelcomeScreen() {
  return (
    <View style={{
        height: '100%',
        backgroundColor: 'white',
        padding: 20,
        paddingTop: 40
    }}>
      <Image source={require('@/assets/images/images.png')}></Image>
    </View>
  )
}