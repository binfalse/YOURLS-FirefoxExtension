# YOURLS Firefox extension

This is an extension for Mozilla's Firefox to interact with the open source [URL shortener Yourls](http://yourls.org/).
This page is just a stub and just contains a few screenshots. You will find [more information on the plugin's website](https://binfalse.de/software/browser-extensions/yourls-firefox-webextension/).

## Key features

* passwordless authentication
* provide a keyword for the short URL
* selected text on the web page to use it as keyword
* automatically copy the resulting short URL to your clipboard


## Required Permissions

* *Access data for all web sites:* The extension needs access to the current website to get the URL and potentially selected text (for keyword suggestions), and the extension needs to access any other URL to communicated with private YOURLS instances.
* *Input data to the clipboard:* The extension is able to copy the shortened URL to clipboard (can be configured in the extension's preferences) 

## UI Integration

### A toolbar button to shorten the current web page

![toolbar button of the YOURLS shortener](https://binfalse.de/assets/media/pics/2017/yourls-firefox/popup.png)

### Selected text automatically becomes a keyword

![select text for the YOURLS shortener](https://binfalse.de/assets/media/pics/2017/yourls-firefox/selection.png)

### Shorten link targets

![shorten link targets using the YOURLS shortener](https://binfalse.de/assets/media/pics/2017/yourls-firefox/link.png)


## Preferences

![Preferences of the YOURLS shortener](https://binfalse.de/assets/media/pics/2017/yourls-firefox/preferences.png)


## License

    Copyright 2011-2017  Martin Scharm
    
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.


