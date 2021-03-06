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
    pageToken         --    data.nextPageToken ; data.prevPageToken

    Youtube API URL Endpoint: (`part=snippet` is required)
    https://www.googleapis.com/youtube/v3/search

    data.items[i].id.videoId
    data.items[i].snippet.description
    data.items[i].snippet.publishedAt
    data.items[i].snippet.thumbnails.default["url"]
    data.items[i].snippet.title
*/


// Global Scoped Variables - Key String for API; API Endpoint; and a place to store the Search Terms.
const YOUTUBE_SEARCH_URL = `https://www.googleapis.com/youtube/v3/search`;
const keyStr=`AIzaSyBKvnTl8IlN92kFkqDNq3d6Z7Bri9dWMrQ`;
let videoQuery = "";




/*  watch Submit - No args - Event Listener for the Search Form submit button. 
    on Submit it calls getVideos with the searchTerm and the loadNav function as a callback.
    */
function watchSubmit() {
    $('.js-search').submit(event => {
      event.preventDefault();
      const searchTarget = $(event.currentTarget).find('.inputSearch');
      videoQuery = searchTarget.val();
      getVideos(videoQuery, loadNav);
      $('.js-results-nav').find('legend').nextAll().remove();
    });
  }

/*  watchNav - args:searchTerm as String - Event Listener for pagination buttons.
    On first load previous button has id:disabled if the disabled button is clicked,
    return false to keep it from doing anything; 
    else call getVideos with search term., loadNav callback, and the page token of the button
    */
function watchNav(searchTerm) {
    $('.js-nav').on('click', '.pagination', function(event){
        event.preventDefault();
        if ($(event.currentTarget).attr('id')==='disabled'){
            return false;
        } else {
            let whichPage = $(event.currentTarget).attr('pagetoken');
            getVideos(searchTerm, loadNav, whichPage);
            $('.js-results-nav').find('legend').nextAll().remove();
        }
    });
}

/*  getVideos - args: searchTerm(String); callback(function); pageID(string)[Optional]
    Load in a new object called query; query contains the api Key, Part, q(uery), 
    type, and video embeddable flag for youtube api. pageId is optional. If present, load
    it in to the query string. On success do callback. (Generally loadNav here.
    */
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

/* loadNav - args: data(Object) -
    loadData looks at the results from getVideos to see total length (expects 5), 
    then loop through. Append an li for each item in the loop while i < length.
    Load in various data points (videoId, channelId, ChannelTitle,Thumbnails.
    Next it creates pagination buttons and loads in the pageTokens of the api responses.
    */
function loadNav (data){
    // iterate through api response and fill in buttons in the form.
    for (let i=data.items.length-1; i>=0; i--){
       // console.log(i);
        //tabIndex = i + 1;
        $('.js-results-nav').find('legend').after(
            `<button type="button" id="${data.items[i].id.videoId}" 
                        js-channel-id="${data.items[i].snippet.channelId}" 
                        js-channel-title="${data.items[i].snippet.channelTitle}" 
                        js-video-title="${data.items[i].snippet.title}">
                <img src="${data.items[i].snippet.thumbnails.medium['url']}" alt="${data.items[i].snippet.channelTitle}">
                <p>${data.items[i].snippet.title}</p>
            </button>`
        );
    }

    //navTabIndex = tabIndex +1;
    // Create Pagination, first page, disable 'previous' button.
    if (!data.hasOwnProperty(`prevPageToken`)) {
        $('.js-results-nav').find('button').last().after(
            `<div class="js-nav">
                <button type="button" class="js-prev-button pagination" id="disabled" disabled>Previous</button>
                <button type="button" class="js-next-button pagination" pageToken=${data.nextPageToken}>Next</button>
            </div> `
        );
    } else { // Create pagination, 2nd page and after get both buttons.
        $('.js-results-nav').find('button').last().after(
            `<div class="js-nav">
                <button type="button" class="js-prev-button pagination" pageToken=${data.prevPageToken}>Previous</button>
                <button type="button" class="js-next-button pagination" pageToken=${data.nextPageToken}>Next</button>
            </div> `
        );
    }
    watchNav(videoQuery);
    // after nav is loaded, call watchNav, passing the search term back in and start again!
}


/*  loadVideo - args:vid, chandId, chanTitle all are strings.
    Use the args to invoke the youtube player iframe embed. */
function loadVideo(vid, chanId, chanTitle, videoTitle){
    let channelId = chanId;
    let videoId = vid;
    let channelTitle = chanTitle;
    let ariaTitle = videoTitle;
    //console.log(`loadVideo Ran`);
    //alert(ariaTitle);
    $('.js-player').html(
        `<iframe aria-label="${ariaTitle}" width="100%" height="480" 
            src="https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0&cc_load_policy=1&iv_load_policy=3" 
            frameborder="0" 
            title="Youtube Video" 
            allowfullscreen></iframe>
        <p>For more video from this channel, visit: <a href="https://www.youtube.com/channel/${channelId}" target="_blank">${channelTitle}</a></p>`
        );

    // event listener for button clicks. 
    // When a nav button is clicked re-run loadVideo with that button's video and channel info 
    $('.js-results-nav').on('click', 'button',
        function(event){
            event.preventDefault();
            event.stopPropagation();
            videoId = "";
            loadVideo($(this).attr("ID"), $(this).attr("js-channel-id"), $(this).attr("js-channel-title"), $(this).attr("js-video-title") );
    });    
}


/* 
    On load, run the getVideos app with "Raccoons" as the query adn loadNav as the callback.
        - This provides the default state so that the app isn't blank on first run.
    Then, run the loadVideo with the predefined videoID, Channel ID, and Channel Title.
        - The values here are default and were manually pulled from the API responses during dev.
    Finally, launch the function to start the event listener on the submit button.
*/
function loadApp(){
    getVideos("raccoons", loadNav);
    loadVideo('4olSy5UXO_M','UCeZe0VwwhEf8KTI2FHfJtTg','Funny Pets'); // set initial video
    watchSubmit();
}

$(loadApp);