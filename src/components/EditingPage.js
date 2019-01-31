import React from 'react';
import { View, Text, Button,FlatList,StyleSheet ,KeyboardAvoidingView,ScrollView,TouchableHighlight} from 'react-native';
import { Input} from 'react-native-elements';
import DateTimePicker from 'react-native-modal-datetime-picker';
import Icon from "react-native-vector-icons/FontAwesome";
import LinearGradient from 'react-native-linear-gradient';
import MonthlyIncomePage from './MonthlyIncomePage';

var SQLite = require('react-native-sqlite-storage')
var db = SQLite.openDatabase({name: 'nativeappdb.db', createFromLocation: '~nativeappdb.db'})
        

  
export default class EditingPage extends React.Component {



    constructor(props) {
        super(props);

        //let selectedUserId = this.props.navigation.state.params.selectedUserId;
        this.state = {
            array : [],
            themefirstColor: 'lightcyan',
            themeSecondColor: 'darkcyan',
            themeThirdColor: 'teal',
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
            selectedUserId : '',
        }
    }

    _showDateTimePicker = () => this.setState({ isDateTimePickerVisible: true });
 
    _hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });
   
    _handleDatePicked = (date) => {
     // console.warn('date'+ date)
      let changedDate = date.getDate() + "-" + (date.getMonth()+1) + "-" + date.getFullYear();
      
      this.setState({date:changedDate});
  
      this.setState({datePickerSelectedDate : date});
      
      this._hideDateTimePicker();
    };



    componentDidMount() {
        let incomeArray = [];
        let totalIncomeAmount = '';

       // console.warn('income selected user id'+this.state.selectedUserId)
        db.transaction((tx) => {
         tx.executeSql('SELECT * FROM Income where user_id = (:user_id)',[this.state.selectedUserId],(tx,results) => {
           let len = results.rows.length;
        //   console.warn("length"+len);
           this.setState({'date' : results.rows.item(0).date,'description' : results.rows.item(0).description,'amount' : results.rows.item(0).incomeAmount.toString()})
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
    

     showEditingMenu() {
        //console.warn('show editing menu');
        this.setState({isEditingMenu: true})
     }
 
     hideEditingMenu() {
        this.setState({isEditingMenu: false})
        this.setState({selectedUserId : ''})
        this.setState({description: ''});
        this.setState({amount : ''});    
     }

    handleEdit = (userId) => {
        this.showEditingMenu();
    }

    handleSave = () => {
        let validation = this.validateFields();
        //console.warn('valide'+validation)
        if(!validation) {
          return false;
        }
    
        db.transaction((tx) => {
            tx.executeSql('UPDATE Income SET date = (:date),description = (:description),incomeAmount = (:incomeAmount) where user_id = (:user_id)',[this.state.date,this.state.description,this.state.amount,this.state.selectedUserId]);
          });          
        var incomeArray1 =  this.state.incomeArray.map(income => (income.userId === this.state.selectedUserId)?{...income, description:this.state.description, date:this.state.date, amount:this.state.amount}:income)
        this.setState({incomeArray: incomeArray1})
        
        this.hideEditingMenu();

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

    
    render() {
        return (
            <LinearGradient  colors={[this.state.themefirstColor, this.state.themefirstColor, this.state.themefirstColor]} style={styles.wrapper}>
                           
            <View style={{borderBottomColor:this.state.themeThirdColor,borderBottomWidth:2,backgroundColor:this.state.themefirstColor}}>
            <Text style={{color:this.state.themeThirdColor,fontSize:25,fontWeight:'bold'}}>Edit Data</Text>
            </View>
            <View style={{flexDirection:'row'}}>
            <View style={{  width:210,justifyContent:'center' ,marginVertical:20,marginHorizontal:10}}>
            <Input editable={false} selectTextOnFocus={false} inputStyle={{fontSize:15,color:this.state.themeThirdColor,fontWeight:'bold'}} inputContainerStyle={{paddingLeft:2,borderWidth:this.state.dateBorderWidth,borderColor:this.state.dateBorderColor,borderRadius: 4,backgroundColor:'white',elevation:15}} blurOnSubmit={false} onSubmitEditing={() => { this.textInput2.focus(); }} underlineColorAndroid='transparent' ref={input => { this.textInput1 = input }}  placeholderTextColor='blue' onChangeText={(text) => this.setState({ date : text})}  value={this.state.date} />
            </View>
            <View style={{  width:60,justifyContent:'center' }}>
             <FontAwesome style={{fontSize: 25,textAlign:'center',color:'white',elevation:15}} name='calendar' onPress={this._showDateTimePicker}  />
             <DateTimePicker
             isVisible={this.state.isDateTimePickerVisible}
             onConfirm={this._handleDatePicked}
             onCancel={this._hideDateTimePicker}
             date={this.state.datePickerSelectedDate}
             />
             </View>
           </View>
           <View style={{flexDirection:'row'}}>
           <View style={{  width:210,justifyContent:'center' ,marginVertical:20,marginHorizontal:10 }}>
           <Input  onBlur={ () => this.onDescriptionBlur() } selectTextOnFocus onFocus={ () => this.onDescriptionFocus() } inputStyle={{fontSize:15,color:this.state.themeThirdColor,fontWeight:'bold'}} inputContainerStyle={{paddingLeft:2,borderWidth:this.state.descriptionBorderWidth,borderColor:this.state.descriptionBorderColor,borderRadius: 4,backgroundColor:'white',elevation:15}} onSubmitEditing={() => { this.textInput3.focus(); }}  underlineColorAndroid='transparent' ref={input => { this.textInput2 = input }}  placeholderTextColor={this.state.themeThirdColor} blurOnSubmit={false} onChangeText={(text) => this.setState({ description : text})} placeholder='Enter text' value={this.state.description} />
           </View>
           <View style={{  width:100 ,justifyContent:'center'}}>
           <Input onBlur={ () => this.onAmountBlur() } selectTextOnFocus onFocus={ () => this.onAmountFocus() }  inputStyle={{fontSize:15,color:this.state.themeThirdColor,fontWeight:'bold'}} inputContainerStyle={{paddingLeft:2,borderWidth:this.state.amountBorderWidth,borderColor:this.state.amountBorderColor ,borderRadius: 4,backgroundColor:'white',elevation:15}} underlineColorAndroid='transparent' ref={input => { this.textInput3 = input }} placeholderTextColor={this.state.themeThirdColor} onChangeText={(text) => this.setState({ amount : text})} placeholder='Amount' value={this.state.amount} keyboardType='numeric'/>
           </View>      
           </View>
   
      
            <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center',paddingTop:15}}>
            <View >
            <LinearGradient  colors={[this.state.themefirstColor, this.state.themeSecondColor, this.state.themeThirdColor]} >
            <TouchableHighlight  onPress={()=> { 
            //    console.warn('save')
                this.handleSave();
            }} style={{backgroundColor:'transparent',height:35,width:100}} >
            <Text style={{borderRadius:20,backgroundColor:'transparent',color:'white',fontSize:16,fontWeight:'bold',paddingLeft:3,paddingTop:5,alignContent:'center',justifyContent:'center'}}>Save</Text>
            </TouchableHighlight>
            </LinearGradient>
            </View>
            <View style={{paddingLeft:20}}>
            <LinearGradient  colors={[this.state.themefirstColor, this.state.themeSecondColor, this.state.themeThirdColor]} >
            <TouchableHighlight onPress={()=> { 
            //    console.warn('close')
                this.hideEditingMenu();
            }} style={{backgroundColor:'transparent',height:35,width:100}} >
            <Text style={{borderRadius:20,backgroundColor:'transparent',color:'white',fontSize:16,fontWeight:'bold',paddingLeft:3,paddingTop:5,alignContent:'center',justifyContent:'center'}}>Close</Text>
            </TouchableHighlight>
            </LinearGradient>
            </View>
            </View>
    
            
            </LinearGradient>
        );
    }
}

const styles = StyleSheet.create({
    wrapper: {
      //...StyleSheet.absoluteFillObject,
      flex: 1,
      backgroundColor: 'transparent',
    },
});
  