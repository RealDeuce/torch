import { torchSimpleBasicTests } from './quench-simple-tests.js';
import { torchDnD5eBasicTests } from './quench-dnd5e-tests.js';
export function hookTests() {
    Hooks.on('quenchReady', quench => {
        console.log("Torch | Registering quench tests...");
        if (game.system.id === 'dnd5e') {
            quench.registerBatch("torch.dnd5e.basic", torchDnD5eBasicTests, { displayName: "Torch: Basic D&D 5e Test" });
        } else {
            quench.registerBatch("torch.simple.basic", torchSimpleBasicTests, { displayName: "Torch: Basic Simple Test" });
        }
    });    
}
