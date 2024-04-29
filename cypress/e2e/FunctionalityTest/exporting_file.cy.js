import { common } from "../../fixtures/dev/common";
import { dashboardpage_locators, loginpage_locators } from "../../fixtures/dev/locators";
Cypress.config('defaultCommandTimeout', 10000); // Set default timeout to 10 seconds (adjust as needed)

beforeEach(() => {
    cy.visit(common.login_url)
    //------------------------------------------------------
    cy.get(loginpage_locators.email_field).type(common.adminEmail)
    cy.get(loginpage_locators.pass_field).type(common.adminPass)
    cy.get(loginpage_locators.submit_button).click()
})

// describe('Dashboard Page - Wait Page to Load',() =>{
//     it('All required in Network should load',() =>{
//         cy.intercept('GET', common.requestURLbalance)
//         .as('getRequestBalances');
//         cy.wait('@getRequestBalances')
//         .its('response.statusCode').should('eq', 200);
//     })
//     it('All required in Network should load',() =>{
//         cy.intercept('GET', common.requestURLadminPermissions)
//         .as('getRequestAdminPermissions');
//         cy.wait('@getRequestAdminPermissions')
//         .its('response.statusCode').should('eq', 200);
//     })
// })

describe('EXPORTING FILE VALIDATION',() =>{
    it('Dashboard exporting file',() =>{
        cy.get(dashboardpage_locators.dashboard_export_btn).click();

        // cy.intercept('POST', common.dashboard_export_auth)
        // .as('getExportAuth');
        // cy.wait('@getExportAuth')
        // .its('response.statusCode').should('eq', 200);

        cy.intercept('POST', common.dashboard_export_auth && 
        common.dashboard_export_response)
        .as('getExportResponse');
        cy.wait('@getExportResponse')
        .its('response.statusCode').should('eq', 200);

        cy.contains(dashboardpage_locators.dashboard_export_btn, 'Download file').should('be.visible');
    })
})
