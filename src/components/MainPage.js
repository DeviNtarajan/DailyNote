import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableHighlight, 
  TouchableOpacity, 
  Animated,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Dimensions
} from 'react-native';
import { PieChart } from 'react-native-svg-charts'
import Svg,{ Text as SVGText,G,Line,Circle,Rect } from 'react-native-svg' 
import { Header ,Input,Button,Card} from 'react-native-elements';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Icon from "react-native-vector-icons/MaterialIcons";
//import Icon from 'react-native-vector-icons/Ionicons';
import { MenuProvider } from 'react-native-popup-menu';
import {
  MenuContext,
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  renderers
} from 'react-native-popup-menu';
import DateTimePicker from 'react-native-modal-datetime-picker';
import ExpensePage from './ExpensePage';
import IncomePage from './IncomePage';
import NavigationActions from 'react-navigation';
import { createMaterialTopTabNavigator,createStackNavigator } from 'react-navigation';
//import MainPage from './MainPage';
var SQLite = require('react-native-sqlite-storage')
var db = SQLite.openDatabase({name: 'nativeappdb.db', createFromLocation: '~nativeappdb.db'})

db.transaction((tx) => {
  //tx.executeSql('DROP TABLE Expenses ');
  //tx.executeSql('DROP TABLE TotalExpensesForDate ');
  //tx.executeSql('DROP TABLE TotalExpensesForMonth ');
  //tx.executeSql('DROP TABLE Income ');
  //tx.executeSql('DROP TABLE TotalIncomeForDate ');
  //tx.executeSql('DROP TABLE TotalIncomeForMonth ');
  tx.executeSql('CREATE TABLE IF NOT EXISTS "Expenses"(user_id INTEGER PRIMARY KEY NOT NULL, description VARCHAR(30), expenseAmount Int, date VARCHAR(30),month VARCHAR(30),year VARCHAR(30))', []);
  tx.executeSql('CREATE TABLE IF NOT EXISTS "TotalExpensesForDate"(user_id INTEGER PRIMARY KEY NOT NULL,totalAmount Int,date VARCHAR(30))', []);
  tx.executeSql('CREATE TABLE IF NOT EXISTS "TotalExpensesForMonth"(user_id INTEGER PRIMARY KEY NOT NULL,totalAmount Int,month VARCHAR(30),year VARCHAR(30))', []);
  tx.executeSql('CREATE TABLE IF NOT EXISTS "Income"(user_id INTEGER PRIMARY KEY NOT NULL, description VARCHAR(30), incomeAmount Int, date VARCHAR(30),month VARCHAR(30),year VARCHAR(30))', []);
  tx.executeSql('CREATE TABLE IF NOT EXISTS "TotalIncomeForDate"(user_id INTEGER PRIMARY KEY NOT NULL,totalAmount Int,date VARCHAR(30))', []);
  tx.executeSql('CREATE TABLE IF NOT EXISTS "TotalIncomeForMonth"(user_id INTEGER PRIMARY KEY NOT NULL,totalAmount Int,month VARCHAR(30),year VARCHAR(30))', []);
});

// Percentages work in plain react-native but aren't supported in Expo yet, workaround with this or onLayout
const { width, height } = Dimensions.get('window');


export default class MainPage extends React.PureComponent {
 
  constructor(props) {
    super(props)
   // console.warn('hello')
    const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
    ];

    let d = new Date();
   // console.warn('react navigation'+this.props.navigation)
    this.state = {
      incomeChartData : [],
      expenseChartData : [],
      incomeColors: [],
      expenseColors: [],
      description : "",
      amount : "",
      totalIncomeAmountForDate : 0,
      totalIncomeAmountForMonth : 0,
      totalExpenseAmountForDate : 0,
      totalExpenseAmountForMonth : 0,
      incomeButtonTitle:'Add Income',
      expenseButtonTitle:'Add Expense',
      date: d.getDate()+'-'+((d.getMonth())+1)+'-'+d.getFullYear(),
      datePickerSelectedDate : d,
      month:monthNames[d.getMonth()],
      year: d.getFullYear().toString(),
      isDateTimePickerVisible: false,
      navigation: this.props.navigation,
      dateBorderColor: 'teal',
      dateBorderWidth: 0.5,
      descriptionBorderColor: 'teal',
      descriptionBorderWidth: 0.5,
      amountBorderColor: 'teal',
      amountBorderWidth: 0.5,
      themefirstColor: 'lightcyan',
      themeSecondColor: 'darkcyan',
      themeThirdColor: 'teal',
      selectedMonthKey: d.getMonth(),
    };
  }

  willFocusSubscription = this.props.navigation.addListener(
    'willFocus',
       payload => {
        this.loadContents();
        this.showTotalIncomeAndExpenseForMonth();
    }
  );
  
  _showDateTimePicker = () => this.setState({ isDateTimePickerVisible: true });
 
  _hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });
 
  _handleDatePicked = (date) => {
  //console.warn('date'+ date)
    let changedDate = date.getDate() + "-" + (date.getMonth()+1) + "-" + date.getFullYear();
    
    this.setMonth(date.getMonth());
    
    this.setState({date:changedDate});

    this.setState({year:date.getFullYear().toString()})

    this.setState({datePickerSelectedDate : date});
    
    this._hideDateTimePicker();
  };

  componentWillReceiveProps = () => {
   // console.warn('receive props daily::');
    this.loadContents();
    this.showTotalIncomeAndExpenseForMonth();
  }

  getInitialState = () => {
  //  console.warn('getInitialState')
  }

  
  setMonth = (monthKey) => {
    //console.warn('set month')
    this.setMonthName(monthKey);
    this.loadContents();
    this.showTotalIncomeAndExpenseForMonth();
  }
  
  setMonthName = (monthKey) => {
    const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
    ];
    this.setState({month: monthNames[monthKey]});
  }

  handleExpense = () => {

      let validation = this.validateFields();
      //console.warn('valide'+validation)
      if(!validation) {
        return false;
      }
      let year = this.state.year;
      let month = this.state.month;
      let date = this.state.date;
      let description = this.state.description;
      let expenseAmount = this.state.amount;
      //console.warn("editedValue"+year);
      //console.warn("editedValue"+month);

      this.addDescripAndSpentAmountInDB(year,month,date,description,expenseAmount);

      this.calculateTotalExpenseInDB();
 
  };

  addDescripAndSpentAmountInDB = (year, month, date, descrip, expense) => {

    db.transaction((tx) => {
     // console.warn('expense '+ year);
      tx.executeSql('INSERT INTO Expenses (year,month,date,description,expenseAmount) VALUES (:year,:month,:date,:description,:expenseAmount)', [year,month,date,descrip,expense]);
     // console.warn('inserted')
    });
  }

  calculateTotalExpenseInDB = () => {
    // console.warn('incomeAmount',incomeAmount)
    this.calculateTotalExpenseForDate();
    this.calculateTotalExpenseForMonth();
  }

  calculateTotalExpenseForDate = () => {
    db.transaction((tx) => {
        let expenseAmount = this.state.amount;
        let totalExpenseAmountForDate = 0;
        tx.executeSql('SELECT * FROM Expenses where date = (:date) ',[this.state.date],(tx,results) => {
            let len = results.rows.length;
         // console.warn("expense length"+len)
            if(len === 1) {
            totalExpenseAmountForDate = expenseAmount;
         //   console.warn("expense length inside 1"+len)
            tx.executeSql('INSERT INTO TotalExpensesForDate (totalAmount,date) Values (:totalAmount,:date)',[totalExpenseAmountForDate,this.state.date]);      
            this.setState({'totalExpenseAmountForDate':totalExpenseAmountForDate});
            }else if( len > 1) {
         //     console.warn("expense length greater 1"+len)
            tx.executeSql('SELECT totalAmount FROM TotalExpensesForDate  where date = (:date)  ',[this.state.date],(tx,results) => {
    //           console.warn("already:"+results.rows.item(0));
                for (let i = 0; i < results.rows.length; ++i) {
        //        console.warn('item:', results.rows.item(i));
                totalExpenseAmountForDate = parseInt(results.rows.item(i).totalAmount) + parseInt(expenseAmount);
        //        console.warn('totalAmount:', totalAmount);
                tx.executeSql('UPDATE TotalExpensesForDate SET totalAmount = (:totalAmount) where date = (:date)',[totalExpenseAmountForDate,this.state.date]);

        //       console.warn('item:', totalIncomeAmount);
                }     
                this.setState({totalExpenseAmountForDate:totalExpenseAmountForDate});   
            });
            } else {
            this.setState({totalExpenseAmountForDate:totalExpenseAmountForDate});
            }        
    
        }); 
        
        });
    }

  calculateTotalExpenseForMonth = () => {
    db.transaction((tx) => {
        let expenseAmount = this.state.amount;
        let totalExpenseAmountForMonth = 0;
        tx.executeSql('SELECT * FROM Expenses where month = (:month) and year = (:year) ',[this.state.month,this.state.year],(tx,results) => {
            let len = results.rows.length;
        //  console.warn("income length"+len)
            if(len === 1) {
            totalExpenseAmountForMonth = expenseAmount;
            tx.executeSql('INSERT INTO TotalExpensesForMonth (totalAmount,month,year) Values (:totalAmount,:month,:year)',[totalExpenseAmountForMonth,this.state.month,this.state.year]);      
            this.setState({'totalExpenseAmountForMonth':totalExpenseAmountForMonth});
            }else if( len > 1) {
            tx.executeSql('SELECT totalAmount FROM TotalExpensesForMonth  where month = (:month) and year = (:year) ',[this.state.month,this.state.year],(tx,results) => {
    //           console.warn("already:"+results.rows.item(0));
                for (let i = 0; i < results.rows.length; ++i) {
        //        console.warn('item:', results.rows.item(i));
                totalExpenseAmountForMonth = parseInt(results.rows.item(i).totalAmount) + parseInt(expenseAmount);
        //        console.warn('totalAmount:', totalAmount);
                tx.executeSql('UPDATE TotalExpensesForMonth SET totalAmount = (:totalAmount) where month = (:month) and year = (:year)',[totalExpenseAmountForMonth,this.state.month,this.state.year]);

        //       console.warn('item:', totalIncomeAmount);
                }     
                this.setState({totalExpenseAmountForMonth:totalExpenseAmountForMonth});   
            });
            } else {
            this.setState({totalExpenseAmountForMonth:totalExpenseAmountForMonth});
            }        
            this.clearTextInputValues();
            this.loadContents();
        }); 
        
        });
  }


    validateFields = () =>
    {
        var description=this.state.description;
        var amount=this.state.amount;
      //  console.warn('de'+description)
      //  console.warn('amount'+amount)
        if ((description==null || description=="") || (amount==null || amount==""))
        {
            alert("Please Fill All Required Field");
            return false;
        }else {
        //  console.warn('valid')
          return true;
        }
    }

  handleIncome = () => {

    let validation = this.validateFields();
    if(!validation) {
      return false;
    }
    let year = this.state.year;
    let month = this.state.month;
    let date = this.state.date;
    let description = this.state.description;
    let incomeAmount = this.state.amount;


    this.addIncomeInDB(year,month,date,description,incomeAmount);

    this.calculateTotalIncomeInDB();
    
  }

  addIncomeInDB = (year,month,date,description,incomeAmount) => {
   // console.warn("income inside"+description)
    db.transaction((tx) => {
      tx.executeSql('INSERT INTO Income (year,month,date,description,incomeAmount) VALUES (:year,:month,:date,:description,:incomeAmount)', [year,month,date,description,incomeAmount]); 
    });
  }

  calculateTotalIncomeInDB = () => {
    // console.warn('incomeAmount',incomeAmount)
    this.calculateTotalIncomeForDate();
    this.calculateTotalIncomeForMonth();
  }

  calculateTotalIncomeForDate = () => {
    db.transaction((tx) => {
        let incomeAmount = this.state.amount;
        let totalIncomeAmountForDate = 0;
        tx.executeSql('SELECT * FROM Income where date = (:date) ',[this.state.date],(tx,results) => {
            let len = results.rows.length;
            if(len === 1) {
            totalIncomeAmountForDate = incomeAmount;
            tx.executeSql('INSERT INTO TotalIncomeForDate (totalAmount,date) Values (:totalAmount,:date)',[totalIncomeAmountForDate,this.state.date]);      
            this.setState({'totalIncomeAmountForDate':totalIncomeAmountForDate});
            }else if( len > 1) {
            tx.executeSql('SELECT totalAmount FROM TotalIncomeForDate  where date = (:date)  ',[this.state.date],(tx,results) => {
                for (let i = 0; i < results.rows.length; ++i) {
                totalIncomeAmountForDate = parseInt(results.rows.item(i).totalAmount) + parseInt(incomeAmount);
                tx.executeSql('UPDATE TotalIncomeForDate SET totalAmount = (:totalAmount) where date = (:date)',[totalIncomeAmountForDate,this.state.date]);
                }     
                this.setState({totalIncomeAmountForDate:totalIncomeAmountForDate});   
            });
            } else {
            this.setState({totalIncomeAmountForDate:totalIncomeAmountForDate});
            }        
    
        }); 
        
        });
    }

  calculateTotalIncomeForMonth = () => {
    db.transaction((tx) => {
        let incomeAmount = this.state.amount;
        let totalIncomeAmountForMonth = 0;
        tx.executeSql('SELECT * FROM Income where month = (:month) and year = (:year) ',[this.state.month,this.state.year],(tx,results) => {
            let len = results.rows.length;
            if(len === 1) {
            totalIncomeAmountForMonth = incomeAmount;
            tx.executeSql('INSERT INTO TotalIncomeForMonth (totalAmount,month,year) Values (:totalAmount,:month,:year)',[totalIncomeAmountForMonth,this.state.month,this.state.year]);      
            this.setState({'totalIncomeAmountForMonth':totalIncomeAmountForMonth});
            }else if( len > 1) {
            tx.executeSql('SELECT totalAmount FROM TotalIncomeForMonth  where month = (:month) and year = (:year) ',[this.state.month,this.state.year],(tx,results) => {
                for (let i = 0; i < results.rows.length; ++i) {
                totalIncomeAmountForMonth = parseInt(results.rows.item(i).totalAmount) + parseInt(incomeAmount);
                tx.executeSql('UPDATE TotalIncomeForMonth SET totalAmount = (:totalAmount) where month = (:month) and year = (:year)',[totalIncomeAmountForMonth,this.state.month,this.state.year]);
                }     
                this.setState({totalIncomeAmountForMonth:totalIncomeAmountForMonth});   
            });
            } else {
            this.setState({totalIncomeAmountForMonth:totalIncomeAmountForMonth});
            }        
            this.clearTextInputValues();
            this.loadContents();
        }); 
        
        });
  }

  clearTextInputValues = () => {
    this.textInput2.clear();
    this.textInput3.clear();
    this.setState({description: ''});
    this.setState({amount : ''});
  }

  loadContents = () => {
    let incomeChartData = [];
    let expenseChartData = [];
    let incomeColors = [];
    let expenseColors = [];
    const randomColor = () => ('#' + (Math.random() * 0xFFFFFF << 0).toString(16) + '000000').slice(0, 7)
    let year = '';
    let month = '';
    db.transaction((tx) => {
      month = this.state.month;
      year = this.state.year;
       tx.executeSql('SELECT * FROM Expenses where month = (:month) AND year = (:year) ',[month,year],(tx,results) => {
           for (let i = 0; i < results.rows.length; ++i) {
             let color = randomColor();
             expenseColors.push(color);
             expenseChartData.push( {key : results.rows.item(i).user_id, date:  results.rows.item(i).date,description: results.rows.item(i).description, amount :results.rows.item(i).expenseAmount,   svg: { fill: color }, });
           }      
  -         this.setState({expenseColors:expenseColors});
           this.setState({expenseChartData: expenseChartData});
           
         });

         tx.executeSql('SELECT * FROM Income where month = (:month) and year = (:year) ',[this.state.month,this.state.year],(tx,results) => {
               for (let i = 0; i < results.rows.length; ++i) {
                 let color = randomColor();
                 incomeColors.push(color);    
                 incomeChartData.push( {key : results.rows.item(i).user_id,  date:  results.rows.item(i).date,description: results.rows.item(i).description, amount :results.rows.item(i).incomeAmount,   svg: { fill: color }, });
               }      
              this.setState({incomeColors:incomeColors});
              this.setState({incomeChartData: incomeChartData}); 
             });
    });
}

  componentDidMount() {
    this.loadContents();
    this.showTotalIncomeAndExpenseForMonth();
  }

  showTotalIncomeAndExpenseForMonth = () => {
    let totalExpenseAmountForMonth = 0;
    let totalIncomeAmountForMonth = 0;

    db.transaction((tx) => {
        tx.executeSql('SELECT * FROM TotalExpensesForMonth where month = (:month) and year = (:year) ',[this.state.month,this.state.year],(tx,results) => {
          let len = results.rows.length;
          if(len > 0) {
            totalExpenseAmountForMonth = results.rows.item(0).totalAmount;
            this.setState({'totalExpenseAmountForMonth': totalExpenseAmountForMonth});
          }else if( len === 0) {
            this.setState({'totalExpenseAmountForMonth': totalExpenseAmountForMonth});
          }
        });

        tx.executeSql('SELECT * FROM TotalIncomeForMonth where month = (:month) and year = (:year) ',[this.state.month,this.state.year],(tx,results) => {
          let len = results.rows.length;
          //console.warn('total income length'+len)
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
    this.textInput3.focus();
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


  render() {
    const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
    ];
  
    const d = new Date();

    const incomeData = this.state.incomeChartData;
    const expenseData = this.state.expenseChartData;
    

    return (
      <ScrollView scrollEnabled={true} style={styles.wrapper}>
      
      <KeyboardAvoidingView
      behavior="padding" 
      enabled>
      <Card containerStyle={{padding: 0,paddingTop:0}} >
      <View>
      <View style={{flexDirection:'row'}}>
      <Menu style={{borderColor:this.state.themefirstColor,borderBottomColor:this.state.themefirstColor,alignItems:'center',paddingTop:10,borderRadius:40}}   >
      
      <MenuTrigger customStyles={{borderBottomColor:this.state.themeThirdColor}}>
      <View style={{flexDirection:'row',justifyContent:'center',alignItems: 'center',backgroundColor:'white',paddingBottom:5,borderBottomColor:this.state.themeThirdColor,width:150}}>
      <Text style={{fontSize: 20,textAlign:'center',color:this.state.themeThirdColor,fontWeight:'bold'}} >{this.state.month}</Text>
      <FontAwesome style={{fontSize: 20,textAlign:'center',color:this.state.themeThirdColor,paddingLeft:10}} name='chevron-down'   />
      </View>      
      </MenuTrigger>
      
      <MenuOptions optionsContainerStyle={{alignItems:'center',marginLeft:70,marginTop:40,width:100,elevation:16}} >
        {
          monthNames.map((item, key) => (
              
              (item === this.state.month  ) ? 
                <MenuOption key={key} onSelect={() => {
                  let year = this.state.year;
                  let date = new Date(year, key, 1, 10, 30, 50, 800);
                  this.setState({selectedMonthKey : key});
                  this.setMonth(key); 
                  this.setState({date : (1+'-'+(key+1)+'-'+year)})
                //  console.warn('changd date'+ date); 
                  this.setState({datePickerSelectedDate:date});
                } } >
                <Text style={{backgroundColor:this.state.themeThirdColor,color:'white',fontWeight:'bold',fontSize:18}}>{item}</Text>
                </MenuOption>
              : 
                <MenuOption key={key} onSelect={() => {
                  let year = this.state.year;
                  let date = new Date(year, key, 1, 10, 30, 50, 800);

                  this.setMonthName(key); 
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
        this.showTotalIncomeAndExpenseForMonth();      
     
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
        this.showTotalIncomeAndExpenseForMonth();          
      } }  />
      </View>      
      </View>
     <View style={{flexDirection:'row',padding:5}}>
     <View style={{  width:210,justifyContent:'center' ,marginHorizontal:10}}>
     <Input leftIcon={  <FontAwesome style={{fontSize: 17,color:this.state.themeThirdColor,fontWeight:'bold',paddingBottom:5}} name='calendar' onPress={this._showDateTimePicker}  /> }
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
    <View style={{flexDirection:'row',padding:5}}>
    <View style={{  width:210,justifyContent:'center' ,marginVertical:10,marginHorizontal:10 }}>
    <Input  onBlur={ () => this.onDescriptionBlur() } selectTextOnFocus onFocus={ () => this.onDescriptionFocus() } inputStyle={{fontSize:15,color:this.state.themeThirdColor,fontWeight:'bold'}} inputContainerStyle={{height:30,paddingLeft:2,borderRadius: 4,backgroundColor:'white',elevation:2}} onSubmitEditing={() => { this.textInput3.focus(); }}  underlineColorAndroid='transparent' ref={input => { this.textInput2 = input }}  placeholderTextColor={this.state.themeThirdColor} blurOnSubmit={false} onChangeText={(text) => this.setState({ description : text})} placeholder='Enter text' value={this.state.description} />
    </View>
    <View style={{  width:100 ,justifyContent:'center'}}>
    <Input onBlur={ () => this.onAmountBlur() } selectTextOnFocus onFocus={ () => this.onAmountFocus() }  inputStyle={{fontSize:15,color:this.state.themeThirdColor,fontWeight:'bold'}} inputContainerStyle={{height:30,paddingLeft:2,borderRadius: 4,backgroundColor:'white',elevation:2}} underlineColorAndroid='transparent' ref={input => { this.textInput3 = input }} placeholderTextColor={this.state.themeThirdColor} onChangeText={(text) => this.setState({ amount : text})} placeholder='Amount' value={this.state.amount} keyboardType='numeric'/>
    </View>
    
    </View>
    
    
    <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center',marginBottom:10}}>
    
    
    <Button
    icon={
      <FontAwesome
        name='minus'
        size={12}
        color='white'
      />
    }
    buttonStyle={{
      width:100,
      height:30,
      backgroundColor:'darkred',
      paddingLeft:5
    }}
    iconLeft
    titleStyle={{ color:'white' }}
    title='Expense'
    onPress={this.handleExpense}/>
    <Button
    icon={
      <FontAwesome
        name='plus'
        size={12}
        color='white'
      />
    }
    buttonStyle={{
      width:100,
      height:30,
      backgroundColor:'darkgreen',
      paddingLeft:5,
      marginLeft:10
    }}
    iconLeft
    titleStyle={{ color:'white' }}
    title='Income'
    onPress={this.handleIncome}/>


    </View>


     </View>
      
     </Card>
     
     <View style={{flexDirection:'row'}}>        
     <Card containerStyle={{padding:0,marginRight:0}}> 
     <View>
       <PieChart
        style={{ height: 120,width:155 }}
        valueAccessor={({ item }) => item.amount}
        data={expenseData}
        spacing={0}
        innerRadius={'40%'}
        outerRadius={'70%'}
        percent={ true }
        labels={ true }
        >   
        <SVGText
        x={0}
        y={1}
        fill={'darkgreen'}
        textAnchor={'middle'}
        alignmentBaseline={'middle'}
        fontSize={12}
        stroke={'black'}
        strokeWidth={0.2}
        >
        Expense
    </SVGText>

        </PieChart>

        <FlatList
        data={this.state.expenseChartData} 
        renderItem={({item}) =>
        ( 
          
          <View style={{flexDirection:'row'}}>
          <Svg height={20} width={20}>
          <Rect
            x="12"
            y="5"
            width='10'
            height='10'
            stroke={item.svg.fill}
            strokeWidth="2"
            fill={item.svg.fill}
          />
          </Svg>
          <View style={{width:80,paddingLeft:5}}>
          <Text style={{}} >{item.description}</Text>
          </View>
          <View style={{width:50}}>
          <Text style={{}} >{item.amount}</Text>
          </View>
          </View>
        )
        }
        extraData = {this.state}
        keyExtractor={item => item.key.toString()} 
        />
      </View>
      </Card>
      <Card containerStyle={{padding:0,marginRight:0}}>
      <View>
        <PieChart
        style={{ height: 120,width:155 }}
        valueAccessor={({ item }) => item.amount}
        data={incomeData}
        spacing={0}
        innerRadius={'40%'}
        outerRadius={'70%'}
        >                 
        <SVGText
        x={0}
        y={1}
        fill={'darkgreen'}
        textAnchor={'middle'}
        alignmentBaseline={'middle'}
        fontSize={12}
        stroke={'black'}
        strokeWidth={0.2}
        >
        Income
        </SVGText>

        </PieChart>
        <FlatList
        data={this.state.incomeChartData} 
        renderItem={({item}) =>
        ( 
          
          <View style={{flexDirection:'row'}}>
          <Svg height={20} width={20}>
          <Rect
            x="12"
            y="5"
            width="10"
            height="10"
            stroke={item.svg.fill}
            strokeWidth="2"
            fill={item.svg.fill}
          />
          </Svg>
          <View style={{width:80,paddingLeft:5}}>
          <Text style={{}} >{item.description}</Text>
          </View>
          <View style={{width:50}}>
          <Text style={{}} >{item.amount}</Text>
          </View>
          </View>
        )
        }
        extraData = {this.state}
        keyExtractor={item => item.key.toString()} 
        />
        </View>
        </Card>
      </View>
      
      </KeyboardAvoidingView>
      </ScrollView>
      );
} 
}

const styles = StyleSheet.create({
  wrapper: {
    //...StyleSheet.absoluteFillObject,
    //flex: 1,
    backgroundColor: 'white',
  }
});

