const React = require('react');
const ReactNative = require('react-native');
const {PanResponder, View, Vibration} = ReactNative;
import {Header} from 'react-native-elements';
import Circle from '../components/Circle';
import { styles } from '../assets/styles';

let timeout = null;
export default class PlayerChooser extends React.Component {
  static navigationOptions = {
    header: null,
  };
  constructor(props){
    super(props);
    this.state={
      circles:[],
      picked: null
    }
  }
  onTouchEnd(){
    this.setState({circles:[], picked:null});
    clearTimeout(timeout);
  }
  onSelect(){
    Vibration.vibrate(200);
    picked = Math.floor(Math.random() * (this.state.circles.length - 1));
    this.setState({picked});
    clearTimeout(timeout);
  }
  onTouchEvent(name, ev) {
    if(ev && ev.nativeEvent && ev.nativeEvent.touches){
      const circles = ev.nativeEvent.touches || [];
      const hasCircles = circles.length > 1;
      let picked = this.state.picked;

      if(hasCircles && circles.length !== this.state.circles.length){
        if(timeout){
          clearTimeout(timeout);
        }
        picked = null;
        timeout = setTimeout(()=>{ this.onSelect() }, 3000);
      }else if(!hasCircles && timeout){
        clearTimeout(timeout);
      }
      this.setState({circles, picked});
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Header
            containerStyle={styles.headerBar}
            barStyle="light-content"
        />
        <View style={[styles.container, {backgroundColor:"#000"}]}
          onStartShouldSetResponder={(ev) => true}
          onResponderGrant={this.onTouchEvent.bind(this, "onResponderGrant")}
          onResponderMove={this.onTouchEvent.bind(this, "onResponderMove")}
          onResponderRelease={this.onTouchEvent.bind(this, "onResponderRelease")}
        >

          {this.state.circles.length > 0 && this.state.circles.map(this.renderCircle.bind(this))}
        </View>
      </View>
    );
  }
  renderCircle(circle,index){
    return(
      <Circle {...circle} picked={this.state.picked} key={circle.identifier} />
    )
  }
}
