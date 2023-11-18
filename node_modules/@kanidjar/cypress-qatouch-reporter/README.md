<h2 align="center">Cypress QATouch Reporter</h2>
<h3 align="center">
Push your Cypress test results into QATouch
</h3>

<div align="center">
<a href="https://github.com/kanidjar/cypress-qatouch-reporter/actions/workflows/build.yaml"><img src="https://github.com/kanidjar/cypress-qatouch-reporter/actions/workflows/build.yaml/badge.svg?branch=main" /></a>
<a href="https://github.com/kanidjar/cypress-qatouch-reporter/actions/workflows/test.yaml"><img src="https://github.com/kanidjar/cypress-qatouch-reporter/actions/workflows/test.yaml/badge.svg?branch=main" /></a>
<a href="https://github.com/kanidjar/cypress-qatouch-reporter/actions/workflows/lint.yaml"><img src="https://github.com/kanidjar/cypress-qatouch-reporter/actions/workflows/lint.yaml/badge.svg?branch=main" /></a>
</div>

### Introduction

This Cypress plugin allows you to push your Cypress test results into QATouch.

### Why this plugin?

Because [the official one](https://www.npmjs.com/package/cypress-qatouch-reporter) is not maintained anylonger and the bulk API it relies on is too unstable (random 500 errors)

### Installation

```sh
npm install @kanidjar/cypress-qatouch-reporter
```

### Configuration

```javascript
// cypress.config.js
const cypressJsonConfig = {
  reporter: "./node_modules/@kanidjar/cypress-qatouch-reporter",
  reporterOptions: {
    domain: "your_domain",
    apiToken: "your_api_token",
    projectKey: "your_project_key",
    testRunKey: "your_test_run_key",
    screenshotsFolder: "path_to_your_screenshot_folder", // optional - only if you want to upload screenshots of your tests to QATouch
  },
};
```

or using [cypress-multi-reporters](https://github.com/you54f/cypress-multi-reporters)

```javascript
// cypress.config.js
const cypressJsonConfig = {
  reporter: "./node_modules/cypress-multi-reporters",
  reporterOptions: {
    reporterEnabled: ["@kanidjar/cypress-qatouch-reporter"],
    kanidjarCypressQatouchReporterReporterOptions: {
      domain: "your_domain",
      apiToken: "your_api_token",
      projectKey: "your_project_key",
      testRunKey: "your_test_run_key",
      screenshotsFolder: "path_to_your_screenshot_folder", // optional - only if you want to upload screenshots of your tests to QATouch
    },
  },
};
```

### Usage

The title of your tests must start with "[QATouch-XXX]", XXX being your test result key.

```javascript
it("[QATouch-XXXX] should do something", () => {});
```

## License

Distributed under the Apache License. See `LICENSE.txt` for more information.

## Changelog

See `CHANGELOG.md` for more information.
