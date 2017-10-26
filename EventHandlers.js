function update(){ //Update handler that updates everything
  updateStorageData();
  updateStatus().then(()=>{
  timeOnFB = 0; //Clear the current user's time on FB
  if(isOnFB && loggedIn){ //Only update current profile if user is on FB and is logged in
      updateCurrentProfileInfo();
    };
  });
}
/*
Event listener for tab switching
*/
chrome.tabs.onActivated.addListener(function(activeInfo){
  update();
});

/*
Event listener for tab updates (refresh, redirects, etc.)
*/
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
  if(changeInfo.status === 'complete'){ //Only update status and records once a tab has completed loading
    update();
    notMinimized = true;
  }
});

chrome.browserAction.onClicked.addListener(function(activeTab){
  chrome.tabs.create({url: 'popup.html'});
})

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  sendResponse({records: records, totalTimeOnFB: totalTimeOnFB});
});

chrome.windows.onFocusChanged.addListener(function(windowId) {
    if (windowId === -1) {
      notMinimized = false;
    } else {
        chrome.windows.get(windowId, function(chromeWindow) {
            if (chromeWindow.state === "minimized") {
              notMinimized = false;
            } else {
              updateStatus();
              notMinimized = true;
            }
        });
    }
});

chrome.windows.onCreated.addListener(window => {
  notMinimized = true;
})

chrome.tabs.onCreated.addListener(()=>{
  notMinimized = true;
})