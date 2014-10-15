# Client for Simple Location Project

**WARNING! Works on this project are in progress. Do not clone it, until this message is removed or until you're ready to finish it yourself. At this point it is pretty unusable at all! It isn't even translated to English yet. See [Issues](https://github.com/trejder/slp-client/issues) for details and progress.**

This is a mobile client for my Simple Location Project, written in PhoneGap 2.9.0. It uses [Font Awesome](http://fontawesome.io/icons/), [Zepto.js](http://zeptojs.com/) and various number of other small Javascript libraries.

Upon finishing, this project will most likely be abandoned, as it lacks some certain functionality and has some small or bigger bugs or missings. The biggest one is, that it completely has no support for user credentials.

## Usage

1. Get the newest version of the source code:
    - fork this repository,
    - clone this repository locally,
    - [download `master` branch as `.zip` file](https://github.com/trejder/slp-client/archive/master.zip).
2. Edit `assets/app.js` and change `configuration.server.ip` and `configuration.server.path` to match your [server](https://github.com/trejder/slp-server).
3. Upload modified code to PhoneGap Build (see below notice) and compile to desired platforms.
4. Install compiled mobile application on selected device, start it and enjoy.

You, of course, have to have [server for this project](https://github.com/trejder/slp-server) installed and working or else everything will fail.

If you login to PhoneGap Build using your GitHub account, then forking is the best option, as you should see code directly in your [Apps](https://build.phonegap.com/apps) page of PGB, ready to be compiled. But, you have to edit your fork and change [server](https://github.com/trejder/slp-server)'s IP address.

## Tests

Mobile client for Simple Location Project has been tested on four different devices and Android versions:

- Samsung Galaxy Nexus with Android 4.3 (previously Android 4.2.2),
- LG GT540 with Android 2.3.3 and CyanogenMod, 
- GSmart Rola G1317D with Android 2.2.2,
- Sony Xperia E with Android 4.1.1.

All seems to be fine on all platforms and all devices.

Tested **only** as compiled through [PhoneGap Build](http://build.phonegap.com). Never compiled locally or tested after such build.