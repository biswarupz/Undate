import axios from 'axios';
import React, {useState} from 'react';
import {
  Text,
  View,
  TextInput,
  Image,
  Touchable,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import tw, {style} from 'twrnc';

const Search = ({navigation}) => {
  const localAPI = 'http://localhost:3000/user/';

  const [searchname, setSearchName] = useState('');
  const [userData, setUserData] = useState([]);

  const delayedSearchUser = text => {
    setTimeout(() => {
      searchUser(text);
    }, 500);
  };

  const searchUser = async text => {
    try {
      const res = await axios.post(`${localAPI}search`, {username: text});
      setUserData(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  function gotoUser(username) {
    console.log('pressed');
    console.log(username);
    navigation.navigate('UsersProfile', {username});
  }

  function navigateHome() {
    navigation.navigate('Home');
  }
  function navigateToProfile() {
    navigation.navigate('Profile');
  }
  function navigateToVideo() {
    navigation.navigate('VideoCall');
  }
  return (
    <>
      <View style={tw`bg-indigo-50 h-full flex p-5 items-center`}>
        <TextInput
          style={tw`h-12 w-full border border-gray-400 bg-white mt-5 px-4 rounded-lg`}
          placeholder="Search username"
          autoCapitalize="none"
          value={searchname}
          onChangeText={text => {
            setSearchName(text);
            delayedSearchUser(text);
          }}
        />
        <ScrollView style={tw`w-full`}>
          <View style={tw`w-full`}>
            {userData.map((user, index) => (
              <TouchableOpacity
                onPress={() => {
                  gotoUser(user.name);
                }}
                key={index}
                style={tw`w-full px-4 py-2 rounded-lg mt-4 h-auto  flex-row gap-2 items-center justify-start bg-indigo-400`}>
                <Image
                  style={tw`h-8 w-8 rounded-full bg-white`}
                  source={
                    user.picture
                      ? {uri: user.picture}
                      : require('../public/chicken.png')
                  }
                />
                <Text style={tw`text-white text-xl`}>{user.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
      <View
        style={tw`w-full h-[10%]  bg-white border-t-2 border-r-2 border-l-2 border-indigo-50 rounded-t-xl  flex-row gap-4 justify-evenly items-center  py-3 absolute bottom-0`}>
        <TouchableOpacity onPress={navigateToVideo}>
          <Image
            source={require('../public/video.png')}
            style={tw`h-8 w-8  rounded-full  `}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={navigateHome} on>
          <Image
            source={require('../public/home.png')}
            style={tw`h-8 w-8
           rounded-full`}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={navigateToProfile} on>
          <Image
            source={require('../public/user.png')}
            style={tw`h-8 w-8
           rounded-full`}
          />
        </TouchableOpacity>
      </View>
    </>
  );
};

export default Search;
