import { APDU, Ndef } from "react-native-nfc-manager";
import NfcManager from "react-native-nfc-manager";
import { Platform } from 'react-native';

export default async function sendAPDU(apdu: APDU) {
    console.debug("Sending APDU: " + JSON.stringify(apdu));
    if (Platform.OS == "android") {
        console.log("Sending command from Android");
        let command = apduToByteArray(apdu);
        console.log(Ndef.util.bytesToHexString(command));
        return NfcManager.transceive(command).then(parseResponse)
            .then((response) => { console.debug("APDU response: " + response); return response; });
    } else if (Platform.OS == "ios") {
        console.log("Sending command from IOS");
        return NfcManager.sendCommandAPDUIOS(apdu);
    } else {
        // NOT SUPPORTED.
        console.error("OS NOT SUPPORTED");
    }
}

function parseResponse(response: number[]) {
    const sw2 = response.pop();
    const sw1 = response.pop();
    const apduResponse = new APDUResponse(response, sw1!!, sw2!!);
    console.log(`APDU Response: ${apduResponse}`);
    return apduResponse;
}

function apduToByteArray(apdu: APDU) {
    return [apdu.cla, apdu.ins, apdu.p1, apdu.p2]
        .concat(apdu.data.length)
        .concat(apdu.data).concat(apdu.le);
}

export class APDUResponse {
    response: number[];
    sw1: number;
    sw2: number;

    constructor(response: number[], sw1: number, sw2: number) {
        this.response = response;
        this.sw1 = sw1;
        this.sw2 = sw2;
    }

    private formatResponseToStringBytes() {
        if (this.response.length == 0) {
            return "";
        }
        let string = Ndef.util.bytesToHexString(this.response);
        // Adds a whitespace each 2 characters.
        return string.match(/.{1,2}/g)!!.join(" ");
    }

    public toString() {
        return `{
           sw1: ${Ndef.util.toHex(this.sw1)}
           sw2: ${Ndef.util.toHex(this.sw2)}
           response: ${this.formatResponseToStringBytes()}
        }`;
    }

}