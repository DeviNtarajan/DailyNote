import React from 'react';
import { View, Text, Button,FlatList,StyleSheet ,KeyboardAvoidingView,ScrollView} from 'react-native';
import { Card,Avatar} from 'react-native-elements';

var SQLite = require('react-native-sqlite-storage')
var db = SQLite.openDatabase({name: 'nativeappdb.db', createFromLocation: '~nativeappdb.db'})
        

  
export default class YearlyIncomePage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            incomeArray : [],
            totalIncomeAmountForMonth : '',
        }
    }

    componentWillReceiveProps = () => {
       // console.warn('receive props daily::');
        this.loadContents();
    }

    componentDidMount() {
        this.loadContents();
    }

    loadContents = () => {
        let incomeArray = [];
        
        db.transaction((tx) => {
            
           tx.executeSql('SELECT * FROM TotalIncomeForMonth  ',[],(tx,results) => {
          //     tx.executeSql('SELECT * FROM Expenses ',[],(tx,results) => {
                let len = results.rows.length;
                //console.warn('yearly expense length'+ len)
               for (let i = 0; i < results.rows.length; ++i) {
                 incomeArray.push( {"userId" : results.rows.item(i).user_id,  "month":  results.rows.item(i).month, "year": results.rows.item(i).year,"totalIncomeAmount": results.rows.item(i).totalAmount});
               }      
               this.setState({incomeArray: incomeArray});
               
             });
                
        });
       
    }

    
    
    render() {
        return (
            <ScrollView style={styles.wrapper} >
                
            <View style={{ paddingLeft:20,paddingRight:20, paddingTop:20}}>            

            { ( this.state.incomeArray.length !== 0) ?
            <FlatList
                data={this.state.incomeArray} 
                
                renderItem={({item}) =>
                ( 
                    <Card containerStyle={{padding: 0,marginVertical:7,marginBottom:7,margin:0}} > 
                    <View style={{  flexDirection: 'row'}}>
                    <View>
                    <Avatar
                        size={60}
                        rounded
                        title={item.month.charAt(0)}
                        //icon={{name: 'user', type: 'font-awesome'}}
                        overlayContainerStyle={{backgroundColor: 'darkgreen'}}
                        onPress={() => console.log("Works!")}
                        activeOpacity={0.7}
                        containerStyle={{flex: 2, marginLeft: 10, marginTop: 10,marginBottom:10}}
                        />
                    </View>
                    <View>
                        <View style={{  flexDirection: 'row',paddingVertical:5,marginLeft:10,paddingBottom:10}}>

                            <View style={{  width:150,marginLeft:10,marginTop:15}}>
                            <Text style={{fontWeight:'bold',color:this.state.themeThirdColor,fontSize:18}}>{item.month}</Text>
                            <Text style={{fontWeight:'bold',color:this.state.themeThirdColor,fontSize:18}}>{item.year}</Text>
                            </View>

                            <View style={{width:150,marginLeft:10,marginTop:15}}>
                            <Text style={{fontWeight:'bold',fontSize:18,color:this.state.themeThirdColor}}>{item.totalIncomeAmount}</Text>
                            </View>                            
    
                        </View>
                    </View>
                    </View>
                    </Card>
    
                    )
                }
                extraData = {this.state}
                keyExtractor={item => item.userId.toString()}
            
                />
               
                :
                <Card containerStyle={{padding: 0,marginVertical:7,marginBottom:7,margin:0}} >  
                            
                         <View style={{ paddingTop: 10,paddingBottom:10,paddingLeft: 140,paddingRight: 100 }}>
                            <Text style={{fontWeight:'bold',fontSize:15,color:this.state.themeThirdColor}}>No Data</Text>
                        </View>
                </Card>
        
            }
            </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    wrapper: {
      //...StyleSheet.absoluteFillObject,
      flex: 1,
      backgroundColor: 'white',
    },
});
  