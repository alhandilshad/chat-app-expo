import { View, Text, TouchableOpacity, Image, FlatList, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../config/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { FontAwesome } from '@expo/vector-icons';

export default function Message() {
  const navigation = useNavigation();
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [userlist, setUserlist] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const router = useRouter()

  useEffect(() => {
    navigation.setOptions({
      header: () => (
        <LinearGradient
          colors={['#3b82f6', '#9333ea']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ height: 60, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ fontWeight: 'bold', color: 'white', fontSize: 22 }}>Messages</Text>
        </LinearGradient>
      ),
    });
    getUsers();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserEmail(user.email);
      } else {
        console.log('User is signed out');
      }
    });
    return () => unsubscribe();
  }, []);

  const getUsers = () => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push(doc.data());
      });
      setUserlist(list);
    });
    return unsubscribe;
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity 
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 20,
      }}
      onPress={() => router.push({
        pathname: '/otherScreens/chat',
        params: {
          chatData: JSON.stringify(item)
        }
      })}
    >
      <Image 
        style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: 'lightgray',
          borderWidth: 0.5,
          borderColor: 'blue',
          marginRight: 12
        }} 
        source={
          item?.profileImg 
            ? { uri: item?.profileImg } 
            : item.gender === 'Male' 
            ? require('../../assets/images/download.jpg') 
            : require('../../assets/images/download (1).jpg')
        }
      />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>
          {item.name}
        </Text>
        <Text style={{ fontSize: 13, color: '#888', marginTop: 2 }}>
          {item.userName !== '' ? item.userName : item.gender}
        </Text>
      </View>
      <FontAwesome name="camera" size={20} color="blue" />
    </TouchableOpacity>
  );

  const filteredUserList = userlist.filter((user) => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) && user.email !== currentUserEmail
  );

  return (
    <View style={{ backgroundColor: 'white', flex: 1 }}>
      <TextInput
        style={{
          margin: 16,
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 30,
          borderWidth: 1,
          borderColor: 'blue',
          fontSize: 16,
        }}
        placeholder="Search messages..."
        placeholderTextColor={'gray'}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredUserList}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderUserItem}
      />
    </View>
  );
}
