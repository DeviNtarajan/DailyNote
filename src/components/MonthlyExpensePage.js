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
import EditingPage from './EditingPage';
import PropTypes from 'prop-types';
import ExpensePage from './ExpensePage';
import { createStackNavigator } from 'react-navigation';

var SQLite = require('react-native-sqlite-storage')
var db = SQLite.openDatabase({name: 'nativeappdb.db', createFromLocation: '~nativeappdb.db'})
        
  
const mapStateToProps = state => ({
    route: state.navigation.route,
  })

  
export default class MonthlyExpensePage extends React.Component {

   
    constructor(props) {
        super(props);

        
    
        const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
        ];
        
      //  console.warn('navigation '+ this.props.navigation)
        //let ref = this.props.navigation.state.params.ref;
        //console.warn('ref ::'+ref);
        let d = new Date();
        let changingRouteName = this.props.screenProps.changingRouteName;
       //  console.warn('navigation state changed'+changingRouteName)
         this.state = {
            userId: '',
            expenseArray : [],
            totalExpenseAmountForDate : 0,
            totalExpenseAmountForMonth : 0,
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
            changingRouteName : changingRouteName,
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
     //   console.warn('receive props monthly::')
        this.loadContents();
        this.showTotalExpenseForMonth();
    }

    loadContents = () => {
        let expenseArray = [];
        let totalExpenseAmount = '';

        db.transaction((tx) => {
       //     console.warn('month' + this.state.month)
           tx.executeSql('SELECT * FROM Expenses where month = (:month) and year = (:year)',[this.state.month,this.state.year],(tx,results) => {
          //     tx.executeSql('SELECT * FROM Expenses ',[],(tx,results) => {
         //      console.warn('get Expense:::' + expenseArray.month );
               //this.setState({"incomeId" : this.state.incomeId + 1});
               for (let i = 0; i < results.rows.length; ++i) {
                 //console.warn('income id'+ this.state.incomeId)
                 expenseArray.push( {"userId" : results.rows.item(i).user_id, "month": results.rows.item(i).month, "date":  results.rows.item(i).date,"year": results.rows.item(i).year,"description": results.rows.item(i).description, "amount" :results.rows.item(i).expenseAmount });
         //        console.warn(' monthly ssdate'+results.rows.item(i).date)
                 //this.setState({"incomeId" : this.state.incomeId + 1});
               }      
               //console.warn('expenseArray'+expenseArray)
               this.setState({expenseArray: expenseArray});
               
             });
       
             
        });
    }

    componentDidMount() {
        this.loadContents();
        this.showTotalExpenseForMonth();
    }

    calculateTotalExpenseInDB = () => {
        // console.warn('incomeAmount',incomeAmount)
        this.calculateTotalExpenseForDate();
        this.calculateTotalExpenseForMonth();
      }

     calculateTotalExpenseForMonth = () => {
        db.transaction((tx) => {
            let totalExpenseAmountForMonth = 0;
            let totalExpenseAmountForSelectedMonth = 0;
            tx.executeSql('SELECT * FROM Expenses where month = (:month) and year = (:year) ',[this.state.month,this.state.year],(tx,results) => {
                let expenseLen = results.rows.length;
     //           console.warn('expense month lenght'+ expenseLen);
     //           console.warn(' month'+ this.state.month);
     //           console.warn(' selected Month'+ this.state.selectedMonth);
                if(this.state.month !== this.state.selectedMonth && this.state.year !== this.state.selectedYear) {
                    tx.executeSql('SELECT * FROM Expenses where month = (:month) and year = (:year)',[this.state.selectedMonth,this.state.selectedYear],(tx,resul) => {
                        let prevExpenseLen = resul.rows.length;
                    //    console.warn('previous expense length'+prevExpenseLen)
                        if(prevExpenseLen > 0) {
                            for (let i = 0; i < resul.rows.length; ++i) {
                    //        console.warn('prev item:', resul.rows.item(i).expenseAmount);
                    //        console.warn('totalExpenseAmountForSelectedMonth'+ totalExpenseAmountForSelectedMonth)
                            totalExpenseAmountForSelectedMonth = parseInt(resul.rows.item(i).expenseAmount) + parseInt(totalExpenseAmountForSelectedMonth); 
                           }
                           tx.executeSql('SELECT * FROM TotalExpensesForMonth where month = (:month) and year = (:year) ',[this.state.selectedMonth,this.state.selectedYear],(tx,results) => {
                            let len = results.rows.length;
                              if(len === 1) {   
                                tx.executeSql('UPDATE TotalExpensesForMonth SET totalAmount = (:totalAmount) where month = (:month) and year = (:year)',[totalExpenseAmountForSelectedMonth,this.state.selectedMonth,this.state.selectedYear]);     
                                this.setState({totalExpenseAmountForSelectedMonth:totalExpenseAmountForSelectedMonth});
                              }
                            });   
                        } else if(prevExpenseLen === 0) {
                            tx.executeSql('DELETE FROM TotalExpensesForMonth WHERE month = (:month) and year = (:year)',[this.state.selectedMonth,this.state.selectedYear]);        
                        }
                }); 
                }

                if(expenseLen > 0) {
                    for (let i = 0; i < results.rows.length; ++i) {
                //    console.warn('item:', results.rows.item(i).expenseAmount);
                //    console.warn('totalExpenseAmountForMonth'+ totalExpenseAmountForMonth)
                    totalExpenseAmountForMonth = parseInt(results.rows.item(i).expenseAmount) + parseInt(totalExpenseAmountForMonth);
            
                   }
                   tx.executeSql('SELECT * FROM TotalExpensesForMonth where month = (:month) and year = (:year)',[this.state.month,this.state.year],(tx,results) => {
                    let len = results.rows.length;
                      if(len === 1) {   
                        tx.executeSql('UPDATE TotalExpensesForMonth SET totalAmount = (:totalAmount) where month = (:month) and year = (:year)',[totalExpenseAmountForMonth,this.state.month,this.state.year]);     
                        this.setState({totalExpenseAmountForMonth:totalExpenseAmountForMonth});
                      }else if(len === 0) {
                        tx.executeSql('INSERT INTO TotalExpensesForMonth (totalAmount,month,year) Values (:totalAmount,:month,:year)',[totalExpenseAmountForMonth,this.state.month,this.state.year]);         
                        this.setState({totalExpenseAmountForMonth:totalExpenseAmountForMonth});                          
                      }
                      this.clearValues();
                    });   
            }
        });
      });         
    }

    calculateTotalExpenseForDate = () => {
        db.transaction((tx) => {
            let totalExpenseAmountForDate = 0;
            let totalExpenseAmountForSelectedDate = 0;
            tx.executeSql('SELECT * FROM Expenses where date = (:date) ',[this.state.date],(tx,results) => {
                let expenseLen = results.rows.length;
            //    console.warn('expense date lenght'+ expenseLen);
            //    console.warn(' date'+ this.state.date);
            //    console.warn(' selected Date'+ this.state.selectedDate);
                if(this.state.date !== this.state.selectedDate) {
                    tx.executeSql('SELECT * FROM Expenses where date = (:date) ',[this.state.selectedDate],(tx,resul) => {
                        let prevExpenseLen = resul.rows.length;
                    //    console.warn('previous expense length'+prevExpenseLen)
                        if(prevExpenseLen > 0) {
                            for (let i = 0; i < resul.rows.length; ++i) {
                    //        console.warn('prev item:', resul.rows.item(i).expenseAmount);
                    //        console.warn('totalExpenseAmountForSelectedDate'+ totalExpenseAmountForSelectedDate)
                            totalExpenseAmountForSelectedDate = parseInt(resul.rows.item(i).expenseAmount) + parseInt(totalExpenseAmountForSelectedDate); 
                           }
                           tx.executeSql('SELECT * FROM TotalExpensesForDate where date = (:date) ',[this.state.selectedDate],(tx,results) => {
                            let len = results.rows.length;
                              if(len === 1) {   
                                tx.executeSql('UPDATE TotalExpensesForDate SET totalAmount = (:totalAmount) where date = (:date)',[totalExpenseAmountForSelectedDate,this.state.selectedDate]);     
                                this.setState({totalExpenseAmountForSelectedDate:totalExpenseAmountForSelectedDate});
                              }
                            });   
                        } else if(prevExpenseLen === 0) {
                            tx.executeSql('DELETE FROM TotalExpensesForDate WHERE date = (:date)',[this.state.selectedDate]);        
                        }
                }); 
                }

                if(expenseLen > 0) {
                    for (let i = 0; i < results.rows.length; ++i) {
                //    console.warn('item:', results.rows.item(i).expenseAmount);
                //    console.warn('totalExpenseAmountForDate'+ totalExpenseAmountForDate)
                    totalExpenseAmountForDate = parseInt(results.rows.item(i).expenseAmount) + parseInt(totalExpenseAmountForDate);
            
                   }
                   tx.executeSql('SELECT * FROM TotalExpensesForDate where date = (:date) ',[this.state.date],(tx,results) => {
                    let len = results.rows.length;
                      if(len === 1) {   
                        tx.executeSql('UPDATE TotalExpensesForDate SET totalAmount = (:totalAmount) where date = (:date)',[totalExpenseAmountForDate,this.state.date]);     
                        this.setState({totalExpenseAmountForDate:totalExpenseAmountForDate});
                      }else if(len === 0) {
                        tx.executeSql('INSERT INTO TotalExpensesForDate (totalAmount,date) Values (:totalAmount,:date)',[totalExpenseAmountForDate,this.state.date]);         
                        this.setState({totalExpenseAmountForDate:totalExpenseAmountForDate});                          
                      }
                    });   
            }
        });
      });         
    }

      calculateTotalExpenseInDBAfterDeleting = () => {
        this.calculateTotalExpenseForDateAfterDeleting();
        this.calculateTotalExpenseForMonthAfterDeleting();
        
      }

      calculateTotalExpenseForMonthAfterDeleting = () => {
        db.transaction((tx) => {
            
            let totalExpenseAmountForMonth = 0;
            tx.executeSql('SELECT * FROM Expenses where month = (:month) and year = (:year)',[this.state.month,this.state.year],(tx,results) => {
                let len = results.rows.length;
            //    console.warn('length month'+ len)
            //    console.warn('month'+ this.state.month)
                if(len > 0) {
                    for (let i = 0; i < results.rows.length; ++i) {
            //        console.warn('item:', results.rows.item(i).expenseAmount);
            //        console.warn('totalExpenseAmountForMonth'+ totalExpenseAmountForMonth)
                    totalExpenseAmountForMonth = parseInt(results.rows.item(i).expenseAmount) + parseInt(totalExpenseAmountForMonth);
            
                   }
                    tx.executeSql('UPDATE TotalExpensesForMonth SET totalAmount = (:totalAmount) where month = (:month) and year = (:year)',[totalExpenseAmountForMonth,this.state.month,this.state.year]);     
                    this.setState({totalExpenseAmountForMonth:totalExpenseAmountForMonth});   
                }else if(len === 0) {
                    tx.executeSql('DELETE FROM TotalExpensesForMonth WHERE month = (:month) and year = (:year)',[this.state.month,this.state.year]);
                    this.setState({totalExpenseAmountForMonth:totalExpenseAmountForMonth});
                }
                this.clearValues();
                });        
            
            });
      }

      calculateTotalExpenseForDateAfterDeleting = () => {
        db.transaction((tx) => {
            
            let totalExpenseAmountForDate = 0;
            tx.executeSql('SELECT * FROM Expenses where date = (:date) ',[this.state.selectedDate],(tx,results) => {
                let len = results.rows.length;
            //    console.warn('length date'+ len)
                if(len > 0) {
                    for (let i = 0; i < results.rows.length; ++i) {
            //        console.warn('item:', results.rows.item(i).totalAmount);
            //        console.warn('totalExpenseAmountForDate', totalExpenseAmountForDate);
                    totalExpenseAmountForDate = parseInt(results.rows.item(i).totalAmount) + parseInt(totalExpenseAmountForDate);
            
                   }
                    tx.executeSql('UPDATE TotalExpensesForDate SET totalAmount = (:totalAmount) where date = (:date)',[totalExpenseAmountForDate,this.state.selectedDate]);     
                    this.setState({totalExpenseAmountForDate:totalExpenseAmountForDate});   
                }else if(len === 0) {
                    tx.executeSql('DELETE FROM TotalExpensesForDate WHERE date = (:date)',[this.state.selectedDate]);
                    this.setState({totalExpenseAmountForDate:totalExpenseAmountForDate});
                }
                });        
            
            });
      }


    handleDelete = () => {
       // console.warn('selected user id'+this.state.selectedUserId)
        db.transaction((tx) => {
            tx.executeSql('DELETE FROM Expenses WHERE user_Id = (:user_Id)',[this.state.selectedUserId]);
            var array = [...this.state.expenseArray]; // make a separate copy of the array
            array.map(expense => (expense.userId === this.state.selectedUserId)? expense:'')
            let index = array.findIndex(expense => expense.userId === this.state.selectedUserId);
        //    console.warn('index of the array'+ index)
            array.splice(index, 1);
            this.setState({expenseArray: array});     
    
        });
        this.calculateTotalExpenseInDBAfterDeleting();
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

        this.showTotalExpenseForMonth();      
    }

    handleEdit = () => {

         db.transaction((tx) => {
            tx.executeSql('SELECT * FROM Expenses where user_id = (:user_id)',[this.state.selectedUserId],(tx,results) => {
              let len = results.rows.length;
            //  console.warn("length"+len);
              this.setState({'date' : results.rows.item(0).date,'description' : results.rows.item(0).description,'amount' : results.rows.item(0).expenseAmount.toString()})
            });
        });
   
        this.showEditingMenu();
    }

    validateFields = () =>
    {
        var description=this.state.description;
        var amount=this.state.amount;
    //    console.warn('de'+description)
    //    console.warn('amount'+amount)
        if ((description==null || description=="") || (amount==null || amount==""))
        {
            alert("Please Fill All Required Field");
            return false;
        }else {
    //      console.warn('valid')
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

        db.transaction((tx) => {
        //    console.warn('date '+ this.state.date);
        //    console.warn('selected user id'+ this.state.selectedUserId)
        //    console.warn('month '+ this.state.month);
        //    console.warn(' selected month '+ this.state.selectedMonth);
            tx.executeSql('UPDATE Expenses SET date = (:date),month = (:month),year = (:year), description = (:description),expenseAmount = (:expenseAmount) where user_id = (:user_id)',[this.state.date,this.state.month,this.state.year,this.state.description,this.state.amount,this.state.selectedUserId]);
        //    console.warn('before expense array'+ this.state.expenseArray)
            this.calculateTotalExpenseInDB();

            this.loadContents();
            
            this.hideEditingMenu();
    
        });          
    }

    

      showTotalExpenseForMonth = () => {
        let totalExpenseAmountForMonth = 0;
       
        //console.warn('showtotal')
        db.transaction((tx) => {
          // console.warn('this state month'+ this.state.month)
            tx.executeSql('SELECT * FROM TotalExpensesForMonth where month = (:month) and year = (:year)',[this.state.month,this.state.year],(tx,results) => {
              let len = results.rows.length;
             
            //  console.warn('total expense length'+len)
            //  console.warn('lendth indied')
              if(len > 0) {
            //    console.warn('totalExpenseAmountForMonth'+results.rows.item(0).totalAmount)
                totalExpenseAmountForMonth = results.rows.item(0).totalAmount;
            //   console.warn('totalExpenseAmountForMonth'+totalExpenseAmountForMonth)
                this.setState({'totalExpenseAmountForMonth': totalExpenseAmountForMonth});
              }else if( len === 0) {
                this.setState({'totalExpenseAmountForMonth': totalExpenseAmountForMonth});
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
            
            <MenuOptions optionsContainerStyle={{alignItems:'center',marginLeft:140,marginTop:0,width:100,elevation:16}} >
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
              this.showTotalExpenseForMonth();
                 
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
              this.showTotalExpenseForMonth();
                
            } }  />
            </View>      
            </View>
           
            <View style={{justifyContent:'flex-end',marginTop:15}}>
                <Badge containerStyle={{ backgroundColor: 'white',width:150,marginLeft:200}} >
                <Text style={{color:'darkred',fontWeight:'bold',fontSize:17}}>Total - {this.state.totalExpenseAmountForMonth}</Text>
                </Badge>
            </View>
             
        <View style={{ paddingLeft:20,paddingRight:20}}>
    
            { ( this.state.expenseArray.length !== 0) ?
            
            <FlatList
                data={this.state.expenseArray} 
                
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
                    overlayContainerStyle={{backgroundColor: 'darkred'}}
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
                        size={22}
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
                        size={22}
                        type='font-awesome'
                        color={this.state.themeThirdColor}
                        onPress={() => {
                            this.setState({selectedUserId : item.userId})
                            this.handleDelete();
                           }} />
                        </View>

                    </View>
                    <View style={{  width:100,marginLeft:10,paddingBottom:14}}>
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
        );
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
  