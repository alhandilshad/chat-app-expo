import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { FontAwesome } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import moment from 'moment'

export default function home() {
    const navigation = useNavigation();
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        navigation.setOptions({
            header: () => (
                <LinearGradient
                  colors={['#3b82f6', '#9333ea']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ height: 70, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, paddingHorizontal: 20 }}
                >
                  <Text style={{ fontWeight: 'bold', color: 'white', fontSize: 22 }}>Beep-One</Text>
                  <FontAwesome name="bell" size={24} color="white" />
                </LinearGradient>
              ),
        })
    }, [])

    useEffect(() => {
      const userQuery = query(
        collection(db, "Posts"),
      );
  
      const unsubscribe = onSnapshot(userQuery, (snapshot) => {
        const sortedPosts = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => b.timestamp - a.timestamp);
        setPosts(sortedPosts);
      });
  
      return () => unsubscribe();
    }, []);

    const renderPost = ({ item }) => (
      <View key={item.id} style={{
        marginBottom: 30
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent:'space-between'
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10
          }}>
            <Image style={{
              width: 50,
              height: 50,
              borderRadius: 40,
              backgroundColor: 'lightgray',
              borderWidth: 0.5,
              borderColor: 'blue'
            }} source={item?.posterProfile ? { uri: item?.posterProfile } : item?.posterGender === 'Male' ? require('../../assets/images/download.jpg') : require('../../assets/images/download (1).jpg') }></Image>

            <View>
            <Text style={{
              fontWeight: 'bold',
              fontSize: 16,
              color: 'black'
            }}>{item?.posterName}</Text>
            <Text style={{
              fontSize: 12,
              color: 'gray'
            }}>{moment(item?.timestamp).startOf("seconds").fromNow()}</Text>
            </View>
          </View>
          <View>
            <Entypo name="dots-three-horizontal" size={20} color="black" />
          </View>
        </View>
        <View>
          <Image source={{ uri: item?.imageURL }} style={{
            width: '100%',
            height: 200,
            borderRadius: 10,
          }}></Image>
        </View>
      </View>
  );

  return (
      <ScrollView style={styles.container}>
          <FlatList
              data={posts}
              renderItem={renderPost}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
          />
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
      backgroundColor: 'white',
      flex: 1,
      padding: 20,
  },
});