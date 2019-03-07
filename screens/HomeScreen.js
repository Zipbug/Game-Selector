import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebBrowser } from 'expo';

import { MonoText } from '../components/StyledText';
var parseString = require('react-native-xml2js').parseString;

export default class HomeScreen extends React.Component {
  constructor(props){
    super(props);
    const userName = "zipbug";

    this.state= {
      gameData:null
    }
  }

  static navigationOptions = {
    header: null,
  };

  getFromApi() {
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

          this.setState({gameData});
        } else {
          console.warn('error', request);
        }
      };

      request.open('GET', 'https://www.boardgamegeek.com/xmlapi2/collection?username=zipbug');
      request.send();

  }

  componentDidMount(){
    if(!this.state.gameData){
        this.getFromApi();
  }
 }




  render() {
    console.log(this.state.gameData);
    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

          {(this.state.gameData && this.state.gameData.length) && this.state.gameData.map(this.renderGameData.bind(this))}

        </ScrollView>

        <View style={styles.tabBarInfoContainer}>
          <Text style={styles.tabBarInfoText}>This is a tab bar. You can edit it in:</Text>

          <View style={[styles.codeHighlightContainer, styles.navigationFilename]}>
            <MonoText style={styles.codeHighlightText}>navigation/MainTabNavigator.js</MonoText>
          </View>
        </View>
      </View>
    );
  }

  renderGameData(item, index, array){
    return(
      <View key={index} style={styles.gameStyle}>
        <Image source={{uri: item.thumbnail}} style={styles.gameImage}/>
        <Text style={styles.gameName}>{item.name._}</Text>
        
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
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center'
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
