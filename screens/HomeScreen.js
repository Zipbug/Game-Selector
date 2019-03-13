import React from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableHighlight, View, AsyncStorage, ActivityIndicator,} from 'react-native';
import TabBarIcon from '../components/TabBarIcon';
import GameFilter from '../components/GameFilter';
import FullGameInfo from '../components/FullGameInfo';
import SignIn from '../components/SignIn'
import { WebBrowser } from 'expo';
import { ThemeProvider, Input, Header } from 'react-native-elements';
import { styles } from '../assets/styles'


let parseString = require('react-native-xml2js').parseString;

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  /*----------------------
      Component Methods
  ----------------------*/
  constructor(props){
    super(props);

    let player = null;
    let gameData = null;

    this._retrieveData('pid').then((data) => {player = data});
    this._retrieveData('gdata').then((data) => {gameData = JSON.parse(data)});

    this.state= {
      player: player,
      gameData:gameData,
      sortedData:null,
      gameFilter: false,
      selectedGame:false,
      search: '',
      loading:false,
    }
  }

  componentDidMount(){
    if(!this.state.gameData && this.state.player){this.getFromApi();}else if(this.state.gameData && this.state.player){this.sortAndGroup();}
  }

  _storeData = async (id, data) => {
    try {await AsyncStorage.setItem(id, data)} catch (error) {console.log(error)}
  };

  _retrieveData = async (id) => {
    let value = null;
    try {value = await AsyncStorage.getItem(id);} catch (error) {console.log(error)}
    return value;
  };

  /*----------------------
         Getters
  ----------------------*/

  getFromApi() {
    this.setState({loading:true});
    fetch('https://bgg-json.azurewebsites.net/collection/'+ this.state.player +"?grouped=true" , {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }
    }).then((response) => response.json())
        .then((gameData) => {
          if(gameData){
            this.setState({gameData}, ()=>{gameData.map((game, index, array)=>{this.getGameData(game.gameId, index, array.length - 1);});});
          }
        }).catch((error) => {console.error(error);});
  }

  sortAndGroup(){
    let groupedArray = []
    this.state.gameData.map((item, index)=>{
        item.orginIndex = index;
        const firstLetter = item['name'].charAt(0);
        const header = groupedArray.findIndex((element)=>{return element.header && element.header === firstLetter});
        if(header == -1){groupedArray.push({"header": firstLetter, collection:[item]});}else{groupedArray[header].collection.push(item);}
      });
      this.setState({sortedData:groupedArray, loading:false});
  };

  getGameData(id, index, last){
    let data = this.state.gameData[index];
    let gameData = this.state.gameData;
    fetch('https://www.boardgamegeek.com/xmlapi2/thing?id='+ id)
    .then(str => {
      if(str){
        const rdata = str._bodyInit;
        parseString(rdata, {trim: true, explicitArray:false, mergeAttrs:true, preserveChildrenOrder:true, explicitRoot:false}, function (err, result) {
            if(err){console.log(err)}else{
              let categories = [];
              let polls = []
              data.type = result.item.type;
              data.description = result.item.description;
              data.yearpublished = result.item.yearpublished.value;
              data.minplaytime = result.item.minplaytime.value;
              data.minage = result.item.minage.value;

              result.item.link.map((item, index)=>{
                 if(categories.indexOf(item.type) == -1){
                  categories.push(item.type);
                  data[item.type] = [];
                 }
                 data[item.type].push(item.value);
              });
              if(result.item.poll){
                result.item.poll.map((item, index)=>{
                   if(polls.indexOf(item.name) == -1){
                    polls.push(item.name);
                    let best = 0;
                    if(item.name == 'suggested_numplayers'){
                      let recommended = 0;
                      let recommendedNumber = 0;
                      let bestNumber =0;
                      item.results.map((e,i)=>{
                        e.result.map((v,k)=>{
                          if(v.value == 'Best' && v.numvotes > best){
                            best = v.numvotes;
                            bestNumber = e.numplayers;
                          }
                          if(v.value == 'Recommended' && v.numvotes > recommended){
                            recommended = v.numvotes;
                            recommendedNumber = e.numplayers;
                          }
                        });
                      });
                      data[item.name]= {
                        "best":bestNumber,
                        "recommended": recommendedNumber
                      }
                    }else if(item.name == 'suggested_playerage'){
                      let age = 0;
                      item.results.result.map((e,i)=>{
                        if(e.numvotes > best){
                          best = e.numvotes;
                          age = e.value;
                        }
                      });
                      data[item.name] = age;
                    }
                   }
                });
              }
              return data;
            }
        });
      }
      gameData[index] = data;
      this.setState({gameData}, ()=>{
        if(index === last){
          this._storeData('gdata', JSON.stringify(gameData));
          this.sortAndGroup();
        }
      });
    });
  }

  /*----------------------
         Setters
  ----------------------*/

  setPlayer(player){
    this._storeData('pid', player);
    this.setState({player}, ()=>{this.getFromApi();});
  }


  setGameFilter(gameFilter) {
    this.setState({gameFilter});
  }


  setSelection(selectedGame){
    this.setState({selectedGame});
  }

  render() {

    return (
      <View style={styles.container}>
        <FullGameInfo
        item={this.state.selectedGame}
        setSelection={this.setSelection.bind(this)}
        />
        <GameFilter
          gameData={this.state.gameData}
          visible={this.state.gameFilter}
          setGameFilter={this.setGameFilter.bind(this)}
          setSelection={this.setSelection.bind(this)}
        />
        {this.state.player && this.renderHeader()}
        {(!this.state.player || this.state.loading)
          ? this.renderCenterPage()
          : <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
              {this.state.sortedData && this.state.sortedData.map(this.renderGameData.bind(this))}
            </ScrollView>
        }
      </View>
    );
  }
  renderHeader(){
    return(
      <Header
        containerStyle={styles.headerBar}
        barStyle="light-content"
        centerComponent={
          <View style={{flex:1, alignItems: 'center',justifyContent: 'center',flexDirection:'row'}}>
            <Input containerStyle={[styles.input, styles.search]} inputContainerStyle={styles.containerStyle} placeholderTextColor="#444444"style={{height: 10}} autoCapitalize = 'none' onChangeText={(search) => this.setState({search})}/>
            <TabBarIcon name={Platform.OS === 'ios' ? 'ios-search' : 'md-search'} />
          </View>
        }
        leftComponent={<TouchableHighlight onPress={() => { this.setGameFilter(true);}}><TabBarIcon name={Platform.OS === 'ios' ? 'ios-shuffle' : 'md-shuffle'} /></TouchableHighlight>}
        rightComponent={<View><TouchableHighlight onPress={() => { this.getFromApi();}}><TabBarIcon name={Platform.OS === 'ios' ? 'ios-refresh' : 'md-refresh'} /></TouchableHighlight></View>}
      />
    )
  }
  renderCenterPage(){
    return(
      <View style={[styles.container, styles.horizontal]}>
          {!this.state.player && <SignIn setPlayer={this.setPlayer.bind(this)} />}
          {this.state.loading && <ActivityIndicator size="large" color="#0000ff" />}
      </View>
    );
  }

  renderGameData(item, index){
    return(
      <View key={'h-' + index} style={{paddingHorizontal:20}} >
        {this.state.search.length == 0 && <Text style={{fontSize:20, fontWeight:'bold'}}>{item.header}</Text>}
        <View  style={{paddingHorizontal:20}} >
          {item.collection.map(this.renderGameItem.bind(this))}
        </View>
      </View>
    );
  }
  renderGameItem(item, index, array){
    //Check to see if search string has any letters.
    if(this.state.search.length){
      //Change both the name and the search to lowercase to make sure everything matches.
      const ln = item.name.toLowerCase();
      const s = this.state.search.toLowerCase();
      //If the the name doesn't includes any of the search letters renturn empty.
      if(!ln.includes(s)){return;}
    }
    return(
      <TouchableOpacity key={'g-'+ index} onPress={this.setSelection.bind(this, item)}>
        <View  style={styles.gameStyle} >
          <Image source={{uri: item.thumbnail}} style={styles.gameImage}/>
          <View style={{textAlign:"left"}}>
            <Text style={styles.gameName}>{item.name}</Text>
            <Text style={styles.developmentModeText}>Plays: {item.minPlayers} - {item.maxPlayers}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

}
