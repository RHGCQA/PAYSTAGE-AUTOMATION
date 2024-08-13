import { transactionpage_locators } from "../../fixtures/prd/locators";

export const fetchTransactionData = 
(rowCount, transaction_number, merchant_name, customer_name) => {
    cy.get(transactionpage_locators.locator_base1+[rowCount]+
        transactionpage_locators.locator_base2+
        transactionpage_locators[transaction_number])
        .invoke('text').as('transaction_number');

        cy.get(transactionpage_locators.locator_base1+[rowCount]+
            transactionpage_locators.locator_base2+
            transactionpage_locators[merchant_name])
            .invoke('text').as('merchant_name');

        cy.get(transactionpage_locators.locator_base1+[rowCount]+
            transactionpage_locators.locator_base2+
            transactionpage_locators[customer_name])
            .invoke('text').as('customer_name');

    cy.wait(3000) //temp load
    cy.log("Fetch")
};