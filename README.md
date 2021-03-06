# TamperMonkey-Scripts
Just a personal collection of ~~not very high quality~~ TamperMonkey scripts.

# A bit of introduction
[TamperMonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) is a Chrome extension to manage user scripts. After it's installed, every link ending with `.user.js` will be caught by the extension and user will be prompted to install the script.

To install one of the scripts listed on this page, just click the header, the rest will be done by the extension.

# Site scripts
Scripts that work on some particular site

## [`youtube.com` Quick Speed Button]
* Adds a button for changing playback speed;
  * Click or scroll over the element to change the speed;
  * Options allow to switch between default (0.25 — 2.00) and extended (0.07 — 16.00) speed ranges;
* Adds an extra panel showing current time and video duration;
  * Panel shows time considering current speed;
  * Move the cursor over the panel to show remaining time;
  * Click panel to toggle playing;
* Share, Save, and Dots buttons can be disabled in options;
* Extra hotkeys can be configured or disabled in options.

![](https://github.com/OddMorning/TamperMonkey-Scripts/blob/master/assets/%5Byoutube.com%5D%20Quick%20Speed%20Button.png)

## [`furaffinity.net` Control Panel Previews]
* Adds control panel previews for comments and faved pictures (for modern design only)

![](https://github.com/OddMorning/TamperMonkey-Scripts/blob/master/assets/%5Bfuraffinity.net%5D%20Control%20Panel%20Previews.png)

## [`avasdemon.com` Pages Counter]
* Adds a pages counter;
* Locks the "next" button and makes picture unclickable if there are no more pages left

![](https://github.com/OddMorning/TamperMonkey-Scripts/blob/master/assets/%5Bavasdemon.com%5D%20Pages%20Counter.png)


# Common scripts
Scripts that change logic of multiple sites

## [Responsive MMB Scroll]
* Hold MMB (Middle Mouse Button) and move cursor up and down to scroll pages quickly;
* Change scrolling speed in options;
* Inspired by [Everything](https://www.voidtools.com/) app.

#### Before and after:
![](https://github.com/OddMorning/TamperMonkey-Scripts/blob/master/assets/Responsive%20MMB%20Scroll%20-%20Before.gif) ==> ![](https://github.com/OddMorning/TamperMonkey-Scripts/blob/master/assets/Responsive%20MMB%20Scroll%20-%20After.gif)


# Libraries
Scripts to be `@require`'d by other scripts

## [MonkeyConfig Lite]
MonkeyConfig is a simple configuration library for user scripts. It allows easy creation of configuration dialog windows and takes care of storing and retrieving the configuration parameters for the script.

Inspired by [MonkeyConfig](https://github.com/odyniec/MonkeyConfig). Lite version has modern design and is compatible with the original script configs.

![](https://github.com/OddMorning/TamperMonkey-Scripts/blob/master/assets/MonkeyConfig%20Lite%20-%20Menu.png)
![](https://github.com/OddMorning/TamperMonkey-Scripts/blob/master/assets/MonkeyConfig%20Lite.png)

### Usage example
```js
// ==UserScript==
// <…>
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @require      https://.../monkeyconfig-lite.js
// ==/UserScript==
```
```js
const ConfigFromScreenshotAbove = new MonkeyConfig({
  title: 'Configure',
  params: {
    hide_buttons: {
      label: 'Hide "Share/Save/Dots" Buttons',
      type: 'checkbox',
      default: false,
    },
    enable_hotkeys: {
      label: 'Enable Hotkeys',
      type: 'checkbox',
      default: true,
    },
    speed_range: {
      label: 'Speed Range',
      type: 'select',
      choices: {
        extended: 'Extended (0.07 — 16.00)',
        default: 'Default (0.25 — 2.00)',
      },
      default: 'extended'
    },
  }
})

// Open/close panel manually
Config.open()
Config.close()

// Get/set options
Config.get('enable_hotkeys')
Config.set('speed_range', 'default')
```
```js
// All available params
const Config = new MonkeyConfig({
  title: 'Configure', // Menu title for extension's menu and panel's header
  menuCommand: false, // Don't create a button in the extension button menu
  params: {
    // Complete params
    text_field: {
      label: 'Text field',
      type: 'text',
      default: 'Default value',
    },
    number_field: {
      label: 'Number field',
      type: 'number',
      default: 15,
    },
    checkbox: {
      label: 'Checkbox',
      type: 'checkbox',
      default: true,
    },
    select_simple: {
      label: 'Choose one option',
      type: 'select',
      choices: ['default', 'extended'],
      default: 'extended',
    },
    select_advanced: {
      label: 'Choose one option',
      type: 'select',
      choices: {
        default: 'Default range',
        extended: 'Extended range',
      },
      default: 'extended',
    },
    
    // If "label" is omitted, it will be autogenerated 
    no_label_one: { // "No Label One"
      type: 'number',
      default: 1,
    },
    noLabelTwo: { // "No Label Two"
      type: 'number',
      default: 1,
    },

    // All unknown types fallback to "text"
    no_label_one: {
      type: 'what',
      default: 'Still text value',
    },

    // It's possible to omit all the props
    empty: {},
  }
})

```



[`youtube.com` Quick Speed Button]: https://github.com/OddMorning/TamperMonkey-Scripts/raw/master/scripts/site/%5Byoutube.com%5D%20Quick%20Speed%20Button.user.js
[`furaffinity.net` Control Panel Previews]: https://github.com/OddMorning/TamperMonkey-Scripts/raw/master/scripts/site/%5Bfuraffinity.net%5D%20Control%20Panel%20Previews.user.js
[`avasdemon.com` Pages Counter]: https://github.com/OddMorning/TamperMonkey-Scripts/raw/master/scripts/site/%5Bavasdemon.com%5D%20Pages%20Counter.user.js

[Responsive MMB Scroll]: https://github.com/OddMorning/TamperMonkey-Scripts/raw/master/scripts/common/Responsive%20MMB%20Scroll.user.js

[MonkeyConfig Lite]: https://github.com/OddMorning/TamperMonkey-Scripts/blob/master/scripts/lib/monkeyconfig-lite.js
