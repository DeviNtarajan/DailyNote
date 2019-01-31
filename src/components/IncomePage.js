import DailyIncomePage from './DailyIncomePage';
import MonthlyIncomePage from './MonthlyIncomePage';
import YearlyIncomePage from './YearlyIncomePage';
import React from 'react';
import { View, Text, Button,FlatList,TouchableHighlight,StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import LinearGradient from 'react-native-linear-gradient';
import Icon from "react-native-vector-icons/FontAwesome";
//import DailyIncomePage from './DailyIncomePage';
//import MonthlyIncomePage from './MonthlyIncomePage';
//import YearlyIncomePage from './YearlyIncomePage';
//import EditingPage from './EditingPage';
//import ExpensePage from './ExpensePage';
import { createMaterialTopTabNavigator,createStackNavigator } from 'react-navigation';


var SQLite = require('react-native-sqlite-storage')
var db = SQLite.openDatabase({name: 'nativeappdb.db', createFromLocation: '~nativeappdb.db'})



export const IncomeNavigator = createMaterialTopTabNavigator({
  Daily : { screen:  DailyIncomePage} ,
  Monthly: { screen: MonthlyIncomePage} ,
  Yearly: { screen: YearlyIncomePage} ,
},{
    order : ['Daily','Monthly','Yearly'],
    animationEnabled : true,
    tabBarOptions: {
        style : {
          backgroundColor : 'teal'
        },
        indicatorStyle : {
          backgroundColor : 'white'
        },
    }
  
  },
);


  
export default class IncomePage extends React.Component {



 
    constructor(props) {
        super(props);
       
        let month = this.props.navigation;
        //let routename = this.props.navigation.state.params.title;
        // console.warn('routename',routename);
       // console.warn('income page navigation',global.currentRoute);
       //await AsyncStorage.setItem('id_token', myId);
        //this.props.navigation.state.params.onGoBack();
        //this.props.navigation.goBack(); 
       this.state = {
            month : month,
            date: new Date().getDate()+'-'+((new Date().getMonth())+1)+'-'+new Date().getFullYear(),
            isDateTimePickerVisible: false,
            datePickerSelectedDate : new Date(),
            themefirstColor: 'lightcyan',
            themeSecondColor: 'darkcyan',
            themeThirdColor: 'teal',
            navigation: this.props.navigation,
            displayOption : '1',
            changingRouteName : ''
        }
    }


    render() {
       
        return (
          <LinearGradient  colors={[this.state.themefirstColor, this.state.themeSecondColor, this.state.themeThirdColor]} style={styles.wrapper} >
     
          <IncomeNavigator  ref={(ref) => { this.nav = ref; }}
          onNavigationStateChange={(prevState, currentState) => {
             const getCurrentRouteName = (navigationState) => {
               if (!navigationState) return null;
               const route = navigationState.routes[navigationState.index];
               if (route.routes) return getCurrentRouteName(route);
      //         console.warn('routeName',route.routeName);
               
               return route.routeName;
             };
             this.setState({changingRouteName :getCurrentRouteName(currentState)});
          global.currentRoute = getCurrentRouteName(currentState);
        }}  screenProps={{ changingRouteName: this.state.changingRouteName}}/>
            
             </LinearGradient>
        )
      }
      
}

const styles = StyleSheet.create({
    wrapper: {
      //...StyleSheet.absoluteFillObject,
      flex: 1,
      backgroundColor: 'transparent',
    },
  });
  