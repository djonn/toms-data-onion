import { bytesToInt, bytesAs16BitNumbers } from "./utils.js";

export const UDP_HEADER_LENGTH = 8;
// From https://en.wikipedia.org/wiki/List_of_IP_protocol_numbers
export const UDP_PROTOCOL_NUMBER = 17;

export class UdpMessage {
  raw;
  source;
  destination;

  /**
   * @param {number[]} source
   * @param {number[]} destination
   * @param {number[]} message
   */
  constructor(source, destination, message) {
    this.source = source;
    this.destination = destination;
    this.raw = message;
  }

  /**
   * @param {number[]} bytes
   * @returns {number}
   */
  calculateChecksum = () => {
    const udpLength = this.length();
    const udpLengthBytes = [(udpLength & 0xff00) >> 8, udpLength & 0xff];

    /** @type {number[]} */
    const udpHeaderWithoutChecksum = this.raw.slice(0, 6);

    const paddingToNearestOctet = this.data().length % 2 ? [0] : [];

    const pseudoIpv4Header = [
      ...this.source,
      ...this.destination,
      0,
      UDP_PROTOCOL_NUMBER,
      ...udpLengthBytes,
      ...udpHeaderWithoutChecksum,
      ...this.data(),
      ...paddingToNearestOctet,
    ];

    const as16Bit = bytesAs16BitNumbers(pseudoIpv4Header);

    const sum = as16Bit.reduce((acc, cur) => acc + cur, 0);
    const complementSum = ((sum & 0xffff00) >> 16) + (sum & 0xffff);

    return ~complementSum & 0xffff;
  };

  isChecksumValid() {
    const headerChecksumBytes = this.raw.slice(6, 8);
    const checksum = bytesToInt(headerChecksumBytes);

    const calculatedChecksum = this.calculateChecksum();

    return checksum === calculatedChecksum;
  }

  data() {
    return this.raw.slice(UDP_HEADER_LENGTH);
  }

  destinationPort() {
    return bytesToInt(this.raw.slice(2, 4));
  }

  length() {
    return bytesToInt(this.raw.slice(4, 6));
  }
}
