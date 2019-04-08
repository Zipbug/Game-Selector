import React from 'react';
import {Animated, Easing, Text, Modal, View, StyleSheet, TouchableOpacity, Platform, Picker } from 'react-native';
import {Overlay, Header, Input, Button, Checkbox} from 'react-native-elements';
import { Icon } from 'expo';
import { styles } from '../assets/styles'
import { Dropdown } from 'react-native-material-dropdown';
import Collapsible from 'react-native-collapsible';

export default class GameFilter extends React.Component {
  constructor(props){
    super(props);

    this.state ={
      player:this.props.user,
      picked: null,
      expansions:false,
      time: null,
      players:null,
      minAge:null,
      suggestedAge:null,
      suggestedNumberPlayers:null,
      bestNumberPlayers:null,
      mechanics:null,
      categories:null
    }
  }

  pickGame(){
    const filter = this.state;
    if(this.props.gameData){
      const available = this.props.gameData.filter(item => {
        let time = true;
        let players = true;
        let category = true;
        let mechanics = true;
        let age = true;
        if(filter.minAge) age = Number(item.minage) >= Number(filter.minAge);
        if(filter.time) time = Number(item.playingTime) >= Number(ilter.minTime);
        if(filter.players) players =  filter.players >= Number(item.minPlayers) && filter.players <= Number(item.maxPlayers);
        if(filter.categories) category = item.boardgamecategory.indexOf(filter.categories) !== -1;
        if(filter.mechanics) mechanics =  item.boardgamemechanic.indexOf(filter.mechanics) !== -1;

        return(time && players && category && mechanics && age);
      });
      const randomNum = Math.floor(Math.random() * Math.floor((available.length - 1)));
      this.props.setSelection(available[randomNum]);
    }
  }
  onValueChanged(prop, value){
    let state = this.state;
    state[prop]  = value;

    this.setState(state);
    this.props.setFilter(state);
  }


  render(){
    const filiterVisible = !this.props.gameFilterData || !this.props.visible;
    let players = [];
    if(this.props.gameFilterData){
    for (var i = this.props.gameFilterData.minPlayers; i <= this.props.gameFilterData.maxPlayers; i++) {
        players.push({value: i});
    }}
    return(
      <View style={{backgroundColor: 'rgba(52, 52, 52, 0)',zIndex:5}}>
        <Collapsible collapsed={!this.props.visible}>
        {this.props.gameFilterData &&
          <View style={{paddingVertical:20, paddingHorizontal:20}}>
            <View style={{flexDirection:"row"}}>
              <Dropdown

              containerStyle={{flex:1}}
              label='Minimum Age'
              data={this.props.gameFilterData.minAge}
              onChangeText={this.onValueChanged.bind(this, 'minAge')}
              />
              <Dropdown
                containerStyle={{flex:1,marginLeft:20}}
                label='Players'
                data={players}
                onChangeText={this.onValueChanged.bind(this, 'players')}
              />
            </View>
            <View style={{flexDirection:"row"}}>
              <Dropdown

              containerStyle={{flex:1}}
              label='Play Time'
              data={this.props.gameFilterData.minPlayTime}
              onChangeText={this.onValueChanged.bind(this, 'time')}
              />
              <Dropdown
              containerStyle={{flex:1,marginHorizontal: 20}}
              label='Mechanics'
              data={this.props.gameFilterData.mechanics}
              onChangeText={this.onValueChanged.bind(this, 'mechanics')}
              />
              <Dropdown
              containerStyle={{flex:1}}
              label='Category'
              data={this.props.gameFilterData.categories}
              onChangeText={this.onValueChanged.bind(this, 'categories')}
              />

            </View>
          </View>
        }
        </Collapsible>
        <TouchableOpacity
          style={{
              borderWidth:1,
              borderColor:'rgba(0,0,0,0.2)',
              alignItems:'center',
              justifyContent:'center',
              width:50,
              height:35,
              backgroundColor:'#841584',
              borderBottomEndRadius:25,
              borderBottomStartRadius:25,
              alignSelf:"center",
            }}
            onPress={this.pickGame.bind(this)}
        >
        <Icon.Ionicons
          name='ios-shuffle'
          color="white"
          style={{fontSize:25, height:25, marginTop:-5}}
        />
        </TouchableOpacity>

      </View>
    );
  }
}
