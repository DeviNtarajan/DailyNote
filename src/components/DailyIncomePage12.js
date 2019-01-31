import React from 'react';
import { View, Text, Button,FlatList,StyleSheet ,KeyboardAvoidingView,ScrollView,TouchableHighlight} from 'react-native';
import { Input,Card,Icon,Avatar,Badge} from 'react-native-elements';
import DateTimePicker from 'react-native-modal-datetime-picker';
import FontAwesome from "react-native-vector-icons/FontAwesome";
//import Icon from "react-native-vector-icons/MaterialIcons";
//import {gold_coins} from  './gold_coins.jpg';
import LinearGradient from 'react-native-linear-gradient';
import PropTypes from 'prop-types';
import IncomePage from './IncomePage';
var SQLite = require('react-native-sqlite-storage')
var db = SQLite.openDatabase({name: 'nativeappdb.db', createFromLocation: '~nativeappdb.db'})
        

  
export default class DailyIncomePage12 extends React.Component {
/*
    static navigationOptions = {
        title: 'Daily Income Page',
        headerTintColor:  'white',
        headerStyle: {
          backgroundColor:"teal"
        }
      };
 */ 
    constructor(props) {
        super(props);

        const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
        ];

        let month = monthNames[new Date().getMonth()]
  //      console.warn('month in daily income'+ month)
       // let date = this.props.navigation.state.params.dailyDate;
        this.state = {
            userId:'' ,
            incomeArray : [],
            totalIncomeAmountForDate : 0,
            totalIncomeAmountForMonth : 0,
            date: new Date().getDate()+'-'+((new Date().getMonth())+1)+'-'+new Date().getFullYear(),
            isDateTimePickerVisible: false,
            datePickerSelectedDate : new Date(), 
            themefirstColor: 'lightcyan',
            themeSecondColor: 'darkcyan',
            themeThirdColor: 'teal',
            isEditingMenu : false,
            isOptionMenu : false,
            description : '',
            amount : '',
            dateBorderColor: 'teal',
            dateBorderWidth: 0.5,
            descriptionBorderColor: 'teal',
            descriptionBorderWidth: 0.5,
            amountBorderColor: 'teal',
            amountBorderWidth: 0.5,
            selectedUserId: '',
            selectedDate: '',
            selectedMonth: '',            
            month : month,
        }
    }

    setMonth = (monthKey) => {
        const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
        ];
        this.setState({month: monthNames[monthKey]});
       // console.warn('set month');
            
    }

    //shouldComponentUpdate = () => {
      //  console.warn('should component update'+ this.props.screenProps.changingRouteName)
       // return true;
    //}

    componentWillReceiveProps = () => {
        console.warn('from receive props daily::');
        this.loadContents();
        this.showTotalIncomeForDate();
    }

    loadContents = () => {
        let incomeArray = [];
        let totalIncomeAmount = '';

        db.transaction((tx) => {
            console.warn('date inside loadcomponents' + this.state.date)
            tx.executeSql('SELECT * FROM Income where date = (:date)',[this.state.date],(tx,results) => {
          //     tx.executeSql('SELECT * FROM Expenses ',[],(tx,results) => {
               console.warn('get Income:::' + results.rows.length );
               //this.setState({"incomeId" : this.state.incomeId + 1});
               for (let i = 0; i < results.rows.length; ++i) {
                 //console.warn('income id'+ this.state.incomeId)
                 incomeArray.push( {"userId" : results.rows.item(i).user_id, "month": results.rows.item(i).month, "date":  results.rows.item(i).date,"description": results.rows.item(i).description, "amount" :results.rows.item(i).incomeAmount });
           //      console.warn(' monthly ssdate'+results.rows.item(i).date)
                 //this.setState({"incomeId" : this.state.incomeId + 1});
               }      
               //console.warn('expenseArray'+expenseArray)
               this.setState({incomeArray: incomeArray});
               
             });
       
             
        });
    }


    _showDateTimePicker = () => this.setState({ isDateTimePickerVisible: true });
 
    _hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });
   
    _handleDatePicked = (date) => {
     // console.warn('date'+ date)
      let changedDate = date.getDate() + "-" + (date.getMonth()+1) + "-" + date.getFullYear();
      
      this.setState({date:changedDate});
  
      this.setState({datePickerSelectedDate : date});

      this.setMonth(date.getMonth());
     // console.warn('from date picker')
      this.loadContents();
      
      this.showTotalIncomeForDate();

      this._hideDateTimePicker();
    };

    componentDidMount() {
        console.warn('from component did mount daily')
        this.loadContents();
        this.showTotalIncomeForDate();
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
              //  console.warn('Income date lenght'+ incomeLen);
              //  console.warn(' date'+ this.state.date);
              //  console.warn(' selected Date'+ this.state.selectedDate);
                if(this.state.date !== this.state.selectedDate) {
                    tx.executeSql('SELECT * FROM Income where date = (:date) ',[this.state.selectedDate],(tx,resul) => {
                        let prevIncomeLen = resul.rows.length;
                      //  console.warn('previous income length'+prevIncomeLen)
                        if(prevIncomeLen > 0) {
                            for (let i = 0; i < resul.rows.length; ++i) {
                      //      console.warn('prev item:', resul.rows.item(i).incomeAmount);
                        //    console.warn('totalIncomeAmountForSelectedDate'+ totalIncomeAmountForSelectedDate)
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
                   // console.warn('item:', results.rows.item(i).incomeAmount);
                    //console.warn('totalIncomeAmountForDate'+ totalIncomeAmountForDate)
                    //console.warn('totalIncomeAmountForDate'+ totalIncomeAmountForDate)
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
            tx.executeSql('SELECT * FROM Income where month = (:month) ',[this.state.month],(tx,results) => {
                let incomeLen = results.rows.length;
                //console.warn('Income month lenght'+ incomeLen);
                //console.warn(' month'+ this.state.month);
                //console.warn(' selected Month'+ this.state.selectedMonth);
                if(this.state.month !== this.state.selectedMonth) {
                    tx.executeSql('SELECT * FROM Income where month = (:month) ',[this.state.selectedMonth],(tx,resul) => {
                        let prevIncomeLen = resul.rows.length;
                      //  console.warn('previous income length'+prevIncomeLen)
                        if(prevIncomeLen > 0) {
                            for (let i = 0; i < resul.rows.length; ++i) {
                        //    console.warn('prev item:', resul.rows.item(i).incomeAmount);
                        //    console.warn('totalIncomeAmountForSelectedMonth'+ totalIncomeAmountForSelectedMonth)
                            totalIncomeAmountForSelectedMonth = parseInt(resul.rows.item(i).incomeAmount) + parseInt(totalIncomeAmountForSelectedMonth); 
                           }
                           tx.executeSql('SELECT * FROM TotalIncomeForMonth where month = (:month) ',[this.state.selectedMonth],(tx,results) => {
                            let len = results.rows.length;
                              if(len === 1) {   
                                tx.executeSql('UPDATE TotalIncomeForMonth SET totalAmount = (:totalAmount) where month = (:month)',[totalIncomeAmountForSelectedMonth,this.state.selectedMonth]);     
                                this.setState({totalIncomeAmountForSelectedMonth:totalIncomeAmountForSelectedMonth});
                              }
                            });   
                        } else if(prevIncomeLen === 0) {
                            tx.executeSql('DELETE FROM TotalIncomeForMonth WHERE month = (:month)',[this.state.selectedMonth]);        
                        }
                }); 
                }

                if(incomeLen > 0) {
                    for (let i = 0; i < results.rows.length; ++i) {
                   // console.warn('item:', results.rows.item(i).incomeAmount);
                   // console.warn('totalIncomeAmountForMonth'+ totalIncomeAmountForMonth)
                    totalIncomeAmountForMonth = parseInt(results.rows.item(i).incomeAmount) + parseInt(totalIncomeAmountForMonth);
            
                   }
                   tx.executeSql('SELECT * FROM TotalIncomeForMonth where month = (:month) ',[this.state.month],(tx,results) => {
                    let len = results.rows.length;
                      if(len === 1) {   
                        tx.executeSql('UPDATE TotalIncomeForMonth SET totalAmount = (:totalAmount) where month = (:month)',[totalIncomeAmountForMonth,this.state.month]);     
                        this.setState({totalIncomeAmountForMonth:totalIncomeAmountForMonth});
                      }else if(len === 0) {
                        tx.executeSql('INSERT INTO TotalIncomeForMonth (totalAmount,month) Values (:totalAmount,:month)',[totalIncomeAmountForMonth,this.state.month]);         
                        this.setState({totalIncomeAmountForMonth:totalIncomeAmountForMonth});                          
                      }
                      this.clearValues();
                    });   
            }
        });
      });         
    }


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
    
    handleChanges = () => {
        
        //this.setState({selectedUserId : incomeId});
        //console.warn('show')
        this.showOptionMenu();
/*
        if(this.state.isEditingMenu) {
            this.hideEditingMenu();
        }else {
            console.warn('show')
            this.showEditingMenu();
        }
*/
    }

    showOptionMenu() {
        this.setState({isOptionMenu: true})
     }
 
     hideOptionMenu() {
        // console.warn('hide option menu');
        this.setState({isOptionMenu: false})
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
        this.clearValues();
     }

    handleEdit = () => {
        //console.warn('edit'+ userId);
        // this.hideOptionMenu(); 
        
        //console.warn('income selected user id'+this.state.selectedUserId)
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
        console.warn('de'+description)
        console.warn('amount'+amount)
        if ((description==null || description=="") || (amount==null || amount==""))
        {
            alert("Please Fill All Required Field");
            return false;
        }else {
          console.warn('valid')
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
            //console.warn('date '+ this.state.date);
            //console.warn('selected user id'+ this.state.selectedUserId)

            tx.executeSql('UPDATE Income SET date = (:date),month = (:month), description = (:description),incomeAmount = (:incomeAmount) where user_id = (:user_id)',[this.state.date,this.state.month,this.state.description,this.state.amount,this.state.selectedUserId]);
        
            this.calculateTotalIncomeInDB();
            //console.warn('from handlesave')
            this.loadContents();
            this.hideEditingMenu();
    
        });          
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
            this.calculateTotalIncomeInDBAfterDeleting();
            this.setState({selectedUserId: ''});
        });
     

    }


    calculateTotalIncomeInDBAfterDeleting = () => {
        this.calculateTotalIncomeForDateAfterDeleting();
        this.calculateTotalIncomeForMonthAfterDeleting();
        
      }

      calculateTotalIncomeForMonthAfterDeleting = () => {
        db.transaction((tx) => {
            
            let totalIncomeAmountForMonth = 0;
            tx.executeSql('SELECT * FROM Income where month = (:month) ',[this.state.month],(tx,results) => {
                let len = results.rows.length;
            //    console.warn('length month'+ len)
            //    console.warn('month'+ this.state.month)
                if(len > 0) {
                    for (let i = 0; i < results.rows.length; ++i) {
            //        console.warn('item:', results.rows.item(i).incomeAmount);
            //        console.warn('totalIncomeAmountForMonth'+ totalIncomeAmountForMonth)
                    totalIncomeAmountForMonth = parseInt(results.rows.item(i).incomeAmount) + parseInt(totalIncomeAmountForMonth);
            
                   }
                    tx.executeSql('UPDATE TotalIncomeForMonth SET totalAmount = (:totalAmount) where month = (:month)',[totalIncomeAmountForMonth,this.state.month]);     
                    this.setState({totalIncomeAmountForMonth:totalIncomeAmountForMonth});   
                }else if(len === 0) {
                    tx.executeSql('DELETE FROM TotalIncomeForMonth WHERE month = (:month)',[this.state.month]);
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
              //  console.warn('length date'+ len)
                if(len > 0) {
                    for (let i = 0; i < results.rows.length; ++i) {
              //      console.warn('item:', results.rows.item(i).incomeAmount);
              //      console.warn('totalIncomeAmountForDate', totalIncomeAmountForDate);
                    totalIncomeAmountForDate = parseInt(results.rows.item(i).incomeAmount) + parseInt(totalIncomeAmountForDate);
            
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
    
      showTotalIncomeForDate = () => {
        let totalIncomeAmountForDate = 0;
       
        //console.warn('showtotal')
        db.transaction((tx) => {
          // console.warn('this state date'+ this.state.date)
            tx.executeSql('SELECT * FROM TotalIncomeForDate where date = (:date) ',[this.state.date],(tx,results) => {
              let len = results.rows.length;
             
            //  console.warn('total Income length'+len)
            //  console.warn('lendth indied')
              if(len > 0) {
            //    console.warn('totalIncomeAmountForDate'+results.rows.item(0).totalAmount)
                totalIncomeAmountForDate = results.rows.item(0).totalAmount;
            //   console.warn('totalIncomeAmountForDate'+totalIncomeAmountForDate)
                this.setState({'totalIncomeAmountForDate': totalIncomeAmountForDate});
              }else if( len === 0) {
                this.setState({'totalIncomeAmountForDate': totalIncomeAmountForDate});
              }
            });    
          });
      }

    render() {
        return (
            <ScrollView style={styles.wrapper} >
 
            <View style={{flexDirection:'row'}}>
                <View style={{  width:210,justifyContent:'center' ,marginVertical:20,marginHorizontal:10}}>
                <Input editable={false} selectTextOnFocus={false} inputStyle={{fontSize:15,color:this.state.themeThirdColor,fontWeight:'bold'}} inputContainerStyle={{paddingLeft:2,borderWidth:this.state.dateBorderWidth,borderColor:this.state.dateBorderColor,borderRadius: 4,backgroundColor:'white',elevation:15}} blurOnSubmit={false} onSubmitEditing={() => { this.textInput2.focus(); }} underlineColorAndroid='transparent' ref={input => { this.textInput1 = input }}  placeholderTextColor='blue' onChangeText={(text) => this.setState({ date : text})}  value={this.state.date} />
                </View>
                <View style={{  width:60,justifyContent:'center' }}>
                <FontAwesome style={{fontSize: 25,textAlign:'center',color:this.state.themeThirdColor,elevation:15}} name='calendar' onPress={this._showDateTimePicker}  />
                <DateTimePicker
                isVisible={this.state.isDateTimePickerVisible}
                onConfirm={this._handleDatePicked}
                onCancel={this._hideDateTimePicker}
                date={this.state.datePickerSelectedDate}
                />
                </View>
            </View>
            <View style={{flexDirection:'row',justifyContent:"flex-end",paddingBottom:10,paddingRight:20}}>
            <View >
            <Text style={{fontSize: 20,textAlign:'center',fontWeight:'bold',color:this.state.themeThirdColor}} >Total -</Text>
            </View>
            <View >
            <Text style={{fontSize: 20,textAlign:'center',fontWeight:'bold',color:'red'}} >{this.state.totalIncomeAmountForDate}</Text>
            </View>
            </View>

        <View style={{ flex: 1,paddingLeft:20,paddingRight:20}}>
        <LinearGradient  colors={[this.state.themefirstColor, this.state.themeSecondColor, this.state.themeThirdColor]}  >
        <View style={{ borderRadius: 4,borderWidth: 0.5,borderColor: 'white'}}>  
            <View style={{  flexDirection: 'row',height:40 }}>
                <View style={{ borderRightWidth:1,borderRightColor:'white',paddingTop: 10,paddingLeft: 22,paddingRight: 23 }}>
                    <Text style={{fontWeight:'bold',fontSize:15,color:'white'}}>Income Description</Text>
                </View>
                <View style={{ paddingLeft : 40, paddingTop: 10 }}>
                    <Text style={{fontWeight:'bold',fontSize:15,color:'white'}}>Amount</Text>
                </View>
            </View>
        </View>
        </LinearGradient>

        { ( this.state.incomeArray.length !== 0) ? 
        <FlatList
            data={this.state.incomeArray} 
            
            renderItem={({item}) =>
            ( 

            <TouchableHighlight onPress={ () => {
                   this.setState({selectedUserId : item.userId})
                  //  console.warn('selected id'+ item.userId);
                    this.setState({selectedDate : item.date})
                   // console.warn('selected month'+item.month)
                    this.setState({selectedMonth : item.month})
                   // console.warn('selectedMonth'+this.state.selectedMonth)
                    this.handleChanges();
                   } 
            }>
            <View style={{ flex:1,borderRadius: 4,borderWidth: 0.5,borderColor: 'teal'}}>  

            <View style={{  flexDirection: 'row',backgroundColor:'white'}}>
                <View style={{   borderRightWidth:1,borderRightColor:'teal',paddingTop: 10,paddingLeft: 20,paddingRight: 20,paddingBottom:10, width:179}}>
                <Text style={{fontWeight:'bold',color:'teal'}}>{item.description}</Text>
                </View>
                <View style={{ paddingLeft : 40, paddingTop: 10,paddingBottom:10}}>
                <Text style={{fontWeight:'bold',fontSize:15,color:'teal'}}>{item.amount}</Text>
                </View>
                </View>
            </View>
            </TouchableHighlight>
            )
            }
            extraData = {this.state}
            keyExtractor={item => item.userId.toString()}
        
            />
            :
                <View style={{ borderRadius: 4,borderWidth: 0.5,borderColor: 'white'}}>  
                        
                     <View style={{ borderRightWidth:1,borderRightColor:'white',paddingTop: 10,paddingBottom:10,paddingLeft: 140,paddingRight: 100 }}>
                        <Text style={{fontWeight:'bold',fontSize:15,color:'white'}}>No Data</Text>
                    </View>
                </View>
            }

            </View>

            {this.state.isOptionMenu &&                    
                <LinearGradient  colors={[this.state.themefirstColor, this.state.themefirstColor, this.state.themefirstColor]} style={styles.optionOverlay}>
                <TouchableHighlight onPress={()=> { 
                    //console.warn('edit')
                    this.handleEdit();
                }
                } style={{backgroundColor:'transparent',borderBottomColor:this.state.themeThirdColor,borderBottomWidth:2}} >
                <Text style={{borderRadius:20,backgroundColor:'transparent',color:this.state.themeThirdColor,fontSize:17,fontWeight:'bold',paddingLeft:3,paddingTop:5,alignContent:'center',justifyContent:'center'}}>Edit</Text>
                </TouchableHighlight>
                 
                <TouchableHighlight onPress={()=> { 
                   // console.warn('delete')
                    this.handleDelete();
                }} style={{backgroundColor:'transparent'}} >
                <Text style={{borderRadius:20,backgroundColor:'transparent',color:this.state.themeThirdColor,fontSize:17,fontWeight:'bold',paddingLeft:3,paddingTop:5,alignContent:'center',justifyContent:'center'}}>Delete</Text>
                </TouchableHighlight>
                
                </LinearGradient>
            }
            {this.state.isEditingMenu &&
                <LinearGradient  colors={[this.state.themefirstColor, this.state.themefirstColor, this.state.themefirstColor]} style={styles.editingOverlay}>
                 <KeyboardAvoidingView behavior="padding">          
                 <View style={{borderBottomColor:this.state.themeThirdColor,borderBottomWidth:2,backgroundColor:this.state.themefirstColor}}>
                 <Text style={{color:this.state.themeThirdColor,fontSize:25,fontWeight:'bold'}}>Edit Data</Text>
                 </View>
                 <View style={{flexDirection:'row'}}>
                 <View style={{  width:210,justifyContent:'center' ,marginVertical:20,marginHorizontal:10}}>
                 <Input editable={false} selectTextOnFocus={false} inputStyle={{fontSize:15,color:this.state.themeThirdColor,fontWeight:'bold'}} inputContainerStyle={{paddingLeft:2,borderWidth:this.state.dateBorderWidth,borderColor:this.state.dateBorderColor,borderRadius: 4,backgroundColor:'white',elevation:15}} blurOnSubmit={false} onSubmitEditing={() => { this.textInput2.focus(); }} underlineColorAndroid='transparent' ref={input => { this.textInput1 = input }}  placeholderTextColor='blue' onChangeText={(text) => this.setState({ date : text})}  value={this.state.date} />
                 </View>
                 <View style={{  width:60,justifyContent:'center' }}>
                  <FontAwesome style={{fontSize: 25,textAlign:'center',color:this.state.themeThirdColor,elevation:15}} name='calendar' onPress={this._showDateTimePicker}  />
                  <DateTimePicker
                  isVisible={this.state.isDateTimePickerVisible}
                  onConfirm={this._handleDatePicked}
                  onCancel={this._hideDateTimePicker}
                  date={this.state.datePickerSelectedDate}
                  />
                  </View>
                </View>

                <View style={{  width:210,justifyContent:'center' ,marginVertical:20,marginHorizontal:10 }}>
                <Input  onBlur={ () => this.onDescriptionBlur() } selectTextOnFocus onFocus={ () => this.onDescriptionFocus() } inputStyle={{fontSize:15,color:this.state.themeThirdColor,fontWeight:'bold'}} inputContainerStyle={{paddingLeft:2,borderWidth:this.state.descriptionBorderWidth,borderColor:this.state.descriptionBorderColor,borderRadius: 4,backgroundColor:'white',elevation:15}} onSubmitEditing={() => { this.textInput3.focus(); }}  underlineColorAndroid='transparent' ref={input => { this.textInput2 = input }}  placeholderTextColor={this.state.themeThirdColor} blurOnSubmit={false} onChangeText={(text) => this.setState({ description : text})} placeholder='Enter text' value={this.state.description} />
                </View>
                <View style={{  width:100 ,justifyContent:'center',paddingLeft:10}}>
                <Input onBlur={ () => this.onAmountBlur() } selectTextOnFocus onFocus={ () => this.onAmountFocus() }  inputStyle={{fontSize:15,color:this.state.themeThirdColor,fontWeight:'bold'}} inputContainerStyle={{paddingLeft:2,borderWidth:this.state.amountBorderWidth,borderColor:this.state.amountBorderColor ,borderRadius: 4,backgroundColor:'white',elevation:15}} underlineColorAndroid='transparent' ref={input => { this.textInput3 = input }} placeholderTextColor={this.state.themeThirdColor} onChangeText={(text) => this.setState({ amount : text})} placeholder='Amount' value={this.state.amount} keyboardType='numeric'/>
                </View>
                            
             
          
                <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center',paddingTop:15}}>
                <View >
                <LinearGradient  colors={[this.state.themefirstColor, this.state.themeSecondColor, this.state.themeThirdColor]} >
                <TouchableHighlight  onPress={()=> { 
                    //console.warn('save')
                    this.handleSave();
                }} style={{backgroundColor:'transparent',height:35,width:100}} >
                <Text style={{borderRadius:20,backgroundColor:'transparent',color:'white',fontSize:16,fontWeight:'bold',paddingLeft:3,paddingTop:5,alignContent:'center',justifyContent:'center'}}>Save</Text>
                </TouchableHighlight>
                </LinearGradient>
                </View>
                <View style={{paddingLeft:20}}>
                <LinearGradient  colors={[this.state.themefirstColor, this.state.themeSecondColor, this.state.themeThirdColor]} >
                <TouchableHighlight onPress={()=> { 
                   // console.warn('close')
                    this.hideEditingMenu();
                }} style={{backgroundColor:'transparent',height:35,width:100}} >
                <Text style={{borderRadius:20,backgroundColor:'transparent',color:'white',fontSize:16,fontWeight:'bold',paddingLeft:3,paddingTop:5,alignContent:'center',justifyContent:'center'}}>Close</Text>
                </TouchableHighlight>
                </LinearGradient>
                </View>
                </View>
        
                </KeyboardAvoidingView>
                </LinearGradient>
                }    
                </ScrollView>
         
        );
    }
}

const styles = StyleSheet.create({
    wrapper: {
      //...StyleSheet.absoluteFillObject,
      flex: 1,
      backgroundColor: 'lightcyan',
    },
    optionOverlay: {
        position: 'absolute',
        left: 115,
        right: 100,
        top: 150,
        bottom: 180,
        opacity: 8,
        elevation:15,
        backgroundColor: 'white',
        borderColor: 'teal',
        borderWidth:6,
        borderRadius:5
        //justifyContent: 'center',
        //alignItems: 'center'
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
  