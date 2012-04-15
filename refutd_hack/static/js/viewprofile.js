var profileGuid;
jQuery(function($){

    $("#markBtn").click(function(event){
        event.preventDefault();
        event.stopPropagation();
        var link = $(this);
        if(link.html() == markProfileLabel){
            $.getJSON("/user/markprofile", {userGuid: userGuid, markedGuid:profileGuid}, function(json) {
                if(json.status == "OK"){
                    $("#markicon").attr("src","/img/redux/staricon.png");
                    link.attr("id",json.remark);//contains the create favorite guid
                    link.html(unmarkProfileLabel);
                }else{
                    // TODO
                }
            });
        }else{
            $.getJSON("/user/unmarkprofile", {markedGuid:profileGuid}, function(json) {
                if(json.status == "OK"){
                   $("#markicon").attr("src","/img/redux/emptystaricon.png");
                   link.html(markProfileLabel);
                }else{
                    // TODO
                }
            });
        }

        //dispatch event to update the list in sidebars ?

        return false;
    });

    $("#reportLink").click(function(event){
        event.preventDefault();
        event.stopPropagation();
        $("#row1,#row2,#row3,#row4,#contactBox").fadeOut('fast');
        $("#reportBox").fadeIn('fast');
        return false;
    });

    $("#abuseCancel").click(function(event){
        event.preventDefault();
        event.stopPropagation();
        $("#row1,#row2,#row3,#row4").fadeIn('fast');
        $("#reportBox").fadeOut('fast');
        return false;
    });

    $("#bluecontactbtn").click(function(event){
        event.preventDefault();
        event.stopPropagation();
        $("#row1,#row2,#row3,#row4,#reportBox").fadeOut('fast');
        $("#contactBox").fadeIn('fast');
        return false;
    });

    $("#replyCancel").click(function(event){
        event.preventDefault();
        event.stopPropagation();
        $("#row1,#row2,#row3,#row4").fadeIn('fast');
        $("#contactBox").fadeOut('fast');
        return false;
    });

    $("#replyBtn").click(function(event){
        event.preventDefault();
        event.stopPropagation();
        $("#errorText").fadeOut('fast');
        $.getJSON("/message/doPostMessage", {messageSubject:$("#replySubject").val(), messageBody:$("#replyText").val(), recipientGuid:profileGuid}, function(json) {
            if(json.result){
                $.modal.close();
            }else{
               $("#errorText").fadeIn('fast');
            }
        });
        return false;
    });

    $("#bluereportSubmit").click(function(event){
        event.preventDefault();
        event.stopPropagation();
        $("#errorText").fadeOut('fast');
        var comments =  $("#abuseText").val();

        var postData = {abuserUsername: viewusername, comments: comments};
        $.getJSON("/message/postabuse", postData, function(json) {
            if(json.result){
                $("#row1,#row2,#row3,#row4").fadeIn('fast');
                $("#reportBox").fadeOut('fast');
            }
            else{
                $("#errorText").fadeIn('fast');
            }
        });
        return false;
    });

    return false;
});

function getAndShowProfile(guid, isMarked, displayControls){
        $.getJSON("/search/getProfile", {guid:guid}, function(json) {
        if(json){
            populateProfile(json, isMarked, displayControls);
            $('#modal-content').modal({
                opacity:80,
                position: [125],
                containerCss:{
                    height: '423px',
                    width: '691px',
                    background: 'url("/img/redux/viewprofile_back.png") no-repeat top left'
                },
                overlayCss: {backgroundColor:"#000"}
            });

            $("#view_profilecont").show();
        }else{
            /* todo */
        }
    });
    return false;
}

function getCountryName(isonumber){
    var arLen=countries.length;
    for ( var i=0; i<arLen; i++){
        if(countries[i].value == isonumber)
            return countries[i].name;
    }
    return "";
}

function populateProfile(profile, isMarked, displayControls){
    profileGuid = profile.guid;

    $('#view_profileImage').attr("src","/profile/image/"+profile.guid+'?r='+new Date().getTime());
    setHTMLValue('viewProfile_FullName', profile.fullname);
    setHTMLValue('viewProfile_NickName', profile.nickname);
    setHTMLValue('viewProfile_Age', profile.age);
    $('#viewProfile_Country').html(getCountryName(profile.country));
    if(profile.gender == "MALE"){
        $('#viewProfile_Gender').attr("src","/img/redux/maleicon.png");
        $('#viewProfile_GenderText').html('Male');
    } else if(profile.gender == "FEMALE"){
        $('#viewProfile_Gender').attr("src","/img/redux/femaleicon.png");
        $('#viewProfile_GenderText').html('Female');
    } else {
        $('#viewProfile_Gender').attr("src","/img/redux/secreticon.png");
        $('#viewProfile_GenderContainer').css("margin-top","0px");
        $('#viewProfile_GenderText').html('Unknown');
    }

    setHTMLValue('viewProfile_occupation', profile.occupation);
    setHTMLValue('viewProfile_lineage', profile.familyLineage);
    setHTMLValue('viewProfile_Hometown', profile.homeTown);
    setHTMLValue('viewProfile_Parenthometown', profile.parentsNationality);
    setHTMLValue('viewProfile_Siblings', profile.siblings);
    setHTMLValue('viewProfile_Tribe', profile.tribe);
    setHTMLValue('viewProfile_FavoriteFood', profile.favoriteFood);
    setHTMLValue('viewProfile_FavoriteSong', profile.favoriteSong);
    setHTMLValue('viewProfile_Lastseen', profile.lastSeen);
    setHTMLValue('viewProfile_Otherinfo', profile.otherInfo);
    setHTMLValue('viewProfile_FavoritePlace', profile.favoritePlace);
    setHTMLValue('viewProfile_physicalTraits', profile.physicalTraits);

    if(isMarked){
        $('#markicon').attr("src","/img/redux/staricon.png");
        $('#markBtn').html(unmarkProfileLabel);
    }

    if(displayControls == true) $('#profileControls').show();
    else $('#profileControls').hide();
}

function setHTMLValue(field, value){
    if(typeof value === 'undefined') value = "";
    $('#' + field).html(value);
}