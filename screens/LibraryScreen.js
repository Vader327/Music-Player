import React from 'react';
import { View, Text, Alert, FlatList, StyleSheet, StatusBar, TouchableHighlight, Animated, Modal, Dimensions, TextInput, KeyboardAvoidingView } from "react-native";
import TrackPlayer from 'react-native-track-player';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Swipeable from 'react-native-gesture-handler/Swipeable';

export default class LibraryScreen extends React.Component{
  constructor(){
    super()
    this.state={
      playlists: [],
      modalVisible: false,
      playlistName: "",
    }
  }

  init=async()=>{
    var playlists = await AsyncStorage.getItem('playlists');
    if(playlists != null){
      playlists = JSON.parse(playlists)
      this.setState({playlists: Object.keys(playlists)})
    }
  }

  componentDidMount(){
    this.init();
  }

  componentWillUnmount=async()=>{
    await TrackPlayer.destroy()
  }

  deletePlaylist=async(index)=>{
    var playlists = this.state.playlists;
    if(playlists.length > 1){playlists.splice(index, 1)}
    else{playlists = []}
    this.setState({playlists: playlists});
    this.storePlaylist(playlists);
  }

  storePlaylist=async(playlists)=>{
    var playlistObj={};
    for (var key of playlists) {
      playlistObj[key] = [];
    }
    await AsyncStorage.setItem('playlists', JSON.stringify(playlistObj))
  }

  renderItem=({item, index})=>{
    var deleteBox=(progress, dragX)=>{      
      var scale = dragX.interpolate({
        inputRange: [0, 10],
        outputRange: [1, 4],
      });
      return(
        <TouchableHighlight onPress={()=>{this.deletePlaylist(index)}} style={{backgroundColor: '#f54242'}} underlayColor="#751010">
          <View style={{width: 100, backgroundColor: '#f54242', flex: 1, alignItems: 'flex-end', justifyContent: 'center'}}>
            <Animated.Text style={{color: 'white', fontWeight: 'bold', transform: [{translateX: scale}]}}>DELETE</Animated.Text>
          </View>
        </TouchableHighlight>
      );
    };

    return(
      <Swipeable renderRightActions={deleteBox} containerStyle={{backgroundColor: '#f54242'}}>
        <TouchableHighlight style={{backgroundColor: 'white', paddingHorizontal: 7, paddingTop: 7}} underlayColor="lightgray"
        onPress={()=>{this.props.navigation.navigate("Playlist", {playlistName: item})}}>
          <View>
            <Text style={{fontSize: 18, color: '#000000'}} numberOfLines={1}>{item}</Text>
            <View style={{width: '90%', height: 1, backgroundColor: '#eeeeee', alignSelf: 'center', marginTop: 7}} />
          </View>
        </TouchableHighlight>
      </Swipeable>
    )
  }

  clear=()=>{
    Alert.alert('Delete All Playlists?', 'This action cannot be reversed.',
    [{text: 'Cancel'},{text: 'Ok', onPress: ()=>{
      this.setState({playlists: []}, async()=>{this.storePlaylist(this.state.playlists); await TrackPlayer.reset()})
    }
    }])
  }

  createPlaylist=async()=>{
    var playlists = this.state.playlists;
    playlists.push(this.state.playlistName);
    this.setState({playlists: playlists, modalVisible: false, playlistName: ""});
    this.storePlaylist(playlists);
  }

  createPlaylistModal=()=>(
    <Modal visible={this.state.modalVisible} animationType="slide" transparent={true}>
      <View style={{width: '80%', alignSelf: 'center', backgroundColor: 'white', top: Dimensions.get('screen').height/2 - 120,
      paddingHorizontal: 10, elevation: 10}}>
        <Text style={{color: '#000000', marginVertical: 10, fontSize: 17}}>Create Playlist</Text>
        <TextInput autoFocus={true} style={styles.textInput} placeholder="Playlist Name" onChangeText={(text)=>{this.setState({playlistName: text})}} />

        <View style={{flexDirection: 'row', alignSelf: 'flex-end'}}>
          <TouchableHighlight onPress={()=>{this.setState({modalVisible: false, playlistName: ""})}} underlayColor="#eeeeee"
          style={{alignSelf: 'flex-end', marginVertical: 15, padding: 10, marginRight: 10}}>
            <Text style={[styles.addButtonText, {color: '#ff696a', textAlign: 'right'}]}>CANCEL</Text>
          </TouchableHighlight>

          <TouchableHighlight onPress={this.createPlaylist} underlayColor="#eeeeee" disabled={this.state.playlistName.trim() == ""}
          style={{alignSelf: 'flex-end', marginVertical: 15, padding: 10}}>
            <Text style={[styles.addButtonText, {color: this.state.playlistName.trim() == "" ? 'lightgray' : '#ff696a', textAlign: 'right'}]}>ADD</Text>
          </TouchableHighlight>
        </View>
      </View>
    </Modal>
  )

  render(){
    return(
      <View style={{flex: 1}}>
        <StatusBar barStyle="light-content" backgroundColor="#e35d5e" />
        <FlatList data={this.state.playlists} renderItem={this.renderItem}
        keyExtractor={(item, index)=>(index.toString())} ListEmptyComponent={
          <Text style={{textAlign: 'center', marginTop: 20, color: 'darkgray'}}>You have no playlists. Click ADD to create a playlist.</Text>
        } />

        {this.createPlaylistModal()}

        <View style={{flexDirection: 'row', justifyContent: 'space-evenly', paddingVertical: 7}}>
          <TouchableHighlight onPress={()=>{this.setState({modalVisible: true})}} style={styles.addButton} underlayColor="#e35d5e">
            <Text style={styles.addButtonText}>ADD</Text>
          </TouchableHighlight>

          <TouchableHighlight style={styles.addButton} underlayColor="#e35d5e" onPress={this.clear}>
            <Text style={styles.addButtonText}>CLEAR</Text>
          </TouchableHighlight>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  addButton:{
    width: '46%',
    height: 30,
    backgroundColor: '#ff696a',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3,
  },
  addButtonText:{
    color: 'white',
    fontWeight: 'bold',
  },
  textInput:{
    borderBottomWidth: 2,
    borderBottomColor: "#ff696a",
    padding: 0,
  }
})