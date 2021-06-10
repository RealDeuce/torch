# Torch module for Foundry VTT

This module provides a HUD toggle button for turning on and off a configurable radius of bright and dim light around you. This base function works regardless of game system. 

Additionally, in D&D5e only:
*  The single HUD control will trigger the 'Dancing Lights' cantrip if you have it.
*  Failing that, it will perforrm the 'Light' cantrip if you have that.
*  Failing that, if you have torches, it consumes one, decrementing the quantity on each use.
*  The button will show as disabled when you turn on the HUD if you have no torches left. (It doesn't currently disable the button while the HUD remains open, though, after you have extinguished your last remaining torch. Room for improvement.)

## History

This module was originally written by @Deuce. After several months of no activity, @lupestro eventually submitted the PR to get its features working reliably in FoundryVTT 0.8. After control transferred to the League, the PR was approved. The module is now somewhat actively maintained by @lupestro.

## Changelog

This has needed to be pieced together a bit, but here's what I've gleaned from the GIT history.

* 1.2.1 - June 11, 2021 - (Lupestro) Cleaned up console logging noise I had created
* 1.2.0 - June 10, 2021 - (Lupestro) Updated for 0.8.6, but ensured it still functions in 0.7.x.
* 1.1.4 - October 21, 2020 - (Stephen Hurd) Marked as 0.7.5 compatible.
* 1.1.3 - October 18, 2020 - (Stephen Hurd) Fix spelling.
* 1.1.2 - October 18, 2020 - (Stephen Hurd) Fix JSON syntax.
* 1.1.1 - October 18, 2020 - (Stephen Hurd) Name adjustment.
* 1.1.0 - October 18, 2020 - (Jose E Lozano) Add Spanish, (Stephen Hurd) Fix bright/dim radius of Dancing Lights.
* 1.0.9 - May 28, 2020 - (Stephen Hurd) Marked as 0.6.0 compatible.
* 1.0.8 - May 19, 2020 - (Aymeric DeMoura) Add French, Marked as 0.5.8 compatible.
* 1.0.7 - April 29, 2020 - (Stephen Hurd) Add Chinese, fix torch inventory usage.
* 1.0.6 - April 18, 2020 - (Stephen Hurd) Fix dancing lights removal.
* 1.0.5 - April 18, 2020 - (Stephen Hurd) Remove socket code for dancing lights removal.
* 1.0.4 - April 18, 2020 - (Stephen Hurd) Update to mark as 0.5.4 compatible.
* 1.0.3 - April 15, 2020 - (MtnTiger) - Updated with API changes.
* 1.0.2 - January 22, 2020 - (Stephen Hurd) Update for 0.4.4.
* 1.0.1 - November 26, 2019 - (Stephen Hurd) - Use await on all promises.
* 1.0.0 - November 25, 2019 - (Stephen Hurd) - Add support for Dancing Lights.

## License

 "THE BEER-WARE LICENSE" (Revision 42): (From torch.js in this module)
 
 <shurd@FreeBSD.ORG> wrote this file.  As long as you retain this notice you can do whatever you want with this stuff. If we meet some day, and you think this stuff is worth it, you can buy me a beer in return.        Stephen Hurd
