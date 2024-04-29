import { common } from "../../fixtures/dev/common";
import { loginpage_locators } from "../../fixtures/dev/locators";

Cypress.config('defaultCommandTimeout', 10000); // Set default timeout to 10 seconds (adjust as needed)

let paystage_url = 'https://develop.paystage.net/login'
let mailinator_url = 'https://www.mailinator.com/v4/public/inboxes.jsp?msgid=jpaytestpk-1697098314-194303205&to=TestHamburgerCharlie'

describe('Verify Email in Mailinator',() =>{
    it('Go to Malinator',() =>{
        cy.visit(paystage_url)
        cy.visit(common.login_url)
        //------------------------------------------------------
        cy.get(loginpage_locators.email_field).type(common.adminEmail)
        cy.get(loginpage_locators.pass_field).type(common.adminPass)
        cy.get(loginpage_locators.submit_button).click()

        cy.visit(mailinator_url)

        cy.origin('https://www.mailinator.com', () => {
            
            cy.clearCookies()
            cy.clearLocalStorage()
            
            cy.reload()
            
            cy.get('.table-striped.jambo_table').click()
            // cy.get('a[target="_other"]').click({ force: true })
        
        })
        
        // cy.get('a[target="_other"]').click({ force: true })
    })
})