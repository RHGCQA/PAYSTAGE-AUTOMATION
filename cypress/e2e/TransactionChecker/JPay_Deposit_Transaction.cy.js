import { common } from "../../fixtures/prd/common";
import { loginpage_locators } from "../../fixtures/prd/locators";
import { sidebarmenu_locators } from "../../fixtures/prd/locators";
import { transactionpage_locators } from "../../fixtures/prd/locators";
import { transactiondetails_locators } from "../../fixtures/prd/locators";
import { data_response_holder } from "../../fixtures/prd/locators";
import { filterTransactions } from './filterTransactions';
import { fetchTransactionData } from './base_date_storage';
// npx cypress run --spec "cypress/e2e/TransactionChecker/*"
// npx cypress run --spec "cypress/e2e/TransactionChecker/JPay_Deposit_Transaction.cy.js"
// npx cypress open
// ./config.cmd --url https://github.com/Chzubaga/paystage_cy --token A7RQNS5BNE5GXNPQXMZFN43GRNPWC

Cypress.config('defaultCommandTimeout', 10000);
Cypress.on('uncaught:exception', (err, runnable) => {
    // expect a 'canceled' error, and don't want to fail the test
    if (err.message.includes('canceled')) {
      return false; // returning false here prevents Cypress from failing the test
    }
    // let other errors fail the test, return true for them
    return true;
});

function roundToTwo(num) {
    return Math.round(num * 100) / 100;
}

describe('Looping within an it block', () => {
    const sheetId = '1vd-uTQXSUgrAc5hoE_du2Zxvw6toE9gEWpjpWxcdwIk'; // Your Google Sheet ID
    let pagenumberStart = 1 //default is page 1
    let pageLength = 1 //total number of pages
    const PageNav = Array.from({ length: pageLength}, (_, i) => i + pagenumberStart);
    PageNav.forEach((pageNav) => {
        const sheetName = "JPAY DEPOSIT LIVE TRANSACTIONS";
        it(`Should test transactions for Page: ${pageNav}`, () => {
            let TransactionDate = 12; // 1 - today | 2 - yesterday (recommended)

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
            filterTransactions('type_deposit', 'vendor_jpay', 'solution_lbtJapan', TransactionDate, pageNav, { timeout: 10000 });
            cy.wait(2850);

            cy.get(transactionpage_locators.tablerow).its('length').then((rowCount) => {
                // const randomRow = Math.floor(Math.random() * rowCount) + 2;
                let rowcount = rowCount + 1;
                let y = pageNav - 1
                let z = y * 20
                for (let x = 2; x <= rowcount; x++) {
                    const isTransactionExist = cy.get(`${transactionpage_locators.locator_base1}${x}${transactionpage_locators.locator_base2}${transactionpage_locators.exist}`)
                        .should('exist', { timeout: 20000 });
                    if (isTransactionExist) {
                        fetchTransactionData(x, 'transaction_number', 'merchant_number', 'merchant_name',
                        'customer_name', 'type', 'method', 'vendor', 'solution', 'status', 'amount', 'net_amount');
                        
                        cy.get('@transaction_number').then((transactionNumber) => {
                            let w = x+z;
                            validateTransactionDetails(transactionNumber);
                            writeInGoogleSheet(sheetId, w, sheetName);
                            validateWebhookResponses(sheetId, sheetName, w);
                            cy.task('log', transactionNumber);
                        });
                    } else {
                        cy.log("ignore");
                    }
                    cy.go('back', { timeout: 20000 });
                    filterTransactions('type_deposit', 'vendor_jpay', 'solution_lbtJapan', TransactionDate, pageNav, { timeout: 10000 });
                    cy.wait(3500);
                }
            });
        });
    });
});


const validateTransactionDetails = (transactionNumber) => {
    cy.visit(`https://portal.paystage.net/${transactionNumber}/transactions`, { timeout: 20000 });
    cy.wait(3500);

    cy.get('@transaction_number').then(() => {
        const storedMerchantNumber = Cypress.env('merchant_number');
        const storedMerchantName = Cypress.env('merchant_name');
        const storedCustomerName = Cypress.env('customer_name');
        const storedTransactionType = Cypress.env('transaction_type');
        const storedStatus = Cypress.env('status');

        if (storedStatus == 'completed'){
            cy.get(transactiondetails_locators.merchant_number).should('be.visible').and('have.text', storedMerchantNumber);
            cy.get(transactiondetails_locators.status).should('be.visible').and('have.text', storedStatus); 
            cy.get(transactiondetails_locators.type).should('be.visible').and('have.text', storedTransactionType);
            cy.get(transactiondetails_locators.merchant_name).should('be.visible').and('have.text', storedMerchantName);
            cy.get(transactiondetails_locators.customer_name).should('be.visible').and('have.text', storedCustomerName);
            cy.get(transactiondetails_locators.solution_ref).invoke('text').as('solution_ref');
            cy.get(transactiondetails_locators.mobile).invoke('text').as('mobile');
            cy.get(transactiondetails_locators.view_payload).contains('View Payload').click();
            cy.wait(1500);
            cy.get(transactiondetails_locators.mobdal_content).invoke('text').then((receivedPayload) => {
                cy.writeFile(data_response_holder.rwPayload, receivedPayload);
            });
            cy.get(transactiondetails_locators.close_modal).click({ timeout: 3000, interval: 600 });
            cy.wait(1500);
            cy.get(transactiondetails_locators.view_request).first().contains('View request').click();
            cy.wait(3500);
            cy.get(transactiondetails_locators.mobdal_content).invoke('text').then((sent_payload_completed) => {
                cy.writeFile(data_response_holder.rwCompleted, sent_payload_completed);
            });
        }else {
            cy.log('Skip test if Jpay deposit status is Pending.')
        }
    });
};

const validateWebhookResponses = (sheetId, sheetName, sheetRow) => {
    const resultCol = sheetName+"!I"; // The cell where you want to write data
    let resultCell = resultCol+sheetRow
    try{
    cy.readFile(data_response_holder.rwPayload).then((payloadResponse) => {
        cy.wrap(payloadResponse.uid).as('payload_uid');
        cy.wrap(payloadResponse.transfer_id).as('payload_transfer_id');
        cy.wrap(payloadResponse.amount).as('payload_amount');
        cy.wrap(payloadResponse.fee).as('payload_fee');
    });

    cy.readFile(data_response_holder.rwCompleted).then((callbackResponse) => {
        cy.wrap(callbackResponse.transaction_number).as('callback_transaction_number');
        cy.wrap(callbackResponse.reference_no).as('callback_merrefno');
        cy.wrap(callbackResponse.status).as('callback_status');
        cy.wrap(callbackResponse.customer.mobile).as('callback_customer_mobile');
        cy.wrap(callbackResponse.details.credit_amount).as('callback_credit_amount');
        cy.wrap(callbackResponse.details.fee).as('callback_fee');
        cy.wrap(callbackResponse.details.total_amount).as('callback_total_amount');
        cy.wrap(callbackResponse.details.transfer_id).as('callback_transfer_id');
    });
    
        // Assert the payloadResponse.uid should equal to reference_no
        cy.get('@payload_uid').then((payload_uid) => {
            cy.get('@callback_merrefno').should((callback_merrefno) => {
                expect(payload_uid).to.eq(callback_merrefno);
            });
        });
        // Assert the payloadResponse.transfer_id to details.transfer_id
        cy.get('@payload_transfer_id').then((payload_transfer_id) => {
            cy.get('@callback_transfer_id').should((callback_transfer_id) => {
                expect(payload_transfer_id).to.eq(callback_transfer_id);
            });
        });
        // Assert the payloadResponse.amount to details.credit_amount
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
        // Assert the payloadResponse.fee to details.fee
        cy.get('@payload_fee').then((payload_fee) => {
            cy.get('@callback_fee').should((callback_fee) => {
                let payloadFee = parseInt(payload_fee)
                expect(payloadFee).to.eq(callback_fee);
            });
        });
        // Assert the callbackResponse.reference_no to Cypress.env('merchant_number')
        cy.get('@callback_merrefno').then((callback_merrefno) => {
            const storedMerchantNumber = Cypress.env('merchant_number');
            expect(callback_merrefno).to.eq(storedMerchantNumber);
        });
        // Assert the callbackResponse.status to 'completed'
        cy.get('@callback_status').then((callback_status) => {
            const storedStatus = Cypress.env('status')
            expect(callback_status).to.eq(storedStatus);
        });
        cy.task('writeToGoogleSheet', { sheetId, cell: resultCell, value: "PASSED" })
    } catch(error){
        cy.log("error")
        cy.task('writeToGoogleSheet', { sheetId, cell: resultCell, value: "FAILED" })
    }  
};

const writeInGoogleSheet = (sheetId, sheetRow, sheetName) => {
    const storedMerchantName = Cypress.env('merchant_name');
    const storedCustomerName = Cypress.env('customer_name');
    cy.readFile(data_response_holder.rwCompleted).then((callbackResponse) => {
        cy.wrap(callbackResponse.transaction_number).as('callback_transaction_number');
        cy.wrap(callbackResponse.details.credit_amount).as('callback_credit_amount');
        cy.wrap(callbackResponse.details.fee).as('callback_fee');
        cy.wrap(callbackResponse.details.total_amount).as('callback_total_amount');
        cy.wrap(callbackResponse.status).as('callback_status');
    });

    const pageCol = sheetName+"!A"; // The cell where you want to write data
    let pageCell = pageCol+sheetRow
    cy.task('writeToGoogleSheet', { sheetId, cell: pageCell, value: sheetRow-1 })
    
    cy.get('@callback_transaction_number').then((transaction_number) => {
        const transCol = sheetName+"!B"; // The cell where you want to write data
        let transCell = transCol+sheetRow
        cy.task('writeToGoogleSheet', { sheetId, cell: transCell, value: transaction_number })
    });

    const mNameCol = sheetName+"!C"; // The cell where you want to write data
    let mNameCell = mNameCol+sheetRow
    cy.task('writeToGoogleSheet', { sheetId, cell: mNameCell, value: storedMerchantName })

    const customerCol = sheetName+"!D"; // The cell where you want to write data
    let customerCell = customerCol+sheetRow
    cy.task('writeToGoogleSheet', { sheetId, cell: customerCell, value: storedCustomerName })

    cy.get('@callback_credit_amount').then((amount) => {
        const amountCol = sheetName+"!E"; // The cell where you want to write data
        let amountCell = amountCol+sheetRow
        cy.task('writeToGoogleSheet', { sheetId, cell: amountCell, value: amount })
    });

    cy.get('@callback_fee').then((fee) => {
        const feeCol = sheetName+"!F"; // The cell where you want to write data
        let feeCell = feeCol+sheetRow
        cy.task('writeToGoogleSheet', { sheetId, cell: feeCell, value: fee })
    });

    cy.get('@callback_total_amount').then((net_amount) => {
        const netAmountCol = sheetName+"!G"; // The cell where you want to write data
        let netAmountCell = netAmountCol+sheetRow
        cy.task('writeToGoogleSheet', { sheetId, cell: netAmountCell, value: net_amount })
    });

    cy.get('@callback_status').then((status) => {
        const statusCol = sheetName+"!H"; // The cell where you want to write data
        let statusCell = statusCol+sheetRow
        cy.task('writeToGoogleSheet', { sheetId, cell: statusCell, value: status })
    });
    
}
