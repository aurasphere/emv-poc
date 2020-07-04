import { APDU } from "react-native-nfc-manager";

export default class SelectApdu implements APDU {
    cla= 0x00;
    ins= 0xA4;
    p1= 0x04;
    p2= 0x00;
    data: number[];
    le: number;

    constructor(data: number[], le: number) {
        this.data = data;
        this.le = le;
    }
}

export const SelectPpseApdu = new SelectApdu([0x32, 0x50, 0x41, 0x59, 0x2E, 0x53, 0x59, 0x53, 0x2E, 0x44, 0x44, 0x46, 0x30, 0x31], 0);