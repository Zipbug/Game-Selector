import React from 'react';
import { Modal, View, StyleSheet, TouchableHighlight, Platform } from 'react-native';
import {Overlay, Header, Input, Button, Checkbox} from 'react-native-elements';
import TabBarIcon from '../components/TabBarIcon';
import { styles } from '../assets/styles'

export default class GameFilter extends React.Component {
  constructor(props){
    super(props);
    this.state ={
      players:0,
      picked: null,
      expansions:false,
      playtime: null,
    }
  }
  pickGame(){
    if(this.props.gameData){
      const available = this.props.gameData.filter(item => {
        let playtime = true;
        let players = this.state.players >= item.minPlayers && this.state.players <= item.maxPlayers;
        if(this.state.playtime && this.state.playtime > 0){
          playtime = this.props.playtime >= item.playingTime;
        }
        return (playtime && players);
      });
      const randomNum = Math.floor(Math.random() * Math.floor((available.length - 1)));
      this.props.setSelection(available[randomNum]);
    }
  }
  render(){
    return(
      <Modal
         animationType="slide"
         transparent={false}
         onRequestClose={() => {this.props.setGameFilter(false)}}
         visible={this.props.visible}
         >
          <View>
            <Header
             containerStyle={styles.headerBar}
             barStyle="light-content"
             rightComponent={<TouchableHighlight onPress={() => {this.props.setGameFilter(false);}}><TabBarIcon name={Platform.OS === 'ios' ? 'ios-close' : 'md-close'} /></TouchableHighlight>}
            />

            <View style={{paddingVertical:20, paddingHorizontal:20}} >
              <Input
                containerStyle={styles.input}
                inputContainerStyle={styles.containerStyle}
                placeholderTextColor="#444444"
                style={{height: 10}}
                placeholder="Players"
                autoCapitalize = 'none'
                onChangeText={(players) => this.setState({players})}
              />
              <Button
                onPress={this.pickGame.bind(this)}
                title="Pick Game"
                color="#841584"
                type="outline"
                accessibilityLabel="Pick Random Game"
              />
              <Input
                containerStyle={styles.input}
                inputContainerStyle={styles.containerStyle}
                placeholderTextColor="#444444"
                style={{height: 10}}
                placeholder="Play Time"
                autoCapitalize = 'none'
                onChangeText={(playtime) => this.setState({playtime})}
              />

            </View>
          </View>
      </Modal>
    );
  }
}
