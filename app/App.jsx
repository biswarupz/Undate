import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SignUp from './screens/SignUp';
import Login from './screens/Login';
import Home from './screens/Home';
import Profile from './screens/Profile';
import UsersProfile from './screens/UsersProfile';
import Search from './screens/Search';
import VideoCall from './screens/VideoCall';

const Stack = createNativeStackNavigator();

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const isLoggedInData = await AsyncStorage.getItem('isLoggedIn');
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      setIsLoggedIn(isLoggedInData ? JSON.parse(isLoggedInData) : !!jwtToken);
    } catch (error) {
      console.error('Error reading login status:', error);
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isLoggedIn ? 'Home' : 'Login'}
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="Login">
          {props => <Login {...props} onLogin={() => setIsLoggedIn(true)} />}
        </Stack.Screen>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="UsersProfile" component={UsersProfile} />
        <Stack.Screen name="Search" component={Search} />
        <Stack.Screen name="VideoCall" component={VideoCall} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
