import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

let innerWidth = 30;
let x = 9;
let y = -6;
export default class Circle extends React.Component {
  constructor(props){
    super(props);
    this.spinValue = new Animated.Value(0);
    this.scale = new Animated.Value(0);
    // First set up animation
    Animated.loop(Animated.timing(
        this.spinValue,
      {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true
      }
    )).start()
    Animated.timing(
        this.scale,
      {
        toValue: 1,
        duration: 200,
        easing: Easing.linear,
        useNativeDriver: true
      }
    ).start()
  }

  render(){
    let picked = true;
    if(this.props.picked !== null && this.props.picked !== this.props.identifier){
      picked = false;
      innerWidth, x, y = 0;
      return null;
    }

    const spin = this.spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg']
    });
    const scale = !picked ? 0 : this.scale.interpolate({
      inputRange: [0, 1],
      outputRange: ['1', '3.5']
    });

    let cStyle = {
      width: innerWidth,
      height: innerWidth,
      borderRadius: innerWidth / 2,
      position: 'absolute',
      top: this.props.pageY - (innerWidth * 3.5),
      left: this.props.pageX - innerWidth / 2,
      backgroundColor:'#000',
      borderWidth:3,
      borderColor:"red",
      transform: [{rotate: spin, scaleX:scale, scaleY:scale}]
    };

    return(
      <Animated.View style={cStyle}>
        <View style={[styles.square, styles.topSquare]}></View>
        <View style={[styles.square, styles.bottomSquare]}></View>
        <View style={[styles.square, styles.leftSquare]}></View>
        <View style={[styles.square, styles.rightSquare]}></View>
      </Animated.View>
    );
  }
}
const styles = StyleSheet.create({
  square:{
    width:5,
    height:5,
    backgroundColor:"red",
    position:"absolute",
  },
  topSquare:{
    top:y,
    left:x,
  },
  bottomSquare:{
    bottom:y,
    left:x,
  },
  leftSquare:{
    top:x,
    left:y,
  },
  rightSquare:{
    top:x,
    right:y,
}
});
