import React, {useState} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import tw from 'twrnc';
import DropDownPicker from 'react-native-dropdown-picker';
import {
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import axios from 'axios';

const SignUp = ({navigation}) => {
  const localAPI = 'http://localhost:3000/signup';
  const API = 'https://undate-backend-admin-server-api.vercel.app/signup';

  const [open, setOpen] = useState(false);
  const [gender, setGender] = useState(null);
  const [items, setItems] = useState([
    {label: 'Male', value: 'male'},
    {label: 'Female', value: 'female'},
  ]);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const validateUsername = char => {
    return char.match(/^[a-z0-9_.]$/i);
  };

  const handleUsernameChange = text => {
    const newUsername = text
      .split('')
      .filter(validateUsername)
      .join('')
      .toLowerCase();
    setUsername(newUsername);
  };

  async function handleSignup() {
    if (username.length == 0) {
      Alert.alert('please enter a valid username');
      return;
    }
    if (username.length > 20) {
      Alert.alert('Username can be max 20 characters');
      return;
    }
    if (!email.endsWith('@vitstudent.ac.in')) {
      Alert.alert('please enter your valid VIT email');
      return;
    }
    if (password.length < 6) {
      Alert.alert('password length should be minimum 6');
      return;
    }
    if (gender == null) {
      Alert.alert('please select a gender');
      return;
    }

    const userData = {username, email, gender, password};
    try {
      axios.post(localAPI, userData).then(res => {
        if (res.data.status === 200) {
          Alert.alert('Sign up successful');
          navigation.navigate('Login');
        } else if (res.data.status == 409) {
          Alert.alert('Email already exists');
        } else if (res.data.status === 408) {
          Alert.alert('This username is already taken');
        }
      });
    } catch (error) {
      console.log(error);
      Alert.alert('Network error, try again later');
    }
  }
  return (
    <View style={tw`h-full w-full bg-indigo-500 px-5`}>
      <View style={tw` w-full justify-center items-center px-5`}>
        <Image
          style={tw`h-28 w-28 mt-10 mb-5`}
          source={require('../public/snail.gif')}
        />
        <Text style={tw`text-white text-center text-lg font-light`}>
          Join Undate, exclusively for VIT students. Sign up with your VIT
          email.
        </Text>
        <View style={tw` w-full mb-10`}>
          <TextInput
            style={tw`h-12 w-full bg-white mt-5 px-4 rounded-lg`}
            placeholder="Username"
            onChangeText={handleUsernameChange}
            value={username}
            autoCapitalize="none"
          />
          <TextInput
            style={tw`h-12 w-full  bg-white mt-5 px-4 rounded-lg`}
            placeholder="VIT Email ID"
            onChangeText={text => setEmail(text)}
            autoCapitalize="none"
          />
          <View style={tw`flex-row gap-2`}>
            <TextInput
              style={tw`h-12 flex-1  bg-white mt-5 px-4 rounded-lg`}
              placeholder="Password"
              onChangeText={text => setPassword(text)}
              autoCapitalize="none"
            />

            <View style={tw`flex-1`}>
              <DropDownPicker
                placeholder="Gender"
                placeholderStyle={{
                  color: 'grey',
                }}
                zIndex={3000}
                zIndexInverse={1000}
                dropDownDirection="BOTTOM"
                style={tw`border  border-gray-300 bg-white mt-5 px-4 rounded-lg`}
                open={open}
                value={gender}
                items={items}
                setOpen={setOpen}
                setValue={setGender}
                setItems={setItems}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={tw` w-full h-12 bg-orange-400  justify-center items-center  rounded-lg my-5`}
          onPress={handleSignup}>
          <Text style={tw`text-white text-2xl font-light`}>Sign Up</Text>
        </TouchableOpacity>
        <View style={tw`flex-row justify-center items-center my-5`}>
          <Text style={tw`text-white`}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={tw`text-white font-semibold text-xl`}>Log in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
export default SignUp;
