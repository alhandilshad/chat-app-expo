import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ToastAndroid,
  ScrollView,
  Modal
} from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { onSnapshot, collection, where, query } from "firebase/firestore";
import { db, auth } from "../../config/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import GradientButton from "../../components/GradientButton";
import AntDesign from '@expo/vector-icons/AntDesign';
import { Feather } from "@expo/vector-icons";

export default function profile() {
  const navigation = useNavigation();
  const [currentUserData, setCurrentUserData] = useState();
  const [currentUserUid, setCurrentUserUid] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      header: () => (
        <LinearGradient
          colors={["#3b82f6", "#9333ea"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ height: 60, alignItems: "center", paddingTop: 20 }}
        >
          <Text style={{ fontWeight: "bold", color: "white", fontSize: 22 }}>
            Profile
          </Text>
        </LinearGradient>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserUid(user.uid);
      } else {
        console.log("User is signed out");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUserUid) return;

    const userQuery = query(
      collection(db, "users"),
      where("uid", "==", currentUserUid)
    );

    const unsubscribe = onSnapshot(userQuery, (snapshot) => {
      snapshot.forEach((doc) => {
        setCurrentUserData(doc.data());
      });
    });

    return () => unsubscribe();
  }, [currentUserUid]);

  return (
    <ScrollView style={{
      backgroundColor: 'white',
    }} >
      <View style={{
        alignItems: "center",
      }}>
      <LinearGradient
        colors={["#3b82f6", "#9333ea"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ height: 90, width: '100%' }}
      >
      </LinearGradient>

      <Image
          source={
            currentUserData?.gender === "Male"
              ? require("../../assets/images/download.jpg")
              : require("../../assets/images/download (1).jpg")
          }
          style={{
            width: 150,
            height: 150,
            borderRadius: 75,
            borderWidth: 1,
            borderColor: "white",
            position: 'absolute',
            top: 15,
          }}
        ></Image>
        <Text style={{ fontWeight: "bold", fontSize: 22, marginTop: 80 }}>
          {currentUserData?.name}
        </Text>
        <Text style={{ fontSize: 18, color: 'gray' }}>
          {currentUserData?.email}
        </Text>
        <Text style={{
            fontSize: 16,
            marginTop: 5
        }}>{currentUserData?.bio ? currentUserData?.bio : currentUserData?.gender === 'Male' ? 'I am a boy' : 'I am a girl'}</Text>

        <View style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent:'space-around',
          marginTop: 20,
          width: '100%',
          marginBottom: 20
        }}>
          <View>
            <Text style={{
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: 24
            }}>{currentUserData?.followers?.length}</Text>
            <Text style={{
              fontWeight: 'bold',
              fontSize: 18
            }}>Followers</Text>
          </View>
          <View>
            <Text style={{
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: 24
            }}>{currentUserData?.following?.length}</Text>
            <Text style={{
              fontWeight: 'bold',
              fontSize: 18
            }}>Following</Text>
          </View>
        </View>

        <View style={{
          width: '80%'
        }}>
        <GradientButton text='Edit Profile' PV={10} />
        </View>

        <View style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 30,
          width: '80%',
          paddingBottom: 6,
          borderBottomWidth: 1,
          borderBottomColor: 'gray'
        }}>
          <Text style={{
            fontWeight: 'bold',
            fontSize: 22
          }}>My Posts</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <AntDesign name="pluscircle" size={34} color="black" />
          </TouchableOpacity>
        </View>
        <View style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginTop: 10,
          marginBottom: 50,
          width: '80%'
        }}>
          <View style={{width: '33%', height: 80, borderWidth: 1, borderColor: 'black'}}></View>
          <View style={{width: '33%', height: 80, borderWidth: 1, borderColor: 'black'}}></View>
          <View style={{width: '33%', height: 80, borderWidth: 1, borderColor: 'black'}}></View>
        </View>

        <View style={{
          width: '80%'
        }}>
        <GradientButton text='Logout' PV={10} />
        </View>

        <TouchableOpacity style={{
          width: '80%',
          borderWidth: 2,
          borderColor: 'red',
          marginTop: 20,
          padding: 10,
          borderRadius: 10,
          marginBottom: 50
        }}>
          <Text style={{
            textAlign: 'center',
            color:'red'
          }}>Delete Account</Text>
        </TouchableOpacity>
    </View>
    
    {/* Create post modal */}
    <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}>
            <View style={{
              width: '80%',
              padding: 20,
              backgroundColor: 'white',
              borderRadius: 10,
              alignItems: 'center'
            }}>
              <Feather name="x" size={30} style={{ alignSelf: 'flex-end' }} onPress={() => setModalVisible(false)} />
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Add New Post</Text>
              <TextInput
                placeholder="Title"
                style={{
                  width: '100%',
                  borderWidth: 1,
                  borderColor: 'gray',
                  borderRadius: 5,
                  padding: 10,
                  marginTop: 15
                }}
              />
              <TextInput
                placeholder="Description"
                style={{
                  width: '100%',
                  borderWidth: 1,
                  borderColor: 'gray',
                  borderRadius: 5,
                  padding: 10,
                  marginTop: 15
                }}
                multiline
                numberOfLines={4}
              />
              <View style={{ width: '60%', marginTop: 20 }}>
                <GradientButton text='Create Post' PV={10} />
              </View>
            </View>
          </View>
        </Modal>
    </ScrollView>
  );
}