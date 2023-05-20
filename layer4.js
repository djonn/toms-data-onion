import { decode } from "./lib/ascii85.js";
import { bytesToString } from "./lib/utils.js";
import { IPV4_HEADER_LENGTH, Ipv4Header } from "./lib/ipv4.js";
import { UdpMessage } from "./lib/udp.js";

const VALID_IP_FROM = "10.1.1.10";
const VALID_IP_TO = "10.1.1.200";
const VALID_PORT_TO = 42069;

export const solve = (input) => {
  const ascii85Decoded = decode(input);

  let i = 0;
  const data = [];
  while (i < ascii85Decoded.length) {
    const ipv4HeaderBytes = ascii85Decoded.slice(i, i + IPV4_HEADER_LENGTH);
    const ipv4Header = new Ipv4Header(ipv4HeaderBytes);

    const udpBytes = ascii85Decoded.slice(
      i + IPV4_HEADER_LENGTH,
      i + ipv4Header.totalLength()
    );
    const udpMessage = new UdpMessage(
      ipv4Header.sourceAddress(),
      ipv4Header.destinationAddress(),
      udpBytes
    );

    if (
      ipv4Header.isChecksumValid() &&
      udpMessage.isChecksumValid() &&
      ipv4Header.destinationAddress().join(".") === VALID_IP_TO &&
      ipv4Header.sourceAddress().join(".") === VALID_IP_FROM &&
      udpMessage.destinationPort() === VALID_PORT_TO
    ) {
      data.push(...udpMessage.data());
    }

    i += ipv4Header.totalLength();
  }

  return bytesToString(data);
};
