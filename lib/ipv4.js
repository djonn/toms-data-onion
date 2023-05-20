import { bytesToInt, bytesAs16BitNumbers } from "./utils.js";

export const IPV4_HEADER_LENGTH = 20;

export class Ipv4Header {
  raw;

  /**
   * @param {number[]} header
   */
  constructor(header) {
    this.raw = header;
  }

  sourceAddress() {
    return this.raw.slice(12, 16);
  }

  destinationAddress() {
    return this.raw.slice(16, 20);
  }

  totalLength() {
    const totalLengthBytes = this.raw.slice(2, 4);
    return bytesToInt(totalLengthBytes);
  }

  /**
   * Combines the bytes into 16-bit numbers,
   * sums up these numbers taking into account 16-bit overflow
   * and takes ones complement of the number,
   * since JS uses 32-bit SIGNED integers for bitwise operations
   * we also need to mask the return value to only keep the 16 LSB's.
   * @param {number[]} bytes
   * @returns {number}
   */
  calculateChecksum = () => {
    const headerWithEmptyCheckSum = this.raw.toSpliced(10, 2, 0, 0);
    const headerAs16BitNumbers = bytesAs16BitNumbers(headerWithEmptyCheckSum);

    const sum = headerAs16BitNumbers.reduce(
      (acc, cur) => (acc + cur) % 0xffff,
      0
    );

    return ~sum & 0xffff;
  };

  isChecksumValid() {
    const headerChecksumBytes = this.raw.slice(10, 12);
    const checksum = bytesToInt(headerChecksumBytes);

    const calculatedChecksum = this.calculateChecksum();

    return checksum === calculatedChecksum;
  }
}
