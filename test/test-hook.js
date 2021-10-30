import { torchGenericBasicTests } from './generic-basic-tests.js';
import { torchDnD5eBasicTests } from './dnd5e-basic-tests.js';
export function hookTests() {
    if (game.world.data.name.startsWith("torch-test-")) { // Belt and braces check
        console.log("Torch | Registering tests...");
        if (game.system.id === 'dnd5e') {
            quench.registerBatch("torch.dnd5e.basic", torchDnD5eBasicTests, { displayName: "Torch: D&D 5e Basic Test" });
        } else {
            quench.registerBatch("torch.generic.basic", torchGenericBasicTests, { displayName: "Torch: Generic Basic Test" });
        }
    }
}
