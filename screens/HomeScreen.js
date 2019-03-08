import React from 'react';
import {
  Modal,
  TextInput,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  View,
  AsyncStorage
} from 'react-native';
import TabBarIcon from '../components/TabBarIcon';
import { WebBrowser } from 'expo';
import { Button, ThemeProvider,Input, Header, CheckBox } from 'react-native-elements';

import { MonoText } from '../components/StyledText';
var parseString = require('react-native-xml2js').parseString;

export default class HomeScreen extends React.Component {
  constructor(props){
    super(props);

    let player = null;
    this._retrieveData('pid').then((data) => {player = data});

    this.state= {
      player: player,
      gameData:null,
      modalVisible: false,
      expansions:true,
      players:0,
      picked: null,
      selectedGame:false,
      selectedVisible:false,
      playtime: null,
      search: '',
    }
  }

  setPlayer(){
    this.setState({player: this.state.text}, ()=>{this.getFromApi(); this._storeData('pid', this.state.player)});
  }

  static navigationOptions = {
    header: null,
  };

  getFromApi() {
    fetch('https://bgg-json.azurewebsites.net/collection/'+ this.state.player +"?grouped=true" , {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }
    }).then((response) => response.json())
        .then((gameData) => {
          // console.log(gameData)

          this.setState({gameData});
        })
        .catch((error) => {
          console.error(error);
        });
  }
  getGameData(id){
    let gameData = null;
    var request = new XMLHttpRequest();
      request.onreadystatechange = (e) => {
        if (request.readyState !== 4) {
          return;
        }

        if (request.status === 200) {
          const response = request.response;
          parseString(response, {trim: true, explicitArray:false, mergeAttrs:true, preserveChildrenOrder:true}, function (err, result) {
              if(err){
                console.log(err)
              }else{
                gameData = result.items.item;

              }
          });
        }
      }
      request.open('GET', 'https://www.boardgamegeek.com/xmlapi2/thing?=' + id);
      request.send();
      return gameData;
  }

  componentDidMount(){
    if(!this.state.gameData && this.state.player){
        this.getFromApi();
    }
  }

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  pickGame(){
    if(this.state.gameData){
      const available = this.state.gameData.filter(item => {
        let playtime = true;
        let players = this.state.players >= item.minPlayers && this.state.players <= item.maxPlayers;
        if(this.state.playtime && this.state.playtime > 0){
          playtime = this.state.playtime >= item.playingTime;
        }
        return (playtime && players);
      });
      const randomNum = Math.floor(Math.random() * Math.floor((available.length - 1)));

      this.setState({picked: available[randomNum]});
    }
  }

  selectGame(selectedGame){
    this.setState({selectedGame, selectedVisible: !!selectedGame});
  }

  _storeData = async (id, data) => {
    try {
      await AsyncStorage.setItem(id, storage);
    } catch (error) {
      // Error saving data
    }
  };

  _retrieveData = async (id) => {
    let value = null;
    try {
      value = await AsyncStorage.getItem(id);
    } catch (error) {
      // Error retrieving data
    }
    return value;
  };

  render() {
    return (
      <View style={styles.container}>
        {this.renderModal()}
        {this.renderSelectedModal()}
        {this.state.player &&
          <Header
            containerStyle={styles.headerBar}
            barStyle="light-content"
            centerComponent={<Input
            containerStyle={styles.input}
            inputContainerStyle={styles.containerStyle}
            placeholderTextColor="#444444"
            style={{height: 10}}
            autoCapitalize = 'none'
            onChangeText={(search) => this.setState({search})}/>}
            leftComponent={
              <TouchableHighlight onPress={() => { this.setModalVisible(true);}}><TabBarIcon name={Platform.OS === 'ios' ? 'ios-nuclear' : 'md-nuclear'} /></TouchableHighlight>
            }
            rightComponent={{ icon: 'search', color: '#fff' }}
          />
        }
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          {!this.state.player && this.renderSignUp()}
          {(this.state.gameData && this.state.gameData.length) && this.state.gameData.map(this.renderGameData.bind(this))}
        </ScrollView>
      </View>
    );
  }
  renderModal(){
    return(
      <Modal
         animationType="slide"
         transparent={false}
         visible={this.state.modalVisible}
         >
          <View>
            <Header
             containerStyle={styles.headerBar}
             barStyle="light-content"
             rightComponent={<TouchableHighlight onPress={() => {this.setModalVisible(false);}}><Text>Close</Text></TouchableHighlight>}
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
              <CheckBox title='Include Expansions'checked={this.state.expansions}/>
              <View style={styles.container}>
                {this.state.picked && this.renderPicked()}
              </View>
            </View>
          </View>
      </Modal>
    )
  }
  renderSelectedModal(){
    const item = this.state.selectedGame;
    return(
      <Modal
         animationType="slide"
         transparent={false}
         visible={this.state.selectedVisible}
         >
          {item &&
          <View>
            <Header
             containerStyle={styles.headerBar}
             barStyle="light-content"
             rightComponent={<TouchableHighlight onPress={() => {this.selectGame(false);}}><Text>Close</Text></TouchableHighlight>}
            />

            <View style={{paddingVertical:20, paddingHorizontal:20}} >
              <Image source={{uri: item.thumbnail}} style={styles.gameImage}/>
              <View>
                <Text style={styles.gameName}>{item.name}</Text>
                <Text>Published: {item.yearPublished}</Text>
                <Text>ID: {item.gameId}</Text>
                <Text style={styles.developmentModeText}>Plays: {item.minPlayers} - {item.maxPlayers}</Text>
                {item.playingTime > 0 && <Text style={styles.developmentModeText}>Playing Time: {item.playingTime}min</Text>}

              </View>
            </View>
          </View>
        }
      </Modal>
    )
  }
  renderPicked(){
    item = this.state.picked;
    return(
      <View >
        <Image source={{uri: item.thumbnail}} style={styles.gameImage}/>
        <View style={{textAlign:"left"}}>
          <Text >{item.name}</Text>
          <Text >Plays: {item.minPlayers} - {item.maxPlayers}</Text>
        </View>
      </View>
    );
  }
  renderSignUp(){
    return(
      <View style={styles.welcomeContainer}>
        <Input
          containerStyle={styles.input}
          inputContainerStyle={styles.containerStyle}
          placeholderTextColor="#444444"
          style={{height: 10}}
          placeholder="Enter your BBG User Name"
          autoCapitalize = 'none'
          leftIconContainerStyle={{marginHorizontal:10}}
          leftIcon={<TabBarIcon color={"#444444"} name={Platform.OS === 'ios' ? 'ios-person' : 'md-person'} />}
          onChangeText={(text) => this.setState({text})}
        />
        <Button
          onPress={this.setPlayer.bind(this)}
          title="Get Games"
          color="#841584"
          type="outline"
          accessibilityLabel="Get all your games"
        />
      </View>
    )
  }

  renderGameData(item, index, array){
    //Check to see if search string has any letters.
    if(this.state.search.length){
      //Change both the name and the search to lowercase to make sure everything matches.
      const ln = item.name.toLowerCase();
      const s = this.state.search.toLowerCase();
      //If the the name doesn't includes any of the search letters renturn empty.
      if(!ln.includes(s)){return;}
    }
    return(
      <TouchableOpacity key={index} onPress={this.selectGame.bind(this, item)}>
        <View  style={styles.gameStyle} onClick>
          <Image source={{uri: item.thumbnail}} style={styles.gameImage}/>
          <View style={{textAlign:"left", flex: 1, flexWrap: 'wrap'}}>
            <Text style={styles.gameName}>{item.name}</Text>
            <Text style={styles.developmentModeText}>Plays: {item.minPlayers} - {item.maxPlayers}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    paddingTop: 30,
    alignItems: 'center',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center', //Centered verticallyx`
    marginTop: 10,
    marginBottom: 20,
  },
  gameStyle:{
    borderBottomWidth:2,
    borderColor:"#444444",
    marginTop:10,
    marginBottom:10,
    paddingBottom:10,
    flex: 1,
    flexDirection: 'row',
  },
  gameImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
  },
  gameName: {
    fontSize: 18,
    lineHeight: 19,
    fontWeight:"bold",
    flex:1,
  },
  containerStyle:{
    borderBottomWidth:0
  },
  input:{
    backgroundColor:"#dbdbdb",
    borderRadius:30,
    marginBottom:10,
    paddingVertical:10,
    width:300
  },
  headerBar: {
    paddingHorizontal:20,
    paddingVertical:20,
    backgroundColor:"#444444"
  },
});
