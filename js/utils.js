var AppConsts = {
    "MS_IN_DAY": 1000 * 60 * 60 * 24
}

var DateUtils = {
    "formatDate": function(date) {
        return date.getDate() + "." + (date.getMonth() + 1);
    },
    "formatDateString": function(dateStr) {
        var date = new Date(dateStr);
        return this.formatDate(date);
    },
    "formateFromMillisecindsToStringDate": function(dateMs) {
        var date = this.formatDate(new Date(dateMs));
        return date;
    },
    "formateFromMillisecindsToDays": function(dateMs) {
        var date = Math.round(dateMs / AppConsts.MS_IN_DAY);
        return date;
    }
}

var CoockieUtils = {
    "getCookie": function(name) {
        var matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    },

    "setCookie": function(name, value, options) {
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
    },

    "deleteCookie": function(name) {
        this.setCookie(name, "", {
            expires: -1
        })
    }
}
