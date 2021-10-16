import { waitUntil } from './test-utils.js';

export let torchDnD5eBasicTests = (context) => {
    const {describe, it, assert, before, afterEach} = context;
    describe('Torch DnD5e Basic Tests', () => {
        describe('Player without torches or spells', () => {
            afterEach(async () => {
                let token = game.scenes.current.tokens.find(token => token.name === "Solo");
                await token.update({
                    "data.brightLight": 0,
                    "data.dimLight": 0
                });
                await game.canvas.hud.token.clear();
            })
    
            if (game.users.current.name === 'Gamemaster') {
                describe('Tests Run As Gamemaster', () => {
                    it('gamemaster controls the token light levels when playerTorches is false', 
                    async () => {
                        this.timeout(5000);
                        game.settings.set('torch','playerTorches', false);
                        let token = game.scenes.current.tokens.find(token => token.name === "Solo");
                        game.canvas.hud.token.bind(token.object);
                        await waitUntil(() => {
                            console.log("Await #1");
                            return game.canvas.hud.token.element.find(`.col.left div`).length > 0;
                        });
                        let hudButtons = game.canvas.hud.token.element.find(`.col.left div`);
                        assert.isTrue(hudButtons.first().hasClass('torch'), 'First button is the Torch button');
                        hudButtons.first().find('i').click();
                        await waitUntil(() => {
                            console.log("Await #2");
                            return token.data.brightLight > 0;
                        });
                        assert.equal(token.data.brightLight, 20, 'Bright light is the configured value for ON');
                        assert.equal(token.data.dimLight, 40, 'Dim light is the configured value for ON');
                        hudButtons.first().find('i').click();
                        await waitUntil(() => {
                            console.log("Await #3");
                            return token.data.brightLight < 10;
                        });
                        assert.equal(token.data.brightLight, 0, 'Bright light is the configured value for OFF');
                        assert.equal(token.data.dimLight, 0, 'Dim light is the configured value for OFF');
                    });
                    it('gamemaster controls the token light levels when playerTorches is true', 
                    async () => {
                        game.settings.set('torch','playerTorches', false);
                        let token = game.scenes.current.tokens.find(token => token.name === "Solo");
                        game.canvas.hud.token.bind(token.object);
                        await waitUntil(() => {
                            return game.canvas.hud.token.element.find(`.col.left div`).length > 0;
                        });
                        let hudButtons = game.canvas.hud.token.element.find(`.col.left div`);
                        assert.isTrue(hudButtons.first().hasClass('torch'), 'First button is the Torch button');
                        hudButtons.first().find('i').click();
                        await waitUntil(() => {
                            return token.data.brightLight > 0;
                        });
                        assert.equal(token.data.brightLight, 20, 'Bright light is the configured value for ON');
                        assert.equal(token.data.dimLight, 40, 'Dim light is the configured value for ON');
                        hudButtons.first().find('i').click();
                        await waitUntil(() => {
                            return token.data.brightLight < 10
                        });
                        assert.equal(token.data.brightLight, 0, 'Bright light is the configured value for OFF');
                        assert.equal(token.data.dimLight, 0, 'Dim light is the configured value for OFF');
                    });
                });
            } else if (game.settings.get('torch', 'playerTorches')) {
                describe('Tests Run As Player With player torches permitted', () => {
                    it('user controls the token light levels if permitted', async () => {
                        let token = game.scenes.current.tokens.find(token => token.name === "Solo");
                        game.canvas.hud.token.bind(token.object);
                        await waitUntil(() => {
                            return game.canvas.hud.token.element.find(`.col.left div`).length > 0;
                        });
                        let hudButtons = game.canvas.hud.token.element.find(`.col.left div`);
                        assert.isTrue(hudButtons.first().hasClass('torch'), 'First button is the Torch button');
                        hudButtons.first().find('i').click();
                        await waitUntil(() => {
                            return token.data.brightLight > 0;
                        });
                        assert.equal(token.data.brightLight, 20, 'Bright light is the configured value for ON');
                        assert.equal(token.data.dimLight, 40, 'Dim light is the configured value for ON');
                        hudButtons.first().find('i').click();
                        await waitUntil(() => {
                            return token.data.brightLight < 10;
                        });
                        assert.equal(token.data.brightLight, 0, 'Bright light is the configured value for OFF');
                        assert.equal(token.data.dimLight, 0, 'Dim light is the configured value for OFF');
                    });
                });
            } else { 
                describe('Tests Run As Player with player torches not permitted', () => { 
                    it('user cannot control the token light levels if not permitted', async () => {
                        let token = game.scenes.current.tokens.find(token => token.name === "Solo");
                        game.canvas.hud.token.bind(token.object);
                        await waitUntil(() => {
                            return game.canvas.hud.token.element.find(`.col.left div`).length > 0;
                        });
                        let hudButtons = game.canvas.hud.token.element.find(`.col.left div`);
                        assert.isFalse(hudButtons.first().hasClass('torch'), 'First button is the Torch button');
                        assert.equal(token.data.brightLight, 0);
                        assert.equal(token.data.dimLight, 0);
                    });
                });
            }
        });
    });
};