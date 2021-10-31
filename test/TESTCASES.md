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

*  Player attempts to activate torch on Token
	* When:
		- [ ] Light Radius settings are default (20 units/ 40 units, 0 units/0 units)
		- [ ] Player Torches setting are checked
		- [ ] Joined as Player
		- [ ] Token HUD is open in scene
		- [ ] Torch button is not activated
    * Expect:
        - [ ] Torch button does not appear

*  GM attempts to activate torch on Token
	* When:
		- [ ] Light Radius settings are default (20 units/ 40 units, 0 units/0 units)
		- [ ] Player Torches setting is checked
		- [ ] GM Uses Inventory is checked
		- [ ] Joined as GM
		- [ ] Token HUD is open in scene
		- [ ] Torch button is not activated
    * Expect:
        - [ ] Torch button icon shows as available to click
	* Do: GM clicks torch button on token HUD
	* Expect:
		- [ ] Torch button icon shows active status - orange border
		- [ ] Light radii change to the “on” levels
		- [ ] The quantity of any resources are not changed by the action
	*  Do: GM clicks torch button again on token HUD
	* Expect:
		- [ ] Torch button icon shows inactive status - no border
		- [ ] Light radii change to the “off” levels
		- [ ] The quantity of any resources are not changed by the action
	* Variant: Player Torches settings are *not* checked
	    - [ ] The GM can still operate the light source
		- [ ] The quantity of any resources are not changed by the action
    * Variant: GM Uses Inventory is not checked
		- [ ] The GM can still operate the light source
		- [ ] The quantity of any resources are not changed by the action

### Token With Torch only

*  Player aattempts to activate torch on Token
	* When:
		- [ ] Light Radius settings are default (20 units/ 40 units, 0 units/0 units)
		- [ ] Player Torches setting is checked
		- [ ] GM Uses Inventory is checked
		- [ ] Joined as Player
		- [ ] Token HUD is open in scene
		- [ ] Torch button is not activated
		- [ ] Actor sheet is open and the quantity of torches is visible
    * Expect:
        - [ ] Torch button icon shows as available to click
	* Do: Player clicks torch button on token HUD
	* Expect:
		- [ ] Torch button icon shows active status - orange border
		- [ ] Light radii change to the “on” levels
		- [ ] The quantity of torches decreases by one
	* Do: Player clicks torch button on token HUD again
	* Expect:
		- [ ] Torch button icon shows inactive status - no border
		- [ ] Light radii change to the “off” levels
		- [ ] The quantity of torches remains unchanged
	* Variant: GM Uses Inventory is *not* checked
		   - [ ] Setting has no impact on player's comsumption of torches 

*  GM attempts to activate torch on Token
	* When:
		- [ ] Light Radius settings are default (20 units/ 40 units, 0 units/0 units)
		- [ ] Player Torches setting is checked
		- [ ] GM Uses Inventory is checked
		- [ ] Joined as GM
		- [ ] Token HUD is open in scene
		- [ ] Torch button is not activated
		- [ ] Actor sheet is open and the quantity of torches is visible
    * Expect:
        - [ ] Torch button icon shows as available to click
	* Do: GM clicks torch button on token HUD
	* Expect:
		- [ ] Torch button icon shows active status - orange border
		- [ ] Light radii change to the “on” levels
		- [ ] The quantity of torches decreases by one
	* Do: GM clicks torch button on token HUD again
	* Expect:
		- [ ] Torch button icon shows inactive status - no border
		- [ ] Light radii change to the “off” levels
		- [ ] The quantity of torches remains unchanged
	* Variant: GM Uses Inventory is *not* checked
	* Expect: 
	    - [ ] Clicking button does not affect the quantity of torches
    * Variant: Player Torches setting is *not* checked
	* Expect:
	   - [ ] Setting has no impact on GM's ability to consume torches 
### Token With Light cantrip only
*  Player attempts to activate torch on Token
	* When:
		- [ ] Light Radius settings are default (20 units/ 40 units, 0 units/0 units)
		- [ ] Player Torches setting are checked
		- [ ] GM Uses Inventory is checked
		- [ ] Joined as GM
		- [ ] Token HUD is open in scene
		- [ ] Torch button is not activated
    * Expect:
        - [ ] Torch button icon shows as available to click
	* Do: Player clicks torch button on token HUD
	* Expect:
		- [ ] Torch button icon shows active status - orange border
		- [ ] Light radii change to the “on” levels
		- [ ] The quantity of any resources are not changed by the action
	*  Do: Player clicks torch button again on token HUD
	* Expect:
		- [ ] Torch button icon shows inactive status - no border
		- [ ] Light radii change to the “off” levels
		- [ ] The quantity of any resources are not changed by the action
	* Variant: Player Torches settings are *not* checked
	    - [ ] The GM can still operate the light source
		- [ ] The quantity of any resources are not changed by the action
    * Variant: GM Uses Inventory is not checked
		- [ ] The GM can still operate the light source
		- [ ] The quantity of any resources are not changed by the action
*  GM aattempts to activate torch on Token
	* When:
		- [ ] Light Radius settings are default (20 units/ 40 units, 0 units/0 units)
		- [ ] Player Torches setting are checked
		- [ ] GM Uses Inventory is checked
		- [ ] Joined as GM
		- [ ] Token HUD is open in scene
		- [ ] Torch button is not activated
    * Expect:
        - [ ] Torch button icon shows as available to click
	* Do: GM clicks torch button on token HUD
	* Expect:
		- [ ] Torch button icon shows active status - orange border
		- [ ] Light radii change to the “on” levels
		- [ ] The quantity of any resources are not changed by the action
	*  Do: GM clicks torch button again on token HUD
	* Expect:
		- [ ] Torch button icon shows inactive status - no border
		- [ ] Light radii change to the “off” levels
		- [ ] The quantity of any resources are not changed by the action
	* Variant: Player Torches settings are *not* checked
	    - [ ] The GM can still operate the light source
		- [ ] The quantity of any resources are not changed by the action
    * Variant: GM Uses Inventory is not checked
		- [ ] The GM can still operate the light source
		- [ ] The quantity of any resources are not changed by the action

### Token With Dancing Lights cantrip only
*  Player attempts to activate torch on Token
	* When:
		- [ ] Light Radius settings are default (20 units/ 40 units, 0 units/0 units)
		- [ ] Player Torches setting are checked
		- [ ] GM Uses Inventory is checked
		- [ ] Joined as GM
		- [ ] Token HUD is open in scene
		- [ ] Torch button is not activated
		- [ ] Fog is reset
    * Expect:
        - [ ] Torch button icon shows as available to click
	* Do: Player clicks torch button on token HUD
	* Expect:
	    - [ ] Four small Light tokens appear at the corners of the actor token
		- [ ] Torch button icon shows active status - orange border
		- [ ] Light radii of tokens take the defined levels for a Dancing lights spell (0 units/10 units)
		- [ ] The quantity of any resources are not changed by the action
	*  Do: Player moves small light tokens into the fog
	    - [ ] Their light radii should clearly show
	*  Do: Player clicks torch button again on token HUD
	* Expect:
	    - [ ] The Four small Light tokens are removed
		- [ ] Torch button icon shows inactive status - no border
		- [ ] Light radii change to the “off” levels
		- [ ] The quantity of any resources are not changed by the action
	* Variant: Player Torches settings are *not* checked
	    - [ ] The GM can still operate the light source
		- [ ] The quantity of any resources are not changed by the action
    * Variant: GM Uses Inventory is not checked
		- [ ] The GM can still operate the light source
		- [ ] The quantity of any resources are not changed by the action
*  GM attempts to activate torch on Token
	* When:
		- [ ] Light Radius settings are default (20 units/ 40 units, 0 units/0 units)
		- [ ] Player Torches setting are checked
		- [ ] GM Uses Inventory is checked
		- [ ] Joined as GM
		- [ ] Token HUD is open in scene
		- [ ] Torch button is not activated
		- [ ] Fog is reset
    * Expect:
        - [ ] Torch button icon shows as available to click
	* Do: GM clicks torch button on token HUD
	* Expect:
	    - [ ] Four small Light tokens appear at the corners of the actor token
		- [ ] Torch button icon shows active status - orange border
		- [ ] Light radii of tokens take the defined levels for a Dancing lights spell (0 units/10 units)
		- [ ] The quantity of any resources are not changed by the action
	* Do: GM moves small light tokens into the fog
	    - [ ] Their light radii should clearly show
	* Do: GM clicks torch button again on token HUD
	* Expect:
	    - [ ] The Four small Light tokens are removed
		- [ ] Torch button icon shows inactive status - no border
		- [ ] Light radii change to the “off” levels
		- [ ] The quantity of any resources are not changed by the action
	* Variant: Player Torches settings are *not* checked
	    - [ ] The GM can still operate the light source
		- [ ] The quantity of any resources are not changed by the action
    * Variant: GM Uses Inventory is not checked
		- [ ] The GM can still operate the light source
		- [ ] The quantity of any resources are not changed by the action

### Token With torches and Light cantrip - cantrip takes precedence
*  Player attempts to activate torch on Token
	* When:
		- [ ] Light Radius settings are default (20 units/ 40 units, 0 units/0 units)
		- [ ] Player Torches setting are checked
		- [ ] GM Uses Inventory is checked
		- [ ] Joined as GM
		- [ ] Token HUD is open in scene
		- [ ] Torch button is not activated
    * Expect:
        - [ ] Torch button icon shows as available to click
	* Do: Player clicks torch button on token HUD
	* Expect:
		- [ ] Torch button icon shows active status - orange border
		- [ ] Light radii change to the “on” levels
		- [ ] The quantity of any resources are not changed by the action
	*  Do: Player clicks torch button again on token HUD
	* Expect:
		- [ ] Torch button icon shows inactive status - no border
		- [ ] Light radii change to the “off” levels
		- [ ] The quantity of any resources are not changed by the action
	* Variant: Player Torches settings are *not* checked
	    - [ ] The GM can still operate the light source
		- [ ] The quantity of any resources are not changed by the action
    * Variant: GM Uses Inventory is not checked
		- [ ] The GM can still operate the light source
		- [ ] The quantity of any resources are not changed by the action
*  GM aattempts to activate torch on Token
	* When:
		- [ ] Light Radius settings are default (20 units/ 40 units, 0 units/0 units)
		- [ ] Player Torches setting are checked
		- [ ] GM Uses Inventory is checked
		- [ ] Joined as GM
		- [ ] Token HUD is open in scene
		- [ ] Torch button is not activated
    * Expect:
        - [ ] Torch button icon shows as available to click
	* Do: GM clicks torch button on token HUD
	* Expect:
		- [ ] Torch button icon shows active status - orange border
		- [ ] Light radii change to the “on” levels
		- [ ] The quantity of any resources are not changed by the action
	*  Do: GM clicks torch button again on token HUD
	* Expect:
		- [ ] Torch button icon shows inactive status - no border
		- [ ] Light radii change to the “off” levels
		- [ ] The quantity of any resources are not changed by the action
	* Variant: Player Torches settings are *not* checked
	    - [ ] The GM can still operate the light source
		- [ ] The quantity of any resources are not changed by the action
    * Variant: GM Uses Inventory is not checked
		- [ ] The GM can still operate the light source
		- [ ] The quantity of any resources are not changed by the action

### Token With Light and Dancing Lights cantrips - Dancing Lights takes precedence
*  Player attempts to activate torch on Token
	* When:
		- [ ] Light Radius settings are default (20 units/ 40 units, 0 units/0 units)
		- [ ] Player Torches setting are checked
		- [ ] GM Uses Inventory is checked
		- [ ] Joined as GM
		- [ ] Token HUD is open in scene
		- [ ] Torch button is not activated
		- [ ] Fog is reset
    * Expect:
        - [ ] Torch button icon shows as available to click
	* Do: Player clicks torch button on token HUD
	* Expect:
	    - [ ] Four small Light tokens appear at the corners of the actor token
		- [ ] Torch button icon shows active status - orange border
		- [ ] Light radii of tokens take the defined levels for a Dancing lights spell (0 units/10 units)
		- [ ] The quantity of any resources are not changed by the action
	*  Do: Player moves small light tokens into the fog
	    - [ ] Their light radii should clearly show
	*  Do: Player clicks torch button again on token HUD
	* Expect:
	    - [ ] The Four small Light tokens are removed
		- [ ] Torch button icon shows inactive status - no border
		- [ ] Light radii change to the “off” levels
		- [ ] The quantity of any resources are not changed by the action
	* Variant: Player Torches settings are *not* checked
	    - [ ] The GM can still operate the light source
		- [ ] The quantity of any resources are not changed by the action
    * Variant: GM Uses Inventory is not checked
		- [ ] The GM can still operate the light source
		- [ ] The quantity of any resources are not changed by the action
*  GM attempts to activate torch on Token
	* When:
		- [ ] Light Radius settings are default (20 units/ 40 units, 0 units/0 units)
		- [ ] Player Torches setting are checked
		- [ ] GM Uses Inventory is checked
		- [ ] Joined as GM
		- [ ] Token HUD is open in scene
		- [ ] Torch button is not activated
		- [ ] Fog is reset
    * Expect:
        - [ ] Torch button icon shows as available to click
	* Do: GM clicks torch button on token HUD
	* Expect:
	    - [ ] Four small Light tokens appear at the corners of the actor token
		- [ ] Torch button icon shows active status - orange border
		- [ ] Light radii of tokens take the defined levels for a Dancing lights spell (0 units/10 units)
		- [ ] The quantity of any resources are not changed by the action
	* Do: GM moves small light tokens into the fog
	    - [ ] Their light radii should clearly show
	* Do: GM clicks torch button again on token HUD
	* Expect:
	    - [ ] The Four small Light tokens are removed
		- [ ] Torch button icon shows inactive status - no border
		- [ ] Light radii change to the “off” levels
		- [ ] The quantity of any resources are not changed by the action
	* Variant: Player Torches settings are *not* checked
	    - [ ] The GM can still operate the light source
		- [ ] The quantity of any resources are not changed by the action
    * Variant: GM Uses Inventory is not checked
		- [ ] The GM can still operate the light source
		- [ ] The quantity of any resources are not changed by the action

## Cases needing specification 
* DnD5e: Player lacks authority to create Dancing Lights tokens
  * GM on same scene
  * GM on different scene
* DnD5e and Simple: Player lacks authority to modify token properties but Player Tokens is checked
  * GM on same scene
  * GM on different scene

## Cases needing clarification
* If a player lacks the permission to modify token settings, how are the light values on the token successfully getting modified when the player clicks the button?
