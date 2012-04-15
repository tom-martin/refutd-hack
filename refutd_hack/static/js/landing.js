jQuery(function($){
    var userEmail = "";
    var userPhone = "";
    var userMainName = "";
    var userFamilyName = "";
    var userNickName = "";
    var userAge = "";
    var userGender = "";
    var userCountry = "";
    var userUsername = "";
    var userPassword = "";

    $('document').ready(function() {
        $('#createprofile').click(function () {
            $('#signup-modal-content').modal({
                opacity:80,
                containerCss:{
                    height: '550px',
                    width: '900px',
                    background: 'url("/static/img/redux/panel.png") no-repeat top left'
                },
                overlayCss: {backgroundColor:"#000"}
            });

            $('#step_1').show();
            $('input:radio').uniform();
            return false;
        });

        $('#countrySelector').click(function () {
           $("#countrySelector option[value='to_remove']").remove();
        });

        $('#ageSelector').click(function () {
           $("#ageSelector option[value='to_remove']").remove();
        });

        $('#mainName').keyup(function() {
            var name = $('#mainName').val();
            if(name.length > 1){
                getSimilarNameCount(name);
            }
        });

        $('#continue_1').click(function () {
            resetGroup('emailGroup');
            resetGroup('mobileGroup');

            // Is email radio group filled
            var emailChioce = $("input[name=email]:checked").val();
            if(typeof emailChioce === 'undefined'){
                shakeAndHighlightGroup('emailGroup');
                return false;
            }

            // Is mobile radio group filled
            var mobileChoice = $("input[name=mobile]:checked").val();
            if(typeof mobileChoice === 'undefined'){
                shakeAndHighlightGroup('mobileGroup');
                return false;
            }

            userEmail = $('#emailText').val();
            var userEmailRepeated = $('#emailTextRepeat').val();
            // Matching and validation
            if("yes" == emailChioce && (userEmail != userEmailRepeated || !validateEmail(userEmail) || userEmail == "")){
                highlightGroup('emailGroup');
                shakeField('emailTextFields');
                return false;
            }

            userPhone = $('#phoneText').val();
            // Validation
            if("yes" == mobileChoice && userPhone == ""){
                highlightGroup('mobileGroup');
                shakeField('mobileTextField');
                return false;
            }


            $('#step_1').hide();
            $('#step_2').fadeIn('slow');
        });

        $('#previous_2').click(function () {
            $('#step_2').hide();
            $('#step_1').fadeIn('slow');
        });

        $('#continue_2').click(function () {
            userMainName = $('#mainName').val();
            userFamilyName = $('#familyName').val();
            userNickName = $('#nickName').val();

            resetGroup('mainNameGroup');
            if(userMainName.length < 2){
                shakeAndHighlightGroup('mainNameGroup');
                return false;
            }

            $('#step_2').hide();
            $('#step_3').fadeIn('slow');
        });

        $('#previous_3').click(function () {
            $('#step_3').hide();
            $('#step_2').fadeIn('slow');
        });

        $('#previous_4').click(function () {
            $('#step_4').hide();
            $('#step_3').fadeIn('slow');
        });

        $('#continue_3').click(function () {
            userAge = $('#ageSelector').val();
            userGender = $("input[name=gender]:checked").val(); ;
            userCountry = $('#countrySelector').val();

            // Is gender radio group filled
            var genderChoice = $("input[name=gender]:checked").val();
            if(typeof genderChoice === 'undefined'){
                shakeAndHighlightGroup('genderGroup');
                return false;
            }

            $('#step_3').hide();
            $('#step_4').fadeIn('slow');
        });

        $('#continue_4').click(function () {
            userUsername = $('#userName').val();
            userPassword = $('#userPassword').val();
            var userPasswordRepeated = $('#passwordRepeated').val();

            resetGroup('usernameGroup');
            resetGroup('passwordGroup');
            $('#warning_2').hide();

            if(userUsername.length == 0){
                shakeAndHighlightGroup('usernameGroup');
                return false;
            }

            if(userPassword.length == 0 || userPassword != userPasswordRepeated){
                shakeAndHighlightGroup('passwordGroup');

                if(userPassword != userPasswordRepeated){
                    showWarning(passwordWarning);
                }

                return false;
            }

            $('#loader').show();
            createUser();
            $('#step_4').hide();
        });

        $('#email_yes').click(function () {
            resetGroup('emailGroup');
            $('#emailInput').show();
            displayWarning();
        });

        $('#email_no').click(function () {
            resetGroup('emailGroup');
            $('#emailInput').hide();
            displayWarning();
        });

        $('#mobile_yes').click(function () {
            resetGroup('mobileGroup');
            $('#mobileInput').show();
            displayWarning();
        });

        $('#mobile_no').click(function () {
            resetGroup('mobileGroup');
            $('#mobileInput').hide();
            displayWarning();
        });

        $('select, input:radio').uniform();

        var opts = {lines: 10, length: 10, width: 7, radius: 17, color: '#444', speed: 1, trail: 60, shadow: false};
        $('.loader').each(function(){
            new Spinner(opts).spin(this);
        });
    });

    function showWarning(msg){
        $('#warning_2').show();
        $('#warning_2 div').html(msg);
    }

    function validateEmail(email){
        var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
         return emailReg.test(email);
    }

    function highlightGroup(field){
        $('#'+field).addClass('dashed-red');
        $('#'+field).removeClass('dashed');
    }

    function resetGroup(field){
        $('#'+field).addClass('dashed');
        $('#'+field).removeClass('dashed-red');
    }

    function shakeField(field){
        $('#'+field).effect("shake", { times:3 }, 100);
    }

    function shakeAndHighlightGroup(field){
        $('#'+field).effect("shake", { times:3 }, 100);
        highlightGroup(field);
    }

    function createUser(){
        $.ajax({
            type: "POST",
            url: "/user/createuser",
            data: "userEmail="+userEmail+"&userPhone="+userPhone+"&userMainName="+userMainName+"&userFamilyName="+userFamilyName+"&userNickName="+userNickName+"&userAge="+userAge+"&userGender="+userGender+"&userCountry="+userCountry+"&userUsername="+userUsername+"&userPassword="+userPassword,
            success: function(msg){
                if(msg.status == 'OK'){
                    setField('#nameHolder', msg.name);
                    setField('#nickHolder', msg.nick);
                    setField('#ageHolder', msg.age);
                    setField('#countryHolder', msg.country);
                    setGenderIcon(msg.gender);
                    setProfileCompleteness(msg.completeness);
                    $('#loader').hide();
                    $('#step_final').fadeIn('slow');

                    //set the session variable so we don't show the notification on the search page
                    $.ajax({type: "POST", url: "/user/setHideNotif"});
                } else {
                    $('#loader').hide();
                    $('#step_4').show();
                    showWarning(msg.remark);
                }
            },
            error:function (xhr, ajaxOptions, thrownError){
                $('#loader').hide();
                $('#step_4').show();
                showWarning("Could not create user, please try again later");
            }
        });
    }

    function setField(name, value){
        if(value == '') value = '&nbsp;';
        $(name).html(value);
    }

    function setGenderIcon(gender){
        if(gender == "MALE"){
            $('#genderHolder').html("male");
            $('#genderIcon').attr("src","/static/img/redux/maleicon.png");
        } else if(gender == "FEMALE"){
            $('#genderHolder').html("female");
            $('#genderIcon').attr("src","/static/img/redux/femaleicon.png");
        } else {
            $('#genderHolder').html("keep secret");
            $('#genderIcon').attr("src","/static/img/redux/secreticon.png");
    }}

    function getSimilarNameCount(name){
        $.ajax({
            type: "POST",
            url: "/user/similarnames",
            data: "name=" + name,
            success: function(msg){
                if(msg.status == 'OK'){
                    $('#profileCount').html(msg.remark);
                    $('#profileName').html(name);
                    $('#profileWarning').show();
                }
            }
        });
    }

    function displayWarning(){
        if($('#mobile_no').is(':checked') && $('#email_no').is(':checked'))
            $('#warning_1').show();
        else
            $('#warning_1').hide();
    }

    function setProfileCompleteness(percentage){
        $('#bubble').html(percentage + '%');
        $('#completed').css('width', 280*percentage/100);
    }
});

function showPopup(){
    $('#forgot-modal-content').modal({
        opacity:80,
        containerCss:{
        height: '230px',
        width: '381px',
        background: 'url("/static/img/redux/smallpanel.png") no-repeat top left'
         },
        overlayCss: {backgroundColor:"#000"}
    });
    $('#forgottenPage').show();
    var opts = {lines: 10, length: 2, width: 2, radius: 3, color: '#444', speed: 1, trail: 52, shadow: false};

    $('.progress').each(function(){
       new Spinner(opts).spin(this);
    });
}

function requestPassword(){
    showPwdLoader()
    var email =  $('#forgotEmail').val();

    $.ajax({
        type: "POST",
        url: "/user/requestpassword",
        data: "email=" + email,
        success: function(msg){
            hidePwdLoader();
            if(msg.status == 'OK'){
                $('#requestPassword').hide();
                $('#requestPasswordFeedback').html(passwordRequestFeedback + ' ' + email);
                $('#requestPasswordFeedback').show();
            } else {
                $('#requestPasswordFeedback').html(passwordRequestError);
                $('#requestPasswordFeedback').show();
            }
        },
        error:function (xhr, ajaxOptions, thrownError){
            hidePwdLoader();
            $('#requestPasswordFeedback').html(passwordRequestError);
            $('#requestPasswordFeedback').show();
        }
    });
}

function showPwdLoader(){
    $('#savebtn').hide();
    $('.progress').show();
}

function hidePwdLoader(){
    $('#savebtn').show();
    $('.progress').hide();
}
