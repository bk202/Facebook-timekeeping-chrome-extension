var loggedIn;
var isOnFB=false; //User could still be "not on FB" even user is logged in, i.e. current tab isn't a FB page
var notMinimized=false;
var records = [];
var totalTimeOnFB;
var timeOnFB = 0;
var currentTime = new Date();
var lastVisitedProfile = {
    profileName: "",
    profilePic: "",
    timeOnFB: 0,
}
var storageTimeStamp;
/*
if time difference(in minutes) between current time and storage time is greater than this number, then reset local storage data.
*/
var maxDiffMins = 1440; //Reset data every 24*60 = 1440 mins


//Finds a certain cookie given the cookie name
function cookieExist(cookie_name){
    return new Promise((resolve, reject) => {
        chrome.cookies.getAll({"name": cookie_name}, cookies => {
            cookies.length>0? resolve(): reject();
        });
    })
}

/*User is logged in if the following 3 cookies are found: c_user, xs, and datr*/
function verifyLogin(){
    return Promise.all([cookieExist("c_user"), cookieExist("xs"), cookieExist("datr")])
}

function getTimeDifference(time1, time2){
    return Math.floor((time2 - time1)/1000)/60;
}

function resetStoragedata(){
    chrome.storage.local.clear(function() {
      var error = chrome.runtime.lastError;
      if (error) {
        console.error(error);
      }
      else{
        chrome.storage.local.set({'totalTimeOnFB': 0, 'records': [], 'lastUpdatedTime': (new Date()).getTime()});
        records = [];
        totalTimeOnFB = 0;
        timeOnFB = 0;
        storageTimeStamp = new Date();
      }
    });
}

/*
Callback timer function
*/
function timer(){
  currentTime = new Date();
  timeDiff = getTimeDifference(storageTimeStamp, currentTime);
  //Data can only exist 24 hours at most
  if(timeDiff >= maxDiffMins){
    resetStoragedata();
  }
  if(isOnFB && loggedIn && notMinimized){
      timeOnFB++;
    }
  window.setTimeout(timer, 1000);
}
timer();

function initStorageData(){
  chrome.storage.local.get('totalTimeOnFB', results =>{
    if(!results.totalTimeOnFB){
      chrome.storage.local.set({'totalTimeOnFB': 0});
    }
    else{
        timeOnFB = results.totalTimeOnFB;
    }
  });
  chrome.storage.local.get('records', results =>{
    if(!results.records){
        chrome.storage.local.set({'records': []});
    }
    else{
        records = results.records;
    }
  });
  chrome.storage.local.get('lastUpdatedTime', results => {
    if(!results.lastUpdatedTime){
    	//Because chrome storage doesn't support date object, thereby time in milisecond is stored
        chrome.storage.local.set({'lastUpdatedTime': (new Date()).getTime()})
        storageTimeStamp = new Date();
    }
    else{
        storageTimeStamp = new Date(results.lastUpdatedTime);
    }
  })
}
initStorageData();

function requestForPageInfo(){
    return new Promise(resolve => {
        var responseObj;
        chrome.tabs.query({"currentWindow": true,"active":true}, function(tab) {
            //If user is currently visiting home page
            if(tab[0].url == "https://www.facebook.com/" || tab[0].url == "http://www.facebook.com/"){
                ResponseObj = {
                    profileName: "Home page",
                    profilePic: "https://www.facebook.com/images/fb_icon_325x325.png",
                };
                resolve(ResponseObj);
            }
            else{
                chrome.tabs.sendMessage(tab[0].id, {RetrieveProfileInfo: true}, function(response) {
                responseObj = response;
                resolve(responseObj);
            });
            }
    });
    })
}

function updateCurrentProfileInfo(){
    requestForPageInfo().then(response => {
        lastVisitedProfile.profileName = response?response.profileName: "";
        lastVisitedProfile.profilePic = response? response.profilePic: "";
    });
}

//Updates the record in program memory
async function updateRecord(){
    for(i=0; i<records.length; i++){
        if(records[i].profileName == lastVisitedProfile.profileName){
            records[i].timeOnFB = records[i].timeOnFB + timeOnFB;
            return;
        }
    }
    records.push({profileName: lastVisitedProfile.profileName, profilePic: lastVisitedProfile.profilePic, timeOnFB: timeOnFB});
    return;
}

//Updates the data in program memory
function updateStorageData() {
  //Update total accumulated time on FB
  chrome.storage.local.get('totalTimeOnFB', results => {
    totalTimeOnFB = results.totalTimeOnFB + timeOnFB;
    chrome.storage.local.set({'totalTimeOnFB': totalTimeOnFB}, ()=>{
    	timeOnFB = 0;
    });
  });

  //Only update record in profile if last visited profile is not empty/undefined
  if(lastVisitedProfile.profileName != "" && lastVisitedProfile.profileName != undefined){
    updateRecord().then(()=>{
    	chrome.storage.local.set({'records': records});
    });
  }
};

function updateLoginStatus(){
  return new Promise(resolve => {
    verifyLogin().then(results => { //Determine the fb login status of user
        loggedIn = true;
        resolve(true);
    }).catch(err => {
    	loggedIn = false;
    	resolve(false);
    });
  })
}
function updateOnFBStatus(){
  //Retrieve the url of current tab
  return new Promise(resolve => {
    chrome.tabs.query({"currentWindow":true,"active":true}, function(tab){
        var facebook = "facebook.com";
        if(tab[0].url.indexOf(facebook) > -1){ //if "facebook.com" is found in current tab's url, then user is on facebook
            isOnFB = true;
            resolve(true);
        }
        else{
            isOnFB = false;
            resolve(false);
        }
     });
  })
}

function updateStatus(){
    var onFBStatus = updateOnFBStatus();
    var loggedInStatus = updateLoginStatus();
    return Promise.all([onFBStatus, loggedInStatus]);
};