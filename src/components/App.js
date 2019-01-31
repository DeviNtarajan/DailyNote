
import React from 'react';
//import MainPage from './MainPage';
//import MainPage1 from './MainPage1';
import ExpensePage from './ExpensePage';
import IncomePage from './IncomePage';
import { DrawerNavigator,createMaterialTopTabNavigator } from 'react-navigation';
import { MenuProvider } from 'react-native-popup-menu';
import Sidebar from './Sidebar';
import { Header ,Input} from 'react-native-elements';
import FontAwesome from "react-native-vector-icons/FontAwesome";
//import { faCoins } from "/home/ra/devi/NativeApp/node_modules/@fortawesome/free-solid-svg-icons/faCoins.js";
//import FontAwesome, { Icons } from 'react-native-fontawesome';
//import Icon from "react-native-vector-icons/MaterialIcons";
import { View, Text } from 'react-native';
import { Icon } from 'react-native-elements';
import  MainTabNavigator from './MainTabNavigator';
import MainPage from './MainPage';

//import { library } from '/home/ra/devi/NativeApp/node_modules/@fortawesome/fontawesome-svg-core'
//import { FontAwesomeIcon } from '/home/ra/devi/NativeApp/node_modules/@fortawesome/react-fontawesome'
//import { faCoins } from '/home/ra/devi/NativeApp/node_modules/@fortawesome/free-solid-svg-icons/faCoins'

//library.add(faCoins)
  

  export const DrawerStack = DrawerNavigator( {
    Home: { screen: MainTabNavigator },
    Expense: { screen : ExpensePage },
    Income: { screen: IncomePage },
    
  },{
    contentComponent: Sidebar,
    contentOptions: {
       style: {
        backgroundColor: 'black',
        flex: 1
      }
    }
  });

  /*export const DrawerNavigation = StackNavigator({
    DrawerStack: { screen: DrawerStack },
    AppStack : {screen : AppNavigator }
  } ,{
    headerMode: 'none',
    navigationOptions: {
    headerVisible: false,
    }
  });*/



export default class App extends React.Component {


  
  render() {
    return (
//      <View style={styles.container}>
//      <Text>{'John \'s pet is '+this.state.petname}</Text>
//      </View>
//        <MenuProvider>
//        <MainPage />
//        </MenuProvider>



        <MenuProvider>

        <View>
            <Header
            placement="left"
            backgroundColor= 'teal'
            outerContainerStyles={{borderBottomColor:'teal',borderTopColor:'teal'}}
            //leftComponent={<View><Icon name='menu' color='#fff' style={{width:50,fontSize:20,fontWeight:'bold'}}  onPress ={ () => { this.props.navigation.openDrawer()}} /></View>}
            centerComponent={{ text: 'Daily Note', style: { color: '#fff',fontSize:22,fontWeight:'bold' } }}
            // rightComponent={{ icon: 'home', color: '#fff' }}
            />
            {/* </LinearGradient> */}
            </View>

            <DrawerStack />
          
            </MenuProvider>
            
    );
}
}
