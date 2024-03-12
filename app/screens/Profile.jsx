import React, {useEffect, useState} from 'react';
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tw from 'twrnc';
import axios from 'axios';
import {storage} from '../firebase.config';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

const Profile = ({navigation}) => {
  const api = 'http://localhost:3000/';
  const [userData, setUserData] = useState('');
  const [postData, setPostData] = useState([]);
  const [bio, setBio] = useState('');
  const [byte, setByte] = useState('');
  const [image, setImage] = useState('');
  const [isBioEditing, setIsBioEditing] = useState(false);
  const [isByteEditing, setIsByteEditing] = useState(false);
  const [isSetting, setIsSetting] = useState(false);
  const maxBioLength = 100;
  const maxByteLength = 300;
  const followersCount =
    userData.followers && Array.isArray(userData.followers)
      ? userData.followers.length
      : 0;
  const followingsCount =
    userData.followings && Array.isArray(userData.followings)
      ? userData.followings.length
      : 0;

  const handleLogout = async () => {
    await AsyncStorage.removeItem('jwtToken');
    navigation.navigate('Login');
  };

  async function getData() {
    const token = await AsyncStorage.getItem('jwtToken');
    try {
      axios.post(`${api}user/userdata`, {token: token}).then(res => {
        setUserData(res.data.data);
      });
    } catch (error) {
      console.log(error);
    }
  }
  async function handleBioUpdate() {
    const username = userData.username;

    const res = await axios.post(`${api}user/bioupdate/?username=${username}`, {
      bio,
    });
    const status = await res.data.status;
    if (status === 'ok') {
      setIsBioEditing(false);
      Alert.alert('Bio updated successfully');
    }
  }
  async function handleBytePost() {
    const username = userData.username;
    if (byte.length <= 0) {
      Alert.alert('Write a valid byte');
      return;
    }
    const res = await axios.post(`${api}post/create/?username=${username}`, {
      byte,
    });
    const status = await res.data.status;
    if (status === 'ok') {
      setIsByteEditing(false);
      Alert.alert('Byte posted successfully');
    }
  }
  async function getProfilePosts() {
    const posts = userData.posts || [];
    try {
      const res = await axios.post(`${api}post/posts`, {
        posts,
      });
      const data = res.data.data;

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
      await axios.post(`${api}post/like`, {
        postId,
        username,
      });
    } catch (error) {
      console.error('Error liking post:', error);
    }
  }
  function navigateHome() {
    navigation.navigate('Home');
  }
  function navigateToVideo() {
    navigation.navigate('VideoCall');
  }
  function settings() {
    if (isSetting == true) {
      setIsSetting(false);
    } else {
      setIsSetting(true);
    }
    //navigation.navigate('Profile');
  }
  const openPhotos = async () => {
    setIsBioEditing(false);
    const options = {
      mediaType: 'photo',
      includeBase64: true,
      maxHeight: 100,
      maxWidth: 100,
    };
    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('Image picker error: ', response.error);
      } else {
        const selectedAsset = response.assets[0];
        const data = `data:${selectedAsset.type};base64,${selectedAsset.base64}`;

        setImage(data);
      }
    });
  };
  const savePhoto = async () => {
    const username = userData.username;

    const res = await axios.post(`${api}user/updateimage`, {username, image});
    if (res.data.status == 200) {
      Alert.alert('Image updated');
    } else if (res.data.status == 403) {
      Alert.alert('Server error, try again later');
    } else {
      Alert.alert('Server error, try again later');
    }
    setImage('');
  };
  const cancelSave = async () => {
    setImage('');
  };
  const postsCount = Array.isArray(userData.posts) ? userData.posts.length : 0;
  useEffect(() => {
    const fetchData = async () => {
      try {
        await getData();
        await getProfilePosts();
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
            {image ? (
              <Image
                style={tw`h-20 w-20 rounded-full bg-white`}
                source={{uri: image}}
              />
            ) : (
              <Image
                style={tw`h-20 w-20 rounded-full bg-white`}
                source={
                  userData.picture
                    ? {uri: userData.picture}
                    : require('../public/chicken.png')
                }
              />
            )}

            <View
              style={tw`flex-row justify-between items-center w-auto gap-4`}>
              <TouchableOpacity
                style={tw` items-center`}
                onPress={() => navigation.navigate('Posts')}>
                <Text style={tw`text-white font-bold`}>{postsCount}</Text>
                <Text style={tw`text-white`}>Posts</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={tw`items-center px-4 border-l border-r border-gray-300`}
                onPress={() => navigation.navigate('Followers')}>
                <Text style={tw`text-white font-bold`}>{followersCount}</Text>
                <Text style={tw`text-white`}>Followers</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={tw`items-center`}
                onPress={() => navigation.navigate('Followings')}>
                <Text style={tw`text-white font-bold`}>{followingsCount}</Text>
                <Text style={tw`text-white`}>Followings</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={tw`flex-row justify-between items-center py-2 `}>
            <Text style={tw`text-xl text-white font-semibold `}>
              {userData.username}
            </Text>
            <View style={tw`flex-row gap-3 items-center`}>
              {image ? (
                <View style={tw`flex-row items-center gap-3`}>
                  <TouchableOpacity
                    onPress={savePhoto}
                    style={tw`py-1 px-3 border border-gray-300 rounded-full`}>
                    <Text
                      style={tw`text-gray-200 text-sm text-center font-semibold`}>
                      save
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={cancelSave} style={tw``}>
                    <Image
                      source={require('../public/bin.png')}
                      style={tw`w-5 h-5`}
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={tw`flex-row items-center gap-3`}>
                  <TouchableOpacity
                    style={tw`py-1 px-3 border border-gray-300 rounded-full`}
                    onPress={() => {
                      setIsBioEditing(!isBioEditing);
                      setIsByteEditing(false);
                    }}>
                    {isBioEditing ? (
                      <Text
                        style={tw`text-gray-200 text-sm text-center font-semibold`}>
                        Cancel
                      </Text>
                    ) : (
                      <Text
                        style={tw`text-gray-200 text-sm text-center font-semibold`}>
                        Edit bio
                      </Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={openPhotos}>
                    <Image
                      source={require('../public/galary.png')}
                      style={tw`h-6 w-6`}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          <View style={tw``}>
            {isBioEditing && (
              <TextInput
                style={tw`p-2  h-16 w-full text-gray-600 font-light rounded-lg bg-white`}
                multiline
                numberOfLines={4}
                maxLength={maxBioLength}
                onChangeText={text => {
                  setBio(text);
                }}
                placeholder="Enter your bio"
                placeholderTextColor="#5E5E5E"
                autoCapitalize="none"
              />
            )}
            {!isBioEditing && (
              <View>
                {userData.biography ? (
                  <Text style={tw`text-sm text-white`}>
                    {userData.biography}
                  </Text>
                ) : (
                  <Text style={tw`text-sm text-white`}>Write your bio</Text>
                )}
              </View>
            )}

            {isBioEditing && (
              <TouchableOpacity
                style={tw`p-2 my-4 w-full rounded-full bg-white`}
                onPress={handleBioUpdate}>
                <Text style={tw`text-indigo-500 font-bold text-center`}>
                  Update Bio
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={tw`w-full px-2`}>
          <View style={tw`flex justify-end items-end`}>
            <TouchableOpacity
              style={tw`py-2 px-8 rounded-full bg-indigo-600`}
              onPress={() => {
                setIsByteEditing(!isByteEditing);
                setIsBioEditing(false);
              }}>
              {isByteEditing ? (
                <Text
                  style={tw`text-gray-200 text-sm text-center font-semibold`}>
                  Cancel
                </Text>
              ) : (
                <Text
                  style={tw`text-gray-200 text-sm text-center font-semibold`}>
                  Post
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {isByteEditing && (
            <TextInput
              style={tw`p-2 my-4 border border-indigo-400 h-16 w-full text-gray-600 font-light rounded-lg bg-white`}
              multiline
              numberOfLines={4}
              maxLength={maxByteLength}
              onChangeText={text => {
                setByte(text);
              }}
              placeholder="Write your Byte"
              placeholderTextColor="gray"
              autoCapitalize="none"
            />
          )}
          {isByteEditing && (
            <TouchableOpacity
              style={tw`p-2 rounded-full bg-white border border-indigo-400`}
              onPress={handleBytePost}>
              <Text style={tw`text-indigo-500 font-bold text-center`}>
                Post
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={tw`mb-5`}>
          {postData.length > 0 ? (
            postData
              .slice()
              .reverse()
              .map((item, index) => (
                <View
                  key={index}
                  style={tw`p-2 mt-5 rounded-lg bg-white shadow-sm`}>
                  <Text style={tw`text-gray-600 mb-2 text-base `}>
                    {item.post}
                  </Text>
                  <TouchableOpacity
                    style={tw`w-full flex-row gap-2 justify-end items-center`}>
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

      {isSetting && (
        <View
          style={tw`w-full bg-indigo-800 flex justify-center items-center  py-3 absolute  h-full `}>
          <Text style={tw`text-xl text-gray-300 my-4 `}>
            Do you want to logout?
          </Text>
          <View style={tw`flex-row  gap-5`}>
            <TouchableOpacity
              style={tw`py-2 w-16 border border-gray-300 rounded-full`}
              onPress={settings}>
              <Text
                style={tw`text-center text-gray-200 text-[15px] font-semibold`}>
                No
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={tw`py-2 w-16 border border-gray-300  rounded-full`}
              onPress={handleLogout}>
              <Text
                style={tw`text-center text-gray-200 text-[15px] font-semibold`}>
                Yes
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
        <TouchableOpacity onPress={settings} on>
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

export default Profile;
