// definitions for Yummly API search request
const courseList = [
  {
    "type": "course",
    "description": "Main Dishes",
    "searchValue": "course^course-Main Dishes"
  },
  {
    "type": "course",
    "description": "Desserts",
    "searchValue": "course^course-Desserts"
  },
  {
    "type": "course",
    "description": "Side Dishes",
    "searchValue": "course^course-Side Dishes"
  },
  {
    "type": "course",
    "description": "Appetizers",
    "searchValue": "course^course-Appetizers"
  },
  {
    "type": "course",
    "description": "Salads",
    "searchValue": "course^course-Salads"
  },
  {
    "type": "course",
    "description": "Breakfast and Brunch",
    "searchValue": "course^course-Breakfast and Brunch"
  },
  {
    "type": "course",
    "description": "Breads",
    "searchValue": "course^course-Breads"
  },
  {
    "type": "course",
    "description": "Soups",
    "searchValue": "course^course-Soups"
  },
  {
    "type": "course",
    "description": "Beverages",
    "searchValue": "course^course-Beverages"
  },
  {
    "type": "course",
    "description": "Condiments and Sauces",
    "searchValue": "course^course-Condiments and Sauces"
  },
  {
    "type": "course",
    "description": "Cocktails",
    "searchValue": "course^course-Cocktails"
  },
  {
    "type": "course",
    "description": "Snacks",
    "searchValue": "course^course-Snacks"
  },
  {
    "type": "course",
    "description": "Lunch",
    "searchValue": "course^course-Lunch"
  }
];
const allergyList = [
  {
    "shortDescription": "Gluten-Free",
    "searchValue": "393^Gluten-Free",
    "type": "allergy"
  },
  {
    "shortDescription": "Peanut-Free",
    "searchValue": "394^Peanut-Free",
    "type": "allergy"
  },
  {
    "shortDescription": "Seafood-Free",
    "searchValue": "398^Seafood-Free",
    "type": "allergy"
  },
  {
    "shortDescription": "Sesame-Free",
    "searchValue": "399^Sesame-Free",
    "type": "allergy"
  },
  {
    "shortDescription": "Soy-Free",
    "searchValue": "400^Soy-Free",
    "type": "allergy"
  },
  {
    "shortDescription": "Dairy-Free",
    "searchValue": "396^Dairy-Free",
    "type": "allergy"
  },
  {
    "shortDescription": "Egg-Free",
    "searchValue": "397^Egg-Free",
    "type": "allergy"
  },
  {
    "shortDescription": "Sulfite-Free",
    "searchValue": "401^Sulfite-Free",
    "type": "allergy"
  },
  {
    "shortDescription": "Tree Nut-Free",
    "searchValue": "395^Tree Nut-Free",
    "type": "allergy"
  },
  {
    "shortDescription": "Wheat-Free",
    "searchValue": "392^Wheat-Free",
    "type": "allergy"
  }
];
let courseVal = [];
let allergyVal = [];
let allowedIng = [];
let excludedIng = [];
let recipes = [];
// save credentials and redirect on successful login
function handleLogin(data) {
  sessionStorage.setItem('token', data.authToken);
  sessionStorage.setItem('yummly-id', data.YUMMLY_ID);
  sessionStorage.setItem('yummly-key', data.YUMMLY_KEY);
  showSearch();
}
// login page error reporting
function handleLoginError(error) {
  const response = error.responseJSON;
  // what is shown to user when error occurs
  if (error.status === 401 ) {
    $('.js-login-err')
      .html(`<h4>Not found. Please check entered email and password.</h4>`)
      .attr('aria-hidden', 'false');
  } else if (response.location === 'username') {
    $('.js-create-account-err')
      .html(`<h4>${response.message}. If you have an account, you can sign in using the 'Log in' form.</h4>`)
      .attr('aria-hidden', 'false');
  } else if (response.location === 'password') {
    $('.js-create-account-err')
      .html(`<h4>Please check entered ${response.location}. It ${response.message.toLowerCase()}.</h4>`)
      .attr('aria-hidden', 'false');
  }
}
// ajax login request to server
function loginCall(username, password) {
  $.ajax({
    url: '/api/auth/login',
    method: 'POST',
    data: JSON.stringify({ 
      username: username,
      password: password
    }),
    contentType: 'application/json',
    dataType: 'json',
    success: handleLogin,
    error: handleLoginError
  });
}
// send login data
function loginSubmit() {
  const loginForm = $('#js-login-form');
  // submit credentials
  $(loginForm).submit(function(event) {
    event.preventDefault();
    $('.js-login-err').empty()
                      .attr('aria-hidden', 'true');
    $('.js-create-account-err').empty()
                               .attr('aria-hidden', 'true');
    const username = $('#js-username').val();
    const password = $('#js-user-pw').val();
    // send user credentials
    loginCall(username, password);
  });
}
// create new user
function createAccountSubmit() {
  const createAccountForm = $('#js-create-account-form');
  // submit new user credentials
  $(createAccountForm).submit(function(event) {
    event.preventDefault();
    $('.js-login-err').empty()
                      .attr('aria-hidden', 'true');
    $('.js-create-account-err').empty()
                               .attr('aria-hidden', 'true');
    const email = $('#js-new-user').val();
    const firstName = $('#js-firstname').val();
    const lastName = $('#js-lastname').val();
    const password = $('#js-new-pw').val();
    const confirmedPassword = $('#js-confirm-pw').val();
    // if password fields match
    if (password === confirmedPassword) {
      // save new user data to db
      $.ajax({
        url: '/api/users',
        method: 'POST',
        data: JSON.stringify({ 
          username: email,
          password: password,
          firstName: firstName,
          lastName: lastName
        }),
        contentType: 'application/json',
        dataType: 'json',
        success: function(response) {
          // login the new user
          loginCall(email, password);
        },
        error: (error) => console.log(error)
      });
    // alert user that passwords don't match
    } else {
      $('.js-create-account-err')
        .html(`<h4>Entered passwords do not match.</h4>`)
        .attr('aria-hidden', 'false');
    }
  });
}
// delete user from db
function deleteAccount() {
  $('#js-delete-account').on('click', (e) => {
    $.ajax({
      url: '/api/users/delete',
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${sessionStorage.token}`
      },
      contentType: 'application/json',
      success: () => {
        logOut();
      },
      error: (error) => console.log(error)
    });
  })
}
// save visited pages hashes for history 
let savedHashes = [];
function updateHistory(currHash) {
  savedHashes.push(window.location.hash.split(1));
  window.location.hash = currHash;
}
// render page function
function renderPage(response, firstName, html, hashStr) {
  updateHistory(hashStr);
  $('title')
    .empty()
    .append(response.title);
  $('header')
    .empty()
    .append(`<div id="top-bar">
              <span id="header-name">
                <a href="#profile">
                  <img src="images/FreeVector-Chef-Hat-Icons40x27.jpg" alt="" width="38" aria-hidden="true">
                  Hi, ${firstName}!
                </a>
              </span>
              <nav>
                <ul class="top-nav">
                  <a href="#search"><li>Search</li></a>
                  <a href="#lists"><li>Saved lists</li></a>
                  <a href="#profile"><li>My profile</li></a>
                  <a onclick='logOut()'><li>Log out</li></a>
                </ul>
              </nav>
            </div>
            <h1 id="logged-in-h1">${response.title}</h1>`);
  $('#main')
    .empty()
    .append(html);
  $(window).animate({ scrollTop: 0 }, 'slow');
}
// render search html
const searchFormHtml = `<form action="" class="js-search-form search-form">
                          <fieldset>
                            <h2 class="js-courses-btn">Choose course</h2>
                            <div id="courses" class="js-courses"></div>
                            <h2 class="js-allergies-btn">Choose allergies</h2>
                            <div id="allergies" class="js-allergies"></div>
                            <h2 class="">Enter ingredients to include</h2>
                            <div class="included-tags-input" data-name="included-tags-input"></div>
                            <h2 class="">Enter ingredients to exclude</h2>
                            <div class="excluded-tags-input" data-name="excluded-tags-input"></div>
                            <input type="submit" value="SEARCH">
                          </fieldset>
                        </form>`;
// show search page
function showSearch() {
  $.ajax({
    url: '/api/users/search/',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${sessionStorage.token}`
    },
    contentType: 'application/json',
    dataType: 'json',
    success: function(response) {
      courseVal = [];
      allergyVal = [];
      allowedIng = [];
      excludedIng = [];
      recipes = [];
      sessionStorage.setItem('firstName', response.firstName);
      renderPage(response, sessionStorage.getItem('firstName'), searchFormHtml, 'search');
      $('.js-courses').html(`${renderChkboxInputs(courseList)}`);
      $('.js-allergies').html(`${renderChkboxInputs(allergyList)}`);
      tagsFromInput(allowedIng, 'included-tags-input');
      tagsFromInput(excludedIng, 'excluded-tags-input');
      searchSubmit();
    },
    error: function(error) { console.log(error) }
  });
}
// render profile page html
const showProfileHtml = function(data) {
  return  `<div class="profile" id="${data._id}">
            <img src="images/FreeVector-Chef-Hat-Icons200x135.jpg" width="150">
            <h4>Registered username: ${data.email}</h4>
            <p>First name: <b>${data.firstName}</b><br>Last name: <b>${data.lastName}</b></p>
            <p>Saved shopping lists: <b>${data.listsCount}</b></p>
            <p style="text-align: center;">
              <a href="#search"><button>Start a new Search</button></a>
              <a href="#lists"><button>Go to saved lists</button></a>
              <a><button id="js-delete-account">Delete account</button></a>
            </p>
          </div>`;
  };
// show profile to user
function showProfile() {
  $.ajax({
    url: '/api/users/profile/',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${sessionStorage.token}`
    },
    contentType: 'application/json',
    dataType: 'json',
    success: function(response) {
      renderPage(response, sessionStorage.getItem('firstName'), showProfileHtml(response), 'profile');
      deleteAccount();
    },
    error: function(error) { console.log(error) }
  });
}
// Add stars to rating display
function starRating(target, id, ratingValue) {
  if (target.innerHTML != '') {
    target.innerHTML = '';
  }
  let starIcons = [];
  const starCount = 5;
  for (let i = 1; i <= starCount; i++) {
    const starIcon = document.createElement('i');
    starIcon.classList.add(`far`, `fa-star`, `star-${id}`, `nr-${i}`);
    starIcons.push(starIcon);
  }
  starIcons.forEach( icon => { target.appendChild(icon) } );
  for (let i = 1; i <= ratingValue; i++) {
    target.querySelector(`.nr-${i}`).classList.replace('far', 'fas');
  }
}
// Enable user to set shopping list rating
function setStarRating() {
  let starsContainer = document.getElementsByClassName('stars-outer');
  for (let item of starsContainer) {
    let targetId = item.id.replace('rating-', '');
    let icons = item.getElementsByClassName(`star-${targetId}`);
    for (let icon of icons) {
      // mouse cursor over star icon 
      icon.addEventListener('mouseenter', (e) => {
        const target = e.currentTarget;
        target.classList.add('js-star-hover');
        if (target.classList.contains('far')) {
          target.classList.replace('far', 'fas');
          target.classList.add('unselected');
        }
      });
      // mouse cursor left star icon 
      icon.addEventListener('mouseleave', (e) => {
        const target = e.currentTarget;
        target.classList.remove('js-star-hover');
        if (target.classList.contains('unselected')) {
          target.classList.replace('fas', 'far');
          target.classList.remove('unselected');
        }
      });
      // click the star icon
      icon.addEventListener('click', (e) => {
        const starNumber = e.currentTarget.classList[3].replace('nr-', '');
        let starValue = parseInt(starNumber);
        // save the new rating value to db
        $.ajax({
          url: '/api/users/lists/update',
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${sessionStorage.token}`,
          },
          data: JSON.stringify({ 
            list_id: targetId,
            rating: starValue
          }),
          contentType: 'application/json',
          dataType: 'json',
          success: (response) => {
            starRating(document.getElementById(`rating-${response.list_id}`), response.list_id, response.rating);
            // re-initialize the star icon event listeners
            setStarRating();
          },
          error: (error) => console.log(error)
        });
      });
    }
  }
}
// render lists html
const showListsHtml = function(data) {
  return '<section id="saved-lists">' + 
    data.map( (list, index) => `<div class="saved-lists-item" id="${list._id}"  style="text-align: center;">
      <h3 class="list-item-h3"><img src="${list.image}"><a  class="js-show-list">${index + 1}. ${list.title}</a></h3>
      <div id="rating-${list._id}" class="stars-outer"></div>
      <p>Comments: ${list.comments.length} </p>
      <div style="text-align: center;">
        <button class="js-show-list">View</button>
        <button id="${list._id}" class="js-delete-list">Delete</button>
      </div>
    </div>`).join('') + 
    '</section>';
};
// delete list from db
function deleteList() {
  $('.js-delete-list').on('click', function(e) {
    const list_id = $(e.currentTarget).attr('id');
    $.ajax({
      url: '/api/users/lists/delete',
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${sessionStorage.token}`
      },
      data: JSON.stringify({
        list_id: list_id
      }),
      contentType: 'application/json',
      success: (response) => {
        renderPage(response, sessionStorage.getItem('firstName'), showListsHtml(response.lists), 'lists');
        deleteList();
        showList();;
      },
      error: (error) => console.log(error)
    });
  });
}
// show lists to user
function showLists() {
  $.ajax({
    url: '/api/users/lists/',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${sessionStorage.token}`
    },
    contentType: 'application/json',
    dataType: 'json',
    data: {},
    success: function(response) {
      renderPage(response, sessionStorage.getItem('firstName'), showListsHtml(response.lists), 'lists');
      response.lists.map(item => {
        starRating(document.getElementById(`rating-${item._id}`), item._id, item.rating);
      });
      deleteList();
      showList();
      setStarRating();
    },
    error: function(error) { console.log(error) }
  });
}
// render list item html
const showListHtml = function(list) {
  return  `<div class="result" id="${list._id}">
            <div id="result-top">
              <img src="${list.image}" alt="Image of ${list.title}">
              <div id="rating-${list._id}" class="stars-outer"></div>
            </div>
            <div id="result-texts">
              <div id="ingredients">
                <h2>Items to buy:</h2>
                <ol>${list.ingredients.map( ingr => {return '<li>' + ingr + '</li>'} ).join('')}</ol>
                <p class="source">
                  For detailed instructions visit 
                  <a href="${list.sourceUrl}" target="_blank" aria-label="For instructions visit ${list.sourceName}.">
                    ${list.sourceName}
                  </a>.
                </p>
              </div>
              <div id="comments">
                <div class="yummly-ref">
                  <a href="${list.yummlyUrl}" target="_blank" aria-label="Link to selected recipe Yummly page">
                    <img id="yummly-logo" src="${list.yummlyLogo}" alt="Link to selected recipe Yummly page">
                    <br>
                    POWERED RECIPE
                  </a>
                </div>
                <div class="fb-share-button" data-href="${list.yummlyUrl}" data-layout="button" data-size="large" data-mobile-iframe="true">
                  <a target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=${list.yummlyUrl}&amp;src=sdkpreparse" class="fb-xfbml-parse-ignore">
                    <img src="images/flogo-RGB-HEX-Blk-58.svg" alt="Share on facebook">
                    <br>
                    SHARE WITH FRIENDS
                  </a>
                </div>
                <h2>Comments: ${list.comments.length} </h2>
                <ol>
                  ${list.comments.map( comment => {
                    return '<li id="' + 
                      comment._id + '">' + 
                      comment.content + 
                      '<button class="js-delete-comment">Delete comment</button></li>'})
                  .join('')}
                </ol>
                <form>
                  <label for="comment">
                    <input type"textarea" rows="4" cols="50" name="comment" id="js-comment-field" data-id="${list._id}" placeholder"Type your comment here...">
                  </label>
                </form>
                <button class="js-add-comment">Add comment</button>
              </div>
            </div>
            <div id="result-buttons">
              <!--<a><button><span>Share </span></button></a>-->
              <a><button id="${list._id}" class="js-delete-list"><span>Delete</span></button></a>
            </div>
          </div>`;
  };
// add comment to list item
function addComm() {
  $('.js-add-comment').on('click', function(e) {
    const commentField = $('#js-comment-field').val();
    const list_id = $('main > div').attr('id');
    const listTitle = $('header h1').text();
    if (!commentField) {
      return false;
    } else {
      $.ajax({
        url: '/api/users/comments/add',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.token}`
        },
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify({
          title: listTitle,
          content: commentField,
          list_id: list_id
        }),
        success: function(response) {
          renderPage(response, sessionStorage.getItem('firstName'), showListHtml(response), response.list._id);
          starRating(document.getElementById(`rating-${response.list._id}`), response.list._id, response.list.rating);
          $('title')
            .empty()
            .append(response.list.title);
          $('header h1')
            .empty()
            .append(response.list.title);
          addComm();
          deleteComm();
          deleteList();
          setStarRating();
        },
        error: function(error) { console.log(error) }
      });
      return false;
    }
  });
}
// delete comment 
function deleteComm() {
  $('.js-delete-comment').on('click', function(e) {
    const listId = $('main > div').attr('id');
    const commentId = $(e.currentTarget).closest('li').attr('id');
    const listTitle = $('header h1').text();
    $.ajax({
      url: '/api/users/comments/delete',
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${sessionStorage.token}`
      },
      data: JSON.stringify({
        title: listTitle,
        list_id: listId,
        comment_id: commentId
      }),
      contentType: 'application/json',
      success: (response) => {
        renderPage(response, sessionStorage.getItem('firstName'), showListHtml(response), response.list._id);
        starRating(document.getElementById(`rating-${response.list._id}`), response.list._id, response.list.rating);
        $('title')
          .empty()
          .append(response.list.title);
        $('header h1')
          .empty()
          .append(response.list.title);
        addComm();
        deleteComm();
        deleteList();
        setStarRating();
      },
      error: (error) => console.log(error)
    });
  });
}
// save list data to local storage
function saveListData(response) {
  sessionStorage.setItem(`list-${response._id}`, JSON.stringify(response));
}
// render list html
function renderList(input) {
  renderPage(input, sessionStorage.getItem('firstName'), showListHtml(input), input._id);
  starRating(document.getElementById(`rating-${input._id}`), input._id, input.rating);
  $('title')
    .empty()
    .append(input.title);
  $('header h1')
    .empty()
    .append(input.title);
  saveListData(input);
  addComm();
  deleteComm();
  deleteList();
  setStarRating();
}
// show list to user
function showList() { 
  const listItemBtn = $('#main').find('.js-show-list');
  listItemBtn.on('click', function(e){
    let itemId = $(e.currentTarget).closest('.saved-lists-item').attr('id');
    $.ajax({
      url: '/api/users/list/',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionStorage.token}`
      },
      data: { list_id: itemId },
      contentType: 'application/json',
      success: (data) => renderList(data.list),
      error: (error) => console.log(error)
    });
  });
}
// log out
function logOut() {
  savedHashes = [];
  sessionStorage.clear();
  window.location.replace('/');
}
// re-create search results html
function reloadSearchResults() {
  $('header')
    .empty()
    .append(`<div id="top-bar">
              <span id="header-name">
                <a href="#profile">
                  <img src="images/FreeVector-Chef-Hat-Icons40x27.jpg" alt="" width="38" aria-hidden="true">
                  Hi, ${sessionStorage.firstName}!
                </a>
              </span>
              <nav>
                <ul class="top-nav">
                  <a href="#search"><li>Search</li></a>
                  <a href="#lists"><li>Saved lists</li></a>
                  <a href="#profile"><li>My profile</li></a>
                  <a onclick='logOut()'><li>Log out</li></a>
                </ul>
              </nav>
            </div>
            <h1 id="logged-in-h1">Search results</h1>`);
  let apiDataFromsessionStorage = JSON.parse(sessionStorage.getItem('dataFromAPI'));  
  displaySearchResults(apiDataFromsessionStorage);
}
// render page when user clicks refresh button
window.onload = function(e) {
  sessionStorage.setItem('hash', window.location.hash.slice(1));
  if(sessionStorage.getItem(`list-${sessionStorage.hash}`)) {
    let listFromsessionStorage = JSON.parse(sessionStorage.getItem(`list-${sessionStorage.hash}`));
    renderList(listFromsessionStorage);
  } else if (sessionStorage.hash == 'search-results') {
    reloadSearchResults();
  } else {
    $.ajax({
      url: '/api/users/' + sessionStorage.hash,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionStorage.token}`
      },
      contentType: 'application/json',
      dataType: 'json',
      success: function() {
        switch (sessionStorage.hash) {
          case 'search':
            showSearch();
            break;
          case 'profile':
            showProfile();
            break;
          case 'lists':
            showLists();
            break;
        }
      },
      error: error => console.log(error)
    });
  }
}
// render page when user clicks page links or back/forward button
function renderPageFromHash() {
  sessionStorage.setItem('hash', window.location.hash.slice(1));
  switch (sessionStorage.hash) {
    case 'search':
      showSearch();
      break;
    case 'profile':
      showProfile();
      break;
    case 'lists':
      showLists();
      break;
    case 'search-results':
      reloadSearchResults();
      break;
    case sessionStorage.hash:
      let listFromsessionStorage = JSON.parse(sessionStorage.getItem(`list-${sessionStorage.hash}`));
      renderList(listFromsessionStorage);
      break;
  }
}
// what happens on window hash change
window.onhashchange = function() {
  if (sessionStorage.token) {
    renderPageFromHash();
  } else {
    logOut();
  }
}
// render checkboxes in search form
function renderChkboxInputs(inputArr) {
	let result = '';
  for (let i = 0; i < inputArr.length; i++) {
  	if (inputArr[i].type === 'course'){
      result += `<div class="checkbox">
                  <label>
                    <input type="checkbox" value="${inputArr[i].searchValue}" name="${inputArr[i].description}" class="${inputArr[i].type}">
                    ${inputArr[i].description}
                  </label>
                </div>`;
  	} else if (inputArr[i].type === 'allergy') {
      result += `<div class="checkbox">
                  <label>
                    <input type="checkbox" value="${inputArr[i].searchValue}" name="${inputArr[i].shortDescription}" class="${inputArr[i].type}">
                    ${inputArr[i].shortDescription}
                  </label>
                </div>`;
    }
  }
  return result;
}
// get checked values from search form
function getCheckedValues (targetClass, isAllergy) {
  // Declare variables to store checked item data
  let targetChecked = targetClass + ':checked';
  let checkedArray = [];
  // find checked values
  function lookForCheckedValues() {
    $(targetChecked).each(function() {
      checkedArray.push($(this).val());
    });
    checkedValues = checkedArray;
    if (isAllergy) {
      allergyVal = checkedValues;
    } else {
      courseVal = checkedValues;
    }
  }
  lookForCheckedValues();
}
// get tags from search form inputs
function tagsFromInput(tags, input) {
  [].forEach.call(document.getElementsByClassName(input), function (el) {
    // prepare inputs
    let hiddenInput = document.createElement('input'),
        mainInput = document.createElement('input');
    hiddenInput.setAttribute('type', 'hidden');
    hiddenInput.setAttribute('name', el.getAttribute('data-name'));
    mainInput.setAttribute('type', 'text');
    mainInput.classList.add('main-input');
    mainInput.addEventListener('input', function () {
      let enteredTags = mainInput.value.split(',');
      if (enteredTags.length > 1) {
        enteredTags.forEach(function (t) {
            let filteredTag = filterTag(t);
            if (filteredTag.length > 0)
                addTag(filteredTag);
        });
        mainInput.value = '';
        return tags;
      }
    });
    // enable user to enter tags with Comma or Enter keys
    mainInput.addEventListener('keydown', function (e) {
      let keyCode = e.which || e.keyCode;
      if (keyCode === 13 || keyCode === 188) {
      	e.preventDefault();
      	userEntered();
      } 
    });
    // validate input and add tag to query list
    function userEntered() {
      let emptyRegExp = /^ +$/;
      let enteredTag = mainInput.value;
      if (emptyRegExp.test(enteredTag)) {
        mainInput.value = '';
      } else if ( enteredTag.length > 0 ) {
        addTag(enteredTag);
        mainInput.value = '';
        return tags;
      }
    }
    // delete tag with Backspace
    mainInput.addEventListener('keydown', function (e) {
      let keyCode = e.which || e.keyCode;
      if (keyCode === 8 && mainInput.value.length === 0 && tags.length > 0) {
          removeTag(tags.length - 1);
      }
    });

    el.appendChild(mainInput);
    el.appendChild(hiddenInput);
    // create tag
    function addTag (text) {
      let tag = {
          text: text,
          element: document.createElement('span'),
      };
      tag.element.classList.add('tag');
      tag.element.textContent = tag.text;
      let closeBtn = document.createElement('span');
      closeBtn.classList.add('close');
      closeBtn.addEventListener('click', function () {
          removeTag(tags.indexOf(tag));
      });
      tag.element.appendChild(closeBtn);
      tags.push(tag);
      el.insertBefore(tag.element, mainInput);
      refreshTags();
    }
    // remove tag
    function removeTag (index) {
      let tag = tags[index];
      tags.splice(index, 1);
      el.removeChild(tag.element);
      refreshTags();
    }
    // update tags
    function refreshTags () {
      let tagsList = [];
      tags.forEach(function (t) {
          tagsList.push(t.text);
      });
      hiddenInput.value = tagsList.join(',');
    }
    // prepare tag for api call
    function filterTag (tag) {
      return tag.replace(/[^\w -]/g, '').trim().replace(/\W+/g, '+');
    }
  });
}

// search recipes API call 
function searchAPI(courseVal, allergyVal, allowedIng, excludedIng) {
  recipes = [];
  const settings = {
    url: 'https://api.yummly.com/v1/api/recipes?_app_id=' + 
      sessionStorage.getItem('yummly-id') + '&_app_key=' + 
      sessionStorage.getItem('yummly-key'),
    data: {
      q: '',
    	allowedCourse: courseVal,
    	allowedIngredient: allowedIng,
    	excludedIngredient: excludedIng,
      allowedAllergy: allergyVal,
      maxResult: 15
    },
    dataType: 'jsonp',
    type: 'GET',
    success: displaySearchResults 
  };
  $.ajax(settings);
}
// get recipe data from API 
function getRecipeData(recipeId, callback) {
  const settings = {
    url: 'https://api.yummly.com/v1/api/recipe/' + 
      recipeId + '?_app_id=' + 
      sessionStorage.getItem('yummly-id') + 
      '&_app_key=' + 
      sessionStorage.getItem('yummly-key'),
    recipe: {},
    dataType: 'jsonp',
    type: 'GET',
    success: callback
  };
  $.ajax(settings);
}
// add recipe data to array 
function saveRecipe(recipeData) {
  recipes.push({recipeData});
}
// create result item
function renderResult(result) {
  // save recipe results to array
  getRecipeData(result.id, saveRecipe);
  // convert cooking time from seconds to hours and minutes
  let h = Math.floor(result.totalTimeInSeconds / 3600);
  let m = Math.floor(result.totalTimeInSeconds % 3600 / 60);
  let hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours ") : "";
  let mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes") : "";
  let cookingTime =  hDisplay + mDisplay; 
  // append recipe to DOM
  $('#js-results').append(
    `<a class="js-result clearfix" id="${result.id}">
      <div>
        <img class="card-image" src="${result.imageUrlsBySize[90]}" alt="Loading recipe image animation"  aria-hidden="true">
        <h3>${result.recipeName}</h3>
        <div class="result-info">
          <div id="rating-${result.id}" class="stars-outer"></div>
          <p class="clock">${cookingTime}</p>
          <div class="clearfix">
            <h4 class="ingredients">Ingredients:</h4>
            <ul class="ingredients-list">${ingredientsList(result.ingredients)}</ul>
          </div>
          </div>
        </div>
      </a>`);
  // add star rating
  setTimeout( () => {
    starRating(document.querySelector(`#rating-${result.id}`), result.id, result.rating);
  }, 300); 
}
// return ingredients list items
function ingredientsList(ingredientArray) {
  let resultIngList = '';
  for (let i = 0; i < ingredientArray.length; i++) {
    resultIngList += '<li class="ingredients-item">';
    resultIngList += ingredientArray[i];
    resultIngList += '</li>';
  }
  return resultIngList;
}
// display search results to user 
function displaySearchResults(data) {
  window.location.hash = 'search-results';
  sessionStorage.setItem('dataFromAPI', JSON.stringify(data));
  $(window).animate({ scrollTop: 0 }, 'fast');
  $('title')
    .empty()
    .append('Search results');
  $('header h1')
    .empty()
    .append(`Search results`);
  $('main')
    .empty()
    .append(`<div id="js-results"></div>`);
  // Do we have results?
  if (data.matches.length > 0) {
    // Loop through the results and render them 
    data.matches.map( (item, index) => renderResult(item) );
    $('main').append(
      `<div>
        <h4>
          <a href="#search">Start a new search</a>
        </h4>
      </div>`);
    // init recipe details event listener
    showRecipeToUser();
  // no results from API
  } else {
    $('main').append(
      `<div class="back-link clearfix">
        <img class="card-image" src="images/FreeVector-Sad-Chef-Hat-Icons200x135.jpg" alt="Sad emoticon"  aria-hidden="true">
        <h3>No results found.</h3>
        <h4>
          <a href="#search">Start a new search</a>
        </h4>
      </div>`);
  }
}
// display selected recipe details
function showRecipeToUser() {
  $('.js-result').on('click', function(event) {
    event.preventDefault();
    // Store the clicked recipe data
    const recipeClicked = recipes.find(recipe => recipe.recipeData.id === this.id);
    const recipeDetails = {
      id: recipeClicked.recipeData.id,
      name: recipeClicked.recipeData.name,
      image: recipeClicked.recipeData.images[0].hostedLargeUrl,
      course: recipeClicked.recipeData.attributes.course,
      rating: recipeClicked.recipeData.rating,
      servings: recipeClicked.recipeData.yield,
      totalTime: recipeClicked.recipeData.totalTime,
      ingredients: recipeClicked.recipeData.ingredientLines,
      sourceName: recipeClicked.recipeData.source.sourceDisplayName,
      sourceUrl: recipeClicked.recipeData.source.sourceRecipeUrl,
      yummlyLogo: recipeClicked.recipeData.attribution.logo,
      yummlyUrl: recipeClicked.recipeData.attribution.url
    }
    // does the result have courses defined?
    function checkCourse() {
      if (recipeDetails.course) {
        recipeDetailsData = recipeDetails.course.join(', ');
        return recipeDetailsData;
      } else {
        return '-';
      }
    }
    // does the result have yield defined?
    function checkYield() {
      if (recipeDetails.servings) {
        return recipeDetails.servings;
      } else {
        return '-';
      }
    }
    // save list to user collection event listener
    function saveToLists() { 
      const saveListBtn = $('#lightbox-content').find('#js-save-list');
      saveListBtn.on('click', function(e){
        $.ajax({
          url: '/api/users/lists/add',
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionStorage.token}`,
          },
          data: JSON.stringify({ 
            title: recipeDetails.name,
            ingredients: recipeDetails.ingredients,
            rating: 0,
            yield: recipeDetails.yield,
            image: recipeDetails.image,
            sourceUrl: recipeDetails.sourceUrl,
            sourceName: recipeDetails.sourceName,
            yummlyUrl: recipeDetails.yummlyUrl,
            yummlyLogo: recipeDetails.yummlyLogo
          }),
          contentType: 'application/json',
          dataType: 'json',
          success: () => alert('List item added'),
          error: (error) => console.log(error)
        });
      });
    }
    // recipe details lightbox html
    const contentHtml = 
      `<p id="closeLightbox">X</p>
        <img src="${recipeDetails.image}" alt="${recipeDetails.name}"  aria-hidden="true">
        <h2>${recipeDetails.name}</h2>
        <div id="rating-${recipeDetails.id}" class="stars-outer"></div>
        <div id="lightbox-content-details">
          <p class="clock">${recipeDetails.totalTime}</p>
          <p class="courses"> ${checkCourse()}</p>
          <p class="yield">${checkYield()}</p>
        </div>
        <span class="ingredients">Ingredients:</span>
        <ol>
          ${ingredientsList(recipeDetails.ingredients)}
        </ol>
        <p class="source">
          For detailed instructions visit 
          <a href="${recipeDetails.sourceUrl}" target="_blank" aria-label="For detailed instructions visit ${recipeDetails.sourceName}.">
            ${recipeDetails.sourceName}
          </a>.
        </p>
        <p>
        <button id="js-save-list">Save to my lists</button>
          <div class="yummly-ref">
            <a href="${recipeDetails.yummlyUrl}" target="_blank" aria-label="Link to selected recipe Yummly page">
              <img id="yummly-logo" src="${recipeDetails.yummlyLogo}" alt="Link to selected recipe Yummly page">
              <br>
              POWERED RECIPE
            </a>
          </div>
          <div class="fb-share-button" data-href="${recipeDetails.yummlyUrl}" data-layout="button" data-size="large" data-mobile-iframe="true">
            <a target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=${recipeDetails.yummlyUrl}&amp;src=sdkpreparse" class="fb-xfbml-parse-ignore">
              <img src="images/flogo-RGB-HEX-Blk-58.svg" alt="Share on facebook">
              <br>
              SHARE WITH FRIENDS
            </a>
            
          </div>
        </p>`;
    // if lightbox exists
    if ($('#lightbox').length > 0) { 
      $('#lightbox-content').html(contentHtml);
      // show lightbox window 
      $('#lightbox').show();
      const ratingContainer = $('#lightbox-content').find(`#rating-${recipeDetails.id}`);
      starRating(ratingContainer[0], recipeDetails.id, recipeDetails.rating);
      saveToLists();
    // if lightbox does not exist
    } else { 
      // create HTML markup for lightbox window
      const lightbox = `<div id="lightbox">
                         <div id="lightbox-content">${contentHtml}</div>	
                       </div>`;
      $('body').append(lightbox);
      const ratingContainer = $('#lightbox-content').find(`#rating-${recipeDetails.id}`);
      starRating(ratingContainer[0], recipeDetails.id, recipeDetails.rating);
      saveToLists();
    }
    // click X to close lightbox
    $('#closeLightbox').on('click', function() {
      $('#lightbox-content').empty();
      $('#lightbox').hide();
    });
  });
}
// search form submit event listener
function searchSubmit() {
  $('.js-search-form').on('submit', function(event) {
    event.preventDefault();
    getCheckedValues('.course', false);
    getCheckedValues('.allergy', true);
    allowedIng = allowedIng.map( item => item.text.replace(' ', '+'));
    excludedIng = excludedIng.map( item => item.text.replace(' ', '+'));
    searchAPI(courseVal, allergyVal, allowedIng, excludedIng);
  });
}
// initialize app and render login page
function initClient() {
  if(!sessionStorage.token) {
    $('#header-container header').append('<h1>DinnerList<br><span>Recipe to Shopping List converter</span></h1>');
    $('#main').append(
      `<div id="start-page">
        <div>
          <h2>Sign in</h2>
          <span class="js-login-err err-message" aria-hidden="true" aria-live="assertive"></span>
          <form action="" id="js-login-form" class="login-form">
            <input type="text" name="username" id="js-username" aria-label="Email address" placeholder="Registered email address" required>
            <input type="password" id="js-user-pw" aria-label="Password" placeholder="Password" required>
            <input type="submit" value="log in" id="js-login-submit" aria-label="Log in" onclick="loginSubmit()">
          </form>
        </div>
        <div>
          <h2>Create account</h2>
          <span class="js-create-account-err err-message" aria-hidden="true" aria-live="assertive"></span>
          <form action="" id="js-create-account-form" class="create-account-form">
            <input type="text" name="firstname" id="js-firstname" aria-label="First name" placeholder="First name">
            <input type="text" name="lastname" id="js-lastname" aria-label="Last name" placeholder="Last name">
            <input type="email" name="email" id="js-new-user" aria-label="Your email address" placeholder="Your email address" required>
            <input type="password" id="js-new-pw" aria-label="Password" placeholder="Password (min 10 characters)" minlength="10" required>
            <input type="password" id="js-confirm-pw" aria-label="Re-enter password" placeholder="Re-enter password" minlength="10" required>
            <input type="submit" value="Create account" id="js-create-account-submit" aria-label="Create account" onclick="createAccountSubmit()">
          </form>
        </div>
      </div>`);
  }
}
// start your engines!
$(initClient);