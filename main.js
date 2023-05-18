import { fetchInitialLayer, extractPayloadAndSaveFiles } from "./lib/utils.js";
import { solve as layer0Solve } from "./layer0.js";
import { solve as layer1Solve } from "./layer1.js";
import { solve as layer2Solve } from "./layer2.js";
import { solve as layer3Solve } from "./layer3.js";

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
