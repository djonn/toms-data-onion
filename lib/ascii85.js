const WHITESPACE_REGEX = /\s/g;
const ZERO = "z";
const END_FILL = "u";

/**
 * Takes 5 characters from the ascii85 character list and converts it into a 32-bit integer
 * @param {string} chars
 * @returns {number}
 */
const charactersToInteger = (chars) => {
  if (
    chars.length !== 5 ||
    chars
      .split("")
      .filter((x) => x.charCodeAt(0) >= 33 && x.charCodeAt(0) <= 117).length !==
      5
  ) {
    throw new Error(
      "chars must be exactly 5 characters, all between ascii 33 and 117 (inclusive)"
    );
  }

  return chars
    .split("")
    .map((x) => x.charCodeAt(0) - 33)
    .reverse()
    .map((num, i) => num * Math.pow(85, i))
    .reduce((acc, cur) => acc + cur, 0);
};

/**
 * Takes a 32-bit integer and splits it into 4 ascii characters
 * @param {number} num
 * @returns {string}
 */
const intToCharacters = (num) => {
  return num
    .toString(2)
    .padStart(8 * 4, "0")
    .split(/(.{8})/)
    .filter((x) => x !== "")
    .map((x) => String.fromCharCode(parseInt(x, 2)))
    .join("");
};

/**
 * Decodes an adobe ascii85 encoded string.
 * @param {string} input
 * @returns {string}
 */
export const decode = (input) => {
  // Wikipedia doesn't mention it, but this site uses "<~" as a start indicator.
  const cleaned = input.replace(WHITESPACE_REGEX, "").replace(/<~|~>/g, "");

  let i = 0;
  let result = "";

  while (i < cleaned.length) {
    if (cleaned[i] === ZERO) {
      result += String.fromCharCode(0).repeat(4);
      continue;
    }

    const nextFive = cleaned.substring(i, i + 5);
    const nextFivePadded = nextFive.padEnd(5, END_FILL);
    const paddingLength = 5 - nextFive.length;
    const int32 = charactersToInteger(nextFivePadded);
    const chars = intToCharacters(int32);
    result += chars.substring(0, 4 - paddingLength);
    i += 5;
  }

  return result;
};
