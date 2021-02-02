import React from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import LibraryScreen from "./screens/LibraryScreen";
import PlayerScreen from "./screens/PlayerScreen";
import PlaylistScreen from "./screens/PlaylistScreen";

export default class App extends React.Component{
  render(){
    return(
      <AppContainer />
    )
  }
}
const stackNavigator = createStackNavigator({
  Library: {screen: LibraryScreen, navigationOptions: {
    headerTintColor: "white", headerStyle: {backgroundColor: "#ff696a"}, headerTitleAlign: 'center',
    headerTitleStyle: {fontFamily: 'Poppins', fontSize: 25}, title: "Playlists"
  }},
  Playlist: {screen: PlaylistScreen, navigationOptions: ({ navigation })=>({
    headerTintColor: "white", headerStyle: {backgroundColor: "#ff696a"}, headerTitleAlign: 'center',
    headerTitleStyle: {fontFamily: 'Poppins', fontSize: 25}, title: navigation.getParam('title')
  })},
  Music: {screen: PlayerScreen, navigationOptions: {
    headerTintColor: "white", headerStyle: {backgroundColor: "#ff696a"},
    headerTitleStyle: {fontFamily: 'Poppins', fontSize: 25}, headerTitleAlign: 'center',
  }},
})

const AppContainer = createAppContainer(stackNavigator);