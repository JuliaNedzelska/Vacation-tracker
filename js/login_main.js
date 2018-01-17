var loginButton = document.getElementById('login_button');
console.log('loginButton');

var loginField = document.getElementById('login_field');
var passwordField = document.getElementById('password_field');
var rememberMeCheckBox = document.getElementById('rememberme_checkbox');

loginButton.addEventListener('click', onClickLoginButton);

//hndles click event on Login button
function onClickLoginButton(event) {
    if (loginField.value != "" && passwordField.value != "") {
        sendTryLogin(loginField.value, passwordField.value);
    }
}

//send request to the server
function sendTryLogin(user, pass) {
    var req = {};
    req.action = "login";
    req.data = {};
    req.data.user = user;
    req.data.pass = pass;
    this.sendHTTPRequest('http://localhost:8081', JSON.stringify(req), 'POST');
}

function sendHTTPRequest(target, data, type) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = this.onHTTPRequest;
    xhttp.open(type, target, true);
    xhttp.send(data);
}

function onHTTPRequest() {
    if (this.readyState == 4 && this.status == 200) {
        var response = JSON.parse(this.responseText);
        onServerResponse(response);
    }
}

function onServerResponse(response) {
    switch (response.action) {
    case "login":
        onLoginResponse(response.data, response.errorID);
        break;
    }
}

function onLoginResponse(data, errorID) {
    deleteCookie("sid");
    if (errorID == 0) {
        var options = {
            "expires": rememberMeCheckBox.checked ? 1000 * 60 * 60 * 24 * 7 : 0
        }
        setCookie("sid", data.sid, options);
        setCookie("user", data.user, options);
        window.location.href = 'ui_page.html';
    } else {//show login error
    }
}

function getCookie(name) {
    var matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

function setCookie(name, value, options) {
    options = options || {};

    var expires = options.expires;

    if (typeof expires == "number" && expires) {
        var d = new Date();
        d.setTime(d.getTime() + expires * 1000);
        expires = options.expires = d;
    }
    if (expires && expires.toUTCString) {
        options.expires = expires.toUTCString();
    }

    value = encodeURIComponent(value);

    var updatedCookie = name + "=" + value;

    for (var propName in options) {
        updatedCookie += "; " + propName;
        var propValue = options[propName];
        if (propValue !== true) {
            updatedCookie += "=" + propValue;
        }
    }

    document.cookie = updatedCookie;
}

function deleteCookie(name) {
    setCookie(name, "", {
        expires: -1
    })
}
