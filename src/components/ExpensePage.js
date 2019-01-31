import DailyExpensePage from './DailyExpensePage';
import MonthlyExpensePage from './MonthlyExpensePage';
import YearlyExpensePage from './YearlyExpensePage';
import React from 'react';
import { View, Text, Button,FlatList,TouchableHighlight,StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import LinearGradient from 'react-native-linear-gradient';
import Icon from "react-native-vector-icons/FontAwesome";
//import DailyIncomePage from './DailyIncomePage';
//import MonthlyIncomePage from './MonthlyIncomePage';
//import YearlyIncomePage from './YearlyIncomePage';
//import EditingPage from './EditingPage';
import { createMaterialTopTabNavigator,createStackNavigator } from 'react-navigation';


var SQLite = require('react-native-sqlite-storage')
var db = SQLite.openDatabase({name: 'nativeappdb.db', createFromLocation: '~nativeappdb.db'})


export const ExpenseNavigator = createMaterialTopTabNavigator({
  Daily : { screen:  DailyExpensePage} ,
  Monthly: { screen: MonthlyExpensePage} ,
  Yearly: { screen: YearlyExpensePage} ,
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
        activeTintColor :'white',
        inactiveTintColor : 'white'      
    }
  
  },
);

  
export default class ExpensePage extends React.Component {



 
    constructor(props) {
        super(props);
        
        let month = this.props.navigation;
    //    console.warn('month',month);
    //    console.warn('Expense page navigation',global.currentRoute);
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
            
          <ExpenseNavigator  ref={(ref) => { this.nav = ref; }}
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
  