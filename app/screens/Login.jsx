import React, {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tw from 'twrnc';
import {
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import axios from 'axios';
import {Linking} from 'react-native';
const Login = ({navigation, onLogin}) => {
  const localAPI = 'http://localhost:3000/login';
  const API = 'https://undate-backend-admin-server-api.vercel.app/login';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const retrieveIsLoggedIn = async () => {
      try {
        const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
        const jwtToken = await AsyncStorage.getItem('jwtToken');
        if (isLoggedIn && jwtToken) {
          onLogin();
          navigation.navigate('Home');
        }
      } catch (error) {
        console.error('Error retrieving login status:', error);
      }
    };

    retrieveIsLoggedIn();
  }, []);

  async function handleLogin() {
    const userData = {email, password};
    console.log(email, password);
    try {
      const response = await axios.post(localAPI, userData); // Use your actual API
      if (response.data.status === 'ok') {
        console.log('Logged In Successfully');
        Alert.alert('Logged In Successfully');
        await AsyncStorage.setItem('jwtToken', response.data.data);
        await AsyncStorage.setItem('isLoggedIn', JSON.stringify(true));
        onLogin();
        navigation.navigate('Home');
      } else {
        console.error('Login failed:', response.data);
        Alert.alert(
          'Login failed:',
          response.data.message || 'Invalid email or password.',
        );
      }
    } catch (error) {
      console.error('Error during login:', error);
      Alert.alert(
        'Error:',
        'An error occurred during login. Please try again.',
      );
    }
  }

  return (
    <View
      style={tw`h-full w-full bg-indigo-500 px-5 flex items-center justify-center`}>
      <Text style={tw`text-white mb-5 text-center text-4xl font-light`}>
        undate
      </Text>
      <View
        style={tw`w-full bg-indigo-500 px-8 justify-center items-center py-4`}>
        <Image source={require('../public/poki.gif')} style={tw`h-32 w-32`} />

        <TextInput
          style={tw`h-12 w-full  bg-white mt-5 px-4 rounded-lg`}
          placeholder="VIT Email ID"
          onChangeText={text => setEmail(text)}
          autoCapitalize="none"
        />
        <TextInput
          style={tw`h-12 w-full bg-white mt-5 px-4 rounded-lg`}
          placeholder="Password"
          onChangeText={text => setPassword(text)}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={tw` w-full h-12 bg-orange-400  justify-center items-center  rounded-lg my-5`}
          onPress={handleLogin}>
          <Text style={tw`text-white text-2xl font-semibold`}>Log in</Text>
        </TouchableOpacity>
        <View style={tw`flex-row justify-center items-center my-5`}>
          <Text style={tw`text-white`}>Don't have an account? </Text>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('SignUp');
              // Linking.openURL('https://www.google.com/');
            }}>
            <Text style={tw`text-white font-semibold text-xl`}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Login;
