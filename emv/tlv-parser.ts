import NfcManager, { Ndef } from "react-native-nfc-manager";

export default function parseTlvs(message: number[]) {
    const tlvs = [];
    while (message.length > 0) {
        const tag = getTag(message);
        console.debug("tag: " + tag);
        const length = getLength(message);
        const value = message.splice(0, length);
        const tlv = new Tlv(tag, length!!, value);
        if (isTagConstructed(tag)) {
            tlv.children = parseTlvs(value);
        }
        tlvs.push(tlv);
    }
    return tlvs;
}

function getLength(message: number[]) {
    const lengthByte = message.shift();
    // If the first byte is set, then the next seven one are the "length of the length". 
    // Otherwise this is the length.
    const binaryLength = toBinaryByteString(lengthByte!!);
    console.trace("Length binary: " + binaryLength);
    if (binaryLength.charAt(0) !== '1') {
        console.trace("The length has only one byte: " + lengthByte);
        return lengthByte;
    }
    const lengthLength = parseInt(binaryLength.substring(1), 2);
    let lengthBytes = "";
    console.trace("Number of bytes of length: " + lengthLength);
    for (let i = 0; i < lengthLength; i++) {
        lengthBytes += Ndef.util.toHex(message.shift()!!);
    }
    return parseInt(lengthBytes, 16);
}

function isTagConstructed(tag: string) {
    // Returns true if the sixth bit in the first byte is set.
    const firstByte = tag.substring(0, 2);
    const firstByteBinary = toBinaryByteString(parseInt(firstByte, 16));
    return firstByteBinary.charAt(2) === '1';
}

function getTag(message: number[]) {
    let tagFirstByte = message.shift();
    let tag = Ndef.util.toHex(tagFirstByte!!);
    console.trace(`GET TAG: Tag first byte is ${tag}`);
    // If the lowest 5 bits are set, then the tag has more bytes.
    const tagFirstByteBinary = toBinaryByteString(tagFirstByte!!);
    console.debug(`Tag first byte binary is ${tagFirstByteBinary.substring(2)}`);
    if (tagFirstByteBinary.substring(3) === "11111") {
        console.debug(`Tag byte is longer than 1`);
        let nextTagByte;
        do {
            nextTagByte = message.shift();
            tag += Ndef.util.toHex(nextTagByte!!);
            // Following tag bytes are indicated with the top bit being set.
        } while (toBinaryByteString(nextTagByte!!).charAt(0) === '1');
    }
    return tag;
}

function toBinaryByteString(decimal : number) {
    return decimal.toString(2).padStart(8, "0");
}

export class Tlv {
    children: Tlv[] = [];
    tag: string;
    length: number;
    value: number[];

    constructor(tag: string, length: number, value: number[]) {
        this.tag = tag;
        this.length = length;
        this.value = value;
    }

    public getChild(tag: string) {
        const tlv = this.children.find(value => value.tag.toUpperCase() === tag.toUpperCase());
        console.debug(`Tag found ${tlv!!.tag}`);
        return tlv;
    }

    public toString(indentationLevel : number = 0) {
        let toString = `${this.tag} `;
        if(this.children.length == 0) {
            toString += ` = ${Ndef.util.bytesToHexString(this.value)}`;
        } else {
            this.children.forEach(c => toString += `\n${"\t".repeat(indentationLevel + 1) + c.toString(indentationLevel + 1)}`);
        }
        return toString; 
    }
}