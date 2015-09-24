# Client for Simple Location Project

**This project is ABANDONED! It isn't translated into English, it has a lot of serious problems (see end of this document and [issues](https://github.com/slproject/client/issues)) and will be [rewritten from scratch](https://github.com/yiinsanedevs/location-beast-client).**

This is a mobile client for my Simple Location Project, written in PhoneGap 2.9.0. It uses [Font Awesome](http://fontawesome.io/icons/), [Zepto.js](http://zeptojs.com/) and various number of other small Javascript libraries.

## Usage

1. Get the newest version of the source code:
    - [fork](https://github.com/slproject/client/fork) this repository,
    - clone this repository locally,
    - [download](https://github.com/slproject/client/archive/master.zip) `master` branch as `.zip` file.
2. Change settings in `assets/app.js` to match [your server's settings](https://github.com/slproject/server) (see below).
3. Upload modified code to PhoneGap Build (see below notice) and compile to desired platforms or build it locally.
4. Install compiled mobile application on selected device, start it and enjoy.

You, of course, have to have [server for this project](https://github.com/slproject/server) installed and working or else everything will fail.

Before recompiling this code in PhoneGap Build or before building it locally, you have to edit `assets/app.js` and change `configuration.server.ip` and `configuration.server.path` settings to match your server's settings (so the mobile client would know, where to push data).

## Tests

Mobile client for Simple Location Project has been tested on four different devices and Android versions:

- Samsung Galaxy Nexus with Android 4.3 (previously Android 4.2.2),
- LG GT540 with Android 2.3.3 and CyanogenMod, 
- GSmart Rola G1317D with Android 2.2.2,
- Sony Xperia E with Android 4.1.1.

All seems to be fine on all platforms and all devices.

Tested **only** as compiled through [PhoneGap Build](http://build.phonegap.com). Never compiled locally or tested after such build.

## Project is really bad!

It lacks some certain functionality and has some smaller or bigger bugs:

1. There is completely no support for user credentials / logging in. Client, once started, throws all the location data directly to [server](https://github.com/slproject/server) and server itself distinguishes clients by analysing UUID only.

2. Filtering methods on server side are very poor, causing an enormous amount of data being pushed back to the browser and resulting in timeouts or server resources being exhausted on quite large tracks (few thousands of points / seconds).

3. There is absolutely no data preparation done at server side. All points and entire dataset is pushed to browser and all the track drawing or stats calculating routines are made there, using Javascript. This causes entire solution to be awfully slow.

Unfortunately, all these nasty things are placed so deeply in core code of both client and server, that to fix it, entire project would actually have to be [rewritten from scratch](https://github.com/yiinsanedevs/location-beast-client). That is, why you should treat this project just as a toy, a funny experiment or an introduction to writing your own solution. You shouldn't **absolutely** use it in production environment or for any kind of serious location or tracking issues.
