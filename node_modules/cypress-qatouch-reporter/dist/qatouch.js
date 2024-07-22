"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var axios = require('axios');

var QaTouch = /** @class */ (function () {
    function QaTouch(options) {
        this.options = options;
        this.base = 'https://api.qatouch.com/api/v1/';
    }

    /**
     * Form the url for api
     *
     * @param path
     * @returns {string}
     * @private
     */
    QaTouch.prototype._url = function (path) {
        return `${this.base}${path}`;
    };

    QaTouch.prototype.publish = function (results) {

        let finalArray = this.addResultsForTestRun(results);
        let endPoint = `testRunResults/status/multiple?project=${this.options.projectKey}&test_run=${this.options.testRunId}&result=${JSON.stringify(finalArray)}&comments=Status changed by cypress automation script.`;

        return axios({
            method: 'PATCH',
            url: this._url(endPoint),
            headers: {
                "api-token": this.options.apiToken,
                "domain": this.options.domain,
                "Content-Type": "application/json"
            },
        })
            .then(function (response) {
                console.log(response);
            })
            .catch(function (error) {
                return console.error(error);
            });
    };

    /**
     * Add results for the test run in qaTouch
     *
     * @param results
     */
    QaTouch.prototype.addResultsForTestRun = function(results) {
        let result = [];
        results.forEach(function (value, item) {
            result.push({
                'case': value.case_id,
                'status': value.status_id,
            });
        });
        return result;
    };

    /**
     * status config values
     *
     * @param status
     * @returns {number}
     */
    QaTouch.prototype.statusConfig = function(status) {
        let statusId= 2;

        switch (status) {
            case 'Passed':
                statusId= 1;
                break;
            case 'Untested':
                statusId= 2;
                break;
            case 'Blocked':
                statusId= 3;
                break;
            case 'Retest':
                statusId= 4;
                break;
            case 'Failed':
                statusId= 5;
                break;
            case 'Not Applicable':
                statusId= 6;
                break;
            case 'In Progress':
                statusId= 7;
                break;
            default:
                statusId= 2
        }

        return statusId
    };

    /**
     * Title to case ids for qaTouch
     *
     * @param title
     * @returns {[]}
     * @constructor
     */
    QaTouch.prototype.TitleToCaseIds = function(title)
    {
        let caseIds = [];
        let testCaseIdRegExp = /\bTR(\d+)\b/g;
        let m;
        while((m = testCaseIdRegExp.exec(title)) !== null) {
            let caseId = parseInt(m[1]);
            caseIds.push(caseId);
        }
        return caseIds;
    };

    return QaTouch;

}());
exports.QaTouch = QaTouch;