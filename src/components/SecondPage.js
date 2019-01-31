import React, { Component } from 'react';
import {Text, View, StyleSheet, TextInput, TouchableOpacity} from 'react-native';
//import {Actions} from 'react-native-router-flux';
//pushing values into array of objects in state
this.setState( () => {
 
  this.state.expenseArray.push( {"expenseId" : this.state.expenseId, "month" : month, "date" : date, "description": descrip, "expenseAmount" :expense });
 
});


export default class SecondPage extends Component {
constructor(props) {
    super(props);
    this.state = {
      quan:'',
      desc:'',
      amt:'',
      dataStorage:[],
      ViewArray: [], 
      Disable_Button: false 
    }

    this.animatedValue = new Animated.Value(0);
        
    this.Array_Value_Index = 0;
  }

  Add_New_View_Function = () =>
  {
      this.animatedValue.setValue(0);

      let New_Added_View_Value = { Array_Value_Index: this.Array_Value_Index }

      this.setState({ Disable_Button: true, ViewArray: [ ...this.state.ViewArray, New_Added_View_Value ] }, () =>
      {
          Animated.timing(
              this.animatedValue,
              {
                  toValue: 1,
                  duration: 400,
                  useNativeDriver: true
              }
          ).start(() =>
          {
              this.Array_Value_Index = this.Array_Value_Index + 1;

              this.setState({ Disable_Button: false });
          }); 
      });              
  }

_add = () => {
  let dataStorage = [{amt: this.state.amt, quan: this.state.quan, desc: this.state.desc}, ...this.state.dataStorage]
  this.setState({dataStorage})
  console.log(dataStorage)
}

render(){
return(
 <View style={styles.container}>
 console.warn('main page',this.state.expenseArray);
 const AnimationValue = this.animatedValue.interpolate(
   {
       inputRange: [ 0, 1 ],

       outputRange: [ -59, 0 ]
   });

   let Render_Animated_View = this.state.ViewArray.map(( item, key ) =>
   {
       if(( key ) == this.Array_Value_Index)
       {
           return(

               <Animated.View 
                 key = { key } 
                 style = {[ styles.Animated_View_Style, { opacity: this.animatedValue, transform: [{ translateY: AnimationValue }] }]}>
                   
                   <Text style = { styles.View_Inside_Text } > This Is Row { item.Array_Value_Index } </Text>
              
               </Animated.View>
           
         );
       }
       else
       {
           return(

               <View 
                 key = { key } 
                 style = { styles.Animated_View_Style }>

                   <Text style = { styles.View_Inside_Text } > This Is Row { item.Array_Value_Index } </Text>

               </View>

           );
       }
   });
   {(this.state.displayOption === '1') ? <DailyIncomePage /> : ((this.state.displayOption === '2') ? <MonthlyIncomePage /> : <YearlyIncomePage />)}        

 <Header
          placement="center"
          backgroundColor= 'forestgreen'
          outerContainerStyles={{borderBottomColor:'forestgreen'}}
          leftComponent={{ icon: 'menu', color: '#fff' }}
          centerComponent={{ text: 'Home Screen', style: { color: '#fff',fontSize:15 } }}
          rightComponent={{ icon: 'home', color: '#fff' }}
          />

          <ButtonGroup
            onPress={this.updateIndex}
            selectedButtonStyle={{backgroundColor:'forestgreen',borderBottomColor:'white',borderBottomWidth:2}}
            selectedIndex={state.selectedIndex}
            buttons={buttons}
            containerStyle={{height: 100,width:360,marginStart:0,marginTop:0,borderRadius:0,backgroundColor:'forestgreen',borderColor:'forestgreen'}}
              />

              <View style={{flexDirection:'row',alignSelf: 'stretch'}}>
              <View style={{width:180,backgroundColor:'forestgreen'}} >
                <Icon style={{fontSize: 25,textAlign:'center',color:'white'}} name='plus-circle'  />
                <Text style={{fontSize: 16,textAlign:'center',color:'white'}}>Total Income</Text>
                <Text style={{fontSize: 14,textAlign:'center',color:'white'}} > {this.state.totalAmount}</Text>
              </View>
              <View style={{width:180,backgroundColor:'forestgreen'}} >              
              <Icon style={{fontSize: 25,textAlign:'center',color:'white'}} name='minus-circle'  />
                <Text style={{fontSize: 16,textAlign:'center',color:'white'}}>Total Expense</Text>
                <Text style={{fontSize: 14,textAlign:'center',color:'white'}} > {this.state.totalAmount}</Text>
              </View>
            </View>
     
            <View style={{ flex: 1,padding:20}}>
            <FlatList
               data={this.state.incomeArray} 
               renderItem={({item}) =>
               ( 
               <View style={(this.state.isEditButtonSelected && this.state.selectedId === item.incomeId) ? { borderRadius: 4,
                 borderWidth: 0.5,
                 borderColor: '#d6d7da',backgroundColor:'palegoldenrod'} : { borderRadius: 4,
                   borderWidth: 0.5,
                   borderColor: 'forestgreen',marginBottom:10,borderBottomWidth:3}}>  
                 <View style={{ flex: 1, alignSelf: 'stretch', flexDirection: 'row',padding:10 }}>
                   <View style={{ flex: 1, alignSelf: 'stretch' }}>
                   <Text style={{fontWeight:'bold',color:'dimgray'}}>{item.description}</Text>
                   </View>
                   <View style={{ flex: 1, alignSelf: 'stretch' }}>
                   <Text style={{fontWeight:'bold',fontSize:15,color:'dimgray'}}>{item.incomeAmount}</Text>
                   </View>
                   <View style={{ flex: 1, alignSelf: 'stretch' }}>
                   <Text style={{fontWeight:'bold',fontSize:15,color:'dimgray'}}>{item.date}</Text>
                   </View>
                 </View>
             </View>
              )
             }
             extraData = {this.state}
             keyExtractor={item => item.incomeId.toString()}
            
             />
             </View>
            
            <View style={{ flex: 1,padding:20}}>
           <FlatList
              data={this.state.expenseArray} 
              
              renderItem={({item}) =>
              ( 
              <View style={(this.state.isEditButtonSelected && this.state.selectedId === item.expenseId) ? { borderRadius: 4,
                borderWidth: 0.5,
                borderColor: '#d6d7da',backgroundColor:'palegoldenrod'} : { borderRadius: 4,
                  borderWidth: 0.5,
                  borderColor: 'forestgreen',marginBottom:10,borderBottomWidth:3}}>  
                <View style={{ flex: 1, alignSelf: 'stretch', flexDirection: 'row',padding:10 }}>
                  <View style={{ flex: 1, alignSelf: 'stretch' }}>
                  <Text style={{fontWeight:'bold',color:'dimgray'}}>{item.description}</Text>
                  </View>
                  <View style={{ flex: 1, alignSelf: 'stretch' }}>
                  <Text style={{fontWeight:'bold',fontSize:15,color:'dimgray'}}>{item.expenseAmount}</Text>
                  </View>
                  <View style={{ flex: 1, alignSelf: 'stretch' }}>
                  <Text style={{fontWeight:'bold',fontSize:15,color:'dimgray'}}>{item.date}</Text>
                  </View>
                </View>
            </View>
             )
            }
            extraData = {this.state}
            keyExtractor={item => item.expenseId.toString()}
           
            />
            </View>
     
            <View style={{  alignSelf: 'stretch', flexDirection: 'row',paddingLeft:10,borderRadius: 4,
            borderWidth: 0.5,
            borderColor: 'forestgreen',padding:10,marginBottom:10 }}>
              <View style={{ flex:1, alignSelf: 'stretch',justifyContent:'center' }}>
              <Text style={{fontSize:16,fontWeight:'bold',color:'forestgreen'}}>Description</Text>
              </View>
              <View style={{ flex:1, alignSelf: 'stretch',justifyContent:'center' }}>
              <Text style={{fontSize:16,fontWeight:'bold',color:'forestgreen'}}>Amount</Text>
              </View>
              <View style={{ flex:1, alignSelf: 'stretch',justifyContent:'center' }}>
              <Text style={{fontSize:16,fontWeight:'bold',color:'forestgreen'}}>Date</Text>
              </View>
            </View>     
    
 <View style={styles.itemDescription}>
                <Text style={styles.itemDescriptionText}>QUANTITY</Text>
                <Text style={styles.itemDescriptionText}>DESCRIPTION</Text>
                <Text style={styles.itemDescriptionText}>AMOUNT</Text>
                <TouchableOpacity style={styles.addButton} onPress={this._add}>
                  <Text style={styles.addButtonText}>ADD</Text>
                </TouchableOpacity>
          </View>
          <View style={styles.rowsOfInput}>
               <TextInput style = {styles.nameInput}
                      onChangeText={(text) => this.setState({quan: text})}
                      value = {this.state.quan}
                      autoCapitalize='none'
                      autoCorrect={false}
                      returnKeyType="next"
                      keyboardAppearance="dark"
                />
                <TextInput style = {styles.nameInput}
                      onChangeText={(text) => this.setState({desc: text})}
                      value = {this.state.desc}
                      autoCapitalize='none'
                      autoCorrect={false}
                      returnKeyType="next"
                      keyboardAppearance="dark"
                />
                <TextInput style = {styles.nameInput}
                      onChangeText= {(text) => this.setState({amt: text})}
                      value = {this.state.amt}
                      autoCapitalize='none'
                      autoCorrect={false}
                      returnKeyType="next"
                      keyboardAppearance="dark"
                />

          </View>  

 </View>

)}
}


const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  itemDescription: {
        marginTop:20,
        backgroundColor:'#00CED1',
        flexDirection:'row',
        justifyContent:'space-between',

    },

    itemDescriptionText:{
      fontSize:12,
      color:'white',
    },

    addButton:{
    borderWidth:1,
    height:20,
    borderRadius:5,
    overflow:'hidden',
    backgroundColor:'red',

  },
   addButtonText:{
    paddingLeft:10,
    paddingRight:10,

  },
    nameInput:{
    flex:1,
    height: 20,
    textAlignVertical:'bottom',
    paddingLeft: 5,
    paddingRight: 5,
    fontSize: 12,
    backgroundColor:'#E0FFFF',
  },
    rowsOfInput:{
     // flex:1,
      flexDirection:'row',
      justifyContent:'space-around'
    },
});