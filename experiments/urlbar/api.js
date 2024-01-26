// Ctrl-Shift-J to view console output from api.js; it doesn't appear in the about:debugging 'Inspect' button's console tab.

"use strict";

XPCOMUtils.defineLazyModuleGetters(this, {
  BrowserWindowTracker: "resource:///modules/BrowserWindowTracker.jsm",
});

var searchResults = {titles: [], urls: []};

var blurListener = null;

this.experiments_urlbar = class extends ExtensionAPI {
  getAPI() {
    return {
      experiments: {
        urlbar:  {
          
          async getResults() {
            let win = BrowserWindowTracker.getTopWindow();
            // if user clicks icon before clicking off of urlbar, urlbar blur el may not have triggered yet
            if (win.document.activeElement.id == "urlbar-input") {
              console.log("blurring urlbar");
              win.gURLBar.view.input.blur();  // only do this if urlbar still has focus!
            }
            return searchResults;
          },
          async initURLbarListener() {
            console.log("initURLbarListener called");
            let win = BrowserWindowTracker.getTopWindow();
            let URLbarInput = win.gURLBar.view.input;
            blurListener = this.captureSearchResults;
            URLbarInput.addEventListener('blur', blurListener);   
            console.log("listening");
          },
          
          async uninitURLbarListener() {
            console.log("uninitURLbarListener called");            
            let win = BrowserWindowTracker.getTopWindow();
            let URLbarInput = win.gURLBar.view.input;
            URLbarInput.removeEventListener('blur', this.captureSearchResults);
            console.log("listener removed");
          },          
          
          async captureSearchResults() {
            console.log("captureSearchResults called");
            let win = BrowserWindowTracker.getTopWindow();
            var results = win.gURLBar.view.visibleResults;
            // console.log(results);
            if (!results) {
              console.log("No urlbar search results found.");
              return {};
            }
            searchResults = {titles: [], urls: []};
            var titles = [];  
            var urls = [];            
            results.forEach(element => {
              titles.push(element.payload.title);
              urls.push(element.payload.url);
            });   
            searchResults.titles.push(titles);            
            searchResults.urls.push(urls);
            console.log(searchResults);
          }
        },
      },
    };
  }

  onShutdown(isAppShutdown) {
    if (isAppShutdown) {
      return; // just let Fx unload it!
    }
    let win = BrowserWindowTracker.getTopWindow();
    let URLbarInput = win.gURLBar.view.input;
    URLbarInput.removeEventListener('blur', blurListener);
    console.log("blurListener removed");    
  } 
};
