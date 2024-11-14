import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ScrollView, Animated, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useNavigation } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, getDocs } from 'firebase/firestore';
import { auth, db } from '../../config/firebaseConfig';
import { FontAwesome, Entypo, Feather } from '@expo/vector-icons';
import moment from 'moment'
import { onAuthStateChanged } from 'firebase/auth';

export default function Home() {
    const navigation = useNavigation();
    const [posts, setPosts] = useState([]);
    const [likesNames, setlikesNames] = useState([]);
    const [likesModal, setlikesModal] = useState(false);
    const [userList, setUserList] = useState([]);
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

      getUsers();
  
      return () => unsubscribe();
    }, []);

    const getUsers = async () => {
      const list = [];
      const dbSnap = await getDocs(collection(db, "users"));
      dbSnap.forEach((doc) => {
        list.push(doc.data());
      });
      setUserList(list);
    };

    const toggleLike = async (postId, currentLikes) => {
      if (!currentUserEmail) return;
  
      const postRef = doc(db, "Posts", postId);
      const isLiked = currentLikes.includes(userList.filter((user) => user.email === currentUserEmail)[0].name);
  
      const updatedLikes = isLiked
        ? currentLikes.filter((name) => name !== userList.filter((user) => user.email === currentUserEmail)[0].name)
        : [...currentLikes, userList.filter((user) => user.email === currentUserEmail)[0].name];
  
      try {
        await updateDoc(postRef, { likes: updatedLikes });

        setPosts((prevPosts) => prevPosts.map((post) => post.id === postId ? { ...post, likes: updatedLikes } : post ) );
      } catch (error) {
        console.error("Error updating likes:", error);
      }
    };

    const renderPost = ({ item }) => {
      const currentUserName = userList.find((user) => user.email === currentUserEmail)?.name;
      const isLiked = item.likes.includes(currentUserName);

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
          <Pressable onPress={handleLikePress}>
            <Image source={{ uri: item?.imageURL }} style={{
              width: '100%',
              height: 200,
              borderRadius: 10,
              marginTop: 10
            }}></Image>
          </Pressable>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 5
          }}>
            <TouchableOpacity onPress={handleLikePress} activeOpacity={0.7}>
            <Animated.View style={{ transform: [{ scale: scaleAnimation }] }}>
              <FontAwesome name={isLiked ? 'heart' : 'heart-o'} size={24} color={isLiked ? 'red' : 'black'} />
            </Animated.View>
          </TouchableOpacity>
          <Feather name="bookmark" size={24} color="black" />
          </View>
          <TouchableOpacity onPress={() => {
            setlikesModal(true)
            setlikesNames(item?.likes)
          }}>
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

<Modal
        animationType="slide"
        transparent={true}
        visible={likesModal}
        onRequestClose={() => setlikesModal(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <View
            style={{
              width: "80%",
              padding: 20,
              backgroundColor: "white",
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <View style={{
              width: '100%',
              flexDirection: "row",
              justifyContent: "space-between",
              paddingBottom: 10,
              alignItems: "center",
              borderBottomWidth: 1,
              borderColor: "#ccc"
            }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: 'blue' }}>
              Likes
            </Text>
            <Feather
              name="x"
              size={30}
              style={{ alignSelf: "flex-end" }}
              onPress={() => setlikesModal(false)}
            />
            </View>
            <View style={{
              marginBottom: 10,
              marginTop: 20,
            }}>
              {likesNames.length > 0 ? (
                likesNames.map((item, index) => (
                  <Text key={index} style={{
                    fontSize: 16,
                    paddingBottom: 2,
                    textAlign: 'center'
                  }}>{item}</Text>
                ))
              ) : (
                <Text>No Likes yet</Text>
              )}
            </View>
          </View>
        </View>
      </Modal>
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
      backgroundColor: 'white',
      padding: 20,
  },
});