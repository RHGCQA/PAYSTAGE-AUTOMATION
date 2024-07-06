import { transactionpage_locators } from "../../fixtures/prd/locators";

export const filterJpayWithdrawalTransactions = (transactionType, vendorType, dateFilter, pagenav) => {
    cy.get(transactionpage_locators.type_dropdown).click({timeout: 10000});
    cy.wait(2000)
    cy.get(transactionpage_locators[transactionType]).click({timeout: 10000});
    cy.wait(2000)
    cy.get(transactionpage_locators.vendor_dropdown).click({timeout: 10000});
    cy.wait(2000)
    cy.get(transactionpage_locators[vendorType]).click({timeout: 10000});
    cy.wait(2000)

    // Filter by date
    cy.get(transactionpage_locators.date_dropdown).click({timeout: 10000});
    cy.wait(2000)
    // select date
    cy.get(transactionpage_locators.date_filter1+dateFilter+transactionpage_locators.date_filter2).click({timeout: 10000});
    cy.wait(3250)
    cy.get(transactionpage_locators.page_navigation_holder1+pagenav+transactionpage_locators.page_navigation_holder2).click({timeout: 10000})
    cy.wait(3000)
};

export const filterQRPHTransactions = (transactionType, vendorType, solution, dateFilter, pagenav) => {
    cy.get(transactionpage_locators.type_dropdown)
    .should('be.visible', {timeout: 10000}).click({timeout: 10000});
    cy.get(transactionpage_locators[transactionType]).click({timeout: 10000});
    cy.wait(3000)
    cy.get(transactionpage_locators.vendor_dropdown)
    .should('be.visible', {timeout: 10000}).click({timeout: 10000});
    cy.get(transactionpage_locators[vendorType]).click({timeout: 10000});
    cy.wait(3000)
    cy.get(transactionpage_locators.solution_dropdown)
    .should('be.visible', {timeout: 10000}).click({timeout: 10000});
    cy.get(transactionpage_locators[solution]).click({timeout: 10000});
    cy.wait(3000)

    // Filter by date
    cy.get(transactionpage_locators.date_dropdown)
    .click({timeout: 10000});
    cy.wait(3000)
    // select date
    cy.get(transactionpage_locators.date_filter1+dateFilter+transactionpage_locators.date_filter2)
    .click({timeout: 10000});
    cy.wait(3000)
    cy.get(transactionpage_locators.page_navigation_holder1+pagenav+transactionpage_locators.page_navigation_holder2)
    .click({timeout: 10000});
    cy.wait(3000)
};