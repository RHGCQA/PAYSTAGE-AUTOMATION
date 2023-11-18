import { common } from "../../fixtures/dev/common";
import { loginpage_locators } from "../../fixtures/dev/locators";
import { dashboardpage_locators } from "../../fixtures/dev/locators";

beforeEach(() => {
    cy.visit(common.login_url);
    //------------------------------------------------------
    cy.get(loginpage_locators.email_field).type(common.adminEmail)
    cy.get(loginpage_locators.pass_field).type(common.adminPass)
    cy.get(loginpage_locators.submit_button).click()
})

describe('Dashboard Page - UI validation',() =>{
    
    it('Dashboard Page Title',() =>{
        cy.title().then(actualPageTitle => {
            cy.title().should('eq',actualPageTitle)
        });
    })

    it('Dashboard Page URL',() =>{
        cy.url().then(actualPageTitle => {
            cy.url().should('eq',actualPageTitle)
        });
    })

})

describe('Dashboard Page - Wait for the Balances to Load',() =>{
    it('All required in Network should load',() =>{
        cy.intercept('GET', common.requestURLbalance)
        .as('getRequestBalances');

        cy.wait('@getRequestBalances')
        .its('response.statusCode').should('eq', 200);
    })
})

describe('Dashboard Page - Wait for the Admin Permissions to Load',() =>{
    it('All required in Network should load',() =>{
        cy.intercept('GET', common.requestURLadminPermissions)
        .as('getRequestAdminPermissions');

        cy.wait('@getRequestAdminPermissions')
        .its('response.statusCode').should('eq', 200);
    })
})

// describe('Dashboard Page - Should have Element',() =>{
//     it.only('Dashboard Balance should displayed',() =>{
//         cy.get(dashboardpage_locators.login_error_message_header)
//         .should('be.visible').contains(errormessage.erorrheader);

//     })
// })