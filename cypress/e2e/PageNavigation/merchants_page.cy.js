import { common } from "../../fixtures/dev/common";
import { loginpage_locators } from "../../fixtures/dev/locators";
import { merchantspage_locators } from "../../fixtures/dev/locators";
// npx cypress run --spec "cypress/e2e/PageNavigation/*"
// npx cypress run --spec "cypress/e2e/PageNavigation/merchants_page.cy.js"
// npx cypress open
beforeEach(() => {
    cy.visit(common.login_url)
    //------------------------------------------------------
    cy.get(loginpage_locators.email_field).type(common.adminEmail)
    cy.get(loginpage_locators.pass_field).type(common.adminPass)
    cy.get(loginpage_locators.submit_button).click()
    //------------------------------------------------------
    cy.wait(3000)
    cy.visit(common.merchants_url)
})

describe('Merchants Page - Page Title/URL validation',() =>{
    it('Merchants Page Title',() =>{
        cy.title().should('eq',common.merchants_pagetitle)
    })
    it('Merchants Page URL',() =>{
        cy.url().should('eq',common.merchants_url)
    })
})
describe('Merchants Page - Wait for the Requests to Load',() =>{
    it('Wait until limit of 20 rows(default) to load',() =>{
        cy.intercept('GET', common.merchantsURLpagination)
        .as('getMerchantsURLpagination');
        cy.wait('@getMerchantsURLpagination')
        .its('response.statusCode').should('eq', 200);
    })
    it('Wait until Admin Permission to load',() =>{
        cy.intercept('GET', common.merchantsURLAdminPermissions)
        .as('getmerchantsURLAdminPermissions');
        cy.wait('@getmerchantsURLAdminPermissions')
        .its('response.statusCode').should('eq', 200);
    })
})
describe('Merchants Page - Should have Element',() =>{
    it('Merchants Page Header should displayed',() =>{
        cy.get(merchantspage_locators.merchants_header).should('exist');
        cy.get(merchantspage_locators.merchants_header).should('be.visible');
        cy.get(merchantspage_locators.merchants_header).should('have.text', 'Merchants');
    })
    it('Merchants Export Button should be visible',() =>{
        cy.get(merchantspage_locators.merchants_export_btn).should('exist');
        cy.get(merchantspage_locators.merchants_export_btn).should('be.visible');
        cy.get(merchantspage_locators.merchants_export_btn).should('have.text', 'Export');
    })
    it('Merchants Search Filter should be visible',() =>{
        cy.get(merchantspage_locators.merchnats_search_filter).should('exist');
        cy.get(merchantspage_locators.merchnats_search_filter).should('be.visible');
        cy.get(merchantspage_locators.merchnats_search_filter).should('have.text', 'Search');
    })
    it('Merchants Table Headers should be visible',() =>{
        //Merchant number
        cy.get(merchantspage_locators.merchants_number).should('exist');
        cy.get(merchantspage_locators.merchants_number).should('be.visible');
        cy.get(merchantspage_locators.merchants_number).should('have.text', 'Merchant number');
        //Merchant name
        cy.get(merchantspage_locators.merchants_name).should('exist');
        cy.get(merchantspage_locators.merchants_name).should('be.visible');
        cy.get(merchantspage_locators.merchants_name).should('have.text', 'Merchant Name');
        //Merchant email
        cy.get(merchantspage_locators.merchants_email).should('exist');
        cy.get(merchantspage_locators.merchants_email).should('be.visible');
        cy.get(merchantspage_locators.merchants_email).should('have.text', 'Email');
        //Company name
        cy.get(merchantspage_locators.merchants_company_name).should('exist');
        cy.get(merchantspage_locators.merchants_company_name).should('be.visible');
        cy.get(merchantspage_locators.merchants_company_name).should('have.text', 'Company name');
        //Registered date
        cy.get(merchantspage_locators.merchants_registered_date).should('exist');
        cy.get(merchantspage_locators.merchants_registered_date).should('be.visible');
        cy.get(merchantspage_locators.merchants_registered_date).should('have.text', 'Registered Date');
    })
    it('Merchants Pagination',() =>{
        cy.wait(2500);
        // cy.scrollTo('bottom');
        //Pagination
        cy.get(merchantspage_locators.merchants_pagination).should('exist');
        cy.get(merchantspage_locators.merchants_pagination).contains('2').should('exist');
        cy.get(merchantspage_locators.merchants_pagination_next).should('exist').click();
        cy.get(merchantspage_locators.merchants_pagination).contains('2').should('have.class', 'rs-pagination-btn rs-pagination-btn-active');
        cy.get(merchantspage_locators.merchants_pagination_prev).should('exist').click();
        cy.get(merchantspage_locators.merchants_pagination).should('be.visible');
        //Page Picker
        cy.get(merchantspage_locators.merchants_pagepicker).should('exist');
        cy.get(merchantspage_locators.merchants_pagepicker).should('be.visible');
        //Goto Searchbar
        cy.get(merchantspage_locators.merchants_gotosearch).should('exist');
        cy.get(merchantspage_locators.merchants_gotosearch).should('be.visible');
    })
})