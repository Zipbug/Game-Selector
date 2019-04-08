import React from 'react';
import { Animated, Easing, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableHighlight, View, AsyncStorage, ActivityIndicator,} from 'react-native';
import TabBarIcon from '../components/TabBarIcon';
import HeaderIcon from '../components/HeaderIcon';
import GameFilter from '../components/GameFilter';
import FullGameInfo from '../components/FullGameInfo';
import SignIn from '../components/SignIn'
import { WebBrowser, Icon } from 'expo';
import { ThemeProvider, Input, Header,ListItem } from 'react-native-elements';
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

    this.searchAnimation = new Animated.Value(0);
    this.search = null;

    let player = null;
    let gameData = null;
    let sortedData = null;
    let filterData = null;

    this.state= {
      player: player,
      gameData:gameData,
      sortedData:sortedData,
      filterData: filterData,
      filter:null,
      gameFilter: false,
      searchBar:false,
      selectedGame:false,
      search: '',
      searchActive:false,
      loading:false,
    }
    this.getData();
  }

  componentDidMount(){
    if(!this.state.gameData && this.state.player){
      this.getFromApi();
    }
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

  getData(){
    this._retrieveData('pid').then((data) => { this.setState({player:data}) });
    this._retrieveData('gdata').then((data) => {this.setState({gameData:JSON.parse(data)})});
    this._retrieveData('sdata').then((data) => {this.setState({sortedData:JSON.parse(data)})});
    this._retrieveData('fdata').then((data) => {this.setState({filterData:JSON.parse(data)})});
  }

  /*----------------------
   First we get the players collection in json format, extentions are grouped under the original game.
  ----------------------*/
  getFromApi() {
    this.setState({loading:true});
    fetch('https://bgg-json.azurewebsites.net/collection/'+ this.state.player, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }
    }).then((response) => response.json())
        .then((gameData) => {
          if(gameData){
            this.setState({gameData}, ()=>{
              gameData.map((game, index, array)=>{
                this.getGameData(game.gameId, index, array.length - 1);
              });
            });
          }
        }).catch((error) => {console.error(error);});
  }
  /*----------------------
   Next we parse through the players games and collect the data for each game in XML format from bgg.
   We parse the xml to json and save that data.
  ----------------------*/
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
                    if(item.name == 'suggested_numplayers' && item.results && item.results.length > 1){
                      let recommended = 0;
                      let recommendedNumber = 0;
                      let bestNumber = 0;
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
    Finally we group all the titles in alphabetical order.
  ----------------------*/

  sortAndGroup(){
    let groupedArray = [];
    let filterData = {
       minPlayers:99,
       maxPlayers:0,
       minPlayTime:[],
       minAge:[],
       suggestedAge:[],
       suggestedNumberPlayers:[],
       bestNumberPlayers:[],
       mechanics:[],
       categories:[]
    };
    this.state.gameData.map((item, index)=>{
        item.orginIndex = index;
        const firstLetter = item['name'].charAt(0);
        const suggested = item.suggested_numplayers;
        const header = groupedArray.findIndex((element)=>{return element.header && element.header === firstLetter});
        if(header == -1){groupedArray.push({"header": firstLetter, collection:[item]});}else{groupedArray[header].collection.push(item);}
        //Add filter data.
        if(filterData.minPlayers > Number(item.minPlayers)){ filterData.minPlayers = Number(item.minPlayers)}
        if(filterData.maxPlayers < Number(item.maxPlayers)){ filterData.maxPlayers = Number(item.maxPlayers)}
        if(filterData.minAge.findIndex(i => i.value == Number(item.minage)) == -1 && item.minage !== undefined){filterData.minAge.push({value: Number(item.minage)})}
        if(filterData.minPlayTime.findIndex( i => i.value == Number(item.minplaytime)) == -1 && item.minplaytime !== undefined){filterData.minPlayTime.push({value: Number(item.minplaytime)})}
        if(filterData.suggestedAge.findIndex(i => i.value == Number(item.suggested_playerage)) == -1 && item.suggested_playerage !== undefined){filterData.suggestedAge.push({value: Number(item.suggested_playerage)})}
        if(suggested && suggested !== undefined){
          if(filterData.bestNumberPlayers.findIndex(i => i.value == parseInt(suggested.best)) == -1 && suggested.best !== undefined){filterData.bestNumberPlayers.push({value: parseInt(suggested.best)})}
          if(filterData.suggestedNumberPlayers.findIndex(i => i.value == parseInt(suggested.recommended)) == -1 && suggested.recommended !== undefined){filterData.suggestedNumberPlayers.push({value: parseInt(suggested.recommended)})}
        }
        if(item.boardgamemechanic && item.boardgamemechanic !== undefined){
          item.boardgamemechanic.map((e,j)=>{if(filterData.mechanics.findIndex(i => i.value == e) == -1){filterData.mechanics.push({value: e})}});
        }
        if(item.boardgamecategory && item.boardgamecategory !== undefined){
          item.boardgamecategory.map((e,j)=>{if(filterData.categories.findIndex(i => i.value == e) == -1){filterData.categories.push({value: e})}});
        }
      });

      filterData.minPlayTime.sort((a, b) => (a.value > b.value)? 1 : -1);
      filterData.minAge.sort((a, b) => (a.value > b.value)? 1 : -1);
      filterData.suggestedAge.sort((a, b) => (a.value > b.value)? 1 : -1);
      filterData.suggestedNumberPlayers.sort((a, b) => (a.value > b.value)? 1 : -1);
      filterData.bestNumberPlayers.sort((a, b) => (a.value > b.value)? 1 : -1);

      this.setState({sortedData:groupedArray, loading:false, filterData});
      this._storeData('sdata', JSON.stringify(groupedArray));
      this._storeData('fdata', JSON.stringify(filterData));
  };

  notInfilter(item){
    const {filter} = this.state;
    if(filter == null)return true;

    let time = true;
    let players = true;
    let category = true;
    let mechanics = true;
    let age = true;
    if(filter.minAge) age = Number(item.minage) >=  Number(filter.minAge);
    if(filter.time) time = Number(item.playingTime) >=  Number(filter.minTime);
    if(filter.players) players =  filter.players >= Number(item.minPlayers) && filter.players <= Number(item.maxPlayers);
    if(filter.categories) category = item.boardgamecategory.indexOf(filter.categories) !== -1;
    if(filter.mechanics) mechanics =  item.boardgamemechanic.indexOf(filter.mechanics) !== -1;

    return(time && players && category && mechanics && age);
  }

  /*----------------------
         Setters
  ----------------------*/

  setPlayer(player){
    this._storeData('pid', player);
    this.setState({player}, ()=>{this.getFromApi();});
  }

  setGameFilter(gameFilter){
    this.setState({gameFilter});
  }

  setSelection(selectedGame){
    this.setState({selectedGame});
  }

  setFilter(filter){
    this.setState({filter});
  }

  setSearch(searchActive){
      Animated.timing(
          this.searchAnimation,
        {
          toValue: searchActive ? 1 : 0,
          duration: 200,
          easing: Easing.linear,
          useNativeDriver: true
        }
      ).start();

    this.setState({searchActive, search: searchActive ? this.state.search : ''},()=>{
      if(searchActive){
        this.search.focus();
      }
    });
  }

  render() {
    return (
      <View style={styles.container}>
      <Animated.View style={{
        position:'absolute',
        top:40,
        left:0,
        height:40,
        flex:1,
        width:"100%",
        backgroundColor:'#fff',
        flexDirection:'row',
        paddingHorizontal:20,
        zIndex:15,
        transform: [{
          translateX: this.searchAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [600, 0]
          })}],}}>
          <Input
            containerStyle={[styles.input, {flex:7}]}
            inputContainerStyle={styles.containerStyle}
            placeholderTextColor="#444444"
            ref={search => this.search = search}
            placeholder="Search"
            onChangeText={search=>{this.setState({search})}}
            value={this.state.search}
            onBlur={this.setSearch.bind(this, false)}
            onCancel={this.setSearch.bind(this, false)}
          />
          <TouchableOpacity onPress={this.setSearch.bind(this, !this.state.searchActive)} style={{marginLeft:5,flex:1, marginTop:5,justifyContent:"center",alignItems:"center",height:30,}}>
            <Icon.Ionicons style={{flex:1, fontSize:30,height:30,}} name='ios-close-circle-outline'/>
          </TouchableOpacity>
      </Animated.View>
        <FullGameInfo
          item={this.state.selectedGame}
          setSelection={this.setSelection.bind(this)}
        />
        {(this.state.player && !this.state.loading) && this.renderHeader()}
        <GameFilter
        gameData={this.state.gameData}
        visible={this.state.gameFilter}
        setGameFilter={this.setGameFilter.bind(this)}
        setSelection={this.setSelection.bind(this)}
        gameFilterData={this.state.filterData}
        setFilter={this.setFilter.bind(this)}
        user={this.state.user}
        />

        {(!this.state.player || this.state.loading)
          ? this.renderCenterPage()
          : <ScrollView style={[styles.container, {marginTop: -35}]} contentContainerStyle={styles.contentContainer}>
              {this.state.sortedData ? this.state.sortedData.map(this.renderGameData.bind(this)) : null}
            </ScrollView>
        }
      </View>
    );
  }
  renderHeader(){
    return(
      <Header containerStyle={styles.lightHeaderBar} barStyle="dark-content" rightContainerStyle={{width:150,}}>
      <View style={{width:80, flex:1, flexDirection:"row", justifyContent:"space-around",alignItems:"center"}}>
        <TouchableOpacity onPress={() => { this.setGameFilter(!this.state.gameFilter);}}><TabBarIcon name={Platform.OS === 'ios' ? 'ios-switch' : 'md-switch'} /></TouchableOpacity >
        <TouchableOpacity onPress={() => { this.getFromApi();}}><TabBarIcon name={Platform.OS === 'ios' ? 'ios-refresh' : 'md-refresh'} /></TouchableOpacity>
      </View>
      <View>
      </View>
      <TouchableOpacity onPress={this.setSearch.bind(this, !this.state.searchActive)}>
        <TabBarIcon style={{marginRight:10}} name={
          !this.state.searchActive ? Platform.OS === 'ios' ? 'ios-search' : 'md-search'
          : Platform.OS === 'ios' ? 'ios-close' : 'md-close'
        } />
      </TouchableOpacity>
    </Header>
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
      <View key={'h-' + index} style={{padding:20}} >
        {this.state.search.length == 0 && <Text style={{fontSize:20, fontWeight:'bold'}}>{item.header}</Text>}
        <View  style={{paddingHorizontal:10}} >
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
    if(!this.notInfilter(item)){
        return null;
    }
    return(
      <TouchableOpacity key={'g-'+ index} onPress={this.setSelection.bind(this, item)}>
        <ListItem
          leftAvatar={{ source: { uri: item.thumbnail } }}
          title={item.name}
          titleStyle={{fontWeight:'bold'}}
          subtitle={
            <View style={{flexDirection:'row', color:"#9b9b9b", marginTop:5,}}>
             <View style={{flexDirection:'row'}}>
               <Icon.Ionicons style={{fontSize:20,height:20,color:"#9b9b9b", marginRight:5,}} name='md-people'/>
               <Text style={{color:"#9b9b9b", marginTop:3,}}>{item.minPlayers} - {item.maxPlayers}</Text>
             </View>
             <View style={{flexDirection:'row', marginLeft:5}}>
               {item.playingTime !== -1 && <Icon.Ionicons style={{fontSize:20,height:20, marginLeft:10, marginRight:5, color:"#9b9b9b"}} name='ios-timer'/>}
               <Text style={{color:"#9b9b9b", marginTop:3}}>{item.playingTime !== -1 ? (item.playingTime + "min") : ""}</Text>
             </View>
            </View>
          }
          chevronColor="#444"
          chevron
          bottomDivider
        />
      </TouchableOpacity>
    );
  }

}
