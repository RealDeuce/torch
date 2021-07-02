# Test Scenarios
## Non DnD5e

### General behavior - 

*  GM activates and deactivates torch
	* When:
		- [ ] Light Radius settings are default (20 units/ 40 units, 0 units/0 units)
		- [ ] Player Torches setting are unchecked
		- [ ] Joined as GM
		- [ ] Token HUD is open in scene
		- [ ] Torch button is not activated
	* Do: GM clicks torch button on token HUD
	* Expect:
		- [ ] Torch button icon shows active status - orange border
		- [ ] Light radii change to the “on” levels
	*  Do: GM clicks torch button again on token HUD
	* Expect:
		- [ ] Torch button icon shows inactive status - no border
		- [ ] Light radii change to the “off” levels
	* Variant - same actions and expectations
		- [ ] Player Torches setting is checked
	* Variant - same actions and expectations
		- [ ] Joined as player
		- [ ] Player Torches setting is checked
* Player has no access when disallowed
	* When:
		- [ ] Light Radius settings are default (20 units/ 40 units, 0 units/0 units)
		- [ ] Player Torches setting is unchecked
		- [ ] Torch is not activated
		- [ ] Joined as player
		- [ ] Token HUD is open in scene
	* Expect:
		- [ ] Torch button does not appear
		- [ ] Torch shows inactive light radii
	* Variant:
		- [ ] Torch is already activated
	* Expect:
		- [ ] Torch button does not appear
		- [ ] Torch shows active light radii
### Radius Settings
*  Torch light radii are faithful to configured settings
	* When:
		- [ ] Light radius settings are configured to (15 units/ 10 units, 10 units/5 units)
		- [ ] Player torches setting is checked
		- [ ] Joined as GM
		- [ ] Token HUD is open in scene
		- [ ] button is not activated
	* Do: GM clicks torch button on token HUD
	* Expect:
		- [ ] Light radii change to the configured “on” levels
	*  Do: GM clicks torch button again on token HUD
	* Expect:
		- [ ] Light radii change to the configured “off” levels
    * Variant - same actions and expectations
        - [ ] Player torches setting is not checked
    * Variant - same actions and expectations
		- [ ] Player torches setting is checked
		- [ ] Joined as player
## DnD5e

### Token with No Torches, No Cantrips

*  Player aattempts to activate torch on Token
	* When:
		- [ ] Light Radius settings are default (20 units/ 40 units, 0 units/0 units)
		- [ ] Player Torches setting are checked
		- [ ] Joined as Player
		- [ ] Token HUD is open in scene
		- [ ] Torch button is not activated
    * Expect:
        - [ ] Torch button icon shows disabled status - orange slash through it
	* Do: Player clicks torch button on token HUD
	* Expect:
        - [ ] Nothing happens

*  GM aattempts to activate torch on Token
	* When:
		- [ ] Light Radius settings are default (20 units/ 40 units, 0 units/0 units)
		- [ ] Player Torches setting are checked
		- [ ] Joined as GM
		- [ ] Token HUD is open in scene
		- [ ] Torch button is not activated
    * Expect:
        - [ ] Torch button icon shows is available to click
	* Do: GM clicks torch button on token HUD
	* Expect:
		- [ ] Torch button icon shows active status - orange border
		- [ ] Light radii change to the “on” levels
	*  Do: GM clicks torch button again on token HUD
	* Expect:
		- [ ] Torch button icon shows inactive status - no border
		- [ ] Light radii change to the “off” levels
### Token With Torch only

### Token With Light cantrip only

### Token With Dancing Lights cantrip only

### Token With multiple light sources
