import React, { Component } from 'react';
import { View , Text , TouchableOpacity, Image} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { LoginManager , LoginButton, AccessToken, GraphRequest,GraphRequestManager } from 'react-native-fbsdk';

export default class Login extends Component {

  constructor(){
    super()

    this.state={
      userData:{}
    }

    this.facebookLogin = this.facebookLogin.bind(this);
    this.facebookLogout = this.facebookLogout.bind(this);
  }



  facebookLogout = async() =>{

    let accessToken = await AsyncStorage.getItem('fb_token')
    
    let logout = new GraphRequest(
                "me/permissions/",
                {
                    accessToken: accessToken,
                    httpMethod: 'DELETE'
                },
                async(error, result) => {
                    if (error) {
                        console.log('Error fetching data: ' + error.toString());
                    } else {
                        await AsyncStorage.removeItem('fb_token')
                        this.setState({userData : {}})
                        console.log(this.state.userData)
                        LoginManager.logOut(); 
                    }
                });
    new GraphRequestManager().addRequest(logout).start();
  }





  facebookLogin = async() =>{
    let result = await LoginManager.logInWithPermissions(["public_profile","email", "user_friends"])

    if (result.isCancelled) {
        console.log("Login cancelled");
    }
    else{
      AccessToken.getCurrentAccessToken().then(
        async(data) => {
          await AsyncStorage.setItem('fb_token', data.accessToken.toString())
        }
      );

      let req = new GraphRequest('/me', {
        httpMethod: 'GET',
        version: 'v2.5',
        parameters: {
          'fields': {
              'string' : 'email,name,picture'
          }
        }
      }, (err, res) => {
            this.setState({userData : res})
      });
      new GraphRequestManager().addRequest(req).start();
    }
    
  }


  render() {
    const {userData} = this.state
    return ( 
     <>
      {
        Object.entries(userData).length == 0 ? (
          <View style={{flex:1, justifyContent: 'center',flexDirection: 'row', alignItems: 'center'}}>
              <TouchableOpacity 
              onPress={()=>this.facebookLogin()}
              style={{backgroundColor:'#4064AD', padding:10}}
              >
                <Text style={{color:'#FFF', fontSize:16}}>Login With Facebook</Text>
              </TouchableOpacity>
          </View>
        ) : (
          <View style={{flex:1, justifyContent: 'center',flexDirection: 'column', alignItems: 'center'}}>

            <Text style={{fontSize:20}}>{userData.name}</Text>

            <View style={{marginBottom: 20}}>
                <Image source={{uri: userData.picture.data.url}} style={{width:50, height:50}}/>
            </View>
            
            <View>
              <TouchableOpacity 
              onPress={()=>this.facebookLogout()}
              style={{backgroundColor:'#4064AD', padding:10}}
              >
                <Text style={{color:'#FFF', fontSize:16}}>Logout</Text>
              </TouchableOpacity>
            </View>
            
          </View>
        )
      }
      </>
    );
  }
};