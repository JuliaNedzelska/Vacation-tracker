function uiView() {

    var currentController = null;
    uiView.setController = function(controller) {
        currentController = controller;
    }

    var currentData = null;
    uiView.setModel = function(model) {
        currentData = model;
    }

    //finding html elements and preparation for use in code
    var vacationListContainer = document.getElementById('vacancy-list');
    var logOut = document.getElementById('logOut');
    var availableVacationDays = document.getElementById('available-days');

    var startDaySelector = document.getElementById('startDay');
    var endDaySelector = document.getElementById('endDay');
    var commentSelector = document.getElementById('comment');

    var addVacationButton = document.getElementById('addVacation');
    var startDay;
    var endDay;
    var stringUserComment = "";


    //adding eventListeners to the html elements
    startDaySelector.addEventListener('change', selectStartDayEvent);
    endDaySelector.addEventListener('change', selectEndDayEvent);
    commentSelector.addEventListener('change', getStringComment);

    addVacationButton.addEventListener('click', clickAddButtonHandler);
    logOut.addEventListener('click', clickLogOutHandler);

    /*
   * handles input selector startDay of the vacation
   * converts string date to milliseconds and updates startDate variable
   */
    function selectStartDayEvent() {
        console.log('Selected startDay value: ', startDaySelector.value);
        startDay = new Date(startDaySelector.value);

        endDaySelector.min = startDay;
        console.log('Date obj: ', startDay);
    }

    /*
   * handles input selector endDay of the vacation
   * converts string date to milliseconds and updates endDay variable
   */
    function selectEndDayEvent() {
        console.log('Selected endDay value: ', endDaySelector.value);
        endDay = new Date(endDaySelector.value);

        console.log('Date obj: ', endDay);
    }

    /*
    * handles logout click event
    */
    function clickLogOutHandler(event) {
        currentController.logOut();
    }

    /*
   * gets string value from textarea
   * updates stringUserComment variable
   */
    function getStringComment() {
        console.log('Func getStringComment:', event.target.id)
        stringUserComment = commentSelector.value;
        console.log('Selected stringUserComment value: ', commentSelector.value);
    }

    /*
   * handles onclick event for the addVacation button
   */
    function clickAddButtonHandler(event) {
        console.log('Click event: ', event.target.id);
        var checkResult = currentController.tryAddVacation(startDay, endDay, stringUserComment);
        switch (checkResult) {
        case currentController.ADD_RESPONSE_CONSTS.OK:
            //do nothing
            break;
        case currentController.ADD_RESPONSE_CONSTS.ERROR_START_DAY_NOT_SET:
            showStartDayNotSet();
            break;
        case currentController.ADD_RESPONSE_CONSTS.DAYS_OFF_LESS:
            showWarningLessDays();
            break;
        case currentController.ADD_RESPONSE_CONSTS.BACK_TO_THE_FUTURE_ERROR:
            timeMashineError();
            break;
        }
    }

    //shows error message if user wrote incorrect data
    function showStartDayNotSet() {
        alert('Start day not set!');
    }

    //shows error message if user wrote incorrect data
    function showWarningLessDays() {
        alert('To much days!');
    }

    //shows error message if user wrote incorrect data
    function showWarningLessDays() {
        alert('The time machine is not invented');
    }


    //deletes vacation from DOM
    function clickDeleteHandler(event) {
        console.log('Func ClickDeleteHandler: ', event.target.userData);
        var resultDelete = event.target.userData;
        currentController.tryDeleteVacation(resultDelete.id);
    }

    /*
    * takes user info from server and fills empty vacation blocks in the DOM
    * @data - user data from data base
    */
    uiView.displayVacationList = function(data) {
        console.log('Func displayVacationList --> addVacationBlockEntry ', vacationListContainer);
        availableVacationDays.innerHTML = data.availableDays;
        vacationBlock.clearVacationList();
        for (var i = 0; i < data.vacationArray.length; i++) {
            vacationBlock.addVacationBlockEntry(data.vacationArray[i], clickDeleteHandler);
        }
    }

    uiView.getSelectedYear = function() {
        return "2017";
    }

    //creates vacation block, adds it to the DOM
    var vacationBlock = {
        clearVacationList: function() {
            var vacationList = document.getElementById('vacancy-list');
            while (vacationList.firstChild) {
                vacationList.removeChild(vacationList.firstChild);
            }
        },
        getDivContainer: function(tagName, className) {
            var tag = document.createElement(tagName);
            tag.classList.add(className);
            return tag;
        },
        //fills empty vacation block by user info
        fillVacancyBlock: function(element, userInfoElemet) {
            element.innerHTML = userInfoElemet;
        },
        createIcon: function(element, iconClassName, userInfoObject, clickHandler, parentBlock) {
            var icon = this.getDivContainer('i', 'fa');

            icon.classList.add(iconClassName);
            icon.setAttribute("aria-hidden", "true");
            icon.userData = userInfoObject;
            icon.parentBlock = parentBlock;

            icon.addEventListener("click", clickHandler);
            element.appendChild(icon);
        },
        //creates and appends empty vacation blocks to the dom
        addVacationBlockEntry: function(userInfoObject, deleteHandler) {

            //defining the main container and appending
            var contentContainer = this.getDivContainer('div', 'vacansy-list-container');
            vacationListContainer.appendChild(contentContainer);

            var content = this.getDivContainer('div', 'content');
            contentContainer.appendChild(content);

            //createing new div containers for the user vacation data
            var vacancyDate = this.getDivContainer('div', 'vacancy-date');
            var vacancyDays = this.getDivContainer('div', 'vacancy-days');
            var vacancyComment = this.getDivContainer('div', 'vacancy-comment');
            var vacancyIcons = this.getDivContainer('div', 'vacansy-icons');

            //creates icon delete
            this.createIcon(vacancyIcons, 'fa-trash-o', userInfoObject, deleteHandler, contentContainer);

            //appends childs to the DOM
            content.appendChild(vacancyDate);
            content.appendChild(vacancyDays);
            content.appendChild(vacancyComment);
            content.appendChild(vacancyIcons);

            //fills empty blocks with user info data from server
            this.fillVacancyBlock(vacancyDate, DateUtils.formateFromMillisecindsToStringDate(+(userInfoObject.startDay)) + ' - ' + DateUtils.formateFromMillisecindsToStringDate(+(userInfoObject.endDay)));
            this.fillVacancyBlock(vacancyDays, uiModel.countDays(userInfoObject) + ' days');
            this.fillVacancyBlock(vacancyComment, userInfoObject.comment);
        }
    }
    return uiView;
}
