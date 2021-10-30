import { torchButtonToggles, torchButtonAbsent, cleanup } from './test-cases.js';

const CLICK_DELAY = 10; /* ms */
export let torchGenericBasicTests = (context) => {
    const {describe, it, assert, afterEach} = context;
    const ACTOR = "Solo";
    describe('Torch Simple Basic Tests', () => {
        afterEach(async () => {
            await cleanup(assert, game, ACTOR);
        })    
        if (game.users.current.name === 'Gamemaster') {
            describe('Tests Run As Gamemaster', () => {
                it('gamemaster controls the token light levels when playerTorches is false', 
                async () => {
                    await game.settings.set('torch','playerTorches', true);
                    await torchButtonToggles(assert, game, ACTOR, 20, 40);
                });
                it('gamemaster controls the token light levels when playerTorches is true', 
                async () => {
                    await game.settings.set('torch','playerTorches', true);
                    await torchButtonToggles(assert, game, ACTOR, 20, 40);
                });
            });
        } else if (game.settings.get('torch', 'playerTorches')) {
            describe('Tests Run As Player With player torches permitted', () => {
                it('user controls the token light levels if permitted', async () => {
                    await torchButtonToggles(assert, game, ACTOR, 20, 40);
                });
            });
        } else { 
            describe('Tests Run As Player with player torches not permitted', () => { 
                it('user cannot control the token light levels if not permitted', async () => {
                    await torchButtonAbsent(assert, game, ACTOR);
                });
            });
        }
    });
};
