"use strict";

//Original
// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */
//original code
function generateStoryMarkup(story, showDeleteBtn = false) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  const favoriteStar = Boolean(currentUser);

  return $(`
      <li id="${story.storyId}">
        <div>
        ${showDeleteBtn ? createDeleteButton() : ""}
        ${favoriteStar ? createStar(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */


function createDeleteButton() {
  return `
      <span class="trash-can">
        <i class="fas fa-trash-alt"></i>
      </span>`;
}

//new function to add star 
function createStar(story, user) {
  const isFavorite = user.isFavorite(story);
  const starSetting = isFavorite ? "fas" : "far";
  return `
    <span class="star">
      <i class="${starSetting} fa-star"></i>
    </span>`;
}

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}



//New added code: When user submits a new story form - collect story data, submit story form event

async function submitNewStory(evt) {
  console.debug("submitNewStory");
  evt.preventDefault();

  const title = $("create-title").val();
  const url = $("create-url").val();
  const author = $("create-author").val();
  const username = currentUser.username;
  const storyData = {title, url, author, username}; 

  const story = await storyList.addStory(currentUser, storyData);

  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);

  $newStoryForm.slideUp("slow");
  $newStoryForm.trigger("reset");

}

$newStoryForm.on("submit", submitNewStory);


function putNewStoryOnPage() {
  console.debug("putNewStoryOnPage");
  $ownStories.empty();

  if (currentUser.ownStories.length === 0) {
    $ownStories.append("<p>User has not added any stories yet!</p>"); 
  } else {
      for (let story of currentUser.ownStories) {
        let $story = generateStoryMarkup(story, true);
        $ownStories.append($story);
      }
    }
    $ownStories.show();
}

function showFavoritesList() {
  console.debug("showFavoritesList");
  $favoriteStories.empty();

  if(currentUser.favorites.length === 0) {
    $favoriteStories.append("<p>No favorites added yet!</p>");
  } else {
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoriteStories.append($story);
    }
  }
  $favoriteStories.show();
} 

async function favoriteUnfavorite(evt) {
  console.debug("favoriteUnfavorite");

  const $target = $(evt.target);
  const $closestStory = $target.closest("li");
  const storyId = $closestStory.attr("id");
  const story = storyList.stories.find(s => s.storyId === storyId);
  
  if($target.hasClass("fas")) {
    await currentUser.removeFavorite(story);
    $target.closest("i").toggleClass("fas far");
  } else {
    await currentUser.addFavorite(story);
    $target.closest("i").toggleClass("fas far")
  }
}

$storiesList.on("click", ".star", favoriteUnfavorite);