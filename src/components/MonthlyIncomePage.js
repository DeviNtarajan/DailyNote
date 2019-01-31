import React from 'react';
import { View, Text, Button,FlatList,StyleSheet ,KeyboardAvoidingView,ScrollView,TouchableHighlight,} from 'react-native';
import { Input,Card,Icon,Avatar,Badge} from 'react-native-elements';
import DateTimePicker from 'react-native-modal-datetime-picker';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import LinearGradient from 'react-native-linear-gradient';
import { MenuProvider } from 'react-native-popup-menu';
import {
  MenuContext,
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  renderers
} from 'react-native-popup-menu';
//import Overlay from 'react-native-elements';
//import EditingPage from './EditingPage';
import PropTypes from 'prop-types';
//import ExpensePage from './ExpensePage';
import { createStackNavigator } from 'react-navigation';

var SQLite = require('react-native-sqlite-storage')
var db = SQLite.openDatabase({name: 'nativeappdb.db', createFromLocation: '~nativeappdb.db'})
        
  
const mapStateToProps = state => ({
    route: state.navigation.route,
  })

  
export default class MonthlyIncomePage extends React.Component {


    constructor(props) {
        super(props);

        const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
        ];
        
        let d = new Date();
        this.state = {
            userId: '',
            incomeArray : [],
            totalIncomeAmountForDate : 0,
            totalIncomeAmountForMonth : 0,
            month:monthNames[d.getMonth()],
            year:d.getFullYear().toString(),
            themefirstColor: 'lightcyan',
            themeSecondColor: 'darkcyan',
            themeThirdColor: 'teal',
            isOptionMenu : false,
            isEditingMenu : false,
            selectedUserId: '',
            selectedDate: '',
            selectedMonth: '',            
            selectedYear: '',
            navigation: this.props.navigation,
            date : '',
            description : '',
            amount : '',
            dateBorderColor: 'teal',
            dateBorderWidth: 0.5,
            descriptionBorderColor: 'teal',
            descriptionBorderWidth: 0.5,
            amountBorderColor: 'teal',
            amountBorderWidth: 0.5,
            isDateTimePickerVisible: false,
            datePickerSelectedDate : new Date(),  
            selectedMonthKey: d.getMonth(),
        }

    }
/*
    shouldComponentUpdate = () => {
        console.warn('should component update'+ this.props.screenProps.changingRouteName)
        return true;
    }
*/
    componentWillReceiveProps = () => {
 //       console.warn('receive props monthly::')
        this.loadContents();
        this.showTotalIncomeForMonth();
    }

    loadContents = () => {
        let incomeArray = [];
        let totalIncomeAmount = '';

        db.transaction((tx) => {
    //        console.warn('month' + this.state.month)
    //        console.warn('year' + this.state.year)
           tx.executeSql('SELECT * FROM Income where month = (:month) and year = (:year)',[this.state.month,this.state.year],(tx,results) => {
          //     tx.executeSql('SELECT * FROM Expenses ',[],(tx,results) => {
            //   console.warn('get Income:::' + results.rows.length );
               //this.setState({"incomeId" : this.state.incomeId + 1});
               for (let i = 0; i < results.rows.length; ++i) {
                 //console.warn('income id'+ this.state.incomeId)
                 incomeArray.push( {"userId" : results.rows.item(i).user_id, "year": results.rows.item(i).year, "date":  results.rows.item(i).date,"month": results.rows.item(i).month ,"description": results.rows.item(i).description, "amount" :results.rows.item(i).incomeAmount });
              //   console.warn(' monthly ssdate'+results.rows.item(i).date)
                 //this.setState({"incomeId" : this.state.incomeId + 1});
               }      
               //console.warn('expenseArray'+expenseArray)
               this.setState({incomeArray: incomeArray});
               
             });
       
             
        });
    }

    componentDidMount() {
     //   console.warn('component did mount from monthly')
        this.loadContents();
        this.showTotalIncomeForMonth();
    }

    
    handleDelete = () => {
        //console.warn('selected user id'+this.state.selectedUserId)
        db.transaction((tx) => {
            tx.executeSql('DELETE FROM Income WHERE user_Id = (:user_Id)',[this.state.selectedUserId]);
            var array = [...this.state.incomeArray]; // make a separate copy of the array
            array.map(income => (income.userId === this.state.selectedUserId)? income:'')
            let index = array.findIndex(income => income.userId === this.state.selectedUserId);
          //  console.warn('index of the array'+ index)
            array.splice(index, 1);
            this.setState({incomeArray: array});
               
        });
        this.calculateTotalIncomeInDBAfterDeleting();
    }

    calculateTotalIncomeInDBAfterDeleting = () => {
        this.calculateTotalIncomeForDateAfterDeleting();
        this.calculateTotalIncomeForMonthAfterDeleting();
        
      }

      calculateTotalIncomeForMonthAfterDeleting = () => {
        db.transaction((tx) => {
            
            let totalIncomeAmountForMonth = 0;
            tx.executeSql('SELECT * FROM Income where month = (:month) and year = (:year) ',[this.state.month,this.state.year],(tx,results) => {
                let len = results.rows.length;
            //    console.warn('length month'+ len)
            //    console.warn('month'+ this.state.month)
                if(len > 0) {
                    for (let i = 0; i < results.rows.length; ++i) {
            //        console.warn('item:', results.rows.item(i).incomeAmount);
            //        console.warn('totalIncomeAmountForMonth'+ totalIncomeAmountForMonth)
                    totalIncomeAmountForMonth = parseInt(results.rows.item(i).incomeAmount) + parseInt(totalIncomeAmountForMonth);
            
                   }
                    tx.executeSql('UPDATE TotalIncomeForMonth SET totalAmount = (:totalAmount) where month = (:month) and year = (:year)',[totalIncomeAmountForMonth,this.state.month,this.state.year]);     
                    this.setState({totalIncomeAmountForMonth:totalIncomeAmountForMonth});   
                }else if(len === 0) {
                    tx.executeSql('DELETE FROM TotalIncomeForMonth WHERE month = (:month) and year = (:year)',[this.state.month,this.state.year]);
                    this.setState({totalIncomeAmountForMonth:totalIncomeAmountForMonth});
                }
                this.clearValues();
                });        
            
            });
      }

      calculateTotalIncomeForDateAfterDeleting = () => {
        db.transaction((tx) => {
            
            let totalIncomeAmountForDate = 0;
            tx.executeSql('SELECT * FROM Income where date = (:date) ',[this.state.selectedDate],(tx,results) => {
                let len = results.rows.length;
            //    console.warn('length date'+ len)
                if(len > 0) {
                    for (let i = 0; i < results.rows.length; ++i) {
            //        console.warn('item:', results.rows.item(i).totalAmount);
            //        console.warn('totalIncomeAmountForDate', totalIncomeAmountForDate);
                    totalIncomeAmountForDate = parseInt(results.rows.item(i).totalAmount) + parseInt(totalIncomeAmountForDate);
            
                   }
                    tx.executeSql('UPDATE TotalIncomeForDate SET totalAmount = (:totalAmount) where date = (:date)',[totalIncomeAmountForDate,this.state.selectedDate]);     
                    this.setState({totalIncomeAmountForDate:totalIncomeAmountForDate});   
                }else if(len === 0) {
                    tx.executeSql('DELETE FROM TotalIncomeForDate WHERE date = (:date)',[this.state.selectedDate]);
                    this.setState({totalIncomeAmountForDate:totalIncomeAmountForDate});
                }
                
                });        
            
            });
      }


    _showDateTimePicker = () => this.setState({ isDateTimePickerVisible: true });
 
    _hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });
   
    _handleDatePicked = (date) => {
     // console.warn('date'+ date)
      let changedDate = date.getDate() + "-" + (date.getMonth()+1) + "-" + date.getFullYear();
      
      this.setState({date:changedDate});

      this.setState({year:date.getFullYear().toString()});

      this.setMonth(date.getMonth());
  
      this.setState({datePickerSelectedDate : date});
      
     // this.loadContents();

     // this.showTotalIncomeForMonth();

      this._hideDateTimePicker();
    };


    onDescriptionFocus() {
        this.setState({
            descriptionBorderColor : this.state.themeThirdColor,
            descriptionBorderWidth : 2
        })
      }
    
      onDescriptionBlur() {
        this.setState({
          descriptionBorderColor : this.state.themeThirdColor,
          descriptionBorderWidth : 0.5
        })
      }
    
      onAmountFocus() {
        this.setState({
            amountBorderColor : this.state.themeThirdColor,
            amountBorderWidth : 2
        })
      }
    
      onAmountBlur() {
        this.setState({
          amountBorderColor : this.state.themeThirdColor,
          amountBorderWidth : 0.5
        })
      }
    

     showEditingMenu() {
        //console.warn('show editing menu');
        this.setState({isEditingMenu: true})
     }
 
     hideEditingMenu() {
        this.setState({isEditingMenu: false})
        this.setState({selectedUserId : ''})
        this.setState({selectedDate : ''})
        this.setState({selectedMonth : ''})
        this.setState({selectedYear : ''})
        this.clearValues();
     }

    setMonth = (monthKey) => {
        const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
        ];
        this.setState({month: monthNames[monthKey]});
        //console.warn('set month')
        this.loadContents();

        this.showTotalIncomeForMonth();
    
    }

    handleEdit = () => {
        

         db.transaction((tx) => {
            tx.executeSql('SELECT * FROM Income where user_id = (:user_id)',[this.state.selectedUserId],(tx,results) => {
              let len = results.rows.length;
            //  console.warn("length"+len);
              this.setState({'date' : results.rows.item(0).date,'description' : results.rows.item(0).description,'amount' : results.rows.item(0).incomeAmount.toString()})
            });
        });
   
        this.showEditingMenu();
    }

    validateFields = () =>
    {
        var description=this.state.description;
        var amount=this.state.amount;
     //   console.warn('de'+description)
     //   console.warn('amount'+amount)
        if ((description==null || description=="") || (amount==null || amount==""))
        {
            alert("Please Fill All Required Field");
            return false;
        }else {
     //     console.warn('valid')
          return true;
        }
    }

    clearValues = () => {
        this.setState({description: ''});
        this.setState({amount : ''});
      }

    handleSave = () => {
    
        let validation = this.validateFields();
        //console.warn('valide'+validation)
        if(!validation) {
          return false;
        }

        //console.warn('date '+ this.state.date);
        //console.warn('selected user id'+ this.state.selectedUserId)
        db.transaction((tx) => {
            tx.executeSql('UPDATE Income SET date = (:date),month = (:month),year = (:year), description = (:description),incomeAmount = (:incomeAmount) where user_id = (:user_id)',[this.state.date,this.state.month,this.state.year,this.state.description,this.state.amount,this.state.selectedUserId]);            
            this.calculateTotalIncomeInDB();
            this.loadContents();
            this.hideEditingMenu();                
        });          
    }

    calculateTotalIncomeInDB = () => {
        // console.warn('incomeAmount',incomeAmount)
        this.calculateTotalIncomeForDate();
        this.calculateTotalIncomeForMonth();
    }

    calculateTotalIncomeForDate = () => {
        db.transaction((tx) => {
            let totalIncomeAmountForDate = 0;
            let totalIncomeAmountForSelectedDate = 0;
            tx.executeSql('SELECT * FROM Income where date = (:date) ',[this.state.date],(tx,results) => {
                let incomeLen = results.rows.length;
               // console.warn('Income date lenght'+ incomeLen);
               // console.warn(' date'+ this.state.date);
               // console.warn(' selected Date'+ this.state.selectedDate);
                if(this.state.date !== this.state.selectedDate) {
                    tx.executeSql('SELECT * FROM Income where date = (:date) ',[this.state.selectedDate],(tx,resul) => {
                        let prevIncomeLen = resul.rows.length;
                    //    console.warn('previous income length'+prevIncomeLen)
                        if(prevIncomeLen > 0) {
                            for (let i = 0; i < resul.rows.length; ++i) {
                    //        console.warn('prev item:', resul.rows.item(i).incomeAmount);
                    //        console.warn('totalIncomeAmountForSelectedDate'+ totalIncomeAmountForSelectedDate)
                            totalIncomeAmountForSelectedDate = parseInt(resul.rows.item(i).incomeAmount) + parseInt(totalIncomeAmountForSelectedDate); 
                           }
                           tx.executeSql('SELECT * FROM TotalIncomeForDate where date = (:date) ',[this.state.selectedDate],(tx,results) => {
                            let len = results.rows.length;
                              if(len === 1) {   
                                tx.executeSql('UPDATE TotalIncomeForDate SET totalAmount = (:totalAmount) where date = (:date)',[totalIncomeAmountForSelectedDate,this.state.selectedDate]);     
                                this.setState({totalIncomeAmountForSelectedDate:totalIncomeAmountForSelectedDate});
                              }
                            });   
                        } else if(prevIncomeLen === 0) {
                            tx.executeSql('DELETE FROM TotalIncomeForDate WHERE date = (:date)',[this.state.selectedDate]);        
                        }
                }); 
                }

                if(incomeLen > 0) {
                    for (let i = 0; i < results.rows.length; ++i) {
                //    console.warn('item:', results.rows.item(i).incomeAmount);
                //    console.warn('totalIncomeAmountForDate'+ totalIncomeAmountForDate)
                    totalIncomeAmountForDate = parseInt(results.rows.item(i).incomeAmount) + parseInt(totalIncomeAmountForDate);
            
                   }
                   tx.executeSql('SELECT * FROM TotalIncomeForDate where date = (:date) ',[this.state.date],(tx,results) => {
                    let len = results.rows.length;
                      if(len === 1) {   
                        tx.executeSql('UPDATE TotalIncomeForDate SET totalAmount = (:totalAmount) where date = (:date)',[totalIncomeAmountForDate,this.state.date]);     
                        this.setState({totalIncomeAmountForDate:totalIncomeAmountForDate});
                      }else if(len === 0) {
                        tx.executeSql('INSERT INTO TotalIncomeForDate (totalAmount,date) Values (:totalAmount,:date)',[totalIncomeAmountForDate,this.state.date]);         
                        this.setState({totalIncomeAmountForDate:totalIncomeAmountForDate});                          
                      }
                    });   
            }
        });
      });         
    }

        calculateTotalIncomeForMonth = () => {
            db.transaction((tx) => {
                let totalIncomeAmountForMonth = 0;
                let totalIncomeAmountForSelectedMonth = 0;
                tx.executeSql('SELECT * FROM Income where month = (:month) and year = (:year) ',[this.state.month,this.state.year],(tx,results) => {
                    let incomeLen = results.rows.length;
                //    console.warn('calculate total income or month')
                //    console.warn('Income month lenght'+ incomeLen);
                //    console.warn(' month'+ this.state.month);
                //    console.warn(' selected Month'+ this.state.selectedMonth);
                    if(this.state.month !== this.state.selectedMonth && this.state.year !== this.state.selectedYear) {
                        tx.executeSql('SELECT * FROM Income where month = (:month) and year = (:year) ',[this.state.selectedMonth,this.state.selectedYear],(tx,resul) => {
                            let prevIncomeLen = resul.rows.length;
                        //    console.warn('previous income length'+prevIncomeLen)
                            if(prevIncomeLen > 0) {
                                for (let i = 0; i < resul.rows.length; ++i) {
                        //        console.warn('prev item:', resul.rows.item(i).incomeAmount);
                        //        console.warn('totalIncomeAmountForSelectedMonth'+ totalIncomeAmountForSelectedMonth)
                                totalIncomeAmountForSelectedMonth = parseInt(resul.rows.item(i).incomeAmount) + parseInt(totalIncomeAmountForSelectedMonth); 
                               }
                               tx.executeSql('SELECT * FROM TotalIncomeForMonth where month = (:month) and year = (:year) ',[this.state.selectedMonth,this.state.selectedYear],(tx,results) => {
                                let len = results.rows.length;
                                  if(len === 1) {   
                                    tx.executeSql('UPDATE TotalIncomeForMonth SET totalAmount = (:totalAmount) where month = (:month) and year = (:year)',[totalIncomeAmountForSelectedMonth,this.state.selectedMonth,this.state.selectedYear]);     
                                    this.setState({totalIncomeAmountForSelectedMonth:totalIncomeAmountForSelectedMonth});
                                  }
                                });   
                            } else if(prevIncomeLen === 0) {
                                tx.executeSql('DELETE FROM TotalIncomeForMonth WHERE month = (:month) and year = (:year)',[this.state.selectedMonth,this.state.selectedYear]);        
                            }
                    }); 
                    }
    
                    if(incomeLen > 0) {
                        for (let i = 0; i < results.rows.length; ++i) {
                    //    console.warn('item:', results.rows.item(i).incomeAmount);
                    //    console.warn('totalIncomeAmountForMonth'+ totalIncomeAmountForMonth)
                        totalIncomeAmountForMonth = parseInt(results.rows.item(i).incomeAmount) + parseInt(totalIncomeAmountForMonth);
                
                       }
                       tx.executeSql('SELECT * FROM TotalIncomeForMonth where month = (:month) and year = (:year) ',[this.state.month,this.state.year],(tx,results) => {
                        let len = results.rows.length;
                          if(len === 1) {   
                            tx.executeSql('UPDATE TotalIncomeForMonth SET totalAmount = (:totalAmount) where month = (:month) and year = (:year)',[totalIncomeAmountForMonth,this.state.month,this.state.year]);     
                            this.setState({totalIncomeAmountForMonth:totalIncomeAmountForMonth});
                          }else if(len === 0) {
                            tx.executeSql('INSERT INTO TotalIncomeForMonth (totalAmount,month,year) Values (:totalAmount,:month,:year)',[totalIncomeAmountForMonth,this.state.month,this.state.year]);         
                            this.setState({totalIncomeAmountForMonth:totalIncomeAmountForMonth});                          
                          }
                          this.clearValues();
                        });   
                }
            });
          });         
        }
    
     
      showTotalIncomeForMonth = () => {

        let totalIncomeAmountForMonth = 0;
        //console.warn('showtotal')
        db.transaction((tx) => {
          // console.warn('this state month'+ this.state.month)
    
            tx.executeSql('SELECT * FROM TotalIncomeForMonth where month = (:month) and year = (:year)  ',[this.state.month,this.state.year],(tx,results) => {
              let len = results.rows.length;
            //  console.warn('total income length'+len)
              if(len > 0) {
                totalIncomeAmountForMonth = results.rows.item(0).totalAmount;
                //console.warn('totalIncomeAmount'+totalIncomeAmount)
                this.setState({'totalIncomeAmountForMonth': totalIncomeAmountForMonth});
              }else if( len === 0) {
                this.setState({'totalIncomeAmountForMonth': totalIncomeAmountForMonth});
              }
            });
    
          });
      }

    render() {
        const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
        ];

        const d = new Date();

        return (
            <View  style={styles.wrapper}>
            <ScrollView >
            
            <View style={{flexDirection:'row'}}>
            <Menu style={{borderColor:this.state.themefirstColor,borderBottomColor:this.state.themefirstColor,alignItems:'center',paddingTop:10,borderRadius:40}}   >
            
            <MenuTrigger customStyles={{borderBottomColor:this.state.themeThirdColor}}>
            <View style={{flexDirection:'row',justifyContent:'center',alignItems: 'center',backgroundColor:'white',paddingBottom:5,borderBottomColor:this.state.themeThirdColor,width:150}}>
            <Text style={{fontSize: 20,textAlign:'center',color:this.state.themeThirdColor,fontWeight:'bold'}} >{this.state.month}</Text>
            <FontAwesome style={{fontSize: 20,textAlign:'center',color:this.state.themeThirdColor,paddingLeft:10}} name='chevron-right'   />
            </View>      
            
            </MenuTrigger>
            
            <MenuOptions optionsContainerStyle={{alignItems:'center',marginLeft:130,marginTop:40,width:100,elevation:16}} >
              {
                monthNames.map((item, key) => (
                    
                    (item === this.state.month  ) ? 
                      <MenuOption key={key} onSelect={() => {
                        let year = d.getFullYear();
                        let date = new Date(year, key, 1, 10, 30, 50, 800);
                        this.setState({selectedMonthKey : key});
                        this.setMonth(key); 
                        this.setState({date : (1+'-'+(key+1)+'-'+year)})
                     //   console.warn('changd date'+ date); 
                        this.setState({datePickerSelectedDate:date});
                      } } >
                      <Text style={{backgroundColor:this.state.themeThirdColor,color:'white',fontWeight:'bold',fontSize:18}}>{item}</Text>
                      </MenuOption>
                    : 
                      <MenuOption key={key} onSelect={() => {
                        let year = d.getFullYear();
                        let date = new Date(year, key, 1, 10, 30, 50, 800);
      
                        this.setMonth(key); 
                        this.setState({date : (1+'-'+(key+1)+'-'+year)})
                     //   console.warn('changd date'+ date); 
                        this.setState({datePickerSelectedDate:date});
          
                        } } >
                      <Text style={{color:this.state.themeThirdColor,fontWeight:'bold',fontSize:18}}>{item}</Text>
                      </MenuOption>
                    
                    
                  )
                )
              }
            </MenuOptions>
            </Menu>

            <View style={{flexDirection:'row',justifyContent:'flex-end',alignItems: 'flex-end',backgroundColor:'white',paddingBottom:5,borderBottomColor:this.state.themeThirdColor,width:150}}>
            <FontAwesome style={{fontSize: 20,textAlign:'center',color:this.state.themeThirdColor,paddingRight:10}} name='chevron-left'   
            onPress={ () => {  
              let year = parseInt(this.state.year,10)-1;
              this.setState({year:year.toString()})
              let key = this.state.selectedMonthKey;
              let date = new Date(year, key, 1, 10, 30, 50, 800);
              this.setState({date : (1+'-'+(key+1)+'-'+year)}) 
              this.setState({datePickerSelectedDate:date});
              this.loadContents();
              this.showTotalIncomeForMonth();
                 
            } }  />
            <Text style={{fontSize: 20,textAlign:'center',color:this.state.themeThirdColor,fontWeight:'bold'}} >{this.state.year}</Text>
            <FontAwesome style={{fontSize: 20,textAlign:'center',color:this.state.themeThirdColor,paddingLeft:10}} name='chevron-right' 
            onPress={ () => {  
              let year = parseInt(this.state.year,10)+1;
              this.setState({year:year.toString()})
              let key = this.state.selectedMonthKey;
              let date = new Date(year, key, 1, 10, 30, 50, 800);
              this.setState({date : (1+'-'+(key+1)+'-'+year)}) 
              this.setState({datePickerSelectedDate:date});
              this.loadContents();      
              this.showTotalIncomeForMonth();
                
            } }  />
            </View>      
            </View>
            <View style={{justifyContent:'flex-end',marginTop:15}}>
                <Badge containerStyle={{ backgroundColor: 'white',width:150,marginLeft:200}} >
                <Text style={{color:'darkgreen',fontWeight:'bold',fontSize:17}}>Total - {this.state.totalIncomeAmountForDate}</Text>
                </Badge>
            </View>
             
        <View style={{ paddingLeft:20,paddingRight:20}}>
    
            { ( this.state.incomeArray.length !== 0) ?
            
            <FlatList
                data={this.state.incomeArray} 
                
                renderItem={({item}) =>
                ( 
                
                <Card containerStyle={{padding: 0,marginBottom:7,margin:0}} > 
                <View style={{  flexDirection: 'row'}}>
                <View>
                <Avatar
                    size={70}
                    rounded
                    title={item.description.charAt(0)}
                    //icon={{name: 'user', type: 'font-awesome'}}
                    overlayContainerStyle={{backgroundColor: 'darkgreen'}}
                    onPress={() => console.log("Works!")}
                    activeOpacity={0.7}
                    containerStyle={{flex: 2, marginLeft: 10, marginTop: 10,marginBottom:10}}
                    />
                </View>
                <View>

                        <View style={{  width:300,marginLeft:10,marginTop:15}}>
                            <Text style={{fontWeight:'bold',color:this.state.themeThirdColor,fontSize:18}}>{item.description}</Text>
                        </View>
                       
                        <View style={{  flexDirection: 'row',marginLeft:10}}>
                        
                        <View style={{width:85}}>
                        <Text style={{fontWeight:'bold',fontSize:15,color:this.state.themeThirdColor}}>{item.amount}</Text>
                        </View>
                        
                        <View style={{paddingLeft:5,width:60}}>
                        <Icon                    
                        name='edit'
                        size={20}
                        type='font-awesome'
                        color={this.state.themeThirdColor}
                        onPress= {() => {
                            this.setState({selectedUserId : item.userId})
                            this.setState({selectedDate : item.date})
                            this.setState({selectedMonth : item.month})
                            this.setState({selectedYear : item.year})
                            this.handleEdit();
                           }}
                            />
                        </View>

                        <View style={{ width:60}}>
                        <Icon                    
                        name='remove'
                        size={20}
                        type='font-awesome'
                        color={this.state.themeThirdColor}
                        onPress={() => {
                            this.setState({selectedUserId : item.userId})
                            this.handleDelete();
                           }} />
                        </View>

                    </View>
                    <View style={{  width:100,marginLeft:10,paddingBottom:10}}>
                    <Text style={{fontWeight:'bold',color:this.state.themeThirdColor,fontSize:15}}>{item.date}</Text>
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
                {this.state.isEditingMenu &&
                    <ScrollView scrollEnabled={false} style={styles.editingOverlay}>
                    <KeyboardAvoidingView behavior="padding">          
                   <View style={{borderBottomColor:this.state.themeThirdColor,borderBottomWidth:2,backgroundColor:'white'}}>
                   <Text style={{color:this.state.themeThirdColor,fontSize:25,fontWeight:'bold'}}>Edit Data</Text>
                   </View>
                   <View style={{flexDirection:'row',padding:5,marginTop:30}}>
                   <View style={{  width:210,justifyContent:'center' ,marginHorizontal:12}}>
                   <Input leftIcon={  <FontAwesome style={{fontSize: 20,color:this.state.themeThirdColor,fontWeight:'bold',paddingBottom:5}} name='calendar' onPress={this._showDateTimePicker}  /> }
                   editable={false} selectTextOnFocus={false} inputStyle={{fontSize:15,color:this.state.themeThirdColor,fontWeight:'bold'}} inputContainerStyle={{height:30,paddingLeft:2,borderRadius: 4,backgroundColor:'white',elevation:2}} blurOnSubmit={false} onSubmitEditing={() => { this.textInput2.focus(); }} underlineColorAndroid='transparent' ref={input => { this.textInput1 = input }}  placeholderTextColor='blue' onChangeText={(text) => this.setState({ date : text})}  value={this.state.date} />
                   </View>
                   <View style={{  width:60,justifyContent:'center' }}>
                    
                    <DateTimePicker
                    isVisible={this.state.isDateTimePickerVisible}
                    onConfirm={this._handleDatePicked}
                    onCancel={this._hideDateTimePicker}
                    date={this.state.datePickerSelectedDate}
                    />
                    </View>
                  </View>
                  <View style={{  width:210,justifyContent:'center' ,marginLeft:20,marginHorizontal:10,marginTop:30 }}>
                  <Input  onBlur={ () => this.onDescriptionBlur() } selectTextOnFocus onFocus={ () => this.onDescriptionFocus() } inputStyle={{fontSize:15,color:this.state.themeThirdColor,fontWeight:'bold'}} inputContainerStyle={{height:30,paddingLeft:2,borderRadius: 4,backgroundColor:'white',elevation:2}} onSubmitEditing={() => { this.textInput3.focus(); }}  underlineColorAndroid='transparent' ref={input => { this.textInput2 = input }}  placeholderTextColor={this.state.themeThirdColor} blurOnSubmit={false} onChangeText={(text) => this.setState({ description : text})} placeholder='Enter text' value={this.state.description} />
                  </View>
                  <View style={{  width:210 ,justifyContent:'center',marginLeft:20,marginTop:30}}>
                  <Input onBlur={ () => this.onAmountBlur() } selectTextOnFocus onFocus={ () => this.onAmountFocus() }  inputStyle={{fontSize:15,color:this.state.themeThirdColor,fontWeight:'bold'}} inputContainerStyle={{height:30,paddingLeft:2,borderRadius: 4,backgroundColor:'white',elevation:2}} underlineColorAndroid='transparent' ref={input => { this.textInput3 = input }} placeholderTextColor={this.state.themeThirdColor} onChangeText={(text) => this.setState({ amount : text})} placeholder='Amount' value={this.state.amount} keyboardType='numeric'/>
                  </View>
                  
                 
                 
             
                   <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center',paddingTop:15}}>
                   <View >
                   
                   <TouchableHighlight  onPress={()=> { 
                       //console.warn('save')
                       this.handleSave();
                   }} style={{backgroundColor:this.state.themeThirdColor,height:35,width:100}} >
                   <Text style={{borderRadius:20,color:'white',fontSize:16,fontWeight:'bold',paddingLeft:3,paddingTop:5,alignContent:'center',justifyContent:'center'}}>Save</Text>
                   </TouchableHighlight>
                   
                   </View>
                   <View style={{paddingLeft:20}}>
                   
                   <TouchableHighlight onPress={()=> { 
                       //console.warn('close')
                       this.hideEditingMenu();
                   }} style={{backgroundColor:this.state.themeThirdColor,height:35,width:100}} >
                   <Text style={{borderRadius:20,color:'white',fontSize:16,fontWeight:'bold',paddingLeft:3,paddingTop:5,alignContent:'center',justifyContent:'center'}}>Close</Text>
                   </TouchableHighlight>
                   
                   </View>
                   </View>
           
                   </KeyboardAvoidingView>
                   </ScrollView>

                       }    
                    
                    </View>
                
        )
    }
}

const styles = StyleSheet.create({
    wrapper: {
      //...StyleSheet.absoluteFillObject,
      flex: 1,
      backgroundColor: 'white',
      
    },
   editingOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        opacity: 8,
        elevation:15,
        backgroundColor: 'white',
        borderColor: 'teal',
        //borderWidth:6,
        //borderRadius:5
        //justifyContent: 'center',
        //alignItems: 'center'
    },


});
  