import { common } from "../../fixtures/dev/common";
import { loginpage_locators } from "../../fixtures/dev/locators";
import { dashboardpage_locators } from "../../fixtures/dev/locators";
// npx cypress run --spec "cypress/e2e/PageNavigation/*"
// npx cypress run --spec "cypress/e2e/PageNavigation/dashboard_page.cy.js"
// npx cypress open
beforeEach(() => {
    cy.visit(common.login_url)
    //------------------------------------------------------
    cy.get(loginpage_locators.email_field).type(common.adminEmail)
    cy.get(loginpage_locators.pass_field).type(common.adminPass)
    cy.get(loginpage_locators.submit_button).click()
})

describe('Dashboard Page - Page Title/URL validation',() =>{
    it('Dashboard Page Title',() =>{
        cy.title().should('eq',common.dashboard_pagetitle)
    })
    it('Dashboard Page URL',() =>{
        cy.url().should('eq',common.dashboard_url)
    })
})

describe('Dashboard Page - Wait for the Balances to Load',() =>{
    it('All required in Network should load',() =>{
        cy.intercept('GET', common.requestURLbalance)
        .as('getRequestBalances');
        cy.wait('@getRequestBalances')
        .its('response.statusCode').should('eq', 200);
    })
    it('All required in Network should load',() =>{
        cy.intercept('GET', common.requestURLadminPermissions)
        .as('getRequestAdminPermissions');
        cy.wait('@getRequestAdminPermissions')
        .its('response.statusCode').should('eq', 200);
    })
})

describe('Dashboard Page - Should have Element',() =>{
    it('Dashboard Balance should displayed',() =>{
        cy.get(dashboardpage_locators.dashboard_header).should('exist');
        cy.get(dashboardpage_locators.dashboard_header).should('be.visible');
        cy.get(dashboardpage_locators.dashboard_header).should('have.text', 'Balances');
    })
    it('Dashboard Export Button should be visible',() =>{
        cy.get(dashboardpage_locators.dashboard_export_btn).should('exist');
        cy.get(dashboardpage_locators.dashboard_export_btn).should('be.visible');
        cy.get(dashboardpage_locators.dashboard_export_btn).should('have.text', 'Export');
    })
    it('Dashboard Table Headers should be visible',() =>{
        //Account number
        cy.get(dashboardpage_locators.dashboard_account_number).should('exist');
        cy.get(dashboardpage_locators.dashboard_account_number).should('be.visible');
        cy.get(dashboardpage_locators.dashboard_account_number).should('have.text', 'Account number');
        //Merchant name
        cy.get(dashboardpage_locators.dashboard_merchant_name).should('exist');
        cy.get(dashboardpage_locators.dashboard_merchant_name).should('be.visible');
        cy.get(dashboardpage_locators.dashboard_merchant_name).should('have.text', 'Merchant Name');
        //Account type
        cy.get(dashboardpage_locators.dashboard_type).should('exist');
        cy.get(dashboardpage_locators.dashboard_type).should('be.visible');
        cy.get(dashboardpage_locators.dashboard_type).should('have.text', 'Type');
    })
    it('Dashboard Pagination',() =>{
        cy.wait(2500);
        cy.scrollTo('bottom');
        //Pagination
        cy.get(dashboardpage_locators.dashboard_pagination).should('exist');
        cy.get(dashboardpage_locators.dashboard_pagination).contains('2').should('exist');
        cy.get(dashboardpage_locators.dashboard_pagination_next).should('exist').click();
        cy.get(dashboardpage_locators.dashboard_pagination).contains('2').should('have.class', 'rs-pagination-btn rs-pagination-btn-active');
        cy.get(dashboardpage_locators.dashboard_pagination_prev).should('exist').click();
        cy.get(dashboardpage_locators.dashboard_pagination).should('be.visible');
        //Page Picker
        cy.get(dashboardpage_locators.dashboard_pagepicker).should('exist');
        cy.get(dashboardpage_locators.dashboard_pagepicker).should('be.visible');
        //Goto Searchbar
        cy.get(dashboardpage_locators.dashboard_gotosearch).should('exist');
        cy.get(dashboardpage_locators.dashboard_gotosearch).should('be.visible');
    })
})