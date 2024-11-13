import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ScrollView, Animated, TouchableOpacity } from 'react-native';
import { useNavigation } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebaseConfig';
import { FontAwesome } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import moment from 'moment'
import { onAuthStateChanged } from 'firebase/auth';

export default function Home() {
    const navigation = useNavigation();
    const [posts, setPosts] = useState([]);
    const [currentUserEmail, setcurrentUserEmail] = useState('');
    const scaleAnimation = useRef(new Animated.Value(1)).current;

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
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setcurrentUserEmail(user.email);
        }else{
          console.log("User is signed out");
        }
      });
      return () => unsubscribe();
    }, []);

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

    const toggleLike = async (postId, currentLikes) => {
      if (!currentUserEmail) return;

      const postRef = doc(db, "Posts", postId);
      const isLiked = currentLikes.includes(currentUserEmail);
      const updatedLikes = isLiked
        ? currentLikes.filter((email) => email !== currentUserEmail)
        : [...currentLikes, currentUserEmail];

      try {
        await updateDoc(postRef, { likes: updatedLikes });
        // Update the local state of posts to reflect the change
        setPosts((prevPosts) => 
          prevPosts.map((post) =>
            post.id === postId ? { ...post, likes: updatedLikes } : post
          )
        );
      } catch (error) {
        console.error("Error updating likes:", error);
      }
    };

    const renderPost = ({ item }) => {
      const isLiked = item.likes.includes(currentUserEmail);

      const handleLikePress = () => {
        toggleLike(item.id, item.likes);
        
        // Animate the "pop" effect
        scaleAnimation.setValue(1);
        Animated.sequence([
          Animated.timing(scaleAnimation, {
            toValue: 1.2,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnimation, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      };

      return (
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
              marginTop: 10
            }}></Image>
          </View>
          <TouchableOpacity onPress={handleLikePress} style={{ marginTop: 4 }} activeOpacity={0.7}>
            <Animated.View style={{ transform: [{ scale: scaleAnimation }] }}>
              <FontAwesome name={isLiked ? 'heart' : 'heart-o'} size={25} color={isLiked ? 'red' : 'black'} />
            </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text>{item?.likes?.length} {item?.likes?.length > 1 ? 'likes' : 'like'}</Text>
          </TouchableOpacity>
          <Text style={{
            fontWeight: 'bold',
            fontSize: 18,
            color: 'black'
          }}>{item?.title}</Text>
          <Text style={{paddingTop: 2}}><Text style={{fontWeight: 'bold'}}>{item?.posterName}</Text>  {item?.description}</Text>
        </View>
      )
    }

  return (
      <ScrollView style={styles.container} contentContainerStyle={{flexGrow: 1, paddingBottom: 20}}>
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
      padding: 20,
  },
});