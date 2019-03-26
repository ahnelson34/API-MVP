'use strict'
const apiKeyLastFm = '77041af4177c0e5538058219c30940b0'
const searchUrlLastFm = 'http://ws.audioscrobbler.com//2.0/'

function formatLastFmQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(api_key => `${encodeURIComponent(api_key)}=${encodeURIComponent(params[api_key])}`)
  return queryItems.join('&');
}


function getTopTracks(artist) {
    const params = {
        api_key: apiKeyLastFm,
        artist,
        method: 'artist.gettoptracks',
        limit: 10,
        autocorrect: 1,
        format: 'json' 
      }; 
    const queryString = formatLastFmQueryParams(params)
    const url = searchUrlLastFm + '?' + queryString;
    
    console.log(url);
    
    return fetch(url);        
}

const apiKeyYouTube = 'AIzaSyC3YDvPKPEQcKDodu7Koq5S8IhCGVbsRXA'; 
const searchURLYouTube = 'https://www.googleapis.com/youtube/v3/search';

function formatYouTubeQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}


function displayResultsYouTube(responseJson) {
  console.log(responseJson);
  $('#video-list').empty();
  for (let i = 0; i < responseJson.items.length; i++){
   
    $('#video-list').append(
      `<li><a href='https://www.youtube.com/watch?v=${responseJson.items[i].id.videoId}' target=_blank'><h3>${responseJson.items[i].snippet.title}</h3></a>
      <img src='${responseJson.items[i].snippet.thumbnails.default.url}'>
      </li>`
      
    )};
  //display the results section  
  $('#results').removeClass('hidden');
};

function getYouTubeVideo(query) {
  const params = {
    key: apiKeyYouTube,
    q: query,
    part: 'snippet',
    maxResults: 1,
    type: 'video'
  };
  const queryString = formatYouTubeQueryParams(params)
  const url = searchURLYouTube + '?' + queryString;

  console.log(url);

  return fetch(url);
}

//show search bar on scroll up
var prevScrollpos = window.pageYOffset;
window.onscroll = function() {
  var currentScrollPos = window.pageYOffset;
  if (prevScrollpos > currentScrollPos) {
    document.getElementById("js-form").style.top = "0";
    //won't do anything if form is not fixed/absolute - a poistioned element
    //translate to jquery
  } else {
    document.getElementById("js-form").style.top = "-50px";
  }
  prevScrollpos = currentScrollPos;
}

// change placeholder
var inputPlaceholder = ["Queen", "Bob Marley", "Beyonce", "Kanye West", "Taylor Swift", "The Beatles", "Drake", "Frank Sinatra"];
setInterval(function() {
    $("input[type='text']").attr("placeholder", inputPlaceholder[inputPlaceholder.push(inputPlaceholder.shift())-1]);
}, 3000);

function computeHomeButton() {
    $('.appLogo').on('click', '.logo', function(event) {
        $('#js-search-term').val(''); 
        // how to make placeholder value reappear?
        //explore form reset event
        $('#video-list').empty();
        $('#results').addClass('hidden');
        $('.site-info').removeClass('hidden');
    });
}


function watchForm() {
    $('form').submit(event => {      
      event.preventDefault();
      $('#results').addClass('hidden');
      $('.site-info').addClass('hidden');
      $('#video-list').empty();
      const searchTermLastFm = $('#js-search-term').val();
      
     
      
     getTopTracks(searchTermLastFm)
      .then(response => {
        if (response.ok) {
        return response.json();
        }
        throw new Error(response.statusText);
        })
        .then(responseJson => {   
          var videoList = []; 
          var videoQueries = [];      
          for (let i = 0; i < responseJson.toptracks.track.length; i++){
            

            var videoItem = {
              index: i,
              title: undefined,
              url: undefined
            }

            videoList.push(videoItem);

            videoQueries.push(
              getYouTubeVideo(`${responseJson.toptracks.track[i].artist.name} ${responseJson.toptracks.track[i].name}`)
                 .then(response => {
                  if (response.ok) {
                    return response.json();
                  }
                  throw new Error(response.statusText);
                })              
              )
          }
          //promise to make sure videos are in corrct order
          Promise.all(videoQueries)
            .then(response => {              
              for (var i = 0; i < videoList.length; i++) {
                var responseJson = response[i]
                $('#video-list').append(
                  `<li><a href='https://www.youtube.com/watch?v=${responseJson.items[0].id.videoId}' target=_blank'><h3>${responseJson.items[0].snippet.title}</h3></a>
                  <img src='${responseJson.items[0].snippet.thumbnails.medium.url}'>
                  </li>`
                  
                );
              }
              $('#results').removeClass('hidden');
            })
        })
        .catch(err => {
          $('#js-error-message').text(`Something went wrong: ${err.message}`);
        });
      });
    }                    

  $(watchForm);
  computeHomeButton();

