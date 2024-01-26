/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

function onStartup() {
  console.log("onStartup called");
  browser.experiments.urlbar.initURLbarListener();
}

function onShutdown() {
  console.log("onShutdown called");
  browser.experiments.urlbar.uninitURLbarListener();
}

const handleToolbarButtonClick = async function (tab, onClickData) {  //  Shift, Alt, Command, Ctrl, or MacCtrl - Fx72+
  let mods = onClickData.modifiers;
  // onClickData.button holds 0=left, 1=middle if we'd ever want to use that
  if (mods.includes("Ctrl")){
    onStartup();
  } else if (mods.includes("Alt")) {
    onShutdown();
  } else {
    var results = await browser.experiments.urlbar.getResults();
    // console.log(results);
    saveResultsAsBookmarks(results);
  }
}

// covers profile startup, add-on install, temp install, etc.
browser.runtime.onStartup.addListener(onStartup);
browser.runtime.onInstalled.addListener(onStartup);

// browser.runtime.onSuspend.addListener(onShutdown); // only works w/ event pages

browser.browserAction.onClicked.addListener(handleToolbarButtonClick);

async function saveResultsAsBookmarks(results) {
  var folderSearch = await browser.bookmarks.search("LocBar");
  // handle case of folder not found; if multiple found, log error and exit
  var folder = folderSearch[0];
  if (!folder || folder.length > 1) {
    error.log("Multiselect Utility:  Folder not found, or multiple folders found. Location bar results have not been saved. Please insure one and only one folder exits for storing these results.");
  }
  let itemsInFolder = await browser.bookmarks.getChildren(folder.id);  
  // while children would include subfolders, non-empty subfolders would not get deleted (& there shouldn't be any unless manually created).

  for (let item of itemsInFolder) {
    await browser.bookmarks.remove(item.id)  // .catch((err) => {console.error(err);});
  }  
  for (var index = 0; index < results.urls[0].length; index++) {
    // console.log(index, folder.id, results.titles[0][index], results.urls[0][index]);
    await browser.bookmarks.create( {index: index, parentId:  folder.id, title: results.titles[0][index], url: results.urls[0][index] } );
  } 
}
