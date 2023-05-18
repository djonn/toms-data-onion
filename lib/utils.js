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

export const bytesToString = (bytes) =>
  bytes.map((byte) => String.fromCharCode(byte)).join("");
