# Torch module for Foundry VTT

This module provides a HUD toggle button for turning on and off a configurable radius of bright and dim light around you. This base function works regardless of game system. 

Additionally, in D&D5e only:
*  The single HUD control will trigger the 'Dancing Lights' cantrip if you have it.
*  Failing that, it will perform the 'Light' cantrip if you have that.
*  Failing that, if you have torches, it consumes one, decrementing the quantity on each use.
*  The button will show as disabled when you turn on the HUD if you have no torches left. 

## Changelog - now in [separate file](./CHANGELOG.md)

## Translation Status

The following is the current status of translation. Some features have arrived, introducing new strings, since translations were last done.

| Language | Completion | Contributors |
| -------- | ---------- | ------------ |
| en    | `[##########]` 16/16 (100%) | deuce |
| zh-cn | `[#######---]` 12/16 (75%)  | xticime |
| es    | `[##########]` 14/16 (100%) | lozalojo |
| fr    | `[#########-]` 14/16 (87%)  | Aymeeric |
| pt-br | `[##########]` 16/16 (100%) | rinnocenti |
| zh-tw | `[##########]` 16/16 (100%) | zeteticl |

PRs for further translations will be dealt with promptly. While German, Japanese, and Korean are most especially desired - our translation story seems deeply incomplete without them - all others are welcome. 

It's only 16 strings so far, a satisfying afternoon, even for someone who's never committed to an open source project before, and your name will go into the readme right here next to the language. Fork, clone, update, _test locally_, commit, and then submit a PR. Holler for @lupestro on Discord if you need help getting started.

## History

This module was originally written by @Deuce. After it sustained several months of inactivity in 2021, @lupestro submitted a PR to get its features working reliably in FoundryVTT 0.8. Deuce agreed to transfer control to the League with @lupestro as maintainer, the changes were committed and a release was made from the League fork. All the PRs that were open at the time of the transfer are now committed and attention has turned to fulfilling some of the feature requests in a maintainable way while retaining the "one-button" character of the original module.

## License

 "THE BEER-WARE LICENSE" (Revision 42): (From torch.js in this module)
 
 <shurd@FreeBSD.ORG> wrote this file.  As long as you retain this notice you can do whatever you want with this stuff. If we meet some day, and you think this stuff is worth it, you can buy me a beer in return.        Stephen Hurd

(So I think we all owe Stephen a beer for making this thing.)