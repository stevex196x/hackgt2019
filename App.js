import React, { Component } from 'react';
import { StyleSheet, Text, View, FlatList, Button } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs'
import { RNCamera } from 'react-native-camera';
import Icon from 'react-native-vector-icons/Ionicons'

var barcodeCodes = [];

const barcodeMapping = {
  "024100122615": "Abble",
  "somekey": "Banan",
  "somekey2": "Shirt",
  "somekey3": "pant"
}

const itemMapping = {
  "Abble": "0.50",
  "Banan": "5.00",
  "Shirt": "3.00",
  "pant": "3.99"
}

var scannedItem = new Object();
scannedItem['name'] = "";
scannedItem['price'] = "";

function updateCart(cartNumber, itemName, itemPrice) {
  return fetch(`https://codingchallenge-3057f.firebaseapp.com/api/addToCart?id=${cartNumber}&price=${itemPrice}&name=${itemName}`).then((response) => response.json()).catch(function(error) {
    console.log(error);
  });    //cart number, itemName, itemPrice
}

function getCart() {
  return fetch('https://codingchallenge-3057f.firebaseapp.com/api/findCart?id=3').then((response) => {return response.json()}).catch(function(error) {
    console.log(error);
  });    //get cart and put it in array
}

function getNcrItem(barcode) {
  return fetch('https://api-reg-apigee.ncrsilverlab.com/v2/inventory/items', {
    method: 'GET',
    headers: new Headers({
      'Authorization': 'Bearer gAAAAAdr-yHNdbFH0zeVyhvl8pMwZy_vFS6O3cBn7Zmydb-3-h8BMyRpmK3IiPQdLSdX1fgiVwovuW0oCE4R5qYS6J8RE02dmeqqeO1FCN4GZfXZ2clB92AsDHl0xo7j9ZAezheBvwSVv6CB7kSSDPeiQesvbIdG-TosSj41GFC7A5cO9AAAAIAAAACghZgq9fdF07BrWo91RHKtSdeM9MjOoMqcr8VGoYE9wjgVnl0iyfGPFH1eb-zdmZJ-Mqh5SBKbaKudd9p4RSdMLKAwgcvY9Va-lDH-5qx4ypS1MAtrqEhCBpmeaFk20d1f_qfiNlOM0XsCAVGEAGMoTUAayIqXwWOx6EWt8fdOeQXaG-gKDYFm1KRhsQAQAUHkhkB0G3GDtN55Ck2V5boZartD2sjDQ2prVnTkDlDKd7zL9tbMh72I89D8wUuFnx2RiaHT2wPyiXnQJtM18NgMlcg2pktM1VzNP9HzmbyaVFIIO-3JyawuT5DYXjvxLR4',
      'Content-Type': 'application/json'
    })
  })
  .then((response) => response.json())
  .then((responseJson) => {
    items = responseJson['Result']
    for (var i = 0; i < items.length; i++) {
      const entireItem = items[i];
      if (entireItem['Barcode'] === barcode) {
        scannedItem['name'] = entireItem['Name'];
        scannedItem['price'] = entireItem['RetailPrice'];
      }
    }
    return scannedItem;
  }).catch(function(error) {
    console.log(error);
  });
}

class ProductScanRNCamera extends Component {

  constructor(props) {
    super(props);
    this.camera = null;
    this.currentBarcode = "";

    this.state = {
      camera: {
        type: RNCamera.Constants.Type.back,
	      flashMode: RNCamera.Constants.FlashMode.auto,
      }
    };
  }

  onBarCodeRead(scanResult) {
    // console.warn(scanResult.type);
    // console.warn(scanResult.data);
    if (scanResult.data != null) {
        if (this.currentBarcode == "" || this.currentBarcode != scanResult.data) {
            this.currentBarcode = scanResult.data;
            console.warn('onBarCodeRead call');
        }
    }
    return;
  }

  async takePicture() {
    if (this.camera) {
      const options = { quality: 0.5, base64: true };
      const data = await this.camera.takePictureAsync(options);
      console.log(data.uri);
    }
  }

  pendingView() {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: 'lightgreen',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text>Waiting</Text>
      </View>
    );
  }

  render() {
    return (
      <View style={camStyles.container}>
        <RNCamera
            ref={ref => {
              this.camera = ref;
            }}
            defaultTouchToFocus
            flashMode={this.state.camera.flashMode}
            mirrorImage={false}
            onBarCodeRead={this.onBarCodeRead.bind(this)}
            onFocusChanged={() => {}}
            onZoomChanged={() => {}}
            androidCameraPermissionOptions={{
                title: 'Permission to use camera',
                message: 'We need your permission to use your camera',
                buttonPositive: 'Ok',
                buttonNegative: 'Cancel',
              }}
            style={camStyles.preview}
            type={this.state.camera.type}
        />
        <View style={[camStyles.overlay, camStyles.bottomOverlay]}>
            <Button
                onPress={() => { 
                  if (this.currentBarcode != "") {
                    barcodeCodes.push(this.currentBarcode);
                    // if (this.currentBarcode === "02410012261") {
                    //   updateCart("1", "Cheez-its", "1.00")
                    // } else if (this.currentBarcode === "049000007909") {
                    //   updateCart("1", "Powerade", "2.00")
                    // } else if (this.currentBarcode === "5012345678900") {
                    //   updateCart("1", "Abble", "5.00")
                    // } else if (this.currentBarcode === "400020001122") {
                    //   updateCart("1", "uwu", "10.00")
                    // }
                  }
                const ncrItem = getNcrItem(this.currentBarcode);
                setTimeout(() => console.log("LUL"), 3000);
                const name = scannedItem['name'];
                const price = scannedItem['price'];
                updateCart("2", name, price);
                scannedItem['name'] = "";
                scannedItem['price'] = "";
                
                console.warn(this.currentBarcode);
              }}
                style={camStyles.enterBarcodeManualButton}
                title="Scan Item"
            />
        </View>
    </View>
    );
  }
}

const camStyles = {
  container: {
    flex: 1
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  overlay: {
    position: 'absolute',
    padding: 16,
    right: 0,
    left: 0,
    alignItems: 'center'
  },
  topOverlay: {
    top: 0,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  bottomOverlay: {
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  enterBarcodeManualButton: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 40
  },
  scanScreenMessage: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center'
  }
};


class CartScreen extends Component {

  componentDidMount() {
    this.setState(this.state);
  }

  render() {

    const cart = getCart();
    const names = cart.cart4.items.name.split(",")
    const prices = cart.cart4.items.price.split(",")
    var newData = []
    for (var i = 0; i < names; i++) {
      newData.push({name : names[i], price: prices[i]});
    }

    // this.setState()


    return (
      <View style={cartStyles.container}>
        <FlatList
          data={newData}
          renderItem={({item}) => <Text style={cartStyles.item}>`${item.name}\t ${item.price}`</Text>}
        />
      </View>
    );
  }
}

const cartStyles = StyleSheet.create({
  container: {
   flex: 1,
   paddingTop: 22
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
})


const bottomTabNavigator = createBottomTabNavigator(
  {
    Scanner: {
      screen: ProductScanRNCamera,
      navigationOptions: {
        tabBarIcon: ({ tintColor }) => (
          <Icon name="ios-camera" size={23} color={tintColor}/>
        )
      }
    }
  },
  {
    initialRouteName: 'Scanner',
    tabBarOptions: {
      activeTintColor: '#eb6e3d'
    }
  }
);

export default class App extends Component {
  render() {
    return (
      <AppContainer />
    );
  }
}

const AppContainer = createAppContainer(bottomTabNavigator);
