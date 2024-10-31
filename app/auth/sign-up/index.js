import { View, Text, TextInput, StyleSheet, TouchableOpacity, ToastAndroid, Dimensions } from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import Ionicons from '@expo/vector-icons/Ionicons';
import GradientButton from "../../../components/GradientButton";
import RadioButtonGroup, { RadioButtonItem } from "expo-radio-button";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../../config/firebaseConfig";
import { setDoc, doc } from "firebase/firestore";

const { width, height } = Dimensions.get("window");

export default function SignUp() {
  const navigation = useNavigation();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [current, setCurrent] = useState("Male");

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  const handleSignUp = () => {
    if (name === '' || email === '' || password === '') {
      ToastAndroid.show("Please fill all fields", ToastAndroid.LONG);
      return;
    }
    
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (response) => {
        const uid = response.user.uid;
        const userData = { name, email, uid, gender:current, followers: [], following: [], bio: '', userName: '' };
        await setDoc(doc(db, "users", uid), userData);
        router.replace('/(tabs)/home')
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorCode, errorMessage);
        // ..
      });
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.headerText}>Create New Account</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput placeholder="Enter full name" style={styles.input} onChangeText={setName} />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput placeholder="Enter email" style={styles.input} onChangeText={setEmail} />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          placeholder="Enter password"
          secureTextEntry={true}
          style={styles.input}
          onChangeText={setPassword}
        />
      </View>

      <View style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: height * 0.03,
        marginTop: height * 0.03
      }}>
        <View>
            <Text style={{
                fontSize: 18
            }}>Gender : </Text>
        </View>
      <RadioButtonGroup
        containerStyle={{ flexDirection: 'row', gap: 5 }}
        selected={current}
        onSelected={(value) => setCurrent(value)}
        radioBackground="blue"
      >
        <RadioButtonItem value='Male' label='Male' />
        <RadioButtonItem value='Female' label='Female' />
      </RadioButtonGroup>
    </View>

      <GradientButton text='Create Account' click={handleSignUp} />

      <TouchableOpacity onPress={() => router.replace('auth/sign-in')} style={styles.signInButton}>
        <Text style={styles.signInButtonText}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: width * 0.05,
    paddingTop: height * 0.05,
    backgroundColor: 'white',
    height: "100%",
  },
  headerText: {
    fontSize: width * 0.08,
    marginTop: height * 0.03,
  },
  inputContainer: {
    marginTop: height * 0.03,
  },
  label: {
    fontSize: width * 0.04,
  },
  input: {
    padding: height * 0.018,
    borderWidth: 1.2,
    borderRadius: width * 0.03,
    borderColor: 'blue',
    fontSize: width * 0.04,
  },
  createAccountButton: {
    padding: height * 0.025,
    backgroundColor: 'black',
    borderRadius: width * 0.04,
    marginTop: height * 0.06,
  },
  buttonText: {
    color: 'white',
    textAlign: "center",
    fontSize: width * 0.045,
  },
  signInButton: {
    padding: height * 0.025,
    backgroundColor: 'white',
    borderRadius: width * 0.04,
    marginTop: height * 0.02,
    borderWidth: 1.2,
    borderColor: 'blue',
  },
  signInButtonText: {
    color: 'blue',
    textAlign: "center",
    fontSize: width * 0.045,
  },
});