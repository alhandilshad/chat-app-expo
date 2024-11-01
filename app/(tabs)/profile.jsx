import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ToastAndroid,
  ScrollView
} from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { onSnapshot, collection, where, query } from "firebase/firestore";
import { db, auth } from "../../config/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import GradientButton from "../../components/GradientButton";

export default function profile() {
  const navigation = useNavigation();
  const [currentUserData, setCurrentUserData] = useState();
  const [currentUserUid, setCurrentUserUid] = useState("");

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
    <View
      style={{
        backgroundColor: "white",
        height: "100%",
      }}
    >
      <LinearGradient
        colors={["#3b82f6", "#9333ea"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ height: 90, alignItems: "center",paddingHorizontal: 20, paddingTop: 10 }}
      >
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
          }}
        ></Image>
        <Text style={{ fontWeight: "bold", fontSize: 22 }}>
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

        <GradientButton text='Edit Profile' PV={10} />
      </LinearGradient>
    </View>
  );
}
