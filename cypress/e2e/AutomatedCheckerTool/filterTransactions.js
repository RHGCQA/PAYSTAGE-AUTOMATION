import { transactionpage_locators } from "../../fixtures/prd/locators";

export const filterTransactions = (merchantname, dateFilter) => {
    cy.get('.rs-input-group > .rs-input').type([merchantname]+'{enter}', {timeout: 15000})
    cy.wait(3000)

    // Filter by date
    cy.get(transactionpage_locators.date_dropdown)
    .click({timeout: 10000});
    cy.wait(3000)
    // select date
    // cy.get(transactionpage_locators.filterDateTemp1 + dateFilter + transactionpage_locators.filterDateTemp2)
    // .click({  timeout: 10000 });
    cy.get(transactionpage_locators.filterDateTemp1 + dateFilter + transactionpage_locators.filterDateTemp2)
    .click({ timeout: 10000 })
    .wait(500)
    cy.get(".rs-calendar-table-cell-selected > .rs-calendar-table-cell-content > .rs-calendar-table-cell-day")
    .click({ timeout: 10000 })
    .wait(3000);
    // cy.get(transactionpage_locators.filterDateTemp1 + dateFilter + transactionpage_locators.filterDateTemp2)
    // .click({  timeout: 10000 });
    // click ok
    cy.get(transactionpage_locators.filterOkButton)
    .click({timeout: 10000});
    cy.wait(3000)
    // search pagenum in GoTo search bar
    cy.get('.rs-pagination-group-limit > .rs-picker > .rs-picker-toggle').click({timeout: 10000});
    cy.wait(3000)
    cy.get('[data-key="200"] > .rs-picker-select-menu-item').click({timeout: 10000});
    cy.wait(3000)
};