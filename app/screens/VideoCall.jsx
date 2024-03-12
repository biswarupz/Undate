import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, {useState} from 'react';
import tw from 'twrnc';
import {Alert, Text, TouchableOpacity, View} from 'react-native';
const api = 'http://localhost:3000/user/videocall';

const VideoCall = ({navigation}) => {
  const [videoData, setVideoData] = useState('');
  async function sendVideo() {
    const res = axios.post(api, {videoData});
    if ((res.data.data = 404)) {
      Alert.alert('Network error, try again later');
      console.log('video call cancelled');
    }
    console.log('video call connected');
  }

  return (
    <View>
      <Text>camera view</Text>
      <View>
        <TouchableOpacity style={tw`h-44 w-full bg-gray-400`}>
          <Text>Join Video Call</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default VideoCall;
