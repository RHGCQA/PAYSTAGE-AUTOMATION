import { common } from "../../fixtures/prd/common";
import { filterTransactions } from './filterTransactions';
import { fetchTransactionData } from './base_date_storage';
import { loginpage_locators, sidebarmenu_locators,
    transactionpage_locators, transactiondetails_locators,
    data_response_holder } from "../../fixtures/prd/locators";

// npx cypress run --spec "cypress/e2e/TransactionChecker/*"
// npx cypress run --spec "cypress/e2e/TransactionChecker/Instapay_Withdrawal_Transaction.cy.js"
// npx cypress open
// ./config.cmd --url https://github.com/Chzubaga/paystage_cy --token A7RQNS5BNE5GXNPQXMZFN43GRNPWC


Cypress.config('defaultCommandTimeout', 10000);
Cypress.on('uncaught:exception', (err) => {
    // Handle specific errors gracefully
    if (err.message.includes('canceled')) {
    return false;
    }
    return true;
});

function roundToTwo(num) {
    return Math.ceil(num * 100) / 100;
}

const sheetId = '1vd-uTQXSUgrAc5hoE_du2Zxvw6toE9gEWpjpWxcdwIk';
const sheetName = "INSTAPAY LIVE TRANSACTIONS";
const pageLength = 5;

const PageNav = Array.from({ length: pageLength}, (_, i) => i + 1);

// Within the test loop
describe('Looping within an it block', () => {
    PageNav.forEach((pageNav) => {
        it(`Should test transactions for Page: ${pageNav}`, () => {
            let testPassed = true;

            // Login
            cy.visit(common.login_url);
            cy.get(loginpage_locators.email_field).type(common.adminEmail);
            cy.get(loginpage_locators.pass_field).type(common.adminPass);
            cy.get(loginpage_locators.submit_button).click();

            try {
                // Navigate to the transaction page
                cy.get(sidebarmenu_locators.transaction_module, { timeout: 4500 }).click();
                cy.get(sidebarmenu_locators.transaction_submodule).click();
                // Filter transactions
                filterTransactions('type_withdrawal', 'vendor_allbank', 'solution_instapay', 2, pageNav, { timeout: 5500 });
                cy.get('.rs-pagination-btn-active').invoke('text').then((active_page_num) => {
                    if (pageNav == active_page_num) {
                        cy.get(transactionpage_locators.tablerow).its('length').then((rowCount) => {
                            let startRow = (pageNav - 1) * 20 + 1;

                            for (let x = 2; x <= rowCount + 1; x++) {
                                const rowSelector = `${transactionpage_locators.locator_base1}${x}${transactionpage_locators.locator_base2}${transactionpage_locators.exist}`;
                                cy.get(rowSelector).then((isTransactionExist) => {
                                    if (isTransactionExist) {
                                        fetchTransactionData(x, 'transaction_number', 'merchant_number', 'merchant_name',
                                        'customer_name', 'type', 'method', 'vendor', 'solution', 'status', 'amount', 'net_amount');

                                        cy.get('@transaction_number').then((transactionNumber) => {
                                            validateTransactionDetails(transactionNumber, pageNav, x, startRow, sheetId, sheetName);
                                            validateWebhookResponses(sheetId, sheetName, startRow + x - 1);
                                            writeInGoogleSheet(sheetId, startRow + x - 1, sheetName);
                                            cy.task('log', transactionNumber);
                                        });
                                    } else {
                                        cy.log("No transaction found at row " + x);
                                    }
                                    cy.go('back', { timeout: 5000 });
                                    cy.wait(3500);
                                    filterTransactions('type_withdrawal', 'vendor_allbank', 'solution_instapay', 2, pageNav, { timeout: 5500 });
                                });
                            }
                        });
                    } else {
                        cy.log("No page found");
                    }
                });

            } catch (error) {
                testPassed = false;
            }
            // const final_result = pageNav + 1;
            // cy.task('writeToGoogleSheet', { sheetId, cell: `${sheetName}!I${final_result}`, value: testPassed ? "PASSED" : "FAILED" });
        });
    });
});


const validateTransactionDetails = (transactionNumber, pageNav, row, startRow, sheetId, sheetName) => {
    cy.visit(`https://portal.paystage.net/${transactionNumber}/transactions`).wait(5200);

    cy.get('@transaction_number').then(() => {
        const storedMerchantNumber = Cypress.env('merchant_number');
        const storedMerchantName = Cypress.env('merchant_name');
        const storedCustomerName = Cypress.env('customer_name');
        const storedTransactionType = Cypress.env('transaction_type');
        const storedStatus = Cypress.env('status');

        if (storedStatus !== 'completed') {
            cy.log(`Skip test as Instapay status is ${storedStatus}.`);
            cy.get(transactiondetails_locators.view_request).first().contains('View request').click();
            cy.wait(3500);
            cy.get(transactiondetails_locators.mobdal_content).invoke('text').then((sent_payload_completed) => {
                cy.writeFile(data_response_holder.rwCompleted, sent_payload_completed);
            });
            return; // Skip the rest of the test for this transaction
        }

        cy.get(transactiondetails_locators.merchant_number).should('be.visible').and('have.text', storedMerchantNumber);
        cy.get(transactiondetails_locators.status).should('be.visible').and('have.text', storedStatus);
        cy.get(transactiondetails_locators.type).should('be.visible').and('have.text', storedTransactionType);
        cy.get(transactiondetails_locators.merchant_name).should('be.visible').and('have.text', storedMerchantName);
        cy.get(transactiondetails_locators.customer_name).should('be.visible').and('have.text', storedCustomerName);
        cy.get(transactiondetails_locators.solution_ref).invoke('text').then((solutionRef) => {
            Cypress.env('solution_ref', solutionRef.trim());
        });
        cy.get(transactiondetails_locators.mobile).invoke('text').then((mobile) => {
            Cypress.env('mobile', mobile.trim());
        });
        cy.get(transactiondetails_locators.view_payload).contains('View Payload').click();
        cy.wait(1500);
        cy.get(transactiondetails_locators.mobdal_content).invoke('text').then((receivedPayload) => {
            cy.writeFile(data_response_holder.rwPayload, receivedPayload);
        });
        cy.get(transactiondetails_locators.close_modal).click({ timeout: 3000 });
        cy.wait(1500);
        cy.get(transactiondetails_locators.view_request).first().contains('View request').click();
        cy.wait(3500);
        cy.get(transactiondetails_locators.mobdal_content).invoke('text').then((sent_payload_completed) => {
            cy.writeFile(data_response_holder.rwCompleted, sent_payload_completed);
        });
        validateWebhookResponses(sheetId, sheetName, startRow + row - 1);
    });
};

const validateWebhookResponses = (sheetId, sheetName, sheetRow) => {
    const resultCell = `${sheetName}!I${sheetRow}`;
    const storedStatus = Cypress.env('status');

    if (storedStatus !== 'completed') {
        cy.log(`Skip test as Instapay status is ${storedStatus}.`);
        cy.readFile(data_response_holder.rwCompleted).then((callbackResponse) => {
            cy.wrap(callbackResponse.transaction_number).as('callback_transaction_number');
            cy.wrap(callbackResponse.reference_no).as('callback_merrefno');
            cy.wrap(callbackResponse.status).as('callback_status');
            cy.wrap(callbackResponse.customer.mobile).as('callback_customer_mobile');
            cy.wrap(callbackResponse.details.credit_amount).as('callback_credit_amount');
            cy.wrap(callbackResponse.details.fee).as('callback_fee');
            cy.wrap(callbackResponse.details.total_amount).as('callback_total_amount');
        });
        cy.task('writeToGoogleSheet', { sheetId, cell: resultCell, value: "FAILED" })
        return; // Skip the rest of the test for this transaction
    }

    try{
        cy.readFile(data_response_holder.rwPayload).then((payloadResponse) => {
            cy.wrap(payloadResponse.transaction.transaction_number).as('payload_transaction_number');
            cy.wrap(payloadResponse.transaction.reference_no).as('payload_merchant_transaction_number');
            cy.wrap(payloadResponse.transaction.status).as('payload_status');
            cy.wrap(payloadResponse.transaction.amount).as('payload_amount');
            cy.wrap(payloadResponse.transaction.settlement_details.total_fee).as('payload_fee');
            cy.wrap(payloadResponse.transaction.solution_ref_no).as('payload_solrefno');
        });
        cy.readFile(data_response_holder.rwCompleted).then((callbackResponse) => {
            cy.wrap(callbackResponse.transaction_number).as('callback_transaction_number');
            cy.wrap(callbackResponse.reference_no).as('callback_merrefno');
            cy.wrap(callbackResponse.status).as('callback_status');
            cy.wrap(callbackResponse.customer.mobile).as('callback_customer_mobile');
            cy.wrap(callbackResponse.details.credit_amount).as('callback_credit_amount');
            cy.wrap(callbackResponse.details.fee).as('callback_fee');
            cy.wrap(callbackResponse.details.total_amount).as('callback_total_amount');
        });
        cy.get('@payload_solrefno').then((payload_solrefno) => {
            const storedSolutionRef = Cypress.env('solution_ref');
            expect(payload_solrefno).to.eq(storedSolutionRef);
        });
        cy.get('@payload_transaction_number').then((payload_transaction_number) => {
            cy.get('@callback_transaction_number').should((callback_transaction_number) => {
                expect(payload_transaction_number).to.eq(callback_transaction_number);
            });
        });
        cy.get('@callback_status').should((callback_status) => {
            expect(callback_status).to.eq("completed");
        });
        cy.get('@payload_amount').then((payload_amount) => {
            let trimedAmount = Math.floor(payload_amount);
            cy.get('@callback_credit_amount').should((callback_credit_amount) => {
                expect(trimedAmount).to.eq(callback_credit_amount);
            });
        });
        cy.get('@payload_fee').then((payload_fee) => {
            let trimedFee = roundToTwo(payload_fee);
            cy.get('@callback_fee').should((callback_fee) => {
                expect(trimedFee).to.eq(callback_fee);
            });
        });
        cy.get('@callback_merrefno').then((callback_merrefno) => {
            const storedMerchantNumber = Cypress.env('merchant_number');
            expect(callback_merrefno).to.eq(storedMerchantNumber);
        });
        cy.get('@callback_customer_mobile').then((callback_customer_mobile) => {
            const storedMobile = Cypress.env('mobile');
            expect(callback_customer_mobile).to.eq(storedMobile);
        });
        cy.get('@payload_amount').then((payload_amount) => {
            cy.get('@callback_fee').then((callback_fee) => {
                cy.get('@callback_credit_amount').then((callback_credit_amount) => {
                    cy.get('@callback_total_amount').should((callback_total_amount) => {
                        let amount = parseInt(payload_amount);
                        let fee = parseInt(callback_fee);
                        let creditAmount = parseInt(callback_credit_amount);
                        let totalAmount = parseInt(callback_total_amount)
                        let netAmount = creditAmount + fee
                        expect(amount).to.eq(creditAmount);
                        expect(totalAmount).to.eq(netAmount);
                    });     
                });     
            });
        });
        cy.task('writeToGoogleSheet', { sheetId, cell: resultCell, value: "PASSED" })
    } catch(error){
        cy.log("error")
        cy.task('writeToGoogleSheet', { sheetId, cell: resultCell, value: "FAILED" })
    }
};

const writeInGoogleSheet = (sheetId, sheetRow, sheetName) => {
    cy.readFile(data_response_holder.rwCompleted).then((callbackResponse) => {
        cy.wrap(callbackResponse.transaction_number).as('callback_transaction_number');
        cy.wrap(callbackResponse.details.credit_amount).as('callback_credit_amount');
        cy.wrap(callbackResponse.details.fee).as('callback_fee');
        cy.wrap(callbackResponse.details.total_amount).as('callback_total_amount');
        cy.wrap(callbackResponse.status).as('callback_status');
    });

    const sheetCells = {
        transactionNumber: `${sheetName}!B${sheetRow}`,
        merchantName: `${sheetName}!C${sheetRow}`,
        customerName: `${sheetName}!D${sheetRow}`,
        creditAmount: `${sheetName}!E${sheetRow}`,
        fee: `${sheetName}!F${sheetRow}`,
        totalAmount: `${sheetName}!G${sheetRow}`,
        status: `${sheetName}!H${sheetRow}`,
    };

    cy.task('writeToGoogleSheet', { sheetId, cell: `${sheetName}!A${sheetRow}`, value: sheetRow - 1 });
    cy.get('@callback_transaction_number').then((transaction_number) => {
        cy.task('writeToGoogleSheet', { sheetId, cell: sheetCells.transactionNumber, value: transaction_number });
    });
    cy.task('writeToGoogleSheet', { sheetId, cell: sheetCells.merchantName, value: Cypress.env('merchant_name') });
    cy.task('writeToGoogleSheet', { sheetId, cell: sheetCells.customerName, value: Cypress.env('customer_name') });
    cy.get('@callback_credit_amount').then((amount) => {
        cy.task('writeToGoogleSheet', { sheetId, cell: sheetCells.creditAmount, value: amount });
    });
    cy.get('@callback_fee').then((fee) => {
        cy.task('writeToGoogleSheet', { sheetId, cell: sheetCells.fee, value: fee });
    });
    cy.get('@callback_total_amount').then((net_amount) => {
        cy.task('writeToGoogleSheet', { sheetId, cell: sheetCells.totalAmount, value: net_amount });
    });
    cy.get('@callback_status').then((status) => {
        cy.task('writeToGoogleSheet', { sheetId, cell: sheetCells.status, value: status });
    });
}

