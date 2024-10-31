import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { useNavigation } from 'expo-router'

import {LinearGradient} from'expo-linear-gradient'

export default function user() {
    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({
            header: () => (
                <LinearGradient
                  colors={['#3b82f6', '#9333ea']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ height: 60, alignItems: 'center', paddingTop: 20 }}
                >
                  <Text style={{ fontWeight: 'bold', color: 'white', fontSize: 22 }}>Users</Text>
                </LinearGradient>
              ),
        })
    })
  return (
    <View style={{
        backgroundColor: 'white',
        height: '100%',
        paddingTop: 20,
        padding: 20
    }}>
      <Text>user</Text>
    </View>
  )
}