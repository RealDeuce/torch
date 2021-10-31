
import { waitUntil } from './test-utils.js';

let getLightRadii = (data) => {
    return data.light 
        ? { bright: data.light.bright, dim: data.light.dim } 
        : { bright: data.brightLight, dim: data.dimLight };
}
let lightRadiiForUpdate = async (data, bright, dim) => {
    return data.light
        ? { "light.bright": bright, "ight.dim": dim }
        : { "brightLight": bright,"dimLight": dim };
}

export let  torchButtonToggles = async (
    assert, game, actor, brightOnRadius, dimOnRadius, 
    brightOffRadius = 0, dimOffRadius = 0
) => {
    let token = game.scenes.current.tokens.find(
        token => token.name === actor);

    // Open the token HUD for the targeted token
    let tokenHUD = game.canvas.hud.token;
    tokenHUD.bind(token.object);
    await waitUntil(() => {
        return tokenHUD.element.find(`.col.left div`).length > 0;
    }, "HUD is up");

    // Examine the initial condition of the HUD
    let hudButtons = tokenHUD.element.find(`.col.left div`);
    assert.isTrue(
        hudButtons.first().hasClass('torch'), 
        'First button is the Torch button');
    console.log("OldValue upon entry:", token.data.flags.torch?.oldValue);
    hudButtons = tokenHUD.element.find(`.col.left div`);
    assert.isFalse(
        hudButtons.first().hasClass('active'), 
        "Torch isn't active before click");

    // Click to turn on light
    hudButtons.first().find('i').click();
    let expectedFlag = `${brightOffRadius}/${dimOffRadius}`;
    await waitUntil(() => {
        return getLightRadii(token.data).bright > brightOffRadius;
    },"Torch is lit");
    await waitUntil(() => {
        return token.data.flags.torch?.oldValue === expectedFlag;
    }, "Torch flag is set");

    // Check conditions after turning on light
    assert.equal(
        getLightRadii(token.data).bright, brightOnRadius, 
        'Bright light is the configured value for ON');
    assert.equal(
        getLightRadii(token.data).dim, dimOnRadius, 
        'Dim light is the configured value for ON');
    hudButtons = tokenHUD.element.find(`.col.left div`);
    await waitUntil(() => {
        return hudButtons.first().hasClass('active');
    }, "Torch button active after first click");

    // Click to turn off light
    hudButtons.first().find('i').click();
    await waitUntil(() => {
        return getLightRadii(token.data).bright < brightOnRadius;
    }, "Torch is unlit");
    await waitUntil(() => {
        return token.data.flags.torch?.oldValue === null;
    }, "Torch flag is cleared");

    // Check conditions after turning off light
    assert.equal(
        getLightRadii(token.data).bright, brightOffRadius, 
        'Bright light is the configured value for OFF');
    assert.equal(
        getLightRadii(token.data).dim, dimOffRadius, 
        'Dim light is the configured value for OFF');
    assert.isFalse(
        hudButtons.first().hasClass('active'), 
        "Torch button inactive after second click");
}

export let  torchButtonAbsent = async (
    assert, game, actor, brightOffRadius = 0, dimOffRadius = 0
) => {
    let token = game.scenes.current.tokens.find(
        token => token.name === actor);
    let tokenHUD = game.canvas.hud.token;

    // Open the token HUD for the targeted token
    tokenHUD.bind(token.object);
    await waitUntil(() => {
        return tokenHUD.element.find(`.col.left div`).length > 0;
    }, "HUD is up");

    // Verify that light button isn't on HUD
    let hudButtons = tokenHUD.element.find(`.col.left div`);
    assert.isFalse(
        hudButtons.first().hasClass('torch'), 
        'First button is the Torch button');

    // Verify that the lights are off
    assert.equal(getLightRadii(token.data).bright, brightOffRadius);
    assert.equal(getLightRadii(token.data).dim, dimOffRadius);
}

export let cleanup = async (
    assert, game, actor, brightOffRadius = 0, dimOffRadius = 0
) => {
    // Make sure playerTorches is off
    if (game.users.current.name === 'Gamemaster') {
        await game.settings.set('torch','playerTorches', true);
    }
    // Make sure lights are off
    let token = game.scenes.current.tokens.find(
        token => token.name === actor);
    await token.update(
        lightRadiiForUpdate(token.data, brightOffRadius, dimOffRadius));

    // Make sure token HUD is closed
    await game.canvas.hud.token.clear();
}
