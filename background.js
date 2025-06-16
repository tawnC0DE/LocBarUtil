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
    // onStartup();  // this is obsolete; should no longer be necessary to do this manually
    await emptySavedResults(false);  // delete items saved as bookmarks in LocBar folder
  } else if (mods.includes("Alt")) {
    // onShutdown();  // this is obsolete; should no longer be necessary to do this manually
  } else {
    var results = await browser.experiments.urlbar.getResults();
    // console.log(results);
    saveResultsAsBookmarks(results);
  }
}
async function getFolder() {
  var folderSearch = await browser.bookmarks.search("LocBar");
  // we should add code to handle case of folder not found; if multiple found, log error and exit
  var folder = folderSearch[0];
  if (!folder || folder.length > 1) {
    folder = null;
    console.error("LocBarUtil: Folder not found, or multiple folders found. Location bar results have not been saved. Please insure one and only one folder exits for storing these results.");
  }
  return folder;
}

async function emptySavedResults(overwriting = true) {
  let folder = await getFolder();
  if (!folder) {
    return;
  }
  let itemsInFolder = await browser.bookmarks.getChildren(folder.id);
  // while children would include subfolders, non-empty subfolders would not get deleted
  // (there shouldn't be any subfolders unless user manually created them).
  if (itemsInFolder.length < 1) {  // folder already empty
    return;
  }

  for (let item of itemsInFolder) {
    let error = false;
    try{
      await browser.bookmarks.remove(item.id);  // folder must be empty before it can be removed
    } catch(e) {
      error = true;
      console.error("LocBarUtil: Subfolder found in 'LocBar' folder used by this extension. Please move or remove it manually and avoid adding subfolders to this folder.");
    }
  }

  // skip delete/re-create if we're emptying just prior to adding new location bar results or error occurred deleting item(s).
  if (overwriting || error) {
    return;
  }
  // delete, then recreate folder to work around bug where in certain situations the 'Empty' popup does not appear in UI
  // on attempt to open the folder (instead, the folder doesn't open at all)
  // don't do remove tree instead of above loop, since we might not need workaround if bug gets fixed
  let index = folder.index;
  let parent = folder.parentId;
  await browser.bookmarks.remove(folder.id);
  // re-create folder in same location & with same title
  browser.bookmarks.create( {index: index, parentId: parent, title: "LocBar", url: null } );
}

async function saveResultsAsBookmarks(results) {
  await emptySavedResults( );
  let folder = await getFolder();
  if (!folder) {
    return;
  }

  for (var index = 0; index < results.urls[0].length; index++) {
    // don't bookmark empty (undefined) urls; i.e. it would create an empty folder with no name
    // this is mostly caused by results like 'search google for foo'
    // OTOH, bookmarks with empty titles will just display the url instead
    if (!results.urls[0][index]) {
      continue;
    }

    // console.log(index, folder.id, results.titles[0][index], results.urls[0][index]);
    await browser.bookmarks.create( {index: index, parentId: folder.id, title: results.titles[0][index], url: results.urls[0][index] } );
  }
}

browser.browserAction.onClicked.addListener(handleToolbarButtonClick);

 (async function main() {
// Detect this extension being started (via profile startup, add-on install, temp install, enabling in AOM etc.)
  onStartup();
})();
