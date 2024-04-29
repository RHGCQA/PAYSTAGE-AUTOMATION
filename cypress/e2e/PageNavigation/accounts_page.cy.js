import { common } from "../../fixtures/dev/common";
import { loginpage_locators } from "../../fixtures/dev/locators";
import { accountspage_locators } from "../../fixtures/dev/locators";
// npx cypress run --spec "cypress/e2e/PageNavigation/*"
// npx cypress run --spec "cypress/e2e/PageNavigation/accounts_page.cy.js"
// npx cypress open
beforeEach(() => {
    cy.visit(common.login_url)
    //------------------------------------------------------
    cy.get(loginpage_locators.email_field).type(common.adminEmail)
    cy.get(loginpage_locators.pass_field).type(common.adminPass)
    cy.get(loginpage_locators.submit_button).click()
    //------------------------------------------------------
    cy.wait(3000)
    cy.visit(common.accounts_url)
})
describe('Accounts Page - Page Title/URL validation',() =>{
    it('Accounts Page Title',() =>{
        cy.title().should('eq',common.accounts_pagetitle)
    })
    it('Accounts Page URL',() =>{
        cy.url().should('eq',common.accounts_url)
    })
})
describe('Accounts Page - Wait for the Requests to Load',() =>{
    it('Wait until limit of 20 rows(default) to load',() =>{
        cy.intercept('GET', common.accountsURLpagination)
        .as('getaccountsURLpagination');
        cy.wait('@getaccountsURLpagination')
        .its('response.statusCode').should('eq', 200);
    })
    it('Wait until Admin Permission to load',() =>{
        cy.intercept('GET', common.accountsURLAdminPermissions)
        .as('getaccountsURLAdminPermissions');
        cy.wait('@getaccountsURLAdminPermissions')
        .its('response.statusCode').should('eq', 200);
    })
})
describe('Accounts Page - Should have Element',() =>{
    it('Accounts Page Header should displayed',() =>{
        cy.get(accountspage_locators.accounts_header).should('exist');
        cy.get(accountspage_locators.accounts_header).should('be.visible');
        cy.get(accountspage_locators.accounts_header).should('have.text', 'Accounts');
    })
    it('Accounts Export Button should be visible',() =>{
        cy.get(accountspage_locators.accounts_export_btn).should('exist');
        cy.get(accountspage_locators.accounts_export_btn).should('be.visible');
        cy.get(accountspage_locators.accounts_export_btn).should('have.text', 'Export');
    })
    it('Accounts Search Filter should be visible',() =>{
        cy.get(accountspage_locators.accounts_search_filter).should('exist');
        cy.get(accountspage_locators.accounts_search_filter).should('be.visible');
        cy.get(accountspage_locators.accounts_search_filter).should('have.text', 'Search');
    })
    it('Accounts Table Headers should be visible',() =>{
        //Merchant number
        cy.get(accountspage_locators.accounts_account_number).should('exist');
        cy.get(accountspage_locators.accounts_account_number).should('be.visible');
        cy.get(accountspage_locators.accounts_account_number).should('have.text', 'Merchant number');
        //Merchant name
        cy.get(accountspage_locators.accounts_merchant_name).should('exist');
        cy.get(accountspage_locators.accounts_merchant_name).should('be.visible');
        cy.get(accountspage_locators.accounts_merchant_name).should('have.text', 'Merchant Name');
        //Merchant email
        cy.get(accountspage_locators.accounts_type).should('exist');
        cy.get(accountspage_locators.accounts_type).should('be.visible');
        cy.get(accountspage_locators.accounts_type).should('have.text', 'Email');
        //Company name
        cy.get(accountspage_locators.accounts_kyc).should('exist');
        cy.get(accountspage_locators.accounts_kyc).should('be.visible');
        cy.get(accountspage_locators.accounts_kyc).should('have.text', 'Company name');
        //Registered date
        cy.get(accountspage_locators.accounts_registered_date).should('exist');
        cy.get(accountspage_locators.accounts_registered_date).should('be.visible');
        cy.get(accountspage_locators.accounts_registered_date).should('have.text', 'Registered Date');
    })
    it('Accounts Pagination',() =>{
        cy.wait(2500);
        // cy.scrollTo('bottom');
        //Pagination
        cy.get(accountspage_locators.accounts_pagination).should('exist');
        cy.get(accountspage_locators.accounts_pagination).contains('2').should('exist');
        cy.get(accountspage_locators.accounts_pagination_next).should('exist').click();
        cy.get(accountspage_locators.accounts_pagination).contains('2').should('have.class', 'rs-pagination-btn rs-pagination-btn-active');
        cy.get(accountspage_locators.accounts_pagination_prev).should('exist').click();
        cy.get(accountspage_locators.accounts_pagination).should('be.visible');
        //Page Picker
        cy.get(accountspage_locators.accounts_pagepicker).should('exist');
        cy.get(accountspage_locators.accounts_pagepicker).should('be.visible');
        //Goto Searchbar
        cy.get(accountspage_locators.accounts_gotosearch).should('exist');
        cy.get(accountspage_locators.accounts_gotosearch).should('be.visible');
    })
})