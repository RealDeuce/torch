import { torchGenericBasicTests } from './generic-basic-tests.js';
import { torchDnD5eBasicTests } from './dnd5e-basic-tests.js';
import { torchCommonLibraryTests } from './common-library-tests.js';
import { torchCommonTokenTests } from './common-token-tests.js';
export function hookTests() {
    if (game.world.data.name.startsWith("torch-test-")) { // Belt and braces check
        console.log("Torch | Registering tests...");
        quench.registerBatch("torch.common.library", torchCommonLibraryTests,  { displayName: "Torch: Common Library Tests" });
        quench.registerBatch("torch.common.token", torchCommonTokenTests,  { displayName: "Torch: Common Token Tests" });
        if (game.system.id === 'dnd5e') {
            //quench.registerBatch("torch.dnd5e.library", torchDnD5eLibraryTests,  { displayName: "Torch: D&D 5e Library Tests" })
            //quench.registerBatch("torch.dnd5e.basic", torchDnD5eBasicTests, { displayName: "Torch: D&D 5e Basic Test" });
        } else {
            //quench.registerBatch("torch.generic.library", torchGenericLibraryTests,  { displayName: "Torch: Generic Library Tests" })
            //quench.registerBatch("torch.generic.basic", torchGenericBasicTests, { displayName: "Torch: Generic Basic Test" });
        }
    }
}
