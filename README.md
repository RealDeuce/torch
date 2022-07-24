# Torch module for Foundry VTT

This module provides a HUD toggle button for turning on and off a configurable radius of bright and dim light around you. This default source ("Self") is provided for any system for which we don't supply more specialized capabilities. 

However, we now have a variety of core light sources configured for D&D 5th Ed, Savage Worlds, Pathfinder 1st and 2nd editions, GURPS, and Earthdawn. You can select which light source the button will manipulate by right-clicking and clicking the desired source from the menu of buttons that appear for light sources in the actor's inventory or spell list. 

Despite all that we have added, this module continues to follow the philosophy of being controllable in play from a single toggle button on the token HUD, and quickly configurable from there.

Out of the box, the following are available:

| System | Sources |
|--------|---------|
| dnd5e | Candle, Torch, Lamp, Bullseye Lantern, Hooded Lantern, Light, Dancing Lights
| swade | Candle, Flashlight, Lantern, Torch
| pf1 | Candle, Lamp, Lantern, Bullseye Lantern, Hooded Lantern, Miner's Lantern, Torch
| pf2e | Candle, Lantern (Hooded), Lantern (Bull's Eye), Torch
| earthdawn4e | Candle, Lantern (Hooded), Lantern (Bullseye), Torch
| gurps | "Candle, Tallow", "Flashlight, Heavy", "Mini Flashlight", "Micro Flashlight", "Survival Flashlight", "Lantern", "Torch", "Bull's-Eye Lantern", "Electric Lantern, Small", "Electric Lantern, Large", "Small Tactical Light", "Large Tactical Light", "Floodlight"

This module just sheds light from the location of a player token upon demand based upon equipment inventory. It is recommended *not* to use this module for spells or equipment that have other capabilities you intend to use, like performing damage or setting down the equipment, but to rely upon other common approaches, like active effects or item piles, for those.

Because the light source to use is now user-configurable, we no longer select a light source for you based on fallbacks. As it stands, if you do not explicitly select your light source, it will pick any among the light sources you have equipped, in no particular order. 
## Customizing light sources

You can supersede these settings or supply settings for your own light sources for any system with a JSON file, which you can deliver through the "Additional Light Sources" setting. 
```json
{
  "dnd5e": {
    "system": "dnd5e",
    "topology": "standard",
    "quantity" : "quantity",
    "sources": {
      "Candle": {
        "name": "Candle",
        "type": "equipment",
        "consumable": true,
        "states": 2,
        "light": [
          { 
            "bright": 10, "dim": 15, "angle": 360, "color": "#ff9329", "alpha": 0.5,
            "animation": { "type": "torch", "speed": 5, "intensity": 5, "reverse": false } 
          }
        ]
      }
    }
  },
  ...
}
```
The key in the top-level hash is the id of the system.

We support two `topology` values at present:
* In `standard` topology, equipment are `Item` objects with a property to track how many you have. Set `quantity` to the property name used by the system to count the inventory of the item.
* In `gurps` topology, light sources are collected under a property of the actor and require GURPS-specific functions to manipulate inventory. Set `quantity` to `amount`.

A source with  `"consumable": false`, like a lamp or a cantrip, doesn't deduct one from inventory with every use. A source with `"consumable": true`, like a torch or a candle, will have a quantity that is reduced as you use them and will become unavailable when the quantity drops to zero. If you find tracking inventory a complete distraction from your game, you can turn this feature off using the "GM Uses Inventory" and "Player Uses Inventory" settings.

`states` specifies how many states the light source toggles through. For on/off sources, `states` is 2. For high/low/off sources, like hooded lanterns, states is 3.

The `light` array contains a hash of light properties for each "on" state, so most things will have one hash between the brackets, but a hooded lantern will have two. The hash can contain any combination of valid token light properties, providing the same degree of configurability as the token's Light tab.

To use this module with game systems using different topologies will require code but very little code. Define the new topology in topology.js. PRs gratefully accepted. :)

## Changelog - now in [separate file](./CHANGELOG.md)

## Translation Status

The following is the current status of translation. Some features have arrived, introducing new strings, since translations were last done.

| Language | Completion | Contributors |
| -------- | ---------- | ------------ |
| en    | `[##################]` 18/18 (100%) | deuce, lupestro |
| zh-cn | `[##########--------]` 10/18 (56%)  | xticime |
| es    | `[############------]` 12/18 (67%)  | lozalojo |
| fr    | `[##########--------]` 10/18 (56%)  | Aymeeric |
| pt-br | `[############------]` 12/18 (67%)  | rinnocenti |
| zh-tw | `[############------]` 12/18 (67%)  | zeteticl |
| de    | `[##################]` 18/18 (100%) | ToGreedy |

PRs for further translations will be dealt with promptly. While German, Japanese, and Korean are most especially desired - our translation story seems deeply incomplete without them - all others are welcome. 

It's only 18 strings so far, a satisfying afternoon, even for someone who's never committed to an open source project before, and your name will go into the readme right here next to the language. Fork, clone, update, _test locally_, commit, and then submit a PR. Holler for @lupestro on Discord if you need help getting started.

## History

This module was originally written by @Deuce. After it sustained several months of inactivity in 2021, @lupestro submitted a PR to get its features working reliably in FoundryVTT 0.8. Deuce agreed to transfer control to the League with @lupestro as maintainer, the changes were committed and a release was made from the League fork. 

All the PRs that were open at the time of the transfer are now committed and attention has turned to fulfilling some of the feature requests in a maintainable way while retaining the "one-button" character of the original module.

With Foundry VTT V10, the module code was rewritten, broken into several JS files to prepare for implementation of the most asked for features, still behind the single button, supported by a couple of new settings. This mechanism is now complete, pending possible requests for additional equipment topologies.

## License

 "THE BEER-WARE LICENSE" (Revision 42): (From torch.js in this module)
 
 <shurd@FreeBSD.ORG> wrote this file.  As long as you retain this notice you can do whatever you want with this stuff. If we meet some day, and you think this stuff is worth it, you can buy me a beer in return.        Stephen Hurd

(So I think we all owe Stephen a beer for making this thing.)