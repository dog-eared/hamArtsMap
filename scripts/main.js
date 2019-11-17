//Global variables:
let map;
let infobox;
let searchManager;

var currentLocation;
var pinLocation;
var currentPin;

var lastModal;

var filters = {
    museums: true,
    art: true,
    monuments: true
};

const colors = {
    "Public Art" : "#8a318c",
    "Monuments" : "#75ab79",
    "Museums" : "#4d938e"
}

const loader = '<div class="spinner-border text-danger" role="status"><span class="sr-only">Loading...</span></div>';


$(document).ready(function() {
    navigator.geolocation.getCurrentPosition(function(loc) {
        currentLocation = loc.coords;
    });

    $("#js__results--close").on("click", function() {
        showResults(false);
        //TODO Clear results for next search
        showSplash(true);
    });

    $(".js__go").on("click", function() {
        term = $(this).siblings(".js__searchbox").val();
        $(this).siblings(".js__searchbox").val(term); //Ensure matching terms

        searchForTerm(term);
    });

    $(".details__reviews").on("click", function() {
        loadReviews();
    });
    
    $(".details__images").on("click", function() {
        loadImages();
    });

    $("#js__hide-ui").on("click", function() {
        $(".results__container").addClass("d-none");
        $("#js__hide-ui").addClass("d-none");
        $("#js__show-ui").removeClass("d-none");
    });

    $("#js__show-ui").on("click", function() {
        $(".results__container").removeClass("d-none");
        $("#js__hide-ui").removeClass("d-none");
        $("#js__show-ui").addClass("d-none");
    });

    $(".js__post__review").on("click", function() {
        $("#post__review").find(".locale__id").val(parseInt($(".location__details").data("locationDetailsId")));
        lastModal = $(".location__details");
        lastModal.modal("hide");
        $("#post__review").modal("show");
    });
    
    $(".js__post__image").on("click", function() {
        $("#js__post--image").val(parseInt($(".location__details").data("locationDetailsId")));
        lastModal = $(".location__details");
        lastModal.modal("hide");
        $("#post__image").modal("show");
    });

    $(".js__alert--close").on("click", function() {
        $(".submit__alert").removeClass("show");
    });

    $(".toggle__filter").on("click", function() {
        var currentFilter = $(this).data("filter");
        if (filters[currentFilter]) {
            filters[currentFilter] = false;
            $(".toggle__filter[data-filter='" + currentFilter + "'] > i").text("check_box_outline_blank");
        } else {
            filters[currentFilter] = true;
            $(".toggle__filter[data-filter='" + currentFilter + "'] > i").text("check_box");
        }
    });

    $(".js__submit--review").on("click", function(data) {
        var name = $("#post__review--author").val();
        var email = $("#post__review--email").val();
        var rating = $("#post__review--rating").val();
        var content = $("#post__review--content").val();
        var locale = $("#post__review").find(".locale__id").val();

        $.post("reviews.php", { authorName : name, authorEmail: email, rating: rating, content: content, localeId: locale, reviewAction: "add"})
        .done(function(data) {
            
            data = JSON.parse(data);
            
            if (data.hasOwnProperty("error")) {
                switch (data["error"]) {
                    case -1:
                        showErrorMessage("Ensure that you've provided valid inputs.");
                        break;
                    default:
                        showErrorMessage("An unknown error has occured. Notify the developer at evan.mulrooney@mohawkcollege.ca.");
                        break;
                }
                return;
            } else if (data.hasOwnProperty("success")) {
                showSuccessMessage("Successfully posted!");
                $("#post__review--form")[0].reset();
                return;
            }
        });


    });

    $(".js__submit--image").on("click", function() {
        var name = $("#post__image--author").val();
        var imageUrl = $("#post__image--url").val();
        var locale = $("#post__image").find(".locale__id").val();

        $.post("images.php", { authorName: name, url: imageUrl, localeId: locale,  imageAction: "add" } )
        .done(function(data) {
            
            data = JSON.parse(data);
            
            if (data.hasOwnProperty("error")) {
                switch (data["error"]) {
                    case -1:
                        showErrorMessage("Ensure that you've provided a valid author name and URL.");
                        break;
                    default:
                        showErrorMessage("An unknown error has occured. Notify the developer at evan.mulrooney@mohawkcollege.ca.");
                        break;
                }
                return;
            } else if (data.hasOwnProperty("success")) {
                showSuccessMessage("Successfully posted!");
                $("#post__image--form")[0].reset();
                return;
            }

        });
    });

    $(".js__close__modal--2nd").on("click", function() {
        lastModal.modal("show");
    });

    $(".search__highest").on("click", function() {
        presetSearch("highestRated");
    });
    
    $(".search__unreviewed").on("click", function() {
        presetSearch("unreviewed");
    });
    
    $(".search__nearby").on("click", function() {
        presetSearch("nearby");
    });


    $(".recent__images__img").on("click", function() {
        $.post("locales.php", {action: "view", specificId: $(this).data("locale")})
            .done(function(data) {
                currentData = JSON.parse(data);
                showLocationDetails(currentData[0]); 
            });
    });
});


function initApp() {
    getMap();
    getDirectionsManager();
    infobox = new Microsoft.Maps.Infobox(map.getCenter(), null);
    infobox.setHtmlContent("");
    infobox.setOptions({visible: false});
    infobox.setMap(map);    
}

function getMap() {
    map = Microsoft.Maps.Map('#map', {
        credentials: "AsFbvK5rycmcVWN5vZDHMqwfWCFLQE3YekuZo8o6l5ZKL5aU3nB-fDQnvsZmUud1",
        center: new Microsoft.Maps.Location(43.2557, -79.8711),
        zoom: 10
    });
}


function presetSearch(searchType) {
    searchObject = {};

    switch (searchType) {
        case "unreviewed":
            $(".results__container").find("h3").text("Search for unreviewed:");
            searchObject["filterUnreviewed"] = true;
        break;
        case "highestRated":
            $(".results__container").find("h3").text("Search for highest rated:");
            searchObject["filterHighestRated"] = true;
            break;
        case "nearby":  
            if (currentLocation == undefined) {
                showErrorMessage("Please let us detect your location, first.");
                navigator.geolocation.getCurrentPosition(function(loc) {
                    currentLocation = loc;
                }, function() {
                    showErrorMessage("Can't get nearby locations");
                });

                break;
            } else {
                $(".results__container").find("h3").text("Search for nearby:");
                searchObject["filterNearby"] = true;
                searchObject["currentLong"] = currentLocation.longitude;
                searchObject["currentLat"] = currentLocation.latitude;
            } 
            break;
        default:
            break;
    }

    search(searchObject);
}

/**
 * Called by clicking on submit button
 */
function searchForTerm(term) {
    searchObject = {searchTerm: term};
    $(".results__container").find("h3").text("Search for: " + term);

    if (!filters["museums"] === filters["art"] || !filters["museums"] === filters["monuments"]) {
        if (filters["museums"])
            searchObject["filterMuseums"] = true;
        if (filters["art"])
            searchObject["filterArt"] = true;
        if (filters["monuments"])
            searchObject["filterMonuments"] = true;
    }

    search(searchObject);
}

function search(searchObj) {
    clearResults();
    showSplash(false);
    showResults(true);

    $.post("locales.php", searchObj)
        .done(function(data) {
            currentData = JSON.parse(data);

            killSearchLayer();
            searchLayer = new Microsoft.Maps.Layer("searchLayer");    

            for (var i = 0; i < currentData.length; i++) {
                currentPin = createMapPin(currentData[i]);
                createSearchResultItem(currentData[i]);
                searchLayer.add(currentPin);
            }
    
            $(".results__list").find(".spinner-border").remove();
            map.layers.insert(searchLayer);
    });
}

/**
 * Removes the layer entirely.
 */
function killSearchLayer() {
    for (var i = 0; i < map.layers.length; i++) {
        if (map.layers[i].getId() == "searchLayer") {
            map.layers[i].dispose();
            return;
        }
    }
}

function createSearchResultItem(locationObject) {
    var temp = document.getElementsByTagName("template")[0];
    var clone = temp.content.cloneNode(true);
    
    $(clone).find(".result__title").find("a").text(locationObject["name"]);
    $(clone).find(".result__blurb").text(locationObject["blurb"]);
    $(clone).find(".result__title").find("a").on("click", function() {
        showLocationDetails(locationObject);
    });

    $(".results__list")[0].appendChild(clone);
}

/**
 * Create a new pin w appropriate data
 * @param JSON object - locationObject - json representation of all location info 
 */
function createMapPin(locationObject) {
    pinLocation = new Microsoft.Maps.Location(parseFloat(locationObject.lat), parseFloat(locationObject.long));

    var pushpin = new Microsoft.Maps.Pushpin(pinLocation, {
        title: locationObject["name"],
        color: colors[locationObject["category"]]
    });

    Microsoft.Maps.Events.addHandler(pushpin, 'click', function() {
        showLocationDetails(locationObject);
    });

    return pushpin;
}

function showLocationDetails(locationObject) {
    $(".location__details").find(".modal-title").text(locationObject["name"]);
    $(".location__details").find(".location__blurb").text(locationObject["blurb"]);
    $(".location__details").first().data("locationDetailsId", locationObject["id"]);
    $(".location__details").find(".location__blurb").trigger("click");
    setRating($(".location__details").find(".location__rating"), locationObject["rating"]);

    $(".location__details").modal("show");

    $('.location__details').find(".details__blurb").trigger("click");

    map.setView({
        center: getLocationWithOffset(parseFloat(locationObject.lat), parseFloat(locationObject.long)),
        zoom: 10
    });
}

function getLocationWithOffset(lat, long) {

    if ($(".results__container").hasClass("d-none")) {
        return new Microsoft.Maps.Location(lat, long);
    } else {        
        offset = $(".results__container").width();

        var p = map.tryLocationToPixel(new Microsoft.Maps.Location(lat, long));
        p.x -= (offset / 2);
        return map.tryPixelToLocation(p);
        
    }

}

function loadReviews() {
    $(".location__reviews").html("").append(loader); //clear existing reviews
    var reviews = $(".location__details").first().data("locationDetailsId");

    $.post("reviews.php", {reviewId: reviews, reviewAction: "view"} )
    .done(function(data) {
        reviewData = JSON.parse(data);
        $(".location__reviews").html("");

        if (reviewData.hasOwnProperty("error")) {
            $(".location__reviews").html("<p class='no-results'>No results!</p>");
            return;
        }

        var temp = document.getElementsByTagName("template")[1];
        
        for (var i = 0; i < reviewData.length; i++) {
            var data = reviewData[i];
            var clone = temp.content.cloneNode(true);
            $(clone).find(".review__author").text("")
                .append($('<a></a>')
                .attr("href", "mailto:" + data["email"])
                .append(data["author"]));
            $(clone).find(".review__date").text(data["date"]);
            $(clone).find(".review__rating").text(data["rating"]);
            $(clone).find(".review__content").text(data["content"]);
            $(".location__reviews").append(clone);

        }
    });
}

function loadImages() {
    $(".location__images").html("").append(loader); //clear existing images
    var images = $(".location__details").data("locationDetailsId");    

    $.post("images.php", {imageId: images, imageAction: "view"} )
    .done(function(data) {
        $(".location__images").html("");
        imageData = JSON.parse(data);

        if (imageData.hasOwnProperty("error")) {
            $(".location__images").html("<p class='no-results'>No results!</p>");
            return;
        }

        var temp = document.getElementsByTagName("template")[2];
        for (var i = 0; i < imageData.length; i++) {
            var data = imageData[i];
            var clone = temp.content.cloneNode(true);
            $(clone).find(".image__img").attr("src", data["imageUrl"]);
            $(clone).find(".image__caption").text(data["author"] + " -- " + data["date"]);
            $(".location__images").append(clone);
        }
    });
}

function setRating(starContainer, ratingValue) {
    var stars = starContainer.children("i");
    for (var i = 0; i < 5; i++) {
        stars[i].innerHTML = ((i + 1) <= ratingValue ? "star" : "star_border");
    }
    $(starContainer).attr("aria-label", ratingValue + " out of 5 stars");
}

function getDirectionsManager() {
    Microsoft.Maps.loadModule('Microsoft.Maps.Directions', function () {
        directionsManager = new Microsoft.Maps.Directions.DirectionsManager(map);
        directionsManager.setRequestOptions({ routeMode: Microsoft.Maps.Directions.RouteMode.driving });
        directionsManager.setRenderOptions({ itineraryContainer: '.directions__list' });
    });
}

function showSplash(setVisible) {
    if (setVisible)
        $(".splash__container, header, footer").removeClass("d-none");
    else
        $(".splash__container, header, footer").addClass("d-none");
}

function clearResults() {
    $(".results__list").children().remove();
    $(".results__list").append(loader);
}

function showResults(setVisible) {
    if (setVisible)
        $(".results__container").removeClass("d-none");
    else
        $(".results__container").addClass("d-none");
}

function showErrorMessage(message) {
    $(".submit__alert").addClass("show").find("p").text(message);
    setTimeout(hideMessage, 4500, "alert");
}

function showSuccessMessage(message) {
    $(".submit__success").addClass("show").find("p").text(message);
    setTimeout(hideMessage, 4500, "success");
}

function hideMessage(messageType) {
    $(".submit__" + messageType).removeClass("show");
}