// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
// Clear session storage
// Cypress.Commands.add('clearSessionStorage', () => {
//     cy.window().then((window) => {
//         window.sessionStorage.clear();
//     });
// });

// Clear cookies, local storage, and session storage
Cypress.Commands.add('clearCache', () => {
    // cy.clearCookies();
    cy.clearLocalStorage();
    // cy.clearSessionStorage();
});

Cypress.Commands.add('updateQATouchTestResult', (runResult, status) => {
    const config = {
        domain: "rhgc",
        apiToken: "7ea772854e8bfb90e92cbdcf321b554cf54de05b565120e9cf31a7de3bbc1975",
        projectKey: "2aMB",
        testRunId: "Dbe6Z"
    };

    cy.request({
        method: 'PATCH',
        url: `https://api.qatouch.com/api/v1/testRunResults/status?status=${status}&project=${config.projectKey}&test_run=${config.testRunId}&run_result=${runResult}`,
        headers: {
            'api-token': config.apiToken,
            'Content-Type': 'application/json',
            'domain': config.domain
        },
        body: {
            'status': status,
            'project': config.projectKey,
            'test_run': config.testRunId,
            'run_result': runResult
        },
        failOnStatusCode: false  // To catch the response even if it's not 2xx
    }).then(response => {
        if (response.status !== 200) {
            cy.log('Failed to update QA Touch. Status:', response.status);
        } else {
            expect(response.status).to.eq(200);
        }
    });
});

Cypress.Commands.add('resetQATouchStatuses', (runResult, status) => {
    const config = {
        domain: "rhgc",
        apiToken: "7ea772854e8bfb90e92cbdcf321b554cf54de05b565120e9cf31a7de3bbc1975",
        projectKey: "2aMB",
        testRunId: "Dbe6Z"
    };

    cy.request({
        method: 'PATCH',
        url: `https://api.qatouch.com/api/v1/bulkupdate?status=${status}&project=${config.projectKey}&test_run=${config.testRunId}`,
        headers: {
            'api-token': config.apiToken,
            'Content-Type': 'application/json',
            'domain': config.domain
        },
        body: {
            'status': status,
            'project': config.projectKey,
            'test_run': config.testRunId,
            'run_result': runResult
        },
        failOnStatusCode: false  // To catch the response even if it's not 2xx
    }).then(response => {
        if (response.status !== 200) {
            cy.log('Failed to update QA Touch. Status:', response.status);
        } else {
            expect(response.status).to.eq(200);
        }
    });
});