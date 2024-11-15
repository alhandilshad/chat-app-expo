import { View, Text, TouchableOpacity, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../config/firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';


export default function Chat() {
  const searchParams = useLocalSearchParams();
  const chatUser = JSON.parse(searchParams.chatData);
  const navigation = useNavigation();
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [currentUserUid, setCurrentUserUid] = useState('');
  const [chatUserData, setChatUserData] = useState();

  useEffect(() => {
    // Fetch Current User
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserEmail(user.email);
      } else {
        console.log('User is signed out');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Fetch Chat User Data
    const userQuery = query(
      collection(db, 'users'),
      where('uid', '==', chatUser?.uid)
    );

    const unsubscribe = onSnapshot(userQuery, (snapshot) => {
      snapshot.forEach((doc) => {
        setChatUserData(doc.data());
      });
    });

    return () => unsubscribe();
  }, [chatUser?.uid]);

  useEffect(() => {
    // Dynamically Set Header When Data is Ready
    if (chatUser || chatUserData) {
      navigation.setOptions({
        header: () => (
          <LinearGradient
            colors={['#3b82f6', '#9333ea']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              height: 60,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 15,
            }}
          >
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 15 }}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <Image
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: 'lightgray',
                borderWidth: 0.5,
                borderColor: 'blue',
              }}
              source={
                chatUserData?.profileImg
                  ? { uri: chatUserData.profileImg }
                  : chatUser?.profileImg
                    ? { uri: chatUser.profileImg }
                    : chatUser?.gender === 'Male'
                      ? require('../../assets/images/download.jpg')
                      : require('../../assets/images/download (1).jpg')
              }
            />

            <Text style={{ fontWeight: 'bold', color: 'white', fontSize: 22 }}>
              {chatUserData?.name || chatUser?.name}
            </Text>
          </LinearGradient>
        ),
        headerShown: true,
        headerTransparent: true,
        headerTitle: '',
      });
    }
  }, [navigation, chatUser, chatUserData]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Chat Screen</Text>
    </View>
  );
}
