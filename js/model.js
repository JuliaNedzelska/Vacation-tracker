function uiModel() {

    //user available vacation days
    uiModel.availableDays = 0;
    
    var currentController = null;
    uiModel.setController = function(controller) {
        currentController = controller;
    }
    uiModel.getVacationData = function(year) {
        serverHandler.getVacationData(year);
    }

    uiModel.addVacation = function(startDay, endDay, comment) {
        serverHandler.addVacation(startDay, endDay, comment);
    }

    //test func to check the server connection
    uiModel.testConnection = function() {
        serverHandler.testConnection();
    }

    /*
    * counts vacation days interval by taking startDay and endDay from userInfoObject
    * @return - countVacationDays
    */
    uiModel.countDays = function(userInfoObject) {
        var countVacationDays = 0;
        var endDayPlus = parseInt(userInfoObject.endDay) + AppConsts.MS_IN_DAY;

        countVacationDays = endDayPlus - parseInt(userInfoObject.startDay);
        countVacationDays = (countVacationDays / AppConsts.MS_IN_DAY);
        return countVacationDays;
    }

    uiModel.getUser = function()    {
        return CoockieUtils.getCookie("user");
    }

    //gets session id
    uiModel.getSID = function() {
        return CoockieUtils.getCookie("sid");
    }

    //checks properties and deletes vacation
    uiModel.tryDeleteVacation = function(id) {
      return serverHandler.deleteVacation(id);
    }

    //functions for server communications
    var serverHandler = {
        "user":"",
        "sid":"",
        deleteVacation: function(id) {
            var req = {};
            req.action = "deleteVacation";
            req.data = {};
            req.data.id = id;
            req.data.user = this.user;
            req.data.sid = this.sid;
            this.sendHTTPRequest('http://localhost:8081', JSON.stringify(req), 'POST');

        },
        getVacationData: function(year) {
            var req = {};
            req.action = "getVacationData";
            req.data = {};
            req.data.year = year;
            req.data.user = this.user;
            req.data.sid = this.sid;
            this.sendHTTPRequest('http://localhost:8081', JSON.stringify(req), 'POST');
        },
        addVacation: function(startDay, endDay, comment) {
            var req = {};
            req.action = "addVacation";
            req.data = {};
            req.data.startDay = startDay.getTime();
            req.data.endDay = endDay.getTime();
            req.data.comment = comment;
            req.data.user = this.user;
            req.data.sid = this.sid;
            this.sendHTTPRequest('http://localhost:8081', JSON.stringify(req), 'POST');
        },
        updateVacation: function(vavationId, startDay, endDay, comment) {},
        sendHTTPRequest(target, data, type) {
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = this.onHTTPRequest;
            xhttp.open(type, target, true);
            xhttp.send(data);
        },
        onHTTPRequest() {
            if (this.readyState == 4 && this.status == 200) {
                var data = JSON.parse(this.responseText);
                currentController.onServerResponse(data);
            }
        }
    };
    serverHandler.user = CoockieUtils.getCookie("user");
    serverHandler.sid = CoockieUtils.getCookie("sid");
    return uiModel;
}
