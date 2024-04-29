import { common } from "../../fixtures/dev/common";
import { loginpage_locators } from "../../fixtures/dev/locators";
import { accountspage_locators } from "../../fixtures/dev/locators";
// npx cypress run --spec "cypress/e2e/PageNavigation/*"
// npx cypress run --spec "cypress/e2e/PageNavigation/accounts_page.cy.js"
// npx cypress open
Cypress.config('defaultCommandTimeout', 10000); // Set default timeout to 10 seconds (adjust as needed)

it('Go to Malinator',() =>{
    cy.visit(common.login_url)
    //------------------------------------------------------
    cy.get(loginpage_locators.email_field).type(common.adminEmail)
    cy.get(loginpage_locators.pass_field).type(common.adminPass)
    cy.get(loginpage_locators.submit_button).click()
})

