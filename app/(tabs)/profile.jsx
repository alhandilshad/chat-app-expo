import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ToastAndroid,
  ScrollView,
  Modal,
  Alert
} from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { onSnapshot, collection, where, query, updateDoc, doc, addDoc, getDocs, deleteDoc } from "firebase/firestore";
import { db, auth } from "../../config/firebaseConfig";
import { onAuthStateChanged, deleteUser } from "firebase/auth";
import GradientButton from "../../components/GradientButton";
import AntDesign from '@expo/vector-icons/AntDesign';
import { Feather } from "@expo/vector-icons";
import moment from "moment";

export default function profile() {
  const navigation = useNavigation();
  const router = useRouter();
  const [currUser, setCurrUser] = useState();
  const [currentUserData, setCurrentUserData] = useState();
  const [currentUserUid, setCurrentUserUid] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [followModal, setFollowModal] = useState(false);
  const [modelType, setModelType] = useState();
  const [followList, setfollowList] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [userName, setUserName] = useState();
  const [bio, setBio] = useState();
  const [postTitle, setPostTitle] = useState();
  const [postDescription, setPostDescription] = useState();
  const [postImageUrl, setPostImageUrl] = useState();
  const [posts, setPosts] = useState([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showPostData, setShowPostData] = useState([]);

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
        setCurrUser(user);
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

  useEffect(() => {
    const q = query(
      collection(db, "Posts"),
      where("userId", "==", currentUserUid)
    );

    const messageUnsubscribe = onSnapshot(q, (docSnap) => {
      const list = [];
      docSnap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      const sortList = list.sort((a, b) => b.timestamp - a.timestamp);
      setPosts(sortList);
    });

    return () => {
      messageUnsubscribe();
    };
  }, [currentUserUid]);

  const handleEditProfile = () => {
    updateDoc(doc(db, "users", currentUserUid), {
      userName: userName,
      bio: bio,
    });
    setEditModal(false);
  }

  const handleCreatePost = () => {
    if (!postTitle ||!postDescription ||!postImageUrl) {
      ToastAndroid.show("Please fill all fields", ToastAndroid.SHORT);
      return;
    }

    addDoc(collection(db, "Posts"), {
      title: postTitle,
      description: postDescription,
      imageURL: postImageUrl,
      posterName: currentUserData?.name,
      posterGender: currentUserData?.gender,
      userId: currentUserUid,
      likes: [],
      timestamp: Date.now(),
    });

    setModalVisible(false);
    setPostTitle('');
    setPostDescription('');
    setPostImageUrl('');
  }

  const handleEditPost = (id, title, description) => {
    updateDoc(doc(db, "Posts", id), {
      title: title,
      description: description,
    });
    setShowPostModal(false);
  }

  const handleDeletePost = (id) => {
    deleteDoc(doc(db, "Posts", id));
    setShowPostModal(false);
  }

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        { text: "Logout", onPress: handleConfirmLogout },
      ],
      { cancelable: false }
    );
  }

  const handleConfirmLogout = () => {
    auth.signOut();
    router.replace("/auth/sign-in");
  }

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        { text: "Delete", onPress: handleConfirmDeleteAccount },
      ],
      { cancelable: false }
    );
  }

  const handleConfirmDeleteAccount = async () => {
    await deleteUser(currUser);
    deleteDoc(doc(db, "users", currentUserUid));
    auth.signOut();
    router.replace("/auth/sign-up");
  }

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
        {currentUserData?.userName !== '' && (
          <Text style={{ fontWeight: "bold", fontSize: 18, }}>
            {currentUserData?.userName}
          </Text>
        )}
        <Text style={{ fontSize: 18, color: 'gray' }}>
          {currentUserData?.email}
        </Text>
        <Text style={{
            fontSize: 16,
            marginTop: 5
        }}>{currentUserData?.bio !== '' ? currentUserData?.bio : currentUserData?.gender === 'Male' ? 'I am a boy' : 'I am a girl'}</Text>

        <View style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent:'space-evenly',
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
            <TouchableOpacity onPress={() => {
              setFollowModal(true)
              setModelType("followers");
              setfollowList(currentUserData?.followers || []);
            }} >
            <Text style={{
              fontSize: 14
            }}>Followers</Text>
            </TouchableOpacity>
          </View>
          <View>
            <Text style={{
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: 24
            }}>{posts?.length}</Text>
            <Text style={{
              fontSize: 14
            }}>Posts</Text>
          </View>
          <View>
            <Text style={{
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: 24
            }}>{currentUserData?.following?.length}</Text>
            <TouchableOpacity 
               onPress={() => {
                setFollowModal(true)
                setModelType("following");
                setfollowList(currentUserData?.following || []);
              }}
            >
            <Text style={{
              fontSize: 14
            }}>Following</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{
          width: '80%'
        }}>
        <GradientButton text='Edit Profile' PV={10} click={() => {
          setEditModal(true);
          setUserName(currentUserData?.userName);
          setBio(currentUserData?.bio);
        }} />
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
          marginBottom: 30,
          width: '80%'
        }}>
          {posts.length > 0 ? (
            posts?.map((post, index) => (
              <TouchableOpacity onPress={() => {
                setShowPostModal(true)
                setShowPostData(post);
              }} style={{
                width: '33%',
                height: 80
              }} key={index}>
                <Image
                  source={{ uri: post.imageURL }}
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                />
              </TouchableOpacity>
            ))
          ) : (
            <View style={{
              width: '100%'
            }}>
               <Text style={{
              textAlign: 'center'
            }}>No posts yet</Text>
            </View>
          )}
        </View>

        <View style={{
          width: '80%'
        }}>
        <GradientButton text='Logout' PV={10} click={handleLogout} />
        </View>

        <TouchableOpacity onPress={handleDeleteAccount} style={{
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
                  borderColor: 'blue',
                  borderRadius: 5,
                  padding: 10,
                  marginTop: 15
                }}
                value={postTitle}
                onChangeText={setPostTitle}
              />
              <TextInput
                placeholder="Description"
                style={{
                  width: '100%',
                  borderWidth: 1,
                  borderColor: 'blue',
                  borderRadius: 5,
                  padding: 10,
                  marginTop: 15
                }}
                multiline
                numberOfLines={4}
                value={postDescription}
                onChangeText={setPostDescription}
              />
              <TextInput
                placeholder="Image Url"
                style={{
                  width: '100%',
                  borderWidth: 1,
                  borderColor: 'blue',
                  borderRadius: 5,
                  padding: 10,
                  marginTop: 15
                }}
                value={postImageUrl}
                onChangeText={setPostImageUrl}
              />
              <View style={{ width: '60%', marginTop: 20 }}>
                <GradientButton text='Create Post' PV={8} click={handleCreatePost} />
              </View>
            </View>
          </View>
        </Modal>

        {/* followers and following modal */}
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
            <View style={{
              flexDirection: 'row',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottomWidth: 1,
              borderColor: "#ccc",
              paddingBottom: 10
            }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: 'blue' }}>
              {modelType === 'followers' ? 'Followers' : 'Following'}
            </Text>
            <Feather
              name="x"
              size={30}
              onPress={() => setFollowModal(false)}
            />
            </View>
            <View style={{
              marginTop: 20,
              marginBottom: 10
            }}>
              {followList.length > 0 ? (
                followList.map((item, index) => (
                  <Text key={index} style={{
                    paddingBottom: 2,
                    fontSize: 16,
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

      {/* edit profile modal */}
      <Modal
  animationType="slide"
  transparent={true}
  visible={editModal}
  onRequestClose={() => setEditModal(false)}
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
      {/* Modal Header */}
      <View
        style={{
          flexDirection: "row",
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottomWidth: 1,
          borderColor: "#ccc",
          paddingBottom: 10,
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "blue" }}>
          Edit Profile
        </Text>
        <Feather
          name="x"
          size={30}
          onPress={() => setEditModal(false)}
        />
      </View>

      {/* Profile Image and Change Photo Button */}
      <View style={{ alignItems: "center", marginTop: 20, width: '100%' }}>
      <Image
          source={
            currentUserData?.gender === "Male"
              ? require("../../assets/images/download.jpg")
              : require("../../assets/images/download (1).jpg")
          }
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: 'lightgray',
            borderWidth: 0.5,
            borderColor: 'blue'
          }}
        ></Image>
        <View style={{
          width: "60%",
          marginTop: 10,
        }}>
        <GradientButton text={'change photo'} PV={6} FS={16} />
        </View>
      </View>

      {/* Username Input */}
      <View
        style={{
          marginTop: 20,
          width: "100%",
        }}
      >
        <Text style={{ marginBottom: 5, fontSize: 16 }}>
          Username
        </Text>
        <TextInput
          style={{
            width: "100%",
            borderWidth: 1,
            borderColor: "blue",
            borderRadius: 5,
            padding: 8,
            fontSize: 15,
          }}
          placeholder="Enter your username"
          value={userName} // Bind to your state
          onChangeText={setUserName} // Replace with your state update function
        />
      </View>

      {/* Bio Input */}
      <View
        style={{
          marginTop: 20,
          width: "100%",
        }}
      >
        <Text style={{ marginBottom: 5, fontSize: 16 }}>
          Bio
        </Text>
        <TextInput
          style={{
            width: "100%",
            borderWidth: 1,
            borderColor: "blue",
            borderRadius: 5,
            padding: 10,
            fontSize: 16,
          }}
          placeholder="Enter your bio"
          value={bio} // Bind to your state
          onChangeText={setBio} // Replace with your state update function
        />
      </View>

      {/* Save Button */}
      <View style={{
        alignSelf: 'flex-end',
        width: '40%',
        marginTop: 20
      }}>
      <GradientButton text='Edit' PV={7} click={handleEditProfile} />
      </View>
    </View>
  </View>
</Modal>

    {/* show post modal */}
    <Modal
  animationType="slide"
  transparent={true}
  visible={showPostModal}
  onRequestClose={() => setShowPostModal(false)}
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
      {/* Modal Header */}
      <View
        style={{
          flexDirection: "row",
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottomWidth: 1,
          borderColor: "#ccc",
          paddingBottom: 10,
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "blue" }}>
          Post
        </Text>
        <Feather
          name="x"
          size={30}
          onPress={() => setShowPostModal(false)}
        />
      </View>

      <View style={{
        alignItems: 'flex-start',
        width: '100%',
        marginTop: 10
      }}>
      <Text style={{
        fontSize: 13,
        color: 'gray',
      }}>{moment(showPostData?.timestamp).startOf('seconds').fromNow()}</Text>
      </View>

      <Image style={{
        width: "100%",
        height: 200,
        marginTop: 10
      }} source={{ uri: showPostData?.imageURL }}></Image>

      {/* Username Input */}
      <View
        style={{
          marginTop: 20,
          width: "100%",
        }}
      >
        <TextInput
          style={{
            width: "100%",
            borderWidth: 1,
            borderColor: "blue",
            borderRadius: 5,
            padding: 8,
            fontSize: 15,
          }}
          value={showPostData?.title}
          onChangeText={(text) => {
            setShowPostData({
              ...showPostData,
              title: text,
            });
          }}
        />
      </View>
      <View
        style={{
          width: "100%",
          marginTop: 10,
        }}
      >
        <TextInput
          style={{
            width: "100%",
            borderWidth: 1,
            borderColor: "blue",
            borderRadius: 5,
            padding: 8,
            fontSize: 15,
          }}
          value={showPostData?.description}
          onChangeText={(text) => {
            setShowPostData({
              ...showPostData,
              description: text,
            });
          }}
        />
      </View>

      <View style={{
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20
      }}>
        <TouchableOpacity onPress={() => handleDeletePost(showPostData?.id)} style={{
          width: '45%',
          borderWidth: 2,
          borderColor: 'red',
          padding: 5,
          borderRadius: 10,
        }}>
          <Text style={{
            textAlign: 'center',
            color: 'red',
            fontWeight: 'bold',
            fontSize: 16,
          }}>Delete Post</Text>
        </TouchableOpacity>

        <View style={{ width: '45%' }}>
          <GradientButton text='Edit Post' PV={7} FS={16} click={() => handleEditPost(showPostData?.id, showPostData?.title, showPostData?.description)} />
        </View>
      </View>
    </View>
  </View>
</Modal>

    </ScrollView>
  );
}