import { torchButtonToggles, torchButtonAbsent, cleanup } from './test-cases.js';

export let torchDnD5eBasicTests = (context) => {
    const {describe, it, assert, before, afterEach} = context;
    const ACTOR = "Empty";
    describe('Torch DnD5e Basic Tests', () => {
        describe('Player without torches or spells', () => {
            afterEach(async () => {
                await cleanup(assert, game, ACTOR)
            })
    
            if (game.users.current.name === 'Gamemaster') {
                describe('Tests Run As Gamemaster', () => {
                    it('gamemaster controls the token light levels when playerTorches is false', async () => {
                        await game.settings.set('torch','playerTorches', false);
                        await torchButtonToggles(assert, game, ACTOR, 20, 40);
                    });
                    it('gamemaster controls the token light levels when playerTorches is true', async () => {
                        await game.settings.set('torch','playerTorches', true);
                        await torchButtonToggles(assert, game, ACTOR, 20, 40);
                    });
                });
            } else if (game.settings.get('torch', 'playerTorches')) {
                describe('Tests Run As Player With player torches permitted', () => {
                    it('user cannot control the token light levels without light sources', async () => {
                        await torchButtonAbsent(assert, game, ACTOR);
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
    });
};