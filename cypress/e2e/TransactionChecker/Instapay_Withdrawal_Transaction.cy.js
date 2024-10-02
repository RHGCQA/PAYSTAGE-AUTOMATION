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

// const sheetId = '1vd-uTQXSUgrAc5hoE_du2Zxvw6toE9gEWpjpWxcdwIk';
const filpath = 'cypress/e2e/Reports/LiveTransactionChecker/LiveTransactionChecker.xlsx'; //changed to excel path file
const sheetName = "INSTAPAY WITHDRAWAL";
const pageLength = 5;

const PageNav = Array.from({ length: pageLength}, (_, i) => i + 1);

describe('Looping within an it block', () => {
    PageNav.forEach((pageNav) => {
        it(`Should test transactions for Page: ${pageNav}`, () => {
            let testPassed = true;

            // Login
            cy.visit(common.login_url);
            cy.get(loginpage_locators.email_field).type(common.adminEmail);
            cy.get(loginpage_locators.pass_field).type(common.adminPass);
            cy.get(loginpage_locators.submit_button).click();

            // Navigate to the transaction page
            cy.get(sidebarmenu_locators.transaction_module, { timeout: 4500 }).click();
            cy.get(sidebarmenu_locators.transaction_submodule).click();
            // Filter transactions
            filterTransactions('type_withdrawal', 'vendor_allbank', 'solution_instapay', 2, pageNav, { timeout: 5500 });

            try {
                cy.get('body').then(($body) => {
                    if ($body.find('.rs-pagination-btn-active').length) {
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
                                            validateTransactionDetails(transactionNumber, pageNav, x, startRow, filpath, sheetName);
                                            validateWebhookResponses(transactionNumber, filpath, sheetName, startRow + x - 1);
                                            writeInGoogleSheet(filpath, startRow + x - 1, sheetName);
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
                    } else {
                        cy.log('No transaction found, skipping the test...');
                    }
                });
            } catch (error) {
                testPassed = false;
            }
        });
    });
});


const validateTransactionDetails = (transactionNumber, pageNav, row, startRow, filpath, sheetName) => {
    try{
        cy.visit(`https://portal.paystage.net/${transactionNumber}/transactions`).wait(5200);
        const storedStatus = Cypress.env('status');
        if (storedStatus !== 'completed') {
            cy.log(`Skip test as Instapay status is ${storedStatus}.`);
            cy.get(transactiondetails_locators.merchant_number).should('be.visible').and('have.text', Cypress.env('merchant_number'));
            cy.get(transactiondetails_locators.status).should('be.visible').and('have.text', Cypress.env('status'));
            cy.get(transactiondetails_locators.merchant_name).should('be.visible').and('have.text', Cypress.env('merchant_name'));
            cy.get(transactiondetails_locators.customer_name).should('be.visible').and('have.text', Cypress.env('customer_name'));
            cy.get(transactiondetails_locators.mobile).invoke('text').as('mobile');
            cy.get(transactiondetails_locators.view_request).first().contains('View request').click();
            cy.wait(3500);
            cy.get(transactiondetails_locators.mobdal_content).invoke('text').then((sent_payload_completed) => {
                cy.writeFile(data_response_holder.rwCompleted, sent_payload_completed);
            });
            return;
        }
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
        validateWebhookResponses(filpath, sheetName, startRow + row - 1);
    } catch(error){
        console.log(error.message)
    }
};

const validateWebhookResponses = (transactionNumber, filpath, sheetName, sheetRow) => {
    const resultCell = `I${sheetRow}`;
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
        cy.get('@callback_transaction_number').then((callback_transaction_number) => {
            expect(callback_transaction_number).to.eq(transactionNumber);
        });
        cy.get('@callback_merrefno').then((callback_merrefno) => {
            cy.get(transactiondetails_locators.merchant_number).should('be.visible').and('have.text', callback_merrefno);
        });
        cy.get('@callback_status').then((callback_status) => {
            cy.get(transactiondetails_locators.status).should('be.visible').and('have.text', callback_status);
        });
        cy.get('@callback_customer_mobile').then((callback_customer_mobile) => {
            cy.get(transactiondetails_locators.mobile).should('be.visible').and('have.text', callback_customer_mobile);
        });

        if (storedStatus == 'pending'){
            cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: resultCell, value: 'PENDING'});
            return;
        } else if(storedStatus == 'failed'){
            cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: resultCell, value: 'FAILED'});
            return;
        }
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
            cy.get(transactiondetails_locators.solution_ref).invoke('text').then((solution_ref)=>{
                expect(payload_solrefno).to.eq(solution_ref);
            });
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
            cy.get('@callback_fee').should((callback_fee) => {
                // let trimedFee = roundToTwo(payload_fee);
                expect(roundToTwo(payload_fee)).to.eq(roundToTwo(callback_fee));
            });
        });
        cy.get('@callback_merrefno').then((callback_merrefno) => {
            const storedMerchantNumber = Cypress.env('merchant_number');
            expect(callback_merrefno).to.eq(storedMerchantNumber);
        });
        cy.get('@callback_customer_mobile').then((callback_customer_mobile) => {
            cy.get(transactiondetails_locators.mobile).invoke('text').then((customerMobile)=>{
                expect(callback_customer_mobile).to.eq(customerMobile);
            });
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
        cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: resultCell, value: 'PASSED'});
    } catch(error){
        cy.log("error")
        cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: resultCell, value: 'FAILED'});
    }
};

const writeInGoogleSheet = (filpath, sheetRow, sheetName) => {
    cy.readFile(data_response_holder.rwCompleted).then((callbackResponse) => {
        cy.wrap(callbackResponse.transaction_number).as('callback_transaction_number');
        cy.wrap(callbackResponse.details.credit_amount).as('callback_credit_amount');
        cy.wrap(callbackResponse.details.fee).as('callback_fee');
        cy.wrap(callbackResponse.details.total_amount).as('callback_total_amount');
        cy.wrap(callbackResponse.status).as('callback_status');
    });

    const sheetCells = {
        transactionNumber: `B${sheetRow}`,
        merchantName: `C${sheetRow}`,
        customerName: `D${sheetRow}`,
        creditAmount: `E${sheetRow}`,
        fee: `F${sheetRow}`,
        totalAmount: `G${sheetRow}`,
        status: `H${sheetRow}`,
    };

    cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: `A${sheetRow}`, value: sheetRow - 1 });
    cy.get('@callback_transaction_number').then((transaction_number) => {
        cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.transactionNumber, value: transaction_number });
    });
    cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.merchantName, value: Cypress.env('merchant_name') });
    cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.customerName, value: Cypress.env('customer_name') });
    cy.get('@callback_credit_amount').then((amount) => {
        cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.creditAmount, value: amount });
    });
    cy.get('@callback_fee').then((fee) => {
        cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.fee, value: fee });
    });
    cy.get('@callback_total_amount').then((net_amount) => {
        cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.totalAmount, value: net_amount });
    });
    cy.get('@callback_status').then((status) => {
        cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.status, value: status });
    });
}

