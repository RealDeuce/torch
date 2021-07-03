# Test Environment for Foundry Modules

## Setup

1. Create a base directory for testing Foundry modules, like ~/FoundryModTest
2. Copy the contents of this directory into it.
3. Download the Linux/Node zips for all the versions of FoundryVTT you want to test with
4. Extract them to subdirectory trees of the same name in the base directory.
5. Edit start.bat and/or start.sh to reflect the Foundry VTT versions you're testing with.
  - The version that is invoked when you don't supply a parameter should be the current shipping version
```
if "%1"=="" SET VTTVER=foundryvtt-0.8.8
if "%1"=="7" SET VTTVER=foundryvtt-0.8.8
if "%1"=="8" SET VTTVER=foundryvtt-0.7.10
```
For each version of Foundry you'll be testing with, run it once to configure Foundry:

1. Start Foundry using the supplied vttstart script "vttstart 8", "vttstart 7", etc.
2. Connect to the site on port 31000
3. Supply your license key and accept the license.
4. In Configuration: 
  * Give it a unique port number.
    * Because it's easy to remember, I use 31000 + the major foundry version: 31007, 31008, 31009.
  * Set your admin password.
  * Save your configuration. 
    * When you do, your server will stop.

For each version of Foundry you'll be testing with, set it up for testing:

1. Restart the server using vttstart.
2. Connect to the site on the port you assigned.
3. Install the test worlds. You should be prompted to install the systems and modules required by the world.
    * For Torch:
      * Worlds: `torch-test-simple` and `torch-test-dnd5e`
      * Systems: `DnD5e` and `Simple Worldbuilding System`
      * Module: `Translation: Spanish \[Core]`

You should be ready to test. 

## Testing in the test worlds - Torch

For each test, log the desired player in to control the desired actor. Some tests require one browser with a gamemaster and one browser with a player.

Each world has one player named for each level of trust:
* Gamemaster
* Player
* Trusted
* Assistant

Each world has two scenes, a primary scene for most of the testing, and a secondary scene so that the gamemaster and the player can be in separate scenes (matters for some tests):

* Ballroom - preset with all characters there
* Kitchen - no characters

The following actors should be sufficient for all the tests without further configuration. You may need to adjust the quantity of torches from time to time as they are consumed.

* Solo (Simple: just a character)
* Empty (DnD5e: no spells, no items)
* Torchbearer (DND5e: just a Torch)
* Pony (DnD5e: just a Light cantrip)
* Dancer (DnD5e: just a Dancing Lights cantrip)
* Caster (DnD5e: both Light and Dancing Lights cantrips)
* Backup (DnD5e: both Light cantrip and a Torch)
* Versatile (DnD5e: both cantrips and a Torch)
* Bic (DnD5e: has spells and a candle, but neither supported cantrip nor a torch)

## Adapting technique to other modules
* Build and zip a world for each system you support. 
* Edit the world.json file to add dependencies for all modules the world depends upon.
* Include a dependency on the core translation for at least one language that your module supports.
  * Most modules will have a mix of translations drawn from core and their own translations.
  * Glancing at settings in that language will identify any new strings added that will need internationalization (using strings instead of literals in the code) or localization. 
  * If you wish, you can install the core translations for *all* the languages you support.
  * However, comparison of strings files against the language you do the glance is often enough.
* Include in the world all scenes, players, and actors you will need for any test in that system. 
  * Include enough players for all relevant privilege levels and interactions needed for testing. This will probably include, at a minimum, one actor for each privilege level, but may need more. Name them so you can remember what they are.
  * Include enough actors to have all relevant combinations (classes, items, spells, etc.) preconfigured in individual actors, named so you can pick them easily. It is a waste of time to bling them up more than you need to identify them easily in the scene.
  * Unless it directly impacts testing, configure each actor with all players as owner, so you can test all your scenarios without reconfiguring their relationships.
  * Place all actors in the scenes in which they will be tested. I usually draw marks in the scene for where particular actors should initially stand with regard to walls, etc. That way if you need to move them for a particular test, you can move them back consistently.
* If you do it this way, executing most of your test scenarios will involve:
  * Adjusting the configuration of the module and perhaps the core language.
  * Controlling the right actor as the right player and walking it through its paces.
  * There will be very little to reset at the end of the test, so you can flow from test to test quickly.
* Keep the zip and the world.json in your source control under a directory named for the world. For Torch, I keep these and the testcases checklist in the test directory.