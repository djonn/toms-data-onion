import axios from "axios";
import { load } from "cheerio";
import { writeFile } from "node:fs/promises";

const URL = "https://www.tomdalling.com/toms-data-onion/";
export const fetchInitialLayer = async () => {
  const { data: html } = await axios.get(URL);
  const $ = load(html);
  return $("pre").text();
};

const PAYLOAD_MARKER =
  "==[ Payload ]===============================================";
export const extractPayloadAndSaveFiles = async (layer, layerNum) => {
  await writeFile(`./out/layer${layerNum}.txt`, layer);
  const payload = layer.split(PAYLOAD_MARKER).at(-1).trim();
  await writeFile(`./out/payload${layerNum}.txt`, payload);
  return payload;
};

/**
 * @param {number[]} bytes
 * @returns {string}
 */
export const bytesToString = (bytes) =>
  bytes.map((byte) => String.fromCharCode(byte)).join("");

/**
 * @param {string} string
 * @returns {number[]}
 */
export const stringToBytes = (string) =>
  string.split("").map((char) => char.charCodeAt(0));

/**
 * @param {number[]} bytes
 * @returns {number}
 */
export const bytesToInt = (bytes) =>
  [...bytes]
    .reverse()
    .map((byte, i) => byte << (i * 8))
    .reduce((acc, cur) => acc | cur, 0);

/**
 * @param {number[]} bytes
 * @returns {number[]}
 */
export const bytesAs16BitNumbers = (bytes) => {
  const as16BitNumbers = [];
  for (let i = 0; i < bytes.length; i += 2) {
    const combined = (bytes[i] << 8) | bytes[i + 1];
    as16BitNumbers.push(combined);
  }

  return as16BitNumbers;
};
