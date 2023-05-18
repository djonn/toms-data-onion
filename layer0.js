import { decode } from "./lib/ascii85.js";
import { bytesToString } from "./lib/utils.js";

export const solve = (input) => {
  const ascii85Decoded = decode(input);
  return bytesToString(ascii85Decoded);
};
