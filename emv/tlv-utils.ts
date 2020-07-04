import { Tlv } from "./tlv-parser";
import { Ndef } from "react-native-nfc-manager";

export function getAids(rootTlv : Tlv) {
    const applications = rootTlv.getChild("A5")?.getChild("BF0C")?.children;
    return applications?.sort((a, b) => a.value[0] - b.value[0]).map(tlv => tlv.getChild("4F")?.value);
}