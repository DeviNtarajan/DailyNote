import React from 'react';
import MainPage from './MainPage';
import ExpensePage from './ExpensePage';
import IncomePage from './IncomePage';
import { createMaterialTopTabNavigator } from 'react-navigation';
import { Icon } from 'react-native-elements';
import FontAwesome from "react-native-vector-icons/FontAwesome";

export const Main = createMaterialTopTabNavigator({
    Home: 
    { screen : MainPage,
      navigationOptions: {
        tabBarIcon: ({ tintColor }) => (
          <Icon name="home" size={30} color="white" />
        ),
        tabBarOptions: { 
          showIcon: true ,
          showLabel:false,
          style : {
            backgroundColor : 'teal'
          },        
          indicatorStyle : {
            backgroundColor : 'white'
          },
  
        },
      }
    },
    Expense: 
    { screen: ExpensePage,
      navigationOptions: {
        tabBarIcon: ({ tintColor }) => (
          <FontAwesome name="minus" size={26} color="white" />
        ),
        tabBarOptions: { 
          showIcon: true ,
          showLabel:false,
          style : {
            backgroundColor : 'teal'
          },
          indicatorStyle : {
            backgroundColor : 'white'
          },
          
        },
      }
    } ,
    Income : 
    { screen:  IncomePage,
      navigationOptions: {
        tabBarIcon: ({ tintColor }) => (
          <FontAwesome name="plus" size={26} color="white" />
        ),
        tabBarOptions: { 
          showIcon: true ,
          showLabel:false,
          style : {
            backgroundColor : 'teal'
          },
          indicatorStyle : {
            backgroundColor : 'white'
          },  
        },
      }
    } ,
  },{
      order : ['Home','Expense','Income'],
      animationEnabled : true,
    
    },
  );
  

  export default class MainTabNavigator extends React.Component {

    constructor(props) {
        super(props);
       
       this.state = {
            changingRouteName : ''
        }
    }

    render() {
        return (
            <Main  ref={(ref) => { this.nav = ref; }}
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
              
                
        );
    }
    }
    
    

