import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'

export default function GradientButton({ text, click }) {
  return (
    <TouchableOpacity onPress={click} style={{ width: '100%' }}>
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          colors={['#3b82f6', '#9333ea']}
          style={{
            paddingVertical: 12,
            alignItems: 'center',
            borderRadius: 8,
          }}
        >
          <Text style={{
            color: 'white',
            fontWeight: 'bold',
            fontSize: 18,
          }}>
            {text}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
  )
}