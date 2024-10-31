import React from 'react'
import { Tabs } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';

export default function Tablayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue', tabBarLabelStyle:{ paddingBottom: 5, fontSize: 12, fontWeight: 'bold' }}}>
        <Tabs.Screen name='home' options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({color}) => <Ionicons name="home-sharp" size={24} color={color} />
        }} />
        <Tabs.Screen name='message' options={{
          tabBarLabel: 'Messages',
          tabBarIcon: ({color}) => <Entypo name="message" size={24} color={color} />
        }} />
        <Tabs.Screen name='user' options={{
          tabBarLabel: 'Users',
          tabBarIcon: ({color}) => <Entypo name="users" size={24} color={color} />
        }} />
        <Tabs.Screen name='profile' options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({color}) => <AntDesign name="user" size={24} color={color} />
        }} />
    </Tabs>
  )
}