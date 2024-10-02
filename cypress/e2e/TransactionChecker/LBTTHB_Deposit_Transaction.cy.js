import { common } from "../../fixtures/prd/common";
import { filterTransactions } from './filterTransactions';
import { fetchTransactionData } from './base_date_storage';
import { loginpage_locators, sidebarmenu_locators, 
    transactionpage_locators, transactiondetails_locators, 
    data_response_holder } from "../../fixtures/prd/locators";

// npx cypress run --spec "cypress/e2e/TransactionChecker/*"
// npx cypress run --spec "cypress/e2e/TransactionChecker/LBTIDR_Deposit_Transaction.cy.js"
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
const sheetName = 'TOPPAY LBT THB';
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
            filterTransactions('type_deposit', 'vendor_toppay', 'solution_lbtThai', 2, pageNav, { timeout: 5500 });
            try {
                cy.get('body').then(($body) => {
                    if ($body.find('.rs-pagination-btn-active').length) {
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
                                            validateTransactionDetails(transactionNumber, pageNav, x, startRow, filpath, sheetName);
                                            validateWebhookResponses(filpath, sheetName, startRow + x - 1);
                                            writeInGoogleSheet(filpath, startRow + x - 1, sheetName);
                                            cy.task('log', transactionNumber);
                                        });
                                    } else {
                                        cy.log("No transaction found at row " + x);
                                    }
                                    cy.go('back', { timeout: 5000 });
                                    cy.wait(3500);
                                    filterTransactions('type_deposit', 'vendor_toppay', 'solution_lbtThai', 2, pageNav, { timeout: 5500 });
                                    })
                                }
                            });
                        }else{
                            cy.log("No page found");
                        }
                        })
                    } else {
                        cy.log('No transaction found, skipping the test...');
                        return; // Skip the rest of the test for this transaction
                    }
                });
            }catch(error){
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
            // cy.log(`Skip test as Local Bank Indonesia Deposit status is ${storedStatus}.`);
            cy.get(transactiondetails_locators.merchant_number).should('be.visible').and('have.text', Cypress.env('merchant_number'));
            cy.get(transactiondetails_locators.status).should('be.visible').and('have.text', Cypress.env('status'));
            cy.get(transactiondetails_locators.type).should('be.visible').and('have.text', Cypress.env('transaction_type'));
            cy.get(transactiondetails_locators.merchant_name).should('be.visible').and('have.text', Cypress.env('merchant_name'));
            cy.get(transactiondetails_locators.customer_name).should('be.visible').and('have.text', Cypress.env('customer_name'));
            cy.get(transactiondetails_locators.solution_ref).invoke('text').as('solution_ref');
            cy.get(transactiondetails_locators.mobile).invoke('text').as('mobile');
            cy.get(transactiondetails_locators.view_request).first().contains('View request').click({ waitForAnimations: false });
            cy.get(transactiondetails_locators.mobdal_content).invoke('text').then((sent_payload_completed) => {
                cy.writeFile(data_response_holder.rwCompleted, sent_payload_completed);
            });
            validateWebhookResponses(filpath, sheetName, startRow + row - 1);
            return; // Skip the rest of the test for this transaction
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
    }catch(error){
        console.log(error.message)
    }
};

const validateWebhookResponses = (filpath, sheetName, sheetRow) => {
    const resultCell = `I${sheetRow}`;
    const storedStatus = Cypress.env('status');

    if (storedStatus !== 'completed') {
        cy.log(`Skip test as Jpay Deposit status is ${storedStatus}.`);
        cy.readFile(data_response_holder.rwCompleted).then((callbackResponse) => {
            cy.wrap(callbackResponse.transaction_number).as('callback_transaction_number');
            cy.wrap(callbackResponse.reference_no).as('callback_merrefno');
            cy.wrap(callbackResponse.status).as('callback_status');
            cy.wrap(callbackResponse.customer.mobile).as('callback_customer_mobile');
            cy.wrap(callbackResponse.details.credit_amount).as('callback_credit_amount');
            cy.wrap(callbackResponse.details.fee).as('callback_fee');
            cy.wrap(callbackResponse.details.total_amount).as('callback_total_amount');
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
        cy.get('@callback_credit_amount').then((callback_credit_amount) => {
            const amount = parseInt(callback_credit_amount)
            const settlement_amount = transactiondetails_locators.settlement_amount
            const settlement_totalamount = transactiondetails_locators.settlement_totalamount
            cy.get(settlement_amount).invoke('text').then((settlement_amount)=>{
                const trimmedSettlementAmount = settlement_amount
                .replace('THB ', '') // Remove "THB "
                .replace(/,/g, '')   // Remove commas
                expect(parseInt(trimmedSettlementAmount)).to.equal(amount);
            })
            cy.get('@callback_total_amount').then((callback_total_amount)=>{
                cy.get(settlement_totalamount).invoke('text').then((settlement_totalamount)=>{
                    const trimmedSettlementTotalAmount = settlement_totalamount
                    .replace('THB ', '') // Remove "THB "
                    .replace(/,/g, '')   // Remove commas
                    expect(parseInt(trimmedSettlementTotalAmount)).to.equal(callback_total_amount);
                })
            })
            
        });

        if (storedStatus == 'pending'){
            cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: resultCell, value: 'PENDING'});
            return;
        } else if(storedStatus == 'failed'){
            cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: resultCell, value: 'FAILED'});
            return;
        } else if(storedStatus == 'expired'){
            cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: resultCell, value: 'EXPIRED'});
            return;
        }
    }

    try{
        cy.readFile(data_response_holder.rwPayload).then((payloadResponse) => {
            cy.wrap(payloadResponse.transaction.transaction_number).as('payload_transaction_number');
            cy.wrap(payloadResponse.transaction.reference_no).as('payload_reference_no');
            cy.wrap(payloadResponse.phone).as('payload_mobile');
            cy.wrap(payloadResponse.transaction.amount).as('payload_amount');
            cy.wrap(payloadResponse.transaction.settlement_details.total_fee).as('payload_fee');
            cy.wrap(payloadResponse.transaction.settlement_details.total_amount).as('payload_total_amount');
        });
        cy.readFile(data_response_holder.rwCompleted).then((callbackResponse) => {
            cy.wrap(callbackResponse.transaction_number).as('callback_transaction_number');
            cy.wrap(callbackResponse.reference_no).as('callback_reference_no');
            cy.wrap(callbackResponse.status).as('callback_status');
            cy.wrap(callbackResponse.customer.mobile).as('callback_customer_mobile');
            cy.wrap(callbackResponse.details.credit_amount).as('callback_credit_amount');
            cy.wrap(callbackResponse.details.fee).as('callback_fee');
            cy.wrap(callbackResponse.details.total_amount).as('callback_total_amount');
        });
        cy.get('@payload_transaction_number').then((payload_transaction_number) => {
            cy.get('@callback_transaction_number').should((callback_transaction_number) => {
                expect(payload_transaction_number).to.eq(callback_transaction_number);
            });
        });
        cy.get('@payload_reference_no').then((payload_reference_no) => {
            cy.get('@callback_reference_no').should((callback_reference_no) => {
                expect(payload_reference_no).to.eq(callback_reference_no);
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
                        let netAmount = creditAmount - fee
                        expect(amount).to.eq(creditAmount);
                        expect(totalAmount).to.eq(netAmount);
                    });     
                });     
            });
        });
        cy.get('@payload_fee').then((payload_fee) => {
            cy.get('@callback_fee').should((callback_fee) => {
                let payloadFee = parseInt(payload_fee)
                expect(payloadFee).to.eq(callback_fee);
            });
        });
        cy.get('@callback_status').then((callback_status) => {
            const storedStatus = Cypress.env('status')
            expect(callback_status).to.eq(storedStatus);
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
