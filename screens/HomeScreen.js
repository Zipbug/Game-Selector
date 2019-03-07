import React from 'react';
import {
  TextInput,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebBrowser } from 'expo';
import { Button, ThemeProvider,Input } from 'react-native-elements';

import { MonoText } from '../components/StyledText';
var parseString = require('react-native-xml2js').parseString;

export default class HomeScreen extends React.Component {
  constructor(props){
    super(props);

    this.state= {
      gameData:null,
      player:null
    }
  }
  setPlayer(){
    this.setState({player: this.state.text}, ()=>{this.getFromApi()});
  }

  static navigationOptions = {
    header: null,
  };

  getFromApi() {
    fetch('https://bgg-json.azurewebsites.net/collection/'+ this.state.player, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }
    }).then((response) => response.json())
        .then((gameData) => {
          console.log("gameData", gameData);
          this.setState({gameData});
        })
        .catch((error) => {
          console.error(error);
        });


  }

  componentDidMount(){
    if(!this.state.gameData && this.state.player){
        this.getFromApi();
  }
 }




  render() {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          {!this.state.player && this.renderSignUp()}
          {(this.state.gameData && this.state.gameData.length) && this.state.gameData.map(this.renderGameData.bind(this))}

        </ScrollView>
      </View>
    );
  }
  renderSignUp(){
    return(
      <View style={styles.welcomeContainer}>
        <Input
          containerStyle={styles.input}
          inputContainerStyle={styles.containerStyle}
          style={{height: 10}}
          placeholder="Enter your BBG User Name"
          autoCapitalize = 'none'
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
    return(
      <View key={index} style={styles.gameStyle}>
        <Image source={{uri: item.thumbnail}} style={styles.gameImage}/>
        <View>
          <Text style={styles.gameName}>{item.name}</Text>
          <Text style={styles.developmentModeText}>Plays: {item.minPlayers} - {item.maxPlayers}</Text>
        </View>
      </View>
    );
  }

  _maybeRenderDevelopmentModeWarning() {
    if (__DEV__) {
      const learnMoreButton = (
        <Text onPress={this._handleLearnMorePress} style={styles.helpLinkText}>
          Learn more
        </Text>
      );

      return (
        <Text style={styles.developmentModeText}>
          Development mode is enabled, your app will be slower but you can use useful development
          tools. {learnMoreButton}
        </Text>
      );
    } else {
      return (
        <Text style={styles.developmentModeText}>
          You are not in development mode, your app will run at full speed.
        </Text>
      );
    }
  }

  _handleLearnMorePress = () => {
    WebBrowser.openBrowserAsync('https://docs.expo.io/versions/latest/guides/development-mode');
  };

  _handleHelpPress = () => {
    WebBrowser.openBrowserAsync(
      'https://docs.expo.io/versions/latest/guides/up-and-running.html#can-t-see-your-changes'
    );
  };
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
    justifyContent: 'center', //Centered vertically
    alignItems: 'center', // Centered horizontally
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
    borderBottomWidth:0,
  },
  input:{
    backgroundColor:"#dbdbdb",
    borderRadius:30,
    marginBottom:10,
    width:300
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
