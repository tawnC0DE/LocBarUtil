# Purpose
This is a web extension experiment add-on for Firefox created to save the results of a urlbar query. Basically it's a workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=1673588 which seems unlikely to be fixed anytime soon. It saves the query results as bookmarks (temporarily; they get overwritten with the next save) so the user can then open as many as desired.

# Installation

## Prerequisites
Webext experiments only work in Developer Edition or Nightly versions of Firefox and xpinstall.signatures.required must be set to false in about:config to install it for normal use (in order to survive restart of Firefox).


## Installing
Download the code as a zip file (On the Code tab, Click 'Code' button then click 'Download ZIP'). Change file extension to .xpi. Open the Firefox Add-ons Manager, click the gear icon, choose 'Install add-on from file...' and choose the downloaded file.

# Usage
Currently you need to first create a folder named LocBar to store resulting bookmarks (anywhere in your bookmarks tree you deem convenient, e.g. on the Bookmarks Toolbar). There must be one and only one folder by this name.

While I have occasionally used this (in various versions) myself for quite some time, it has not been widely tested, and should be considered beta quality.

When typing into the urlbar, if you want to open more than one result's link, click the toolbar button to save the results to the folder named LocBar. Then open as many as desired via normal bookmark methods.
