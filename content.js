/*
4 types of profile name:
1. Timeline layout username - id: fb-timeline-cover-name
2. Public profile page - classname: _33vv
3. fb photo media content page - classname: fbPhotoContributorName
4. Media content page(Video/pictures) - classname: fwb
*/
function findUsername(){
    var timeLineProfile = $('#fb-timeline-cover-name').text();
    if(timeLineProfile) return timeLineProfile;
    var publicProfile = $('._33vv a').text();
    if(publicProfile) return publicProfile;
    var media1 = $('.fbPhotoContributorName a').text();
    if(media1) return media1;
    var media2 = $('.fwb a').text();
    if(media2) return media2;
    return undefined;
}

/*
4 types of profile pic:
1. Timeline layout profile page - classname: profilePic
2. Public profile page - classname: _4jhq
3. fb photo media content page - classname: _clearfix _fbPhotoSnowliftAuthorInfo __xlu a div img
4. separate media content page(Video/pictures) - classname: _s0 
*/

//Helper function for finding an img of DOM based on classname
function findImg(classname){
    return $(classname).attr('src');
}

//Try each type of profile page's retrieval method
function retrieveProfilePic(){
    var timeLineProfile = findImg('.profilePic');
    if(timeLineProfile) return timeLineProfile;
    var publicProfile = findImg('._4jhq');
    if(publicProfile) return publicProfile
    var media1 = findImg('.clearfix.fbPhotoSnowliftAuthorInfo._xlu a div img');
    if(media1) return media1;
    var media2 = findImg('._s0');
    if(media2) return media2;
    return undefined;
};

//Listen on messages from background.js
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    var responseObj = new Object();
    if (request.RetrieveProfileInfo) {
        let profileName = findUsername();
        responseObj.profileName = profileName;
        let profilePic = retrieveProfilePic();
        responseObj.profilePic = profilePic;
        sendResponse(responseObj);
    }
    return true;
});