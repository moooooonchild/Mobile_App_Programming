import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, ScrollView, ImageBackground, Image, TouchableOpacity, Alert } from 'react-native';
import { NavigationContainer, useIsFocused } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

function WriteScreen({route}){

  var tYear = route.params.tYear;
  var tMonth = route.params.tMonth;
  var tDate = route.params.tDate;
  
  const [Year, setYear] = useState("");
  const [Month, setMonth] = useState("");
  const [Date, setDate] = useState("");

  const[letter, setLetter] = useState('');
  const[refresh, setRefresh] = useState(0);

  async function add_item(){
      setRefresh(refresh+1);
  }

  useEffect(()=>{
    async function save_data(){
      try{
        
        var letters = [];
        var temp = await AsyncStorage.getItem("@letters");
        if(temp!=null){
          letters = await JSON.parse(temp);
        }   

        if(letter.length>0){
          if(Year>0){
            if(Year<tYear){
              //error
              Alert.alert('전송 실패!', '과거로는 전송이 불가능해요');
              return;
            }
            else if(Year == tYear){
              if(Month<tMonth){
                //error
                Alert.alert('전송 실패!', '과거로는 전송이 불가능해요');
                return;
              }
              else if(Month == tMonth){
                if(Date<tDate){
                  //error
                  Alert.alert('전송 실패!', '과거로는 전송이 불가능해요');
                  return;
                }
              }
            }
            //ok
            letters.push({letter: letter, year: Year, month: Month, date: Date,
                          tYear: tYear, tMonth : tMonth, tDate : tDate});
            await AsyncStorage.removeItem('@letters');
            await AsyncStorage.setItem('@letters', JSON.stringify(letters));
            Alert.alert('전송 완료!');
          }
          else{
            Alert.alert('전송 실패!', '날짜를 선택해주세요');
          }
        }
        
      } catch(e){
        console.log('failed to save');
      }
    }
    save_data();
  },[refresh]);

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {        
        setYear(date.getFullYear());
        setMonth(date.getMonth());
        setDate(date.getDate());
        hideDatePicker();
    };

  return(
   <ScrollView style={{flex:1, marginTop:30}}>
      <ImageBackground style={{height:'100%', width:'100%'}}
                        source={require('./assets/write.jpg')}>
        <View style={{margin:35, alignSelf:'center'}}>
          <TextInput style={{fontSize:15, margin:15, height:430, width:320}} onChangeText={setLetter}
                      multiline={true}
                      placeholder={'편지를 입력해주세요!'}/>
        </View>
        <TouchableOpacity style = {{alignSelf:'center'}} onPress={showDatePicker}>
                        <Image style={{height:50, width:150}} source={require('./assets/b2.png')}/>       
        </TouchableOpacity>
                <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
                    onConfirm={handleConfirm}
                    onCancel={hideDatePicker}
                />
        <View style = {{height : 10}}/>
        <TouchableOpacity style = {{alignSelf:'center', marginBottom:80}} onPress={add_item}>
                        <Image style={{height:50, width:150}} source={require('./assets/b1.png')}/> 
        </TouchableOpacity>       
      </ImageBackground>
   </ScrollView>
  );
}

function ReadScreen({route}){

  var tYear = route.params.tYear;
  var tMonth = route.params.tMonth;
  var tDate = route.params.tDate;
  var data = route.params.toShow;

  return(
   <View style={{flex: 1, marginTop:30}}>
    <ImageBackground style={{height:'100%', width:'100%'}}
                      resizeMode = 'contain' source={require('./assets/read.jpg')}>
   <ScrollView contentContainerStyle={{padding:30}}>
    <View>
      <Text style={{marginBottom:20, fontSize:20, fontWeight:"bold"}}>
        {tYear}년 {tMonth+1}월 {tDate}일의 나에게</Text>
    {data}
    </View>
   </ScrollView>
   </ImageBackground>
   </View> 
  );
}

function HomeScreen({navigation}){

  const isFocused = useIsFocused();

  const [tYear, setYear] = useState("");
  const [tMonth, setMonth] = useState("");
  const [tDate, setDate] = useState("");

  useEffect(function(){
    setInterval(run_everysec, 1000);
  }, []);

  function run_everysec(){
    var td = new Date();
    setYear(td.getFullYear());
    setMonth(td.getMonth());
    setDate(td.getDate());
  }

  var toShow;

  useEffect(()=>{
    async function load_data(){
      try{

        toShow =[];
        var temp = await AsyncStorage.getItem('@letters');
        
        var Data = JSON.parse(temp);
  
        for(var i=0; i<Data.length; i++){
          if(Data[i].year == tYear && Data[i].month == tMonth && Data[i].date == tDate){
            var a = <View style={{
                                  backgroundColor:'#FEFFDE',
                                  borderRadius:10,
                                  marginBottom:10,
                                  padding:20,
                                  elevation:10
                                }}>
                    <Text>From {Data[i].tYear}.{Data[i].tMonth+1}.{Data[i].tDate}.</Text>
                    <View style = {{height:10}}/>
                    <Text>{Data[i].letter}</Text>
                    <View style = {{height:10}}/>
                    </View>
            toShow.push(a);
           }
        }
      } catch(e){
        console.log('failed to load');
      }
    }
    load_data();
  }, [isFocused]);


  return(
   <View style={{flex:1, marginTop:30}}>
      <ImageBackground style={{height:'100%', width:'100%'}}
                        source={require('./assets/home.jpg')}>
      <View style={{padding:250}}/>
      <TouchableOpacity style = {{alignSelf:'center'}} onPress={function(){navigation.navigate('Write',{tYear:tYear, tMonth:tMonth, tDate:tDate})}}>
                      <Image style={{height:50, width:160}} source={require('./assets/b1.png')}/>
      </TouchableOpacity>
      <View style={{height:10}}/>
      <TouchableOpacity style = {{alignSelf:'center'}} onPress={function(){navigation.navigate('Read',{toShow:toShow, tYear:tYear, tMonth:tMonth, tDate:tDate})}}>
                      <Image style={{height:50, width:160}} source={require('./assets/b3.png')}/>
      </TouchableOpacity>
      </ImageBackground>
   </View>
  );
}

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{headerShown: false}}/>
        <Stack.Screen name="Write" component={WriteScreen} options={{headerShown: false}}/>
        <Stack.Screen name="Read" component={ReadScreen} options={{headerShown: false}}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}