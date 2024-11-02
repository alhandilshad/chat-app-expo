import { View, Text, TouchableOpacity, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation, useRouter } from 'expo-router'
import {LinearGradient} from'expo-linear-gradient'
import { onSnapshot, collection } from 'firebase/firestore'
import { db, auth } from '../../config/firebaseConfig'
import { onAuthStateChanged } from 'firebase/auth'

export default function user() {
    const navigation = useNavigation();
    const router = useRouter();
    const [userlist, setUserlist] = useState([]);
    const [currentUserEmail, setcurrentUserEmail] = useState();

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
        getUsers()
    }, [navigation])

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setcurrentUserEmail(user.email);
        }else{
          console.log("User is signed out");
        }
      });
      return () => unsubscribe();
    }, []);

    const getUsers = () => {
      const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
        const list = [];
        snapshot.forEach((doc) => {
          list.push(doc.data());
        });
        setUserlist(list);
      });
      return unsubscribe;
    };

  return (
    <View style={{
        backgroundColor: 'white',
        height: '100%',
        paddingTop: 20,
        padding: 20
    }}>
      {userlist.filter((user) => user.email !== currentUserEmail).map((user, index) => (
        <TouchableOpacity onPress={() => router.push({
          pathname: '/otherScreens/userProfile',
          params: {
            userData: JSON.stringify(user)
          }
        })} key={index} style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          marginBottom: 10,
          padding: 10,
          borderRadius: 10,
          backgroundColor: 'white',
          shadowColor: 'blue',
          shadowOffset: { width: 4, height: 4 },
          shadowOpacity: 0.6,
          shadowRadius: 6,
          elevation: 5,
          borderWidth: 0.4,
          borderColor: 'blue'
        }}>
          {user.profileImg ? (
            <Image source={{ uri: user.profileImg }} style={{
              width: 70,
              height: 70,
              borderRadius: 40,
              backgroundColor: 'lightgray',
              borderWidth: 0.5,
              borderColor: 'blue'
            }}></Image>
          ) : (
            <Image source={user.gender === 'Male' ? require('../../assets/images/download.jpg') : require('../../assets/images/download (1).jpg')} style={{
              width: 70,
              height: 70,
              borderRadius: 40,
              backgroundColor: 'lightgray',
              borderWidth: 0.5,
              borderColor: 'blue'
            }}></Image>
          )}
          <View>
            <Text style={{
              fontWeight: 'bold',
              fontSize: 20,
              color: 'black'
            }}>{user.name}</Text>
            <Text style={{
              fontSize: 14,
              color: 'gray'
            }}>{user.email}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  )
}