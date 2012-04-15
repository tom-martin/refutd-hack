var gender;//1 = male, 2 female
var name;
var age;
var country;
var birthPlace;
var homeTown;
var tribe;
var familySize;
var parentsNationality;
var viewusername;
var resultslist;
var lastType;

jQuery(function($){
    $('#gender_MALE').click(function(event){
        $('#searchstep2 .searchstepheader').html(maleSelectedText);
        $('#searchresulttext2').html(maleSelectedText_Submit);
        $('#searchstep3 .searchstepheader').html(maleStep3Header);
        $('#step3info').html(maleStep3Info);
        $('#searchstep4 .searchstepheader').html(maleStep4Header);
        $('#step5birthplace').html(step5BirthplMaleText);
        $('#step5siblings').html(step5siblingsMaletext);
        $('#step5tribe').html(step5tribeMaletext);
        $('#step5parents').html(step5parentsMaletext);

        $('#searchstep2,#searchresultsubmit').show();

        showLoader('#searchstep1matches');
        gender = 1;
        doSearch(1);
        return false;
    });

    $('#gender_FEMALE').click(function(event){
        $('#searchstep2 .searchstepheader').html(femaleSelectedText);
        $('#searchresulttext2').html(femaleSelectedText_Submit);
        $('#searchstep3 .searchstepheader').html(femaleStep3Header);
        $('#step3info').html(femaleStep3Info);
        $('#searchstep4 .searchstepheader').html(femaleStep4Header);
        $('#step5birthplace').html(step5BirthplFeMaleText);
        $('#step5siblings').html(step5siblingsFeMaletext);
        $('#step5tribe').html(step5tribeFeMaletext);
        $('#step5parents').html(step5parentsFeMaletext);

        $('#searchstep2,#searchresultsubmit').show();

        showLoader('#searchstep1matches');
        gender = 2;
        doSearch(1);
        return false;
    });

    $('#nameselect').click(function(event){
        event.preventDefault();
        event.stopPropagation();
        name = $('#names').val();
        showLoader('#searchstep2matches');
        doSearch(2);
        return false;
    });

    $('#age').change(function(event){
        age = $('#age').val();
        showLoader('#searchstep3matches');
        doSearch(3);
        return false;
    });

    $('#country').change(function(event){
        country = $('#country').val();
        showLoader('#searchstep4matches');
        doSearch(4);
        return false;
    });

    $('#submitbtn').click(function(event){
        event.preventDefault();
        event.stopPropagation();
        return false;
    });

    $('#moredetails').click(function(event){
        event.preventDefault();
        event.stopPropagation();

        //show more details
        $("#searchstep5").show();
        $("#searchresultsubmit, #searchresultbtn2").hide();
        return false;
    });

    $('#updatesearch').click(function(event){
        event.preventDefault();
        event.stopPropagation();
        birthPlace = $('#birthPlace').val();
        homeTown = $('#homeTown').val();
        tribe = $('#tribe').val();
        familySize = $('#familySize').val();
        familySize = familySize == "-1" ? "" : familySize;
        parentsNationality = $('#parentsNationality').val();

        showLoader('#searchstep5matches');
        doSearch(5);

        return false;
    });

    $('#searchsubmit, #bluesubmitbtn').click(function(event){
        event.preventDefault();
        event.stopPropagation();

        top.location.href = "/search/result";
        return false;
    });

    $('#notifclosebtn, #nothanxbtn').click(function(event){
        event.preventDefault();
        event.stopPropagation();

        $('#profilenotification').slideToggle('fast');

        $.ajax({type: "POST", url: "/user/setHideNotif"});

        return false;
    });

    //reset search
    $.ajax({type: "POST", url: "/search/resetQuery"});

    $('select, input:radio').uniform();

    var opts = {lines: 10, length: 2, width: 2, radius: 3, color: '#fff', speed: 1, trail: 52, shadow: false};
    $('.loader').each(function(){
        new Spinner(opts).spin(this);
    });
});

function showLoader(element){
    $(element).removeClass().addClass("graybubble").addClass('searchstepmatches');
    $(element+' span').html(searchingText);
    $(element+ ' ~ div').show();
    $(element).show();
}

function hideLoader(element){
    $(".graybubble").removeClass().addClass("smallgraybubble").addClass('searchstepmatches');
    $(".purplebubble").removeClass().addClass("smallgraybubble").addClass('searchstepmatches');
    $(element).removeClass().addClass("purplebubble").addClass('searchstepmatches');
    $(element+ ' ~ div').hide();
}

function doSearch(type){
    var postData;
    if(lastType > type)
    {
        switch(type){
            case 1:
                postData = {gender: gender, name: "", limit: 10};
                break;
            case 2:
                postData = {gender: gender, name: name, limit: 10};
                break;
            case 3:
                postData = {gender: gender, name: name, age: age, limit: 10};
                break;
            case 4:
                postData = {gender: gender, name: name, age: age, country: country, limit: 10};
                break;
            case 5:
                postData = {gender: gender, name: name, age: age, country: country, birthPlace: birthPlace, homeTown: homeTown, tribe: tribe, familySize: familySize, parentsNationality: parentsNationality, limit: 10};
                break;
        }
        //lastType = type;
        $.getJSON("/search/doSearch", postData, function(json) {
            setResults(type, json.results, true);
        });
    }
    else
    {
        lastType = type;
        postData = {gender: gender, name: name, age: age, country: country, birthPlace: birthPlace, homeTown: homeTown, tribe: tribe, familySize: familySize, parentsNationality: parentsNationality, limit: 10};
        $.getJSON("/search/doSearch", postData, function(json) {
            setResults(type, json.results, false);
        });
    }
}

function getCountryName(isonumber){
    var arLen=countries.length;
    for ( var i=0; i<arLen; i++){
        if(countries[i].value == isonumber)
            return countries[i].name;
    }
    return "";
}

function setResults(type, results, repeatSearch){
    var sResultText = searchResultText.replace('{0}', results);
    $('#searchresulttext').html(sResultText);
    var maxResults = results > 10 ? 10 : results;

    switch(type)
    {
        case 1://gender
            hideLoader('#searchstep1matches');
            $('#searchstep1matches span').html(results + " " +matchesText);
            $('#results').show();
            if(repeatSearch){
                name = $('#names').val();
                showLoader('#searchstep2matches');
                doSearch(2);
            }
            break;
        case 2://name
            hideLoader('#searchstep2matches');
            $('#searchstep2matches span').html(results + " " +matchesText);

            var nInfoText = nameInfoText.replace('{0}', results);
            nInfoText = nInfoText.replace('{1}', name);
            $('#informationbox2 p').html(nInfoText);
            $('#informationbox2').show();

            $('#searchstep3').show();

            if(repeatSearch){
                age = $('#age').val();
                showLoader('#searchstep3matches');
                doSearch(3);
            }
            break;
        case 3:
            hideLoader('#searchstep3matches');
            $('#searchstep3matches span').html(results + " " +matchesText);
            var aInfoText;
            if(age == "-1"){
                aInfoText = ageInfoText2.replace('{0}', results);
            }
            else if(age == "17"){
                aInfoText = ageInfoText3.replace('{0}', results);
            }
            else{
                aInfoText = ageInfoText.replace('{0}', results);
                aInfoText = aInfoText.replace('{1}', age);
            }
            $('#informationbox3 p').html(aInfoText);
            $('#informationbox3').show();

            $('#searchstep4').show();
             if(repeatSearch){
                 country = $('#country').val();
                 showLoader('#searchstep4matches');
                 doSearch(4);
             }
            break;
        case 4:
            hideLoader('#searchstep4matches');
            $('#searchstep4matches span').html(results + " " +matchesText);

            var cInfoText = countryInfoText.replace('{0}', results);
            cInfoText = cInfoText.replace('{1}', $('#country :selected').text());
            $('#informationbox').html(cInfoText);

            $('#searchresulttext2').hide();
            $('#searchresultbtn2').show();
             if(repeatSearch){
                birthPlace = $('#birthPlace').val();
                homeTown = $('#homeTown').val();
                tribe = $('#tribe').val();
                familySize = $('#familySize').val();
                parentsNationality = $('#parentsNationality').val();

                showLoader('#searchstep5matches');
                doSearch(5);
             }
            break;
        case 5:
            hideLoader('#searchstep5matches');
            $('#searchstep5matches span').html(results + " " +matchesText);
            break;
    }
}

