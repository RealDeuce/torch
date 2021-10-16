import { waitUntil } from './test-utils.js';

const CLICK_DELAY = 10; /* ms */
export let torchSimpleBasicTests = (context) => {
    const {describe, it, assert, afterEach} = context;
    describe('Torch Simple Basic Tests', () => {
        afterEach(async () => {
            let token = game.scenes.current.tokens.find(token => token.name === "Solo");
            await token.update({
                "data.brightLight": 0,
                "data.dimLight": 0
            });
            await waitUntil(() => {
                return token.data.brightLight < 10
            },"cleanup");
            await game.canvas.hud.token.clear();
        })    
        if (game.users.current.name === 'Gamemaster') {
            describe('Tests Run As Gamemaster', () => {
                it('gamemaster controls the token light levels when playerTorches is false', 
                async () => {
                    game.settings.set('torch','playerTorches', false);
                    let token = game.scenes.current.tokens.find(token => token.name === "Solo");
                    game.canvas.hud.token.bind(token.object);
                    assert.isTrue(await waitUntil(() => {
                        return game.canvas.hud.token.element.find(`.col.left div`).length > 3;
                    }, "hud"), "HUD showed up with all buttons within a second");
                    let hudButtons = game.canvas.hud.token.element.find(`.col.left div`);
                    assert.isTrue(hudButtons.first().hasClass('torch'), 'First button is the Torch button');
                    hudButtons.first().find('i').click();
                    assert.isTrue(await waitUntil(() => {
                        return token.data.brightLight > 0;
                    }, "click1"), "Bright Light value increased within a second");
                    assert.equal(token.data.brightLight, 20, 'Bright light is the configured value for ON');
                    assert.equal(token.data.dimLight, 40, 'Dim light is the configured value for ON');
                    token = game.scenes.current.tokens.find(token => token.name === "Solo");
                    hudButtons.first().find('i').click();
                    assert.isTrue(await waitUntil(() => {
                        return token.data.brightLight < 10;
                    }, "click2"), "Bright Light value reduced within a second");
                    assert.equal(token.data.brightLight, 0, 'Bright light is the configured value for OFF');
                    assert.equal(token.data.dimLight, 0, 'Dim light is the configured value for OFF');
                });
                it('gamemaster controls the token light levels when playerTorches is true', 
                async () => {
                    game.settings.set('torch','playerTorches', true);
                    let token = game.scenes.current.tokens.find(token => token.name === "Solo");
                    game.canvas.hud.token.bind(token.object);
                    assert.isTrue(await waitUntil(() => {
                        return game.canvas.hud.token.element.find(`.col.left div`).length > 3;
                    }, "hud"), "HUD showed up with all buttons within a second");
                    let hudButtons = game.canvas.hud.token.element.find(`.col.left div`);
                    assert.isTrue(hudButtons.first().hasClass('torch'), 'First button is the Torch button');
                    token = game.scenes.current.tokens.find(token => token.name === "Solo");
                    hudButtons.first().find('i').click();
                    assert.isTrue(await waitUntil(() => {
                        return token.data.brightLight > 0;
                    }, "click1"), "Bright Light value increased within a second");
                    assert.equal(token.data.brightLight, 20, 'Bright light is the configured value for ON');
                    assert.equal(token.data.dimLight, 40, 'Dim light is the configured value for ON');
                    hudButtons.first().find('i').click();
                    assert.isTrue(await waitUntil(() => {
                        return token.data.brightLight < 10;
                    }, "click2"), "Bright Light value reduced within a second");
                    assert.equal(token.data.brightLight, 0, 'Bright light is the configured value for OFF');
                    assert.equal(token.data.dimLight, 0, 'Dim light is the configured value for OFF');
                });
            });
        } else if (game.settings.get('torch', 'playerTorches')) {
            describe('Tests Run As Player With player torches permitted', () => {
                it('user controls the token light levels if permitted', async () => {
                    let token = game.scenes.current.tokens.find(token => token.name === "Solo");
                    game.canvas.hud.token.bind(token.object);
                    assert.isTrue(await waitUntil(() => {
                        return game.canvas.hud.token.element.find(`.col.left div`).length > 3;
                    }, "hud"), "HUD showed up with all buttons within a second");
                    let hudButtons = game.canvas.hud.token.element.find(`.col.left div`);
                    assert.isTrue(hudButtons.first().hasClass('torch'), 'First button is the Torch button');
                    hudButtons.first().find('i').click();
                    assert.isTrue(await waitUntil(() => {
                        return token.data.brightLight > 0;
                    }, "click1"),"Bright Light value increased within a second");
                    assert.equal(token.data.brightLight, 20, 'Bright light is the configured value for ON');
                    assert.equal(token.data.dimLight, 40, 'Dim light is the configured value for ON');
                    hudButtons.first().find('i').click();
                    assert.isTrue(await waitUntil(() => {
                        return token.data.brightLight < 10;
                    }, "click2"), "Bright Light value reduced within a second");
                    assert.equal(token.data.brightLight, 0, 'Bright light is the configured value for OFF');
                    assert.equal(token.data.dimLight, 0, 'Dim light is the configured value for OFF');
                });
            });
        } else { 
            describe('Tests Run As Player with player torches not permitted', () => { 
                it('user cannot control the token light levels if not permitted', async () => {
                    let token = game.scenes.current.tokens.find(token => token.name === "Solo");
                    game.canvas.hud.token.bind(token.object);
                    assert.isTrue(await waitUntil(() => {
                        return game.canvas.hud.token.element.find(`.col.left div`).length > 1;
                    }, "hud"), "HUD showed up with some buttons within a second");
                    let hudButtons = game.canvas.hud.token.element.find(`.col.left div`);
                    assert.isFalse(hudButtons.first().hasClass('torch'), 'First button is the Torch button');
                    assert.equal(token.data.brightLight, 0);
                    assert.equal(token.data.dimLight, 0);
                });
            });
        }
    });
};
