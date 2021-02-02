import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from "react-native";
import Slider from '@react-native-community/slider';
import TrackPlayer from 'react-native-track-player';
import Icon from "react-native-vector-icons/Ionicons";

export default class PlayerScreen extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      songName: this.props.navigation.getParam("name"),
      songUri: this.props.navigation.getParam("uri"),
      paused: false,
      progress: 0,
    }
  }

  componentDidMount(){
    this.init();
    this.interval = setInterval(this.updateProgress, 100)
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  changeSong=async()=>{
    for(var tracks of await TrackPlayer.getQueue()){
      if(tracks.url == await TrackPlayer.getCurrentTrack()){
        this.setState({songName: tracks.title, paused: false})
      }
    }
  }

  updateProgress=async()=>{
    if(!this.state.paused){
      var pos = (await TrackPlayer.getPosition()) / (await TrackPlayer.getDuration())
      if(pos < 1){this.setState({progress: pos})}
      if(pos > 0.1){this.changeSong()}
    }
  }

  init=async()=>{
    await TrackPlayer.play();
  }

  toggle=async()=>{
    var paused = this.state.paused;
    if(paused){
      await TrackPlayer.play();
      this.setState({paused: false})
    }
    else{
      await TrackPlayer.pause();
      this.setState({paused: true})
    }
  }

  changeProgress=async(pos)=>{
    var pos1 = await TrackPlayer.getDuration()
    await TrackPlayer.seekTo(pos * pos1).then(async()=>{
      if(!this.state.paused){
        await TrackPlayer.play()
      }
    });
  }

  render(){
    return(
      <View style={{flex: 1, backgroundColor: "white", alignItems: 'center'}}>
        <View style={styles.img}>
          <Icon name="musical-notes" size={100} color="white" />
        </View>
        <Text style={{color: '#ff696a', fontSize: 30, fontFamily: 'Poppins', width: '80%', textAlign: 'center'}} numberOfLines={1}>{this.state.songName}</Text>

        <Slider style={{width: (Dimensions.get("screen").width-50)}} minimumValue={0} maximumValue={1}
        value={this.state.progress} thumbTintColor="#ff696a" minimumTrackTintColor="#ff696a" maximumTrackTintColor="black"
        onSlidingComplete={this.changeProgress} onSlidingStart={async(pos)=>{await TrackPlayer.pause()}} />

        <View style={{flexDirection: 'row', justifyContent: 'space-evenly', width: '80%', marginTop: 40}}>
          <TouchableOpacity onPress={async()=>{            
            var queue = await TrackPlayer.getQueue()
            if(queue[0].url != await TrackPlayer.getCurrentTrack()){
              await TrackPlayer.skipToPrevious();
              this.changeSong()
            }
          }}>
            <Icon name="play-back" size={40} />
          </TouchableOpacity>

          <TouchableOpacity onPress={this.toggle}>
            <Icon name={!this.state.paused ? "pause" : "play"} size={40} />
          </TouchableOpacity>

          <TouchableOpacity onPress={async()=>{
            var queue = await TrackPlayer.getQueue();
            if(queue[queue.length - 1].url != await TrackPlayer.getCurrentTrack()){
              await TrackPlayer.skipToNext();
              this.changeSong();
            }
            else{
              this.changeProgress(1);
              this.setState({progress: 1, paused: true})
            }
          }}>
            <Icon name="play-forward" size={40} />
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  img:{
    width: 200,
    height: 200,
    backgroundColor: '#ff696a',
    borderRadius: 100,
    marginVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progress: {
    height: 5,
    width: "90%",
    marginTop: 10,
    flexDirection: "row"
  },
})