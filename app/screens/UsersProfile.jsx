import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Text, View, Image, ScrollView, TouchableOpacity} from 'react-native';
import axios from 'axios';
import tw from 'twrnc';

const UsersProfile = ({route, navigation}) => {
  const api = 'http://localhost:3000/';
  const [profileUserData, setProfileUserData] = useState('');
  const [userData, setUserData] = useState('');
  const [postData, setPostData] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const {username} = route.params;

  const followersCount =
    profileUserData.followers && Array.isArray(profileUserData.followers)
      ? profileUserData.followers.length
      : 0;
  const followingsCount =
    profileUserData.followings && Array.isArray(profileUserData.followings)
      ? profileUserData.followings.length
      : 0;

  async function getData() {
    const token = await AsyncStorage.getItem('jwtToken');

    try {
      const response = await axios.post(`${api}user/userdata`, {token: token});
      setUserData(response.data.data);
    } catch (error) {
      console.log(error);
    }
  }

  async function userAcc() {
    const response = await axios.post(`${api}user/?username=${username}`);
    setProfileUserData(response.data.data);
  }

  async function getProfilePosts() {
    const posts = profileUserData.posts || [];
    try {
      const response = await axios.post(`${api}profile_posts`, {posts});
      const data = response.data.data;

      const eachPostData = data.map(item => ({
        post: item.post,
        postId: item._id,
        totalLikes: item.liked_by,
        likedByUser: item.liked_by.includes(userData.username),
      }));

      setPostData(eachPostData);
    } catch (error) {
      console.error('Error:', error);
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

  async function follow() {
    const mainUser = userData.username;
    const otherUser = username;
    try {
      await axios.post(`${api}user/follow`, {otherUser, mainUser});

      await getData();

      const isFollowingNow =
        userData &&
        userData.followings &&
        userData.followings.includes(username);
      setIsFollowing(isFollowingNow);
    } catch (error) {
      console.log(error);
    }
  }

  function navigateUserProfile() {
    navigation.navigate('Profile');
  }

  function navigateHome() {
    navigation.navigate('Home');
  }

  function navigateVideo() {
    navigation.navigate('VideoCall');
  }

  const postsCount = Array.isArray(profileUserData.posts)
    ? profileUserData.posts.length
    : 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        await userAcc();
        await getProfilePosts();
        await getData();

        const isFollowingNow =
          userData &&
          userData.followings &&
          userData.followings.includes(username);
        setIsFollowing(isFollowingNow);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const intervalId = setInterval(fetchData, 500);
    return () => clearInterval(intervalId);
  }, [postData]);
  return (
    <>
      <ScrollView style={tw`h-full bg-indigo-50 p-3`}>
        <View style={tw`shadow-sm rounded-xl p-3 my-5 bg-indigo-500`}>
          <View style={tw`flex-row items-center justify-between`}>
            <Image
              style={tw`h-20 w-20 rounded-full bg-white`}
              source={
                profileUserData.picture
                  ? {uri: profileUserData.picture}
                  : require('../public/chicken.png')
              }
            />
            <View
              style={tw`flex-row justify-between items-center w-auto gap-4`}>
              <TouchableOpacity style={tw` items-center`}>
                <Text style={tw`text-white font-bold`}>{postsCount}</Text>
                <Text style={tw`text-white`}>Posts</Text>
              </TouchableOpacity>
              <View
                style={tw` items-center px-4 border-l border-r border-gray-300`}>
                <Text style={tw`text-white font-bold`}>{followersCount}</Text>
                <Text style={tw`text-white`}>Followers</Text>
              </View>
              <View style={tw`items-center  `}>
                <Text style={tw`text-white font-bold`}>{followingsCount}</Text>
                <Text style={tw`text-white`}>Followings</Text>
              </View>
            </View>
          </View>
          <View style={tw`flex-row justify-between items-center py-2 `}>
            <Text style={tw`text-xl text-white font-semibold `}>
              {profileUserData.username}
            </Text>
            <TouchableOpacity
              onPress={follow}
              style={tw`py-1 px-3 border border-gray-300  rounded-full`}>
              {isFollowing ? (
                <Text style={tw`text-white`}>Following</Text>
              ) : (
                <Text style={tw`text-white`}>Follow</Text>
              )}
            </TouchableOpacity>
          </View>
          <View>
            {profileUserData.biography ? (
              <Text style={tw`text-sm text-white`}>
                {profileUserData.biography}
              </Text>
            ) : (
              <Text style={tw`text-sm text-white`}>
                Hey, I am {profileUserData.username}
              </Text>
            )}
          </View>
        </View>
        <View style={tw`mb-5`}>
          {postData.length > 0 ? (
            postData
              .slice()
              .reverse()
              .map((item, index) => (
                <View
                  key={index}
                  style={tw`p-3 mb-5 rounded-lg bg-white shadow-sm`}>
                  <Text style={tw`text-gray-600 mb-4 text-base `}>
                    {item.post}
                  </Text>
                  <View
                    style={tw`w-full  flex-row gap-2  justify-end items-center`}>
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
                  </View>
                </View>
              ))
          ) : (
            <Text style={tw`text-gray-600`}>No posts found.</Text>
          )}
        </View>
      </ScrollView>
      <View
        style={tw`w-full h-[10%]  bg-white border-t-2 border-r-2 border-l-2 border-indigo-50 rounded-t-xl  flex-row gap-4 justify-evenly items-center  py-3 absolute bottom-0`}>
        <TouchableOpacity onPress={navigateVideo}>
          <Image
            source={require('../public/video.png')}
            style={tw`h-8 w-8 rounded-full`}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={navigateHome}>
          <Image
            source={require('../public/home.png')}
            style={tw`h-8 w-8 rounded-full`}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={navigateUserProfile}>
          <Image
            source={require('../public/user.png')}
            style={tw`h-8 w-8 rounded-full`}
          />
        </TouchableOpacity>
      </View>
    </>
  );
};

export default UsersProfile;
