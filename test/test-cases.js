
import { waitUntil } from './test-utils.js';
export let  torchButtonToggles = async (
    assert, game, actor, brightOnRadius, dimOnRadius, brightOffRadius = 0, dimOffRadius = 0
) => {
    let token = game.scenes.current.tokens.find(token => token.name === actor);
    game.canvas.hud.token.bind(token.object);
    await waitUntil(() => {
        return game.canvas.hud.token.element.find(`.col.left div`).length > 0;
    }, "HUD is up");
    let hudButtons = game.canvas.hud.token.element.find(`.col.left div`);
    assert.isTrue(hudButtons.first().hasClass('torch'), 'First button is the Torch button');
    console.log("OldValue upon entry:", token.data.flags.torch?.oldValue);
    hudButtons = game.canvas.hud.token.element.find(`.col.left div`);
    hudButtons.first().find('i').click();
    await waitUntil(() => {
        return token.data.brightLight > brightOffRadius;
    },"Torch is lit");
    assert.equal(token.data.brightLight, brightOnRadius, 'Bright light is the configured value for ON');
    assert.equal(token.data.dimLight, dimOnRadius, 'Dim light is the configured value for ON');
    hudButtons = game.canvas.hud.token.element.find(`.col.left div`);
    hudButtons.first().find('i').click();
    await waitUntil(() => {
        return token.data.brightLight < brightOnRadius;
    }, "Torch is unlit");
    assert.equal(token.data.brightLight, brightOffRadius, 'Bright light is the configured value for OFF');
    assert.equal(token.data.dimLight, dimOffRadius, 'Dim light is the configured value for OFF');
    await waitUntil(() => {
        return token.data.flags.torch?.oldValue === null;
    }, "Torch flag is cleared");
}

export let  torchButtonAbsent = async (
    assert, game, actor, brightOffRadius = 0, dimOffRadius = 0
) => {
    let token = game.scenes.current.tokens.find(token => token.name === actor);
    game.canvas.hud.token.bind(token.object);
    await waitUntil(() => {
        return game.canvas.hud.token.element.find(`.col.left div`).length > 0;
    }, "HUD is up");
    let hudButtons = game.canvas.hud.token.element.find(`.col.left div`);
    assert.isFalse(hudButtons.first().hasClass('torch'), 'First button is the Torch button');
    assert.equal(token.data.brightLight, brightOffRadius);
    assert.equal(token.data.dimLight, dimOffRadius);
}

export let cleanup = async (
    assert, game, actor, brightOffRadius = 0, dimOffRadius = 0
) => {
    if (game.users.current.name === 'Gamemaster') {
        await game.settings.set('torch','playerTorches', true);
    }
    let token = game.scenes.current.tokens.find(token => token.name === actor);
    await token.update({
        "data.brightLight": brightOffRadius,
        "data.dimLight": dimOffRadius
    });
    await game.canvas.hud.token.clear();
}
