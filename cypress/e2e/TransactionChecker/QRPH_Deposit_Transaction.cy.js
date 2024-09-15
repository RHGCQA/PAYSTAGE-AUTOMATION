import { common } from "../../fixtures/prd/common";
import { filterTransactions } from './filterTransactions';
import { fetchTransactionData } from './base_date_storage';
import { loginpage_locators, sidebarmenu_locators,
    transactionpage_locators, transactiondetails_locators,
    data_response_holder } from "../../fixtures/prd/locators";

// npx cypress run --spec "cypress/e2e/TransactionChecker/*"
// npx cypress run --spec "cypress/e2e/TransactionChecker/QRPH_Deposit_Transaction.cy.js"
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
const sheetName = "QPRH LIVE TRANSACTIONS";
const pageLength = 5;

const PageNav = Array.from({ length: pageLength }, (_, i) => i + 1);

describe('Looping within an it block', () => {
    PageNav.forEach((pageNav) => {
        it(`Should test transactions for Page: ${pageNav}`, () => {
            let testPassed = true;

            cy.resetQATouchStatuses('d192aw', 'untested');

            // Login
            cy.visit(common.login_url);
            cy.get(loginpage_locators.email_field).type(common.adminEmail);
            cy.get(loginpage_locators.pass_field).type(common.adminPass);
            cy.get(loginpage_locators.submit_button).click();
            cy.updateQATouchTestResult('RpM25D', 'passed');

            try {
                // Navigate to transaction page
                cy.get(sidebarmenu_locators.transaction_module, { timeout: 4500 }).click();
                cy.get(sidebarmenu_locators.transaction_submodule).click();

                // Filter transactions
                filterTransactions('type_deposit', 'vendor_allbank', 'solution_QRPH', 2, pageNav, { timeout: 5500 });
                cy.get('.rs-pagination-btn-active').invoke('text').then((active_page_num)=>{
                    if(pageNav == active_page_num){
                        cy.get(transactionpage_locators.tablerow).its('length').then((rowCount) => {
                            let startRow = (pageNav - 1) * 20 + 1;
                            
                            for (let x = 2; x <= rowCount+1; x++) {
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
                                    cy.wait(3250);
                                    filterTransactions('type_deposit', 'vendor_allbank', 'solution_QRPH', 2, pageNav, { timeout: 5500 });
                                });
                            }
                        });
                    }else{
                        cy.log("No page found ");
                    }
                cy.updateQATouchTestResult('d192aw', 'passed');
            })
            } catch (error) {
                cy.updateQATouchTestResult('d192aw', 'failed');
                testPassed = false;
            }
            // const final_result = pageNav+1
            // cy.task('writeToGoogleSheet', { sheetId, cell: `${sheetName}!I${final_result}`, value: testPassed ? "PASSED" : "FAILED" });
        });
    });
});

const validateTransactionDetails = (transactionNumber, pageNav, row, startRow, sheetId, sheetName) => {
    try {
        cy.visit(`https://portal.paystage.net/${transactionNumber}/transactions`).wait(5200);
        cy.get(transactiondetails_locators.merchant_number).should('be.visible').and('have.text', Cypress.env('merchant_number'));
        cy.get(transactiondetails_locators.status).should('be.visible').and('have.text', Cypress.env('status'));
        cy.get(transactiondetails_locators.type).should('be.visible').and('have.text', Cypress.env('transaction_type'));
        cy.get(transactiondetails_locators.merchant_name).should('be.visible').and('have.text', Cypress.env('merchant_name'));
        cy.get(transactiondetails_locators.customer_name).should('be.visible').and('have.text', Cypress.env('customer_name'));
        cy.get(transactiondetails_locators.solution_ref).invoke('text').as('solution_ref');
        cy.get(transactiondetails_locators.mobile).invoke('text').as('mobile');
        cy.get(transactiondetails_locators.view_payload).contains('View Payload').click({ waitForAnimations: false });
        cy.get(transactiondetails_locators.mobdal_content).invoke('text').then((receivedPayload) => {
            cy.writeFile(data_response_holder.rwPayload, receivedPayload);
        });
        cy.get(transactiondetails_locators.close_modal).click({ waitForAnimations: false });
        cy.get(transactiondetails_locators.view_request).first().contains('View request').click({ waitForAnimations: false });
        cy.get(transactiondetails_locators.mobdal_content).invoke('text').then((sent_payload_completed) => {
            cy.writeFile(data_response_holder.rwCompleted, sent_payload_completed);
        });
        cy.updateQATouchTestResult('xzaK05', 'passed');
        validateWebhookResponses(sheetId, sheetName, startRow + row - 1);
    } catch (error) {
        cy.updateQATouchTestResult('xzaK05', 'failed');
    }
};

const validateWebhookResponses = (sheetId, sheetName, sheetRow) => {
    const resultCell = `${sheetName}!I${sheetRow}`;
    try {
        cy.readFile(data_response_holder.rwPayload).then((payloadResponse) => {
            cy.wrap(payloadResponse.amount).as('payload_amount');
            cy.wrap(payloadResponse.txnid).as('payload_transaction_number');
            cy.wrap(payloadResponse.status).as('payload_status');
            cy.wrap(payloadResponse.refno).as('payload_solrefno');
            cy.wrap(payloadResponse.transaction.reference_no).as('payload_merrefno');
            cy.wrap(payloadResponse.transaction.currency).as('payload_currency');
        });

        cy.readFile(data_response_holder.rwCompleted).then((callbackResponse) => {
            cy.wrap(callbackResponse.transaction_number).as('callback_transaction_number');
            cy.wrap(callbackResponse.reference_no).as('callback_merrefno');
            cy.wrap(callbackResponse.status).as('callback_status');
            cy.wrap(callbackResponse.customer.mobile).as('callback_customer_mobile');
            cy.wrap(callbackResponse.details.credit_amount).as('callback_credit_amount');
            cy.wrap(callbackResponse.details.credit_currency).as('callback_credit_currency');
            cy.wrap(callbackResponse.details.fee).as('callback_fee');
            cy.wrap(callbackResponse.details.total_amount).as('callback_total_amount');
        });

        cy.get('@payload_amount').then((payload_amount) => {
            const amount = parseInt(payload_amount);
            const merchant_name = Cypress.env('merchant_name');

            switch (merchant_name) {
                case 'TECHOPTIONS (CY) GROUP LIMITED':
                case 'TECHSOLUTIONS (CY) GROUP LIMITED':
                    const fee = Math.max(25, roundToTwo(amount * 0.04));
                    cy.get('@callback_fee').should('eq', fee);
                    cy.get('@callback_total_amount').should('eq', amount - fee);
                    break;
                case 'RIVALRY LIMITED':
                    const rivalryFee = Math.max(13, roundToTwo(amount * 0.0275));
                    cy.get('@callback_fee').should('eq', rivalryFee);
                    cy.get('@callback_total_amount').should('eq', roundToTwo(amount - rivalryFee));
                    break;
                default:
                    const defaultFee = roundToTwo(amount * 0.02);
                    const adjustedFee = Cypress.env('merchant_name') === 'FooBar Prod' ? 1 : Math.max(10, defaultFee);
                    cy.get('@callback_fee').should('eq', adjustedFee);
                    cy.get('@callback_total_amount').should('eq', amount - adjustedFee);
            }

            cy.get('@callback_credit_amount').should('eq', payload_amount);
        });

        cy.get('@payload_transaction_number').then((payload_transaction_number) => {
            cy.get('@callback_transaction_number').should('eq', payload_transaction_number);
        });

        const expectedStatus = Cypress.env('status') === 'completed' ? 'S' : 'F';
        cy.get('@payload_status').should('eq', expectedStatus);

        cy.get('@solution_ref').then((solutionRef) => {
            cy.get('@payload_solrefno').should('eq', solutionRef);
        });
        
        cy.get('@mobile').then((mobile) => {
            cy.get('@callback_customer_mobile').should('eq', mobile);
        });
        
        cy.get('@callback_merrefno').then((callbackMerRefNo) => {
            cy.get('@payload_merrefno').should('eq', callbackMerRefNo);
        });
        
        cy.get('@callback_credit_currency').then((callbackCurrency) => {
            cy.get('@payload_currency').should('eq', callbackCurrency);
        });

        cy.updateQATouchTestResult('VVa25B', 'passed');
        cy.task('writeToGoogleSheet', { sheetId, cell: resultCell, value: "PASSED" });
    } catch (error) {
        cy.updateQATouchTestResult('VVa25B', 'failed');
        cy.task('writeToGoogleSheet', { sheetId, cell: resultCell, value: "FAILED" });
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
};
