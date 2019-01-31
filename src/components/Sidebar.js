import React, { Component } from 'react';
import { NavigationActions } from 'react-navigation';
import { ScrollView, Text, View,StyleSheet } from 'react-native';
import { Button } from 'react-native-elements';
import { DrawerActions } from 'react-navigation';
import PropTypes from 'prop-types';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Icon from "react-native-vector-icons/MaterialIcons";

export default class Sidebar extends Component {
   
    navigateToScreen = (route) => () => {
        const navigate = NavigationActions.navigate({
          routeName: route,
   //       action: NavigationActions.navigate({ routeName: 'SubProfileRoute' }),
            
        });
        
        this.props.navigation.dispatch(navigate);
 //       this.props.navigation.dispatch(navigateAction);
        this.props.navigation.dispatch(DrawerActions.closeDrawer())

      }
   
   
      render () {
        return (
          <View style={styles.wrapper}>
          <ScrollView>
            <Button
            icon={
              <Icon
                name='arrow-forward'
                size={25}
                color='teal'
              />
            }
            buttonStyle={{
              width:300,
              backgroundColor:'lightcyan'
            }}t
            iconRight
            titleStyle={{ color:'teal',width:170 }}
            title='Home'
            onPress={this.navigateToScreen('MainPage')}/>
             <Button
             icon={
              <Icon
                name='arrow-forward'
                size={25}
                color='teal'
              />
            }
            buttonStyle={{
              width:300,
              backgroundColor:'lightcyan'
            }}
            iconRight
            titleStyle={{ color:'teal' ,width:170}}
             title='Expense'
             onPress={this.navigateToScreen('ExpensePage')}/>
             <Button
             icon={
               <Icon
                 name='arrow-forward'
                 size={25}
                 color='teal'
               />
             }
             buttonStyle={{
               width:300,
               backgroundColor:'lightcyan'
             }}
             iconRight
             titleStyle={{ color:'teal' ,width:170}}
             title='Income'
              onPress={this.navigateToScreen('IncomePage')}/>
 
             </ScrollView>
          </View>
        );
      }
    }

    Sidebar.propTypes = {
      navigation: PropTypes.object
    };
    
    const styles = StyleSheet.create({
      wrapper: {
        flex: 1,
        backgroundColor: 'white',
      },
    });
  