# Feature - Adding support for more systems

Currently, Torch only explicitly supports light sources from D&D 5e, with a "self-only" lighting option for other systems configurable in the settings.

With the enhancement to the selection of sources, Torch supports all the common light sources for D&D 5e. We would like extend this to other systems. Recall that, for D&D 5e, we started with the following tables:

| Item | Bright | Dim | Shape | Consumable | States | 
|------|--------|-----| ----- | ----- | -------|
| Candle | 5 | 10 | round | item | unlit, lit |
| Bullseye Lantern | 60 | 120 | cone | oil | unlit, lit |
| Hooded Lantern | 30 (0) | 60 (5) | round | oil | unlit, open, closed |
| Lamp | 15 | 45 | round | oil | unlit, lit |
| Torch | 20 | 40 | round | item | unlit, lit |

| Spell | Bright | Dim | Shape | range | level | other effects
|------|--------|-----| ----- |  --------| ---| ----- |
Continual Flame | 20 | 40 | sphere | touch | 2 | none
Dancing Lights | 0 | 10 | sphere | 120 ft | cantrip | none
Daylight | 60 | 120 | sphere | 60 ft | 3 | none
Fire Shield | 10 | 20 | sphere | self | 4 | flame damage
Flame Blade | 10 | 20 | sphere | self | 2 | melee weapon
Light | 20 | 40 | sphere | touch | cantrip | none
Moonbeam | 0 | 5 | cylinder | 120 ft | 2 | radiant damage
Produce Flame | 10 | 20 | sphere | self | cantrip | thrown weapon
Sunbeam | 30 | 60 | cylinder | self | 6 | radiant damage

Eventually, the additional capabilities and requirements of spells being beyond the scope of Torch, we chose to support the five standard pieces of lighting equipment, plus the Dancing Lights and Light cantrips.

The above format of table will prove useful in characterizing light sources in other systems as well.

To better support other systems:

* We would like to extend support as installed to "core book" lighting equipment in as many systems as possible.
* We would like to make the Torch module extensible to let GMs supply additional light sources for the game.

In experimentation, we have found that several, but not all, game systems deliver their equipment as embedded items in the actor, in precisely the same manner as D&D 5e. For instance, the name is in `item.name` and how many the user has is in `item.system.quantity`. For these systems, which include Savage Worlds, and both editions of Pathfinder, support can be as simple as supplying a table like the ones above for the sources in the system.

However, not all systems handle equipment in the same way. For instance, Earthdawn 4e uses "amount" rather than "quantity". This is a relatively simple case. GURPS doesn't use items for its equipment at all. It models a hierarchy of containers, attached as actor system data, and provides a function to walk it:
```javascript
GURPS.recurselist(game.actors.get(this.token.actorId).system.equipment.carried,(item) => {
    console.log("Name: ", item.name, ", Count: ",item.count); 
});
```

Therefore, a change to support more systems will need to abstract navigation of equipment and the collection and setting of quantity based on the system you are using.

Once we are sure we can use tables to supply light sources for each game, and set those into place, the second issue for this design is how to let the GM supply a batch of light sources. I am inclined to support json or yaml input for the tabular portion. We can add an item to the data structure identifying the item ruleset to apply for a particular system. Initial rulesets might be "std","ed4e","gurps".

The remaining sections of this document will sketch out the details of how this might work.

## The light source table

The light source table drives the whole mechanism. It declaratively defines what light sources Torch will supply to the game. Since we will be supporting "free" cantrips but not spells that consume slots, we don't need to be concerned about spell levels.
```typescript
interface LightSourceTable {
  system: string;               // The name of the system for which the table applies
  topology: 'standard' | 'GURPS';
  quantityField: string;        // The name of the field holding the inventory of the light source
  sources: LightSource[];       // The light sources in the table
}
interface LightSource {
    name: string; // Light source name - preferably in the case used in the game system.
    type: 'spell' | 'equipment'; // Gives a hint where to look for the light source.
    consumable: boolean; // Whether inventory is consumed for every use.
    states: number; // The number of states involved - one unlit state and one or more lit states.
    light: LightData[]; // A Foundry LightData object for each lit state in order.
}
```
The topology field tells Torch which set of rules to apply to find and use light sources within the actor. 
* The **standard** topology uses owned Item objects for both equipment and spells, with the quantity for equipment in a field within the Item's `system` data. 
* The **GURPS** topology uses the Actor's `system` data for equipment with a hierarchy of containers and special functions to walk them.
* Other topologies may apply for other systems.

Because we are using LightData objects, we can specify anything about the light source that the token can carry. States cycle the token through the light specs in order. 

## System light source topology
Because we are already using this structure with standard topology for D&D5e light sources, the only additional structure needed to support additional systems in the code is the isolation of the few functions that are sensitive to the topology of equipment and spells in the system. These functions form the Topology interface, implemented by a class for each topology. When the Light Source data is loaded, the runtime structure can carry the topology instance as a property.

```typescript
interface SystemTopology {
    hasEquipment(name: string): boolean;
    hasCantrip(name: string): boolean;
    getInventory(name:string) : number;
    await decrementInventory(name:string) : number; 
}
class StandardTopology implements SystemTopology {
    constructor(itemName: string);
    hasEquipment(name: string): boolean;
    hasCantrip(name: string): boolean;
    getInventory(name:string) : number;
    await decrementInventory(name:string) : number; 

}
class GURPSTopology implements SystemTopology {
    constructor(itemName: string);
    hasEquipment(name: string): boolean;
    hasCantrip(name: string): boolean;
    getInventory(name:string) : number;
    await decrementInventory(name:string) : number; 
}
```
## Settings and extensibility

Since the light source table is just data, users should be able to extend Torch's reach without having to code anything if we provide a way via settings for GMs to supply supplementary tables that override the behavior of light sources already defined or define new light sources. These may be light sources from game system supplements, they may support a new system, or they may be light sources the GM has defined.

### Effect of changes on existing settings

Today, we support the GM setting up bright/dim levels for torch on and torch off configurations. These levels will be used as a light source wherever other light sources aren't defined, which today means anywhere but D&D 5e. 

* Some systems, like those based on FATE or PBTA or 2d6 (like City of Mists), simply aren't built around lists of equipment. If you would reasonably have a flashlight, you do. Special abilities like spells are based on character traits and storytelling.
* For other systems, we have had neither light sources set up by default nor the ability to extend them. 

This capability still needs to be supported. In order to support the full range of light properties, though, the simple bright/dim settings should be overridable through light source data. Conceptually, there is a table for the "default" system, with one predefined, non-consumable light source named "Self". Its light values come from the bright/dim settings. An extension table can change the properties of "Self" and add other default light sources.

The `Player Torches` setting lets the GM control whether players can turn their light sources on and off. I see no reason to remove this setting. Some GMs may want to use the absence of light to control what users can see and have concerns about users trying to out-maneuver them. It's not my style of game-play, but "not my circus, not my monkeys." I'll let it stand.

Today, there are two settings specific to D&D 5e:
* `GM Uses Inventory` - whether the GM depletes inventory when using a light source
* `GM Inventory Item Name` - the name of the light source to use. The bright and dim levels in the settings will be used for this light source, rather than the settings from the game system, and the inventory of the named source will be affected by use.

Since we will now be extending our item support beyond D&D: 
* `GM Uses Inventory` needs to no longer be D&D specific, but appear regardless of system and apply wherever we have an item table that enables us to use inventory.
* We should also have a setting `Player Uses inventory` so that GMs can set up a game where nobody has to fiddle with the quantities. This is a requested feature. [[Issue #11](https://github.com/League-of-Foundry-Developers/torch/issues/11)]
* The `GM Inventory Item Name*` setting was created before we allowed user light source choices, and it will always be awkward. The ability to extend with a table will subsume the need for this. We should remove it.
* The `Dancing Lights Vision` setting is *not* marked as dnd5e-specific today, but that is clearly an oversight, as it refers to a specific D&D 5e cantrip. It should become the *only* DND5e specific setting in the updated module.

This covers what needs to change for the existing settings.

### New settings

**Light Source Configuration File**

Settings are inherently per-game. It seems reasonable to have a setting that specifies the location of a file that contains all the extended light sources for the game. Since any one game is only ever in one system, the file will contain a single `LightSourceTable` object, as described above, in JSON or YAML format. 

This will be a single file selection setting. I don't think we need to offer the user a way to specify more than one such file. This allows a lot of extensibility while keeping the settings page relatively well contained. 

We will supply clear help on the structure of the file in the module's `README.md`.

### Extensibility needing code

This will allow nearly all of the extensibility needed by the module without adding code. Where there is a game system with a topology we do not yet support, the additional topology class would need to be written and the topology name added to our list of recognized topologies. Happily, when we support topologies in the manner stated above, this should be a very small and isolated code change.

Users can request the addition of a system topology in an issue, perhaps with a macro to demonstrate finding all the equipment on their system, or (better yet) offer an implementation in a PR. All of the topologies and their discriminator will be supported together in the topology.js module, so they would just be adding to that.

We can describe briefly in the `README.md` what users need to do to support such a system as well.
