import { common } from "../../fixtures/prd/common";
import { loginpage_locators } from "../../fixtures/prd/locators";
import { sidebarmenu_locators } from "../../fixtures/prd/locators";
import { transactionpage_locators } from "../../fixtures/prd/locators";
import { fetchTransactionData } from './base_date_storage';
import { filterTransactions } from './filterTransactions';
// import { testFilter } from './filterTransactions';
// npx cypress run --spec "cypress/e2e/AutomatedCheckerTool/*"
// npx cypress run --spec "cypress/e2e/AutomatedCheckerTool/Anomaly_Checker.cy.js"
// npx cypress open

Cypress.config('defaultCommandTimeout', 10000);
Cypress.on('uncaught:exception', (err, runnable) => {
    // expect a 'canceled' error, and don't want to fail the test
    if (err.message.includes('canceled')) {
      return false; // returning false here prevents Cypress from failing the test
    }
    // let other errors fail the test, return true for them
    return true;
});

describe('Checking specific customers live transactions', () => {
    const sheetId = '1vd-uTQXSUgrAc5hoE_du2Zxvw6toE9gEWpjpWxcdwIk'; // Your Google Sheet ID
    const merchantlist = ["RIVALRY LIMITED","MAGICPORO LTD", "EXNESS LIMITED", 
        "POC LAB CO., LTD", "ORIENTAL WALLET", "EQUINOX POLAR", "KDG SOLUTIONS B.V."]
    const Merchants = merchantlist.slice();

    Merchants.forEach((merchant) => {
        const sheetName = merchant;
        it(`${merchant}`, () => {
            let TransactionDate = 9; // 1 - today | 2 - yesterday (recommended)
            // Login
            cy.visit(common.login_url);
            cy.get(loginpage_locators.email_field).type(common.adminEmail);
            cy.get(loginpage_locators.pass_field).type(common.adminPass);
            cy.get(loginpage_locators.submit_button).click();
    
            // Navigate to the transaction page
            cy.get(sidebarmenu_locators.transaction_module).should('be.visible',
                { timeout: 10000 }).click();
            cy.get(sidebarmenu_locators.transaction_submodule).click();

            // Filter transactions
            filterTransactions(merchant, TransactionDate, { timeout: 10000 });
            cy.wait(20000);
            cy.get(transactionpage_locators.tablerow).its('length').then((rowCount) => {
                cy.log(rowCount)
                let rowcount = rowCount + 1
                for (let x = 2; x <= rowcount; x++) {
                    const rowCol = sheetName+"!A"; // The cell where you want to write data
                    let rowCell = rowCol+x
                    cy.task('writeToGoogleSheet', { sheetId, cell: rowCell, value: x-1 })

                    const isTransactionExist = cy.get(`${transactionpage_locators.locator_base1}${x}${transactionpage_locators.locator_base2}${transactionpage_locators.exist}`)
                        .should('exist', { timeout: 20000 });
                    if (isTransactionExist) {
                        let sheetRow = x;
                        fetchTransactionData(sheetRow, 'transaction_number', 'merchant_name', 'customer_name');
                        
                        cy.get('@transaction_number').then((transactionNumber) => {
                            const transCol = sheetName+"!B"; // The cell where you want to write data
                            let transCell = transCol+sheetRow
                            cy.task('writeToGoogleSheet', { sheetId, cell: transCell, value: transactionNumber })
                        });
                        cy.get('@merchant_name').then((merchant_name) => {
                            const mNameCol = sheetName+"!C"; // The cell where you want to write data
                            let mNameCell = mNameCol+sheetRow
                            cy.task('writeToGoogleSheet', { sheetId, cell: mNameCell, value: merchant_name })
                            cy.log(mNameCell)
                            cy.log(merchant_name)
                        });
                        cy.get('@customer_name').then((customer_name) => {
                            const customerCol = sheetName+"!D"; // The cell where you want to write data
                            let customerCell = customerCol+sheetRow
                            cy.task('writeToGoogleSheet', { sheetId, cell: customerCell, value: customer_name })
                            cy.log(customerCell)
                            cy.log(customer_name)
                        });
                    } else {
                        cy.log("ignore");
                    }
                }
            });
        });
    });
});