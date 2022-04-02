# Feature: Extending light sources

## Light Sources in D&D

The following equipment from the Player's Handbook and SRD can serve as a light source:

| Item | Bright | Dim | Shape | Consumable | States | 
|------|--------|-----| ----- | ----- | -------|
| Candle | 5 | 10 | round | item | unlit, lit |
| Bullseye Lantern | 60 | 120 | cone | oil | unlit, lit |
| Hooded Lantern | 30 (0) | 60 (5) | round | oil | unlit, open, closed |
| Lamp | 15 | 45 | round | oil | unlit, lit |
| Torch | 20 | 40 | round | item | unlit, lit |

Equipment as light sources:
* are generally able to be held or placed, so they need to be treated like a touch spell. 
* can only be controlled when held.
* are either consumed over time or are used with oil that is consumed over time

The hooded lantern has two different "lit" states that need to be cycled.

The following spells from the Player's Handbood and SRD are the only ones that are specified as light sources:

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

Spells have many of the same issues as equipment, along with a few others.
* The cylinder shape on some spells doesn't cause a problem for an overhead view.
* Spells that aren't cantrips consume spell slots.
* Their activity as a light source is only one facet of their action, and other modules cover the other facets, so you really benefit from casting them in the normal way, not from a flame button on the HUD.

Here are some things that we can do:
* Held items and self-ranged cantrips just shed light from the selected token.
* When items are placed or spells are cast at range, light is shed from a synthetic token created for the purpose.
* We can wimp out on touch spells by treating them as range spells and manually keeping the synthetic token with the target.
* We can consume torches and candles and spell slots.
* We can ignore consumption impact for oil-based light sources.
* We can track the hood on a hooded lantern by having the on/off toggle become an open/hooded/off toggle.
* We can support Produce Flame if we ignore it's thrown behavior.

Here are the things that we can't do:
* Attaching touch spell light source effects to their targets.
* Supporting spells with other effects as light sources.
* Tracking consumption of oil or wax over time.
* We can't provide support for directing the beam of the Bullseye Lantern

Hence, we can support all five of the equipment-based light sources and the spells Continual Flame, Dancing Lights, Daylight, Light, and Produce Flame. We cannot support Fire Shield, Flame Blade, Moonbeam, or Sunbeam. Ten feasible light sources isn't half bad.

Doing the easiest things first: 
* In round 0, we enable the user to choose among the three things we already do support: Torch, Light, and Dancing Lights.
* In round 1, we can deliver "self-only" Candle, Lamp, Torch, Light, and Produce Flame with Candle and Torch consumable. 
* In round 2, we can support the tri-state Hooded Lantern.
* In round 3, we can add support for placing the above light sources and picking them up.
* In round 4, we can support consuming spell slots, picking up Continual Flame and Daylight

I think this is as far as we can reach with this module for D&D5e without profound complications. We can publish each rounnd as we complete it.

## Proposed User Experience

The ability to manually choose which spells and items for our HUD to control needs to be very easy to get to but not in the way. A user will have their "go-to" light source most of the time but may want to change it by circumnstance. 

### HUD changes - Light source selection

I propose that we trigger a light source menu on a right click on the flame icon: 
* The light source menu will be a single row of icons representing light sources that the character possesses.
* It will appear to the left of the flame icon, with physical items to the right and spells to the left. 
* If the user only has one item, it will still show in the menu. 
* If the user has no items, there will be no flame icon to right-click. 
* Hovering any of the icons will display its name.
* Clicking one of the items will make it the new selected item. 
* Clicking anywhere on the HUD or dismissing the HUD will make the menu disappear.
* Hovering the flame icon will show a tooltip identifying the current selected item.

The application must keep the identity of the current light source as flagged state.
The selected light source and the list of available light sources will be collected when the HUD is opened.

### HUD Changes - Placed vs. Held

It isn't clear how we would transition between a light source being placed and held. Shift-clicking an active lamp icon could spawn an offset token for the placed item. Shift-clicking when the item token is adjacent could remove the token, absorbing the behavior back into the character token.

### HUD Changes - Hooded Lantern

In a later round, the behavior of the flame toggle icon will be dependent upon the light source chosen. For a hooded lantern, it will cycle through three states (unlit, open, closed) rather than two (unlit, lit). We will need to keep state for this, and may want to turn the implementation into an explicit state machine.

## Development plan

 ### Prefactoring - Code structure

  We're adding a fair amount of complexity here. The goal of this round is to restructure the existing code to prepare for growth without adding any new features.
  
  Here are some concerns we could separate using classes or modules for the varying scopes:
  * Concerns locked to the actor -
    * What items - spells and equipment - does the actor have that are light sources?
    * Handling equipment inventory on light source state changes
    * Handling spell slots on light source state changes
  * Concerns locked to the HUD -
    * Flame button, light source menu
    * clicks, events, and visible HUD changes related to light sources
  * Concerns locked to the actor's main token in the scene -
    * Light levels, original light levels
  * Concerns locked to light source type - 
    * Bright/dim level, light shape, consumable, spell level, range, states
  * Overall state - 
    * selected light source, current light state

All of our state persists as flags on the actor's primary token for the scene, so all methods can be static. This means we're talking about pure modules of functions rather than stateful objects.
  
  
After some thought, it will be sufficient to break things up into three modules:
  * Torch.js - this is the app. It has all of our hooks, our settings, our test setup, and our socket handling. It also contains our grand logic and calls the other modules.
  * Canvas.js - this deals with the elements on the canvas, the actor and its primary token for the scene plus the secondary tokens for dropped and spell light sources.
  * Hud.js - this handles the interaction with the torch button and the light source buttons on the token HUD.

These all lived together comfortably while things were very simple, but the HUD is getting a bit bigger and the canvas is going to have to deal with a bit more variety. This is probably the minimum amount of modularization needed to keep things sensible. 

As we perform this initial refactoring, we may discover some things. Here are a couple we might anticipate: 
  * we might have to split the actor piece, which manages all the available light sources (including consumption), from its primary token, which holds all the state for this module
  * we might have to separate the light sources out individually but I'm hoping we can keep treating the light sources as data and not code.

### Round 0 - Choosing

We have three sources we support right now. The user is currently stuck with a hierarchy based on what they have:
* Dancing Lights if they have it.
* Light if they have it.
* Torch if they have it.

The goal of this round is to enhance the HUD to let the user select, among the light sources that they have, which one they want to use when they click the torch button.

#### Step 1 - Light source information

A method providing the character's light sources:
* A list of the light sources the user has - for each:
  - item name
  - type (spell or equipment), 
  - inventory (quantity or slots, -1 for unlimited)
  - its icon.
* The list should be arranged in the following order:
  - Unlimited equipment
  - Unlimited spells
  - Limited equipment with inventory
  - Limited spells with inventory
  - Limited equipment out of inventory (slash across)
  - Limited spells out of inventory (slash across)
  - Alphabetical order within each of the above categories
  
#### Step 2 - The light source menu itself

A menu so the user can select which light source to use:
* We need a horizontal menu of icon buttons 
  * Each item will appear as an icon of the same dimensions as the flame icon.
  * Each item will have a tooltip with the name of the item.
* The menu will receive the list of light sources and the index of the currently selected one.
* Icons will be displayed in the delivered order, from right to left.
* If a light source has been selected, the icon for that light source is outlined in red.
* When the user clicks on one of the items, the menu delivers the index of the item selected.

#### Step 3 - Basic HUD dynamics for the menu

* When the user right clicks on the flame icon, the menu must extend to the left of the flame icon. 
  * Consider a brief transition for the rollout.
* When the user clicks one of the items in the menu, the menu rolls back into the flame icon.
  * Consider a corresponding transition for the rollback.

#### Step 4 - Application support

* Necessary application state:
  * The identity of the currently selected light source
  * The activity state of the current light source (lit or not)
  * The light level of the player token involved when no light is lit - collected just before lighting a source, restored when extinguishing it.
* Upon opening the HUD, if no light source has been selected, the application defaults to the first item in the list, which should be the least costly one to use.
* When the user right-clicks the flame icon, _if no light source is currently active_, the HUD displays the light source menu.
* When the user selects a light source, the light source they chose becomes the selected light source.
* If that light source is out of inventory, it appears with a slash through it and cannot be lit.

#### System design considerations

* Since we are setting up the HUD to only allow one active light source at a time, we can take certain liberties:
  * We don't need to keep the active light source separate from the selected light source.
  * For placed light sources, we only need to worry about extinguishing one kind.
* It would be useful to have a more positive indicator of light source status than inferring it from the "old" light level. 
  * This will allow for multi-state light sources (like the Hooded Lantern) in the future.
* Candles, Torches, and similar devices remain in inventory until extinguished.
* Spell slots are expended as soon as the spell is cast. 

#### Responding to external change
We cannot treat the light sources as a closed system - we must respond to external changes from the environment.
* Anticipated types of external change:
  * Inventory exhaustion for other reasons - giving away torches, casting other spells of the same level.
  * Removal of items from an actor
  * Deletion of an actor's token and creation of a new one.

* To mitigate these:
  * The ability to extinguish a lit light source should be unaffected by the presence or condition of the light source in the actor's data. 
    * If present, equipment inventories should still be adjusted appropriately. 
    * The slash should still appear upon extinguishment if light source remains and the inventory is reduced to zero.
  * Any active light source that "disappears" should immediately become unlit at the earliest convenient opportunity.
    * It would be good if this happened before the HUD is reopened, so we may need an event notification.
    * In addition, an available light source should be selected.
  * Light sources will need to survive replacement of the primary token for an actor in the scene.
    * Initially this will only affect Dancing Lights, but it will soon have company
    * Since the actor remains the same, the current mechanism of deleting tokens named for the light source belonging to the same actor as the current primary token should work fine.

### Round 1 - Choices

Round 1 should just involve adding new light sources to the mix - Candle, Lamp, Produce Flame, Hooded without the hood. Hopefully, it will deliver some of what people are looking for without much more code to test. 

### Round 2 - The 'Hood

Round 2 should add the third lighting state to the hooded lantern.

### Round 3 - "I pick things up, I put things down"

Round 3 should provide the UI for putting down and picking up light sources and casting placed spells other than Dancing Lights. Placed light sources get their own token. 

[Further design TBD]

### Round 4 - Cast Party

Round 4 should deal with the intricacies of spells cast at consumable levels, i.e. other than cantrips. If possible, we should piggyback on existing casting mechanics. For the user, this will add light sources from Continual Flame and Daylight.

[Further design very much TBD]


 