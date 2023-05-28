import { decode } from "./lib/ascii85.js";
import { bytesToString } from "./lib/utils.js";
import { TomtelCoreI69 } from "./lib/vm.js";

export const solve = (input) => {
  const ascii85Decoded = decode(input);

  const vm = new TomtelCoreI69(ascii85Decoded);
  const output = vm.run();

  return bytesToString(output);
};
