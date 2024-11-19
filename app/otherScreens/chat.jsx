import { View, Text, TouchableOpacity, Image, KeyboardAvoidingView, Platform, FlatList, TextInput, StyleSheet, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../config/firebaseConfig';
import { collection, query, where, onSnapshot, addDoc, deleteDoc } from 'firebase/firestore';
import moment from 'moment';


export default function Chat() {
  const searchParams = useLocalSearchParams();
  const chatUser = JSON.parse(searchParams.chatData);
  const navigation = useNavigation();
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [currentUserUid, setCurrentUserUid] = useState('');
  const [chatUserData, setChatUserData] = useState();
  const [message, setMessage] = useState("");
  const [chatList, setChatList] = useState([]);

  useEffect(() => {
    // Fetch Current User
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserEmail(user.email);
        setCurrentUserUid(user.uid);
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
              height: 70,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 15,
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
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

            <View>
            <Text style={{ fontWeight: 'bold', color: 'white', fontSize: 22 }}>
              {chatUserData?.name || chatUser?.name}
            </Text>
            <Text style={{ fontSize: 14, color: chatUserData?.isOnline ? 'green' : 'green' }}>
    {chatUserData?.isOnline ? 'Online' : 'Offline'}
  </Text>
            </View>
          </LinearGradient>
        ),
        headerShown: true,
        headerTransparent: true,
        headerTitle: '',
      });
    }
  }, [navigation, chatUser, chatUserData]);

  useEffect(() => {
    // Check if both state.uid and currentUserId are available
    if (currentUserUid && chatUser?.uid) {
      const q = query(
        collection(db, "chat"),
        where(chatUser?.uid,"==", true),
        where(currentUserUid,"==", true),
      );

      const messageUnsubscribe = onSnapshot(q, (docSnap) => {
        const list = [];
        docSnap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        const sortList = list.sort((a, b) => a.timestamp - b.timestamp);
        setChatList(sortList);
      });

      return () => {
        messageUnsubscribe(); // Unsubscribe from the snapshot listener when the component unmounts
      };
    }
  }, [currentUserUid, chatUser?.uid]);

  const sendMessages = () => {
    if (!message.trim()) return;

    addDoc(collection(db, "chat"), {
      message,
      [chatUser?.uid]: true,
      [currentUserUid]: true,
      senderUid: currentUserUid,
      receiverUid: chatUser?.uid,
      timestamp: Date.now(),
    });
    setMessage("");
  };

  const renderMessage = ({ item }) => {
    const isSentMessage = item.senderUid === currentUserUid;
  
    return (
      <ScrollView
        style={[
          styles.messageContainer,
          isSentMessage ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' },
        ]}
      >
        {isSentMessage ? (
          <LinearGradient
            colors={['#3b82f6', '#9333ea']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.messageSent]}
          >
            <Text style={[styles.messageText, { color: 'white' }]}>{item.message}</Text>
            <Text style={[styles.timestamp, { color: 'white' }]}>
              {moment(item.timestamp).format('hh:mm A')}
            </Text>
          </LinearGradient>
        ) : (
          <>
          <View style={{ flexDirection: 'row' }}>
          <Text>alhan</Text>
          <View style={styles.messageReceived}>
            <Text style={[styles.messageText, { color: 'black' }]}>{item.message}</Text>
            <Text style={[styles.timestamp, { color: '#999' }]}>
              {moment(item.timestamp).format('hh:mm A')}
            </Text>
          </View>
          </View>
          </>
        )}
      </ScrollView>
    );
  };
  

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Message List */}
      <FlatList
        data={chatList}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
      />

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#aaa"
          value={message}
          onChangeText={setMessage}
        />
        <LinearGradient
        colors={['#3b82f6', '#9333ea']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.sendButtonGradient}
      >
        <TouchableOpacity style={styles.sendButton} onPress={sendMessages}>
          <Ionicons name="send" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f1f1',
  },
  messageList: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingTop: 80,
    paddingBottom: 20
  },
  messageContainer: {
    marginVertical: 5,
    maxWidth: '90%',
  },
  messageSent: {
    padding: 10,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20
  },
  messageReceived: {
    padding: 10,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: '#fff',
  },
  timestamp: {
    alignSelf: 'flex-end',
    fontSize: 10,
    marginTop: 5,
  },
  messageText: {
    fontSize: 15,
    fontWeight: 500
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },
  input: {
    flex: 1,
  fontSize: 16,
  padding: 10,
  backgroundColor: '#f5f5f5',
  borderRadius: 25,
  marginRight: 10,
  borderColor: '#ddd',
  borderWidth: 1,
  },
  sendButtonGradient: {
    borderRadius: 25,
    width: 50,
    height: 50,
  },
  sendButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

});