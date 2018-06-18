'use strict'

/* 

Important things to know

Things we need from the youtube API:
videoId           --    data.items[i].id.videoId
Video Description --    data.items[i].snippet.description // Maybe not. I don't like this property.
Published Date    --    data.items[i].snippet.publishedAt
Thumbnail         --    data.items[i].snippet.thumbnails.default["url"]
Title             --    data.items[i].snippet.title
channelId         --    data.items[i].snippet.channelId
                        `https://www.youtube.com/channel/${channelId}`

Youtube API URL: (`part=snippet` is required)
https://www.googleapis.com/youtube/v3/search?&part=snippet?key=AIzaSyBKvnTl8IlN92kFkqDNq3d6Z7Bri9dWMrQ?q=cat

data.items[i].id.videoId
data.items[i].snippet.description
data.items[i].snippet.publishedAt
data.items[i].snippet.thumbnails.default["url"]
data.items[i].snippet.title

Default behavior will be searching for cats. Everyone on the internet likes cats.
*/

const YOUTUBE_SEARCH_URL = `https://www.googleapis.com/youtube/v3/search`;
const keyStr=`AIzaSyBKvnTl8IlN92kFkqDNq3d6Z7Bri9dWMrQ`;
let videoQuery = "";

function watchSubmit() {
    
    $('.js-search').submit(event => {
      event.preventDefault();
      const searchTarget = $(event.currentTarget).find('.inputSearch');
      videoQuery = searchTarget.val();
      getVideos(videoQuery, loadNav);
      //watchNav(videoQuery);
      //searchTarget.val("");
      $('.js-results-nav').find('ul').html(``);
    });
  }

function watchNav(searchTerm){
    //alert(searchTerm);
    $('.js-nav').on('click', '.pagination', function(event){
        let whichPage = $(event.currentTarget).attr('pagetoken');
        getVideos(searchTerm, loadNav, whichPage);
        console.log(`${searchTerm}`); // To fix, this is undefined.
        $('.js-results-nav').find('ul').empty();;
    });
}

// search for videos using the query string from the form
function getVideos(searchTerm, callback, pageId) {
    const query = {
      key: `${keyStr}`,
      part: `snippet`,   
      q: `${searchTerm}`,
      type: `video`,
      videoEmbeddable: 'true'
    };

    if (pageId){
        query.pageToken = `${pageId}`;
    }

    $.getJSON(YOUTUBE_SEARCH_URL, query, callback);
  }

// Need to load the API Response into the Right side Navbar.
// Use CSS Class js-results-nav
function loadNav (data){
    //console.log(data.nextPageToken);
    // iterate through api response and fill in list items in the UL
    for (let i=0; i<data.items.length; i++){
       // console.log(i);
        $('.js-results-nav').find('ul').append(
            `<li id="${data.items[i].id.videoId}" js-channel-id="${data.items[i].snippet.channelId}" js-channel-title="${data.items[i].snippet.channelTitle}">
                <img src="${data.items[i].snippet.thumbnails.medium['url']}" alt="${data.items[i].snippet.channelTitle}">
                <p>${data.items[i].snippet.title}</p>
            </li>`
        );
    }

    if (!data.hasOwnProperty(`prevPageToken`)) {
        $('.js-results-nav').find('ul').append(
            `<form class="js-nav">
                <input type="button" value="Previous" class="js-prev-button pagination" disabled>
                <input type="button" value="Next" class="js-next-button pagination" pageToken=${data.nextPageToken}>
            </form> `
        );
    } else {
        $('.js-results-nav').find('ul').append(
            `<form class="js-nav">
                <input type="button" value="Previous" class="js-prev-button pagination" pageToken=${data.prevPageToken}>
                <input type="button" value="Next" class="js-next-button pagination" pageToken=${data.nextPageToken}>
            </form> `
        );
    }
    watchNav(videoQuery);
}

// When a thumbnail is clicked, play the video.
// pay attention to the videoId of the item being clicked
function loadVideo(vid, chanId, chanTitle){
    let channelId = chanId;
    let videoId = vid;
    let channelTitle = chanTitle;
    //console.log(`loadVideo Ran`);

    $('.js-player').html(
        `<iframe width="100%" height="480" src="https://www.youtube.com/embed/${videoId}" frameborder="0" title="Youtube Video" allowfullscreen></iframe>
        <p>For more video from this channel, visit: <a href="https://www.youtube.com/channel/${channelId}" target="_blank">${channelTitle}</a></p>`
        );

    // event listener for button clicks. 
    $('.js-results-nav').on('click', 'li',
        function(event){
            //console.log($(this).attr("ID"));
            videoId = "";
            loadVideo($(this).attr("ID"), $(this).attr("js-channel-id"), $(this).attr("js-channel-title") );
    });    
}

function loadApp(){
    getVideos("racoons", loadNav);
    loadVideo('4olSy5UXO_M','UCeZe0VwwhEf8KTI2FHfJtTg','Funny Pets'); // set initial video
    watchSubmit();
    
}

$(loadApp);