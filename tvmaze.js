"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");

async function getShowsByTerm(term) {
  //send request to tvmaze API with the term
  const res = await axios.get(`https://api.tvmaze.com/search/shows?q=${term}`)

  //create an empty array for the show objects
  const showList = []

  //iterate through each show and retrieve the id, name, image, and summary
  res.data.forEach((element) => {
    const showDetails = element.show;

    //create variables for objects that will be potentially null
    let img = showDetails.image;
    let summary = showDetails.summary;

    //give image a default value if null
    img = img === null ? "https://store-images.s-microsoft.com/image/apps.65316.13510798887490672.6e1ebb25-96c8-4504-b714-1f7cbca3c5ad.f9514a23-1eb8-4916-a18e-99b1a9817d15?mode=scale&q=90&h=300&w=300" : showDetails.image.original;

    //change summary from null to a blank string
    summary = summary === null ? "" : showDetails.summary;

    //destructure id and name
    const {id, name} = showDetails

    //push show details object to the showList array
    showList.push({id, name, img, summary})
  })
  return showList;
}


/** Given list of shows, create markup for each and to DOM */
function populateShows(shows) {
  //reset the show list section for new searches
  $showsList.empty();

  //iterate through each show and create show detail div
  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.img}"
              alt="${show.name}"
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes" onclick="getEpisodesOfShow(${show.id})">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);
    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  //save input search-term
  const term = $("#search-query").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
  $searchForm[0].reset();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */
async function getEpisodesOfShow(id) {

  //using the given id, request the show episode information
  const res = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);

  //create an empty array to hold the episode objects
  const episodeList = [];

  //iterate through each show to retrieve the episode id, name, number, and season
  res.data.forEach((show) => {
    const {id, name, number, season} = show;
    episodeList.push({id, name, number, season});
  })

  //display episodes at the bottom of the screen
  populateEpisodes(episodeList);
}

function populateEpisodes(episodes) {
  //reset the episodes list
  $('#episodes-list').html("");

  //iterate through episodes to display indv episode details
  for (let episode of episodes) {
    const $episode = $(
      `<li data-episode-id="${episode.id}">
        <h5>S${episode.season} E${episode.number} - ${episode.name}</h5>
       </li>`
       );

    //add list item to ul
    $('#episodes-list').append($episode);
  }

  //make the episodes section visible
  $episodesArea.removeAttr("style");
 }
