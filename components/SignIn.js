import React from 'react';
import {View, StyleSheet, Platform} from 'react-native';
import {Button, Input} from 'react-native-elements';
import TabBarIcon from '../components/TabBarIcon';
import { styles } from '../assets/styles'

export default class SignIn extends React.Component {
  constructor(props){
    super(props);
    this.state={player:''}
  }
  render(){
    return(
      <View style={styles.welcomeContainer}>
        <Input
          containerStyle={[styles.input, styles.signUp]}
          inputContainerStyle={styles.containerStyle}
          placeholderTextColor="#444444"
          style={{height: 10}}
          placeholder="Enter your BBG User Name"
          autoCapitalize = 'none'
          leftIconContainerStyle={{marginHorizontal:10}}
          leftIcon={<TabBarIcon color="#444444" name={Platform.OS === 'ios' ? 'ios-person' : 'md-person'} />}
          onChangeText={(player) => this.setState({player})}
        />
        <Button
          onPress={()=>{this.props.setPlayer(this.state.player)}}
          title="Get Games"
          color="#841584"
          type="outline"
          accessibilityLabel="Get all your games"
        />
      </View>
    )
  }
}
