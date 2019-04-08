import React from 'react';
import {View, StyleSheet, Image, TouchableOpacity, ScrollView, Text, Platform} from 'react-native';
import {Overlay} from 'react-native-elements';
import TabBarIcon from '../components/TabBarIcon';
import { styles } from '../assets/styles'
import HTML from 'react-native-render-html';

export default class FullGameInfo extends React.Component {

render(){
  const item = this.props.item;
  const visible = item ? true : false;
  return(
    <Overlay isVisible={visible}>
        <View style={styles.gameFullInfoContainer}>
          <TouchableOpacity onPress={() => {this.props.setSelection(null)}}><TabBarIcon styles={{color:"#000000"}} name={Platform.OS === 'ios' ? 'ios-close' : 'md-close'} /></TouchableOpacity>
          <ScrollView style={styles.container} contentContainerStyle={[styles.contentContainer, styles.modalContainer]}>
          {item &&
            <View>
            <Image source={{uri: item.thumbnail}} style={styles.gameInfoImage}/>
            <View style={styles.gameInfoContainer}>
              <Text style={styles.gameName}>{item.name}</Text>
              <Text>Published: {item.yearPublished}</Text>
              <Text>ID: {item.gameId}</Text>
              <Text >Plays: {item.minPlayers} - {item.maxPlayers}</Text>
              {item.playingTime > 0 && <Text >Playing Time: {item.playingTime}min</Text>}
              {(item.suggested_numplayers && item.suggested_numplayers.best) && <Text >Best number of players: {item.suggested_numplayers.best}</Text>}
              {(item.suggested_numplayers && item.suggested_numplayers.recommended) &&  <Text >Recommended number of players: {item.suggested_numplayers.recommended}</Text>}
              <Text >Suggested Mininmum age: {item.suggested_playerage}</Text>
              <Text >Game Type: {item.type}</Text>
              {item.boardgamecategory &&
                <View>
                  <Text >Categories: </Text>
                  {item.boardgamecategory.map((category, index)=>{
                    return(<Text style={{marginLeft:10}} key={"c-"+index}>{category}</Text>)
                  })}
                </View>
              }
              {item.boardgamemechanic &&
                <View>
                  <Text >Board Game Mechanics: </Text>
                  {item.boardgamemechanic.map((mechanic, index)=>{
                    return(<Text style={{marginLeft:10}} key={"m-"+index}>{mechanic}</Text>)
                  })}
                </View>
              }
              {item.boardgameartist &&
                <View>
                  <Text >Artist: </Text>
                  {item.boardgameartist.map((artist, index)=>{
                    return(<Text style={{marginLeft:10}} key={"a-"+index}>{artist}</Text>)
                  })}
                </View>
              }
              {item.boardgamedesigner &&
                <View>
                  <Text >Designers: </Text>
                  {item.boardgamedesigner.map((designer, index)=>{
                    return(<Text style={{marginLeft:10}} key={"d-"+index}>{designer}</Text>)
                  })}
                </View>
              }
              {item.boardgamepublisher &&
                <View>
                  <Text >Publisher(s): </Text>
                  {item.boardgamepublisher.map((publisher, index)=>{
                    return(<Text style={{marginLeft:10}} key={"p-"+index}>{publisher}</Text>)
                  })}
                </View>
              }
              {item.description && <HTML html={item.description} />}
            </View>
            </View>
          }
          </ScrollView>
        </View>
    </Overlay>
    );
  }
}
