import { fetchInitialLayer, extractPayloadAndSaveFiles } from "./lib/utils.js";
import { writeFile } from "node:fs/promises";
import { solve as layer0Solve } from "./layer0.js";
import { solve as layer1Solve } from "./layer1.js";
import { solve as layer2Solve } from "./layer2.js";
import { solve as layer3Solve } from "./layer3.js";
import { solve as layer4Solve } from "./layer4.js";
import { solve as layer5Solve } from "./layer5.js";
import { solve as layer6Solve } from "./layer6.js";

const layers = {};
const payloads = {};

layers[0] = await fetchInitialLayer();
payloads[0] = await extractPayloadAndSaveFiles(layers[0], 0);

layers[1] = layer0Solve(payloads[0]);
payloads[1] = await extractPayloadAndSaveFiles(layers[1], 1);

layers[2] = layer1Solve(payloads[1]);
payloads[2] = await extractPayloadAndSaveFiles(layers[2], 2);

layers[3] = layer2Solve(payloads[2]);
payloads[3] = await extractPayloadAndSaveFiles(layers[3], 3);

layers[4] = layer3Solve(payloads[3]);
payloads[4] = await extractPayloadAndSaveFiles(layers[4], 4);

layers[5] = layer4Solve(payloads[4]);
payloads[5] = await extractPayloadAndSaveFiles(layers[5], 5);

layers[6] = layer5Solve(payloads[5]);
payloads[6] = await extractPayloadAndSaveFiles(layers[6], 6);

const core = layer6Solve(payloads[6]);
await writeFile(`./out/core.txt`, solution);
