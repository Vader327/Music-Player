import React from 'react';
import { View, Text, Alert, FlatList, StyleSheet, StatusBar, TouchableHighlight, Animated, Dimensions } from "react-native";
import DocumentPicker from 'react-native-document-picker';
import TrackPlayer from 'react-native-track-player';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Swipeable from 'react-native-gesture-handler/Swipeable';

export default class PlaylistScreen extends React.Component{
  constructor(props){
    super(props)
    this.state={
      tracks: [],
      playlistName: this.props.navigation.getParam("playlistName"),
    }
    this.props.navigation.setParams({title: this.props.navigation.getParam("playlistName")})
  }

  componentDidMount(){
    this.init();
  }

  init=async()=>{
    var playlists = JSON.parse(await AsyncStorage.getItem('playlists'));
    this.setState({tracks: playlists[this.state.playlistName.toString()]})
    console.log("\n")

    var tracks = this.state.tracks
    var queue = await TrackPlayer.getQueue()
    console.log(queue.length)

    if(queue.length == 0){
      await TrackPlayer.setupPlayer()
      TrackPlayer.updateOptions({
        capabilities: [
          TrackPlayer.CAPABILITY_PLAY,
          TrackPlayer.CAPABILITY_PAUSE,
          TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
          TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS,
        ]})
        await TrackPlayer.add(this.state.tracks);
    }
    else{
      for(var i in tracks){
        if(tracks.length != queue.length && queue[i] && tracks[i].id != queue[i].id){
          await TrackPlayer.reset()
          if(this.state.tracks.length > 0){
            await TrackPlayer.add(this.state.tracks);
          }
        }
      }
    }   
  }

  next=async(item)=>{
    if(await TrackPlayer.getCurrentTrack() !== item.url){
      await TrackPlayer.skip(item.id)
    }
    this.props.navigation.navigate("Music", {name: item.title, uri: item.url, tracks: this.state.tracks})
  }

  updateSongsStorage=async(tracks)=>{
    var playlistObj = JSON.parse(await AsyncStorage.getItem('playlists'));
    playlistObj[this.state.playlistName.toString()] = tracks          
    await AsyncStorage.setItem('playlists', JSON.stringify(playlistObj))
  }

  deleteSong=async(index)=>{
    var tracks = this.state.tracks;
    if(tracks.length > 1){tracks.splice(index, 1)}
    else{tracks = []}

    this.updateSongsStorage(tracks);
    
    this.setState({tracks: tracks}, async()=>{
      await TrackPlayer.reset().then(async()=>{
        if(this.state.tracks.length != 0){
          await TrackPlayer.add(this.state.tracks)
        }
      })
    })
  }

  renderItem=({item, index})=>{
    var deleteBox=(progress, dragX)=>{
      var scale = dragX.interpolate({
        inputRange: [0, 10],
        outputRange: [1, 4],
      });
      return(
        <TouchableHighlight onPress={()=>{this.deleteSong(index)}} style={{backgroundColor: '#f54242'}} underlayColor="#751010">
          <View style={{width: 100, backgroundColor: '#f54242', flex: 1, alignItems: 'flex-end', justifyContent: 'center'}}>
            <Animated.Text style={{color: 'white', fontWeight: 'bold', transform: [{translateX: scale}]}}>DELETE</Animated.Text>
          </View>
        </TouchableHighlight>
      );
    };

    return(
      <Swipeable renderRightActions={deleteBox} containerStyle={{backgroundColor: '#f54242'}}>
        <TouchableHighlight style={{backgroundColor: 'white', paddingHorizontal: 7, paddingTop: 7}} underlayColor="lightgray"
        onPress={()=>{this.next(item)}}>
          <View>
            <Text style={{fontSize: 18, color: '#000000'}} numberOfLines={1}>{item.title}</Text>
            <View style={{width: '90%', height: 1, backgroundColor: '#eeeeee', alignSelf: 'center', marginTop: 7}} />
          </View>
        </TouchableHighlight>
      </Swipeable>
    )
  }

  selectFile=async()=>{
    try{
      var results = await DocumentPicker.pickMultiple({type: [DocumentPicker.types.audio]})

      for(var res of results){
        var ok = true

        for(var track of this.state.tracks){if(track.url == res.uri){ok = false}}

        if(ok){
          var newTracks = [...this.state.tracks, {id: res.uri, title: res.name.slice(0, -4), url: res.uri, artist: ''}]
          this.setState({tracks: newTracks})
          this.updateSongsStorage(newTracks);
          await TrackPlayer.add({
            id: res.uri,
            title: res.name.slice(0, -4),
            url: res.uri,
            artist: '',
          })
        }
        else{
          Alert.alert("Song already added!")
        }
      }
    }
    catch(err){console.log(err)}
  }

  clear=()=>{
    Alert.alert('Delete All Songs?', 'This action cannot be reversed.',
    [{text: 'Cancel'},{text: 'Ok',
      onPress: ()=>{
        this.setState({tracks: []}, async()=>{
          await TrackPlayer.reset();
          this.updateSongsStorage(this.state.tracks);
        })
      }
    }])
  }

  shuffle=()=>{
    var tracks = this.state.tracks;
    if(tracks.length != 0){
      tracks.sort(()=>(0.5 - Math.random()));
      this.setState({tracks: tracks}, async()=>{
        await TrackPlayer.reset()
        for(var newTrack of tracks){
          await TrackPlayer.add(newTrack);
        }
      })
    }
  }

  render(){
    return(
      <View style={{flex: 1}}>
        <StatusBar barStyle="light-content" backgroundColor="#e35d5e" />
        <FlatList data={this.state.tracks} renderItem={this.renderItem}
        keyExtractor={(item, index)=>(index.toString())} ListEmptyComponent={
          <Text style={{textAlign: 'center', marginTop: 20, color: 'darkgray'}}>Library Empty. Click ADD to add music.</Text>
        } />

        <View style={{width: '95%', alignSelf: 'center', justifyContent: 'center', marginTop: 7}}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7}}>
            <TouchableHighlight onPress={this.selectFile} style={styles.addButton} underlayColor="#e35d5e">
              <Text style={styles.addButtonText}>ADD</Text>
            </TouchableHighlight>

            <TouchableHighlight style={styles.addButton} underlayColor="#e35d5e" onPress={this.clear}>
              <Text style={styles.addButtonText}>CLEAR</Text>
            </TouchableHighlight>
          </View>

          <TouchableHighlight style={[styles.addButton, {width: '100%', marginBottom: 7}]} underlayColor="#e35d5e" onPress={this.shuffle}>
            <Text style={styles.addButtonText}>SHUFFLE</Text>
          </TouchableHighlight>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  addButton:{
    width: '49%',
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
})