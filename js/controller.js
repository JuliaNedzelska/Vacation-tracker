function uiController(currentData, currentView) {

    uiController.ADD_RESPONSE_CONSTS = {
        "OK": "OK",
        "DAYS_OFF_LESS": "DAYS_OFF_LESS",
        "BACK_TO_THE_FUTURE_ERROR": "BACK_TO_THE_FUTURE_ERROR",
        "ERROR_START_DAY_NOT_SET": "ERROR_START_DAY_NOT_SET"
    }

    var MS_IN_DAY = (1000 * 60 * 60 * 24);

    uiController.start = function() {
        currentData.setController(uiController);
        currentView.setController(uiController);
        var year = currentView.getSelectedYear();
        currentData.getVacationData(year);
    }


   //takes data from ui_page filled by user
    uiController.tryAddVacation = function(startDay, endDay, comment) {
        var resultVacationDays = calculateCountOfVacationDays(startDay, endDay);
        if (resultVacationDays > 0 && resultVacationDays <= currentData.availableDays) {
            currentData.addVacation(startDay, endDay, comment);
            return uiController.ADD_RESPONSE_CONSTS.OK;
        } else if (resultVacationDays > 0 && resultVacationDays > currentData.availableDays) {
            return uiController.ADD_RESPONSE_CONSTS.DAYS_OFF_LESS;
        } else if (resultVacationDays <= 0) {
            return uiController.ADD_RESPONSE_CONSTS.BACK_TO_THE_FUTURE_ERROR;
        }
    }

    uiController.tryDeleteVacation = function(id) {
      uiModel.tryDeleteVacation(id);
    }

  /*
   * defines count of vacation days by substracting endDay from startDay
   * @startDay - the first day of vacation in milliseconds
   * @endDay - the last day of vacation in milliseconds
   * @return - count of vacation days in integer
   */
    function calculateCountOfVacationDays(startDay, endDay) {
        console.log('_________________________________');
        console.log('Func calculateCountOfVacationDays');

        var countVacationDays = 0;
        var endDayPlus = endDay.getTime() + MS_IN_DAY;

        countVacationDays = endDayPlus - startDay.getTime();
        countVacationDays = (countVacationDays / MS_IN_DAY);

        console.log('Count of vacation days: ', countVacationDays);
        uiModel.availableDays = countVacationDays;
        return countVacationDays;
    }

  /*
   * updates count of vacation days by substracting endDay from startDay
   * @resultVacationDays - the first day of vacation in milliseconds
   */
    function updateAvailableDays(resultVacationDays) {
        console.log('_________________________________');
        console.log('Func updateAvailableDays');

        availableVacationDays = availableVacationDays - resultVacationDays;

        console.log('availableVacationDays', availableVacationDays);
    }

    //Server part

    uiController.onServerResponse = function(response) {
        if (response.errorID != 0) {
          onServerError();
          return;
        }
        switch (response.action) {
          case "addVacation":
          case "getVacationData":
          case "deleteVacation":
              currentView.displayVacationList(response.data);
              break;
        }
    }

    function getVacationData() {
        var year = "2017";
        serverHandler.getVacationData(year);
    }

    function onServerError() {
      uiController.logOut();
    }

    uiController.logOut = function() {
      CoockieUtils.deleteCookie("user");
      CoockieUtils.deleteCookie("sid");
      window.location.href = 'index.html';
    }

    return uiController;
}
