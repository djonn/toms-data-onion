import { decode } from "./lib/ascii85.js";
import { bytesToString, stringToBytes } from "./lib/utils.js";

const KEY_LENGTH = 32;
const PAYLOAD_MARKER = "==[ Payload ]===================";

/**
 * @param {number[]} input
 * @param {number[]} key
 * @returns {number[]}
 */
const xor = (input, key) => {
  return input.map((byte, i) => {
    const keyAtPosition = key[i % key.length];
    return byte ^ keyAtPosition;
  });
};

const getKeySegmentFromKnownMessage = (
  knownMessage,
  startIndex,
  encodedMessage
) => {
  const knownBytes = stringToBytes(knownMessage);
  const encodedSegment = encodedMessage.slice(
    startIndex,
    startIndex + knownMessage.length
  );
  return xor(knownBytes, encodedSegment);
};

const randomByte = () => Math.random() * 0xff;

export const solve = (input) => {
  const ascii85Decoded = decode(input);

  // ### Known parts of the key ###
  const keyPart1 = getKeySegmentFromKnownMessage(
    "==[ Layer 4/6: ",
    0,
    ascii85Decoded
  );
  const keyPart2 = getKeySegmentFromKnownMessage(
    "=============\n\n",
    keyPart1.length + KEY_LENGTH,
    ascii85Decoded
  );

  const partialKey = [...keyPart1, ...keyPart2];

  // ### Cracking the rest of the key ###
  // This should start out at [0, 0], but to speed up the next layers I've put in the correct values.
  let guessedKeyPart = [217, 76];

  do {
    const guessedKey = [...partialKey, ...guessedKeyPart];

    const potentialSolutionBytes = xor(ascii85Decoded, guessedKey);
    const potentialSolution = bytesToString(potentialSolutionBytes);
    const isCorrect = potentialSolution.includes(PAYLOAD_MARKER);

    if (isCorrect) return potentialSolution;

    guessedKeyPart[1] = (guessedKeyPart[1] + 1) % 255;
    if (guessedKeyPart[1] === 0) {
      guessedKeyPart[0] = guessedKeyPart[0] + 1;
    }

    if (guessedKeyPart[0] === 255 && guessedKeyPart[1] === 255)
      throw new Error("Checked everything, but didn't work");
  } while (true);
};
