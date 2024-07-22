# QA Touch
Test Together

Collaborative Test Case Management tool For Modern QA Teams

# QA Touch Reporter for Cypress

Pushes test results into QA Touch system.

## Installation

```shell
$ npm i cypress-qatouch-reporter
```

## Usage
Ensure that your QA Touch API is enabled and generate your API keys. See https://doc.qatouch.com/#qa-touch-api

Add reporter to cypress.json file:

```Javascript

    ...
    "reporter": "cypress-qatouch-reporter",
    "reporterOptions": {
        "domain" : "your-domain",
        "apiToken": "your-token",
        "projectKey": "project-key",
        "testRunId": "test-run-id"
    },

```


Mark your cypress test names starts with ID of QA Touch test run cases. Ensure that your case ids are well distinct from test descriptions.
 
```Javascript
it("TR001 Authenticate with invalid user")
```

Only passed, untested and failed tests will be published in QA Touch Test Run.

## Options

**domain**: *string* domain name of your QA Touch instance (e.g. dckap)

**apiToken**: *string* API token for user which will be created in the edit profile menu in your domain login

**projectKey**: *number* project key with which the tests are associated

**testRunId**: *number* test run Id with which the tests are associated

## References
- https://www.npmjs.com/package/cypress-qatouch-reporter
- https://qatouch.com/
- https://help.qatouch.com/
- https://doc.qatouch.com/
