import { transactionpage_locators } from "../../fixtures/prd/locators";

export const filterJpayWithdrawalTransactions = (transactionType, vendorType, dateFilter, pagenav) => {
    cy.get(transactionpage_locators.type_dropdown).click({timeout: 10000});
    // cy.wait(3000)
    cy.get(transactionpage_locators[transactionType]).click({timeout: 10000});
    cy.wait(2000)

    cy.get(transactionpage_locators.vendor_dropdown).click({timeout: 10000});
    // cy.wait(3000)
    cy.get(transactionpage_locators[vendorType]).click({timeout: 10000});
    cy.wait(2000)

    // Filter by date
    cy.get(':nth-child(8) > .w-full > .rs-picker-toggle > .rs-stack > [style="flex-grow: 1; overflow: hidden;"] > .rs-picker-toggle-textbox').click({timeout: 10000});
    // cy.wait(3000)
    // cy.get(dateFilter).click();
    // select date
    cy.get(`.rs-picker-toolbar-ranges > :nth-child(${dateFilter}) > .rs-btn`).click({timeout: 10000});
    cy.wait(3250)

    cy.get("[aria-label="+pagenav+"]").click({timeout: 10000})
    cy.wait(3000)
};

export const filterQRPHTransactions = (transactionType, vendorType, solution, dateFilter, pagenav) => {
    cy.get(transactionpage_locators.type_dropdown).click({timeout: 10000});
    // cy.wait(3000)
    cy.get(transactionpage_locators[transactionType]).click({timeout: 10000});
    cy.wait(2000)

    cy.get(transactionpage_locators.vendor_dropdown).click({timeout: 10000});
    // cy.wait(3000)
    cy.get(transactionpage_locators[vendorType]).click({timeout: 10000});
    cy.wait(2000)

    cy.get(transactionpage_locators.solution_dropdown).click({timeout: 10000});
    // cy.wait(3000)
    cy.get(transactionpage_locators[solution]).click({timeout: 10000});
    cy.wait(2000)

    // Filter by date
    cy.get(':nth-child(8) > .w-full > .rs-picker-toggle > .rs-stack > [style="flex-grow: 1; overflow: hidden;"] > .rs-picker-toggle-textbox').click({timeout: 10000});
    // cy.wait(3000)
    // cy.get(dateFilter).click();
    // select date
    cy.get(`.rs-picker-toolbar-ranges > :nth-child(${dateFilter}) > .rs-btn`).click({timeout: 10000});
    cy.wait(3250)

    cy.get("[aria-label="+pagenav+"]").click({timeout: 10000})
    cy.wait(3000)
};