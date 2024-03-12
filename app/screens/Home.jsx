import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tw from 'twrnc';
import axios from 'axios';
import {BackHandler} from 'react-native';

const Home = ({navigation}) => {
  const [allPosts, setAllPosts] = useState([]);
  const [userData, setUserData] = useState('');
  const [loading, setLoading] = useState(true); // Added loading state
  const api = 'http://localhost:3000/';

  useEffect(() => {
    const handleBackPress = async () => {
      const token = await AsyncStorage.getItem('jwtToken');
      if (token) {
        Alert.alert('Logout Required', 'Please log out to exit the app.');
        return true;
      }
      return false;
    };

    BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () =>
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
  }, []);

  async function getData() {
    const token = await AsyncStorage.getItem('jwtToken');

    try {
      axios.post(`${api}userdata`, {token: token}).then(res => {
        setUserData(res.data.data);
      });
    } catch (error) {
      console.log(error);
    }
  }

  async function getAllPosts() {
    try {
      const res = await axios.get(`${api}user/home`);
      if (res.data.status === 'ok') {
        const data = res.data.data;
        const profilePic = await Promise.all(
          data.map(async item => {
            try {
              const username = item.username;

              const res = await axios.post(`${api}user/profilepic`, {username});
              return res.data.data;
              //console.log(res.data.status);
            } catch (e) {
              console.log(e);
              return null;
            }
          }),
        );
        const eachPostData = data.map((item, index) => ({
          post: item.post,
          postId: item._id,
          username: item.username,
          totalLikes: item.liked_by,
          likedByUser: item.liked_by.includes(userData.username),
          picture: profilePic[index],
        }));

        setAllPosts(eachPostData);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  }
  async function handleLike(postId) {
    try {
      const username = userData.username;
      await axios.post(`${api}post/like`, {postId, username});
    } catch (error) {
      console.error('Error liking post:', error);
    }
  }

  async function gotoUser(username) {
    try {
      const user = userData.username;
      if (user === username) {
        navigation.navigate('Profile');
      } else {
        navigation.navigate('UsersProfile', {username});
      }
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getAllPosts();
        await getData();
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    const intervalId = setInterval(fetchData, 1000);
    return () => clearInterval(intervalId);
  }, [getData]);

  function navigateToVideo() {
    navigation.navigate('VideoCall');
  }
  function navigateToSearch() {
    navigation.navigate('Search');
  }
  function navigateToProfile() {
    navigation.navigate('Profile');
  }

  return (
    <>
      {loading ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <Text>Loading...</Text>
        </View>
      ) : (
        <View style={tw`h-[90%]`}>
          <View style={tw`w-full bg-indigo-500 rounded-b-xl`}>
            <Text style={tw`text-2xl font-bold p-4 text-center text-white`}>
              Undate
            </Text>
          </View>
          <ScrollView style={tw`bg-indigo-50 p-3`}>
            <View style={tw``}>
              {allPosts.length > 0 ? (
                allPosts
                  .slice()
                  .reverse()
                  .map((item, index) => (
                    <View
                      key={index}
                      style={tw` p-2 mb-5 rounded-lg bg-white shadow-sm`}>
                      <TouchableOpacity
                        style={tw`flex-row gap-2 py-1 items-center justify-start`}
                        onPress={() => {
                          gotoUser(item.username);
                        }}>
                        <Image
                          style={tw`h-10 w-10 rounded-full bg-white`}
                          source={
                            item.picture
                              ? {uri: item.picture}
                              : require('../public/chicken.png')
                          }
                        />
                        <Text
                          style={tw`text-gray-600 font-semibold text-lg px-2 bg-lime-100`}>
                          {item.username}
                        </Text>
                      </TouchableOpacity>
                      <Text style={tw`text-gray-600 mb-2 text-base `}>
                        {item.post}
                      </Text>
                      <TouchableOpacity
                        style={tw`w-full  flex-row gap-2 p-1 border-gray-500 justify-end items-center`}>
                        <Text style={tw`text-gray-600`}>
                          Likes {item.totalLikes.length}
                        </Text>

                        <TouchableOpacity
                          style={tw``}
                          onPress={() => handleLike(item.postId)}>
                          <Image
                            source={
                              item.likedByUser
                                ? require('../public/red_heart.png')
                                : require('../public/white_heart.png')
                            }
                            style={tw`h-5 w-5`}
                          />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    </View>
                  ))
              ) : (
                <Text style={tw`text-gray-600`}>No posts found.</Text>
              )}
            </View>
          </ScrollView>
        </View>
      )}
      <View
        style={tw`w-full h-[10%]  bg-white border-t-2 border-r-2 border-l-2 border-indigo-50 rounded-t-xl  flex-row gap-4 justify-evenly items-center  py-3 absolute bottom-0`}>
        <TouchableOpacity onPress={navigateToVideo} on>
          <Image
            source={require('../public/video.png')}
            style={tw`h-8 w-8
              rounded-full`}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={navigateToSearch} on>
          <Image
            source={require('../public/search.png')}
            style={tw`h-8 w-8 opacity-60
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

export default Home;
