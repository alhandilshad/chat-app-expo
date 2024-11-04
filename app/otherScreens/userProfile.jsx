import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ToastAndroid,
  ScrollView,
  Modal,
  Touchable,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  onSnapshot,
  collection,
  where,
  query,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "../../config/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import GradientButton from "../../components/GradientButton";
import { Feather } from "@expo/vector-icons";

export default function profile() {
  const item = useLocalSearchParams();
  const user = JSON.parse(item.userData);

  const navigation = useNavigation();
  const [currentUserData, setCurrentUserData] = useState();
  const [profileUser, setprofileUser] = useState();
  const [currentUserUid, setCurrentUserUid] = useState("");
  const [followModal, setFollowModal] = useState(false);
  const [modelType, setmodelType] = useState();
  const [followList, setfollowList] = useState([]);
  const [profilePosts, setProfilePosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTransparent: true,
      headerTitle: "",
      headerTintColor: "white",
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
    const userQuery = query(
      collection(db, "users"),
      where("uid", "==", user?.uid)
    );

    const unsubscribe = onSnapshot(userQuery, (snapshot) => {
      snapshot.forEach((doc) => {
        setprofileUser(doc.data());
      });
    });

    return () => unsubscribe();
  }, [user?.uid]);

  useEffect(() => {
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

  useEffect(() => {
    if (profileUser?.followers && currentUserData) {
      setIsFollowing(profileUser.followers.includes(currentUserData.name));
    }
  }, [profileUser, currentUserData]);

  useEffect(() => {
    const userQuery = query(
      collection(db, "Posts"),
      where("userId", "==", user?.uid)
    );

    const unsubscribe = onSnapshot(userQuery, (snapshot) => {
      const sortedPosts = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => b.timestamp - a.timestamp);
      setProfilePosts(sortedPosts);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const handleFollow = async () => {
    if (!currentUserData || !profileUser) return;
    setLoading(true);

    try {
      const otherUserRef = doc(db, "users", user?.uid);
      const currentUserRef = doc(db, "users", currentUserUid);

      const updatedFollowers = profileUser?.followers
        ? [...profileUser.followers, currentUserData.name]
        : [currentUserData.name];

      const updatedFollowing = currentUserData?.following
        ? [...currentUserData.following, profileUser.name]
        : [profileUser.name];

      await updateDoc(otherUserRef, { followers: updatedFollowers });
      await updateDoc(currentUserRef, { following: updatedFollowing });

      setprofileUser((prev) => ({ ...prev, followers: updatedFollowers }));
      setCurrentUserData((prev) => ({ ...prev, following: updatedFollowing }));
      setIsFollowing(true);
    } catch (error) {
      console.error("Error following user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!currentUserData || !profileUser?.followers) return;

    try {
      const otherUserRef = doc(db, "users", user?.uid);
      const currentUserRef = doc(db, "users", currentUserUid);

      const updatedFollowers = profileUser.followers.filter(
        (follower) => follower !== currentUserData.name
      );

      const updatedFollowing = currentUserData?.following?.filter(
        (following) => following !== profileUser.name
      );

      await updateDoc(otherUserRef, { followers: updatedFollowers });
      await updateDoc(currentUserRef, { following: updatedFollowing });

      setprofileUser((prev) => ({ ...prev, followers: updatedFollowers }));
      setCurrentUserData((prev) => ({ ...prev, following: updatedFollowing }));
      setIsFollowing(false);
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  return (
    <ScrollView
      style={{
        backgroundColor: "white",
      }}
    >
      <View
        style={{
          alignItems: "center",
        }}
      >
        <LinearGradient
          colors={["#3b82f6", "#9333ea"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ height: 130, width: "100%" }}
        ></LinearGradient>

        <Image
          source={
            profileUser?.profileImg
              ? { uri: profileUser.profileImg }
              : profileUser?.gender === "Male"
              ? require("../../assets/images/download.jpg")
              : require("../../assets/images/download (1).jpg")
          }
          style={{
            width: 150,
            height: 150,
            borderRadius: 75,
            borderWidth: 2,
            borderColor: "white",
            position: "absolute",
            top: 50,
          }}
        ></Image>
        <Text style={{ fontWeight: "bold", fontSize: 22, marginTop: 80 }}>
          {profileUser?.name}
        </Text>
        <Text style={{ fontSize: 18, color: "gray" }}>
          {profileUser?.email}
        </Text>
        <Text
          style={{
            fontSize: 16,
            marginTop: 5,
          }}
        >
          {profileUser?.bio
            ? profileUser?.bio
            : profileUser?.gender === "Male"
            ? "I am a boy"
            : "I am a girl"}
        </Text>

        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
            marginTop: 20,
            width: "100%",
            marginBottom: 20,
          }}
        >
          <View>
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                fontSize: 24,
              }}
            >
              {profileUser?.followers?.length}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setFollowModal(true)
                setmodelType("followers");
                setfollowList(profileUser.followers || []);
              }}
            >
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold'
              }}>Followers</Text>
            </TouchableOpacity>
          </View>
          <View>
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                fontSize: 24,
              }}
            >
              {profileUser?.following?.length}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setFollowModal(true)
                setmodelType("following");
                setfollowList(profileUser?.following || []);
              }}
            >
              <Text style={{
                fontSize: 18, 
                fontWeight: 'bold'
              }}>Following</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={{
            width: "60%",
          }}
        >
          {!isFollowing ? (
            <GradientButton
              text={loading ? "Following..." : "Follow"}
              PV={8}
              click={handleFollow}
            />
          ) : (
            <View
              style={{
                display: "flex",
                flexDirection: "row",
              }}
            >
              <TouchableOpacity
                onPress={handleUnfollow}
                style={{
                  flex: 1,
                  backgroundColor: "#FF6347", // tomato color for unfollow
                  paddingVertical: 10,
                  marginHorizontal: 5,
                  borderRadius: 8,
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 5,
                  elevation: 5,
                }}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  Unfollow
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => console.log("Message Button Pressed")}
                style={{
                  flex: 1,
                  backgroundColor: "#3b82f6", // blue color for message button
                  paddingVertical: 10,
                  marginHorizontal: 5,
                  borderRadius: 8,
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 5,
                  elevation: 5,
                }}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  Message
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View
          style={{
            alignItems: "center",
            marginTop: 30,
            width: "80%",
            paddingBottom: 6,
            borderBottomWidth: 1,
            borderBottomColor: "gray",
          }}
        >
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 22,
            }}
          >
            Posts ({profilePosts.length})
          </Text>
        </View>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            marginTop: 10,
            marginBottom: 50,
            width: "80%",
          }}
        >
          {profilePosts?.length > 0 ? (
            profilePosts?.map((post, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  width: "33%",
                  height: 90,
                }}
              >
                <Image
                  source={{ uri: post.imageURL }}
                  style={{
                    width: "100%",
                    height: "100%",
                    resizeMode: "cover",
                  }}
                ></Image>
              </TouchableOpacity>
            ))
          ) : (
            <Text
              style={{
                textAlign: "center",
                fontSize: 18,
              }}
            >
              No posts yet
            </Text>
          )}
        </View>
      </View>

      {/* Create post modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={followModal}
        onRequestClose={() => setFollowModal(false)}
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
            <Feather
              name="x"
              size={30}
              style={{ alignSelf: "flex-end" }}
              onPress={() => setFollowModal(false)}
            />
            <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 20 }}>
              {modelType === 'followers' ? 'Followers' : 'Following'}
            </Text>
            <View>
              {followList.length > 0 ? (
                followList.map((item, index) => (
                  <Text key={index} style={{
                    marginBottom: 5,
                    fontSize: 18,
                    textAlign: 'center'
                  }}>{item}</Text>
                ))
              ) : (
                <Text>No {modelType} yet</Text>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
