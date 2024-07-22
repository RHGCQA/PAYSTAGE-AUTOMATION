"use strict";

/**
 * @type {*|(function(...[*]=))}
 * @private
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

Object.defineProperty(exports, "__esModule", { value: true });

var mocha = require("mocha");
var qatouch = require("./qatouch");

/**
 * @type {function(*=, *): *|CypressQaTouchReporter}
 */
var CypressQaTouchReporter = /** @class */ (function (_super) {
    __extends(CypressQaTouchReporter, _super);

    /**
     * QaTouch Reporter Function
     *
     * @param runner
     * @param options
     * @returns {*|CypressQaTouchReporter}
     * @constructor
     */
    function CypressQaTouchReporter(runner, options) {
        var _this = _super.call(this, runner) || this;
        const stats = runner.stats;
        _this._indents = 0;
        _this.results = [];
        _this._passes = 0;
        _this._fails = 0;
        _this._untested = 0;

        var reporterOptions = options.reporterOptions;
        _this.qaTouch = new qatouch.QaTouch(reporterOptions);
        _this.validate(reporterOptions, 'domain');
        _this.validate(reporterOptions, 'apiToken');
        _this.validate(reporterOptions, 'projectKey');
        _this.validate(reporterOptions, 'testRunId');

        /**
         * Event handler for runner start
         */
        runner.on('start', function () {
            console.log('start');
        });

        /**
         * Event handler for test pass
         *
         * @param test
         */
        runner.on('pass', function (test) {
            console.log(`${_this.indent(_this._indents)}pass: ${test.fullTitle()}`);

            _this._passes++;
            let status_id = _this.qaTouch.statusConfig('Passed');
            let caseIds = _this.qaTouch.TitleToCaseIds(test.title);
            if (caseIds.length > 0) {
                let results = caseIds.map(caseId => {
                    return {
                        case_id: caseId,
                        status_id: status_id,
                    };
                });
                (_a = _this.results).push.apply(_a, results);
            }
            var _a;
        });

        /**
         * Event handler for test skip
         *
         * @param test
         */
        runner.on('pending', function (test) {
            console.log(
                `${_this.indent(_this._indents)}untested: ${test.fullTitle()}`
            );
            _this._untested++;
            let status_id = _this.qaTouch.statusConfig('Untested');
            let caseIds = _this.qaTouch.TitleToCaseIds(test.title);
            if (caseIds.length > 0) {
                let results = caseIds.map(caseId => {
                    return {
                        case_id: caseId,
                        status_id: status_id,
                    };
                });
                (_a = _this.results).push.apply(_a, results);
            }
            var _a;
        });

        /**
         * Event handler for test fail
         *
         * @param test
         */
        runner.on('fail', function (test) {
            console.log(
                `${_this.indent(_this._indents)}fail: ${test.fullTitle()}`
            );
            _this._fails++;
            let status_id = _this.qaTouch.statusConfig('Failed');
            let caseIds = _this.qaTouch.TitleToCaseIds(test.title);
            if (caseIds.length > 0) {
                let results = caseIds.map(caseId => {
                    return {
                        case_id: caseId,
                        status_id: status_id,
                    };
                });
                (_a = _this.results).push.apply(_a, results);
            }
            var _a;
        });

        /**
         * Event handler for runner end
         */
        runner.on('end', function () {
            console.log(`end: ${stats.passes}/${stats.passes + stats.failures} ok`);
            if (_this.results.length === 0) {
                console.warn("No test cases were matched. Ensure that your tests are declared correctly and matches TRxxx");
                return;
            }
            _this.qaTouch.publish(_this.results);
        });
        return _this;
    }

    /**
     * Validate function
     *
     * @param options
     * @param name
     */
    CypressQaTouchReporter.prototype.validate = function (options, name) {
        if (options == null) {
            throw new Error('Missing reporterOptions in cypress.json');
        }
        if (options[name] == null) {
            throw new Error("Missing " + name + " value. Please update reporterOptions in cypress.json");
        }
    };

    /**
     * Indent function
     *
     * @param indent
     * @returns {string}
     */
    CypressQaTouchReporter.prototype.indent = function(indent) {
        return Array(indent).join('  ');
    };

    return CypressQaTouchReporter;
}(mocha.reporters.Spec));

exports.CypressQaTouchReporter = CypressQaTouchReporter;