import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10
  },
  developmentModeText: {
    color: '#444444',
    fontSize: 14,
  },
  contentContainer: {
    paddingTop: 30,
  },
  modalContainer:{
    paddingVertical:20,
    paddingHorizontal:20
  },
  welcomeContainer: {
    paddingTop: 30,
    alignItems: 'center',
    justifyContent: 'center', //Centered`
    flex: 1,
    flexDirection: 'column',
    marginTop: 10,
    marginBottom: 20,
  },
  gameInfoContainer: {
    paddingTop: 30,
    flex: 1,
    flexDirection: 'column',
    marginTop: 10,
    marginBottom: 20,
    textAlign:'left'
  },
  gameInfoImage:{
    flex:1,
    height:80,
    resizeMode: 'cover',
    marginTop: 3,
    marginRight:5,
  },
  gameStyle:{
    borderBottomWidth:1,
    borderColor:"#dbdbdb",
    marginTop:10,
    marginBottom:10,
    paddingBottom:10,
    flex: 0.9,
    flexDirection: 'row',
  },
  gameDetails:{
    flex: 2,
    marginRight: 50,
  },
  gameImage: {
    width: 80,
    height:80,
    resizeMode: 'cover',
    marginTop: 3,
    marginRight:5,
  },
  gameName: {
    fontSize: 18,
    fontWeight:"bold",
  },
  containerStyle:{
    borderBottomWidth:0
  },
  input:{
    backgroundColor:"#dbdbdb",
    borderRadius:30,
  },
  signUp:{
    marginBottom:10,
    paddingVertical:10,
    width:300
  },
  search:{
    paddingVertical:2,
    marginRight:5,
    flex:2
  },
  headerBar: {
    paddingHorizontal:20,
    paddingVertical:10,
    backgroundColor:"#444444"
  },
});
 export { styles }
