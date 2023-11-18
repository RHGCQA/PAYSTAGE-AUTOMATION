import { common } from "../../fixtures/dev/common";
import { loginpage_locators } from "../../fixtures/dev/locators";
import { errormessage } from "../../fixtures/dev/error_messages";

beforeEach(() => {
    cy.visit(common.login_url);
})

describe('Login-Page-Negative', () =>{

    it('Login with blank email and blank password', () => {
        cy.get(loginpage_locators.submit_button).click()
        //------------------------------------------------------
        cy.get(loginpage_locators.login_error_message_header)
        .should('be.visible').contains(errormessage.erorrheader);
        cy.get(loginpage_locators.login_error_message_1)
        .should('be.visible').contains(errormessage.email_required);
        cy.get(loginpage_locators.login_error_message_2)
        .should('be.visible').contains(errormessage.password_required);
    })

    it('Login with invalid email and blank password', () => {
        cy.get(loginpage_locators.email_field).type(common.randomString)
        cy.get(loginpage_locators.submit_button).click()
        //------------------------------------------------------
        cy.get(loginpage_locators.login_error_message_1)
        .should('be.visible').contains(errormessage.email_invalid);
        cy.get(loginpage_locators.login_error_message_2)
        .should('be.visible').contains(errormessage.password_required);
    })

    it('Login with invalid email and invalid password', () => {
        cy.get(loginpage_locators.email_field).type(common.randomString)
        cy.get(loginpage_locators.pass_field).type(common.randomString)
        cy.get(loginpage_locators.submit_button).click()
        //------------------------------------------------------
        cy.get(loginpage_locators.login_error_message_1)
        .should('be.visible').contains(errormessage.email_invalid);
    })

    it('Login with valid email and invalid password', () => {
        cy.get(loginpage_locators.email_field).type(common.adminEmail)
        cy.get(loginpage_locators.pass_field).type(common.randomString)
        cy.get(loginpage_locators.submit_button).click()
        //------------------------------------------------------
        cy.get(loginpage_locators.login_error_message_1)
        .should('be.visible').contains(errormessage.invalid_creds);
    })
})


describe('Login-Page-Positive', () =>{
    it('Login Title Page', () => {
        cy.title().then(actualPageTitle => {
            cy.title().should('eq',actualPageTitle)
        });
    })

    it('Login Page URL', () => {
        cy.url().then(actualURL => {
            cy.url().should('eq', actualURL);
        });
    })

    it('Login Page should have text', () => {
        cy.get(loginpage_locators.login_login_text_loc)
        .should('be.visible').contains(common.login_login_text);
        cy.get(loginpage_locators.login_email_text_loc)
        .should('be.visible').contains(common.login_email_text);
        cy.get(loginpage_locators.login_password_text_loc)
        .should('be.visible').contains(common.login_pass_text);
    })

    it('Login Page should have clickables', () => {
        cy.get(loginpage_locators.submit_button)
        .should('be.visible').contains(common.login_submitbutton_text);
        cy.get(loginpage_locators.login_forgotpass_text_loc)
        .should('be.visible').contains(common.login_forgotpass_text);
        cy.get(loginpage_locators.login_createacc_text_loc)
        .should('be.visible').contains(common.login_createacc_text);
    })

    it('Login using Admin account', () => {
        cy.get(loginpage_locators.email_field).type(common.adminEmail)
        cy.get(loginpage_locators.pass_field).type(common.adminPass)
        cy.get(loginpage_locators.submit_button).click()
        //------------------------------------------------------
        cy.title().then(redictectToDashboard => {
            cy.title().should('eq', redictectToDashboard)
        })
    })
})
