
import React from 'react'
import {
  View, Text, TouchableOpacity
} from 'react-native'
import NfcManager, { NfcEvents, NfcTech } from 'react-native-nfc-manager';
import sendAPDU from "./emv/commands/command-sender";
import SelectApdu, { SelectPpseApdu } from './emv/commands/select';
import parseTlvs from './emv/tlv-parser';
import { getAids } from './emv/tlv-utils';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      testing: false
    };
  }
  componentDidMount() {
    NfcManager.start();
  }

  componentWillUnmount() {
    this._cancel();
  }

  _onTagDiscovered = async tag => {
    console.log('Tag Discovered', tag);
    this.setState({ tag });
    console.log("tech requested")
    try {
      const response = await sendAPDU(SelectPpseApdu);
      const tlvs = parseTlvs(response.response);
      const aids = getAids(tlvs[0]);
      const selectAidResponse = await sendAPDU(new SelectApdu(aids[0], 0));
      this.setState({ response: selectAidResponse });
    } catch (error) {
      console.error(error);
      this.setState({ response: error });
    }

  }


  render() {
    var tag = JSON.stringify(this.state?.tag);
    var response = this.state?.response?.toString();
    var testing = this.state?.testing;

    return (
      <View style={{ padding: 20 }}>
        <Text>NFC Demo</Text>
        {testing ?
          <TouchableOpacity
            style={{ padding: 10, width: 200, margin: 20, borderWidth: 1, borderColor: 'black' }}
            onPress={this._cancel}
          >
            <Text>Cancel Test</Text>
          </TouchableOpacity>
          :
          <TouchableOpacity
            style={{ padding: 10, width: 200, margin: 20, borderWidth: 1, borderColor: 'black' }}
            onPress={this._test}
          >
            <Text>Test</Text>
          </TouchableOpacity>
        }
        <Text>{tag}</Text>
        <Text>{response}</Text>
      </View>
    )
  }

  _cancel = () => {
    NfcManager.cancelTechnologyRequest().catch(() => 0);
    this.setState({ testing: false });
  }

  _test = async () => {
    this.setState({ testing: true });
    try {
      await NfcManager.requestTechnology(NfcTech.IsoDep);
      await this._onTagDiscovered();
    } catch (ex) {
      console.warn('ex', ex);
    }
    this._cancel();
  }
}
export default App