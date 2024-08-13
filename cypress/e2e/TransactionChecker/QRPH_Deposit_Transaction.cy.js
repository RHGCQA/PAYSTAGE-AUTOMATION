import { common } from "../../fixtures/prd/common";
import { loginpage_locators } from "../../fixtures/prd/locators";
import { sidebarmenu_locators } from "../../fixtures/prd/locators";
import { transactionpage_locators } from "../../fixtures/prd/locators";
import { transactiondetails_locators } from "../../fixtures/prd/locators";
import { data_response_holder } from "../../fixtures/prd/locators";
import { filterTransactions } from './filterTransactions';
import { fetchTransactionData } from './base_date_storage';
// npx cypress run --spec "cypress/e2e/TransactionChecker/*"
// npx cypress run --spec "cypress/e2e/TransactionChecker/QRPH_Deposit_Transaction.cy.js"
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
    return Math.ceil(num * 100) / 100;
}

describe('Looping within an it block', () => {
    const sheetId = '1vd-uTQXSUgrAc5hoE_du2Zxvw6toE9gEWpjpWxcdwIk'; // Your Google Sheet ID
    let pagenumberStart = 1 //default is page 1
    let pageLength = 12 //total number of pages
    const PageNav = Array.from({ length: pageLength}, (_, i) => i + pagenumberStart);
    PageNav.forEach((pageNav) => {
        const sheetName = "QPRH LIVE TRANSACTIONS";
        const pageCol = sheetName+"!A"; // The cell where you want to write data
        it(`Should test transactions for Page: ${pageNav}`, () => {
            cy.resetQATouchStatuses('d192aw', 'untested')

            let TransactionDate = 12; // 1 - today | 2 - yesterday (recommended)
            try {
                // Login
                cy.visit(common.login_url);
                cy.get(loginpage_locators.email_field).type(common.adminEmail);
                cy.get(loginpage_locators.pass_field).type(common.adminPass);
                cy.get(loginpage_locators.submit_button).click();
                cy.updateQATouchTestResult('RpM25D', 'passed'); //login valid credential
                console.log('Login Admin Account')
                console.log('email:'+common.adminEmail)
                console.log('pass:'+common.adminPass)
            } catch (error){
                cy.updateQATouchTestResult('RpM25D', 'failed'); //login valid credential
            }
            try{
                // Navigate to the transaction page
                cy.get(sidebarmenu_locators.transaction_module).should('be.visible',
                    { timeout: 10000 }).click();
                cy.get(sidebarmenu_locators.transaction_submodule).click();
                // Filter transactions
                filterTransactions('type_deposit', 'vendor_allbank', 'solution_QRPH', TransactionDate, pageNav, { timeout: 10000 });
                cy.wait(2850);
                cy.get(transactionpage_locators.tablerow).its('length').then((rowCount) => {
                    // const randomRow = Math.floor(Math.random() * rowCount) + 2;
                    let rowcount = rowCount+1;
                    let y = pageNav - 1
                    let z = y * 20
                    for (let x=2; x <=rowcount; x++) {
                        let pageCell = pageCol+x
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
                        filterTransactions('type_deposit', 'vendor_allbank', 'solution_QRPH', TransactionDate, pageNav, { timeout: 10000 });
                        cy.wait(3000);
                    }
                });
                cy.updateQATouchTestResult('d192aw', 'passed'); //transaction page navigation
            } catch (error){
                cy.updateQATouchTestResult('d192aw', 'failed'); //transaction page navigation
            }
        });
    });
}); 

const validateTransactionDetails = (transactionNumber) => {
    try{
        cy.visit(`https://portal.paystage.net/${transactionNumber}/transactions`, { timeout: 20000 });
        cy.wait(3500);

        cy.get('@transaction_number').then(() => {
            const storedMerchantNumber = Cypress.env('merchant_number');
            const storedMerchantName = Cypress.env('merchant_name');
            const storedCustomerName = Cypress.env('customer_name');
            const storedTransactionType = Cypress.env('transaction_type');
            const storedStatus = Cypress.env('status');

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

            cy.get(transactiondetails_locators.close_modal).click({ timeout: 3000 });
            cy.wait(1500);

            cy.get(transactiondetails_locators.view_request).first().contains('View request').click();
            cy.wait(3500);

            cy.get(transactiondetails_locators.mobdal_content).invoke('text').then((sent_payload_completed) => {
                cy.writeFile(data_response_holder.rwCompleted, sent_payload_completed);
            });
        });
        cy.updateQATouchTestResult('xzaK05', 'passed'); //transaction details page navigation
    } catch (error){
        cy.updateQATouchTestResult('xzaK05', 'failed'); //transaction details page navigation
    }
};

const validateWebhookResponses = (sheetId, sheetName, sheetRow) => {
    const resultCol = sheetName+"!I"; // The cell where you want to write data
    let resultCell = resultCol+sheetRow
    try{
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
    
        // Add your assertions here
        cy.get('@payload_amount').then((payload_amount) => {
            let amount = parseInt(payload_amount);
            // Assume you have a variable determining the type of element
            const merchant_name = Cypress.env('merchant_name') // This could be any condition based on your test

            switch (merchant_name) {
            case 'TECHOPTIONS (CY) GROUP LIMITED':
                let fee_holder_techoptions = roundToTwo(amount * 0.04);
                if (fee_holder_techoptions < 25) {
                    cy.get('@callback_fee').should('eq', 25);
                    cy.get('@callback_total_amount').should((callback_total_amount) => {
                        let total_amount = amount - 25;
                        expect(callback_total_amount).to.eq(total_amount);
                    });
                } else {
                    cy.get('@callback_fee').should('eq', fee_holder_techoptions);
                    cy.get('@callback_total_amount').should((callback_total_amount) => {
                        let total_amount = amount - fee_holder_techoptions;
                        expect(callback_total_amount).to.eq(total_amount);
                    });
                }
                break;
            case 'TECHSOLUTIONS (CY) GROUP LIMITED':
                let fee_holder_techsolutions = roundToTwo(amount * 0.04);
                if (fee_holder_techsolutions < 25) {
                    cy.get('@callback_fee').should('eq', 25);
                    cy.get('@callback_total_amount').should((callback_total_amount) => {
                        let total_amount = amount - 25;
                        expect(callback_total_amount).to.eq(total_amount);
                    });
                } else {
                    cy.get('@callback_fee').should('eq', fee_holder_techsolutions);
                    cy.get('@callback_total_amount').should((callback_total_amount) => {
                        let total_amount = amount - fee_holder_techsolutions;
                        expect(callback_total_amount).to.eq(total_amount);
                    });
                }
                break;
            case 'RIVALRY LIMITED':
                let fee_holder_rivalry = roundToTwo(amount * 0.0275);
                if (fee_holder_rivalry < 13) {
                    cy.get('@callback_fee').should('eq', 13);
                    cy.get('@callback_total_amount').should((callback_total_amount) => {
                        let total_amount = roundToTwo(amount - 13);
                        expect(callback_total_amount).to.eq(total_amount);
                    });
                } else {
                    cy.get('@callback_fee').should('eq', fee_holder_rivalry);
                    cy.get('@callback_total_amount').should((callback_total_amount) => {
                        let total_amount = roundToTwo(amount - fee_holder_rivalry);
                        expect(callback_total_amount).to.eq(total_amount);
                    });
                }
                break;
            default:
                let fee_holder = roundToTwo(amount * 0.02); // Round to 2 decimal places
                if (fee_holder < 10) {
                    if (Cypress.env('merchant_name') === 'FooBar Prod') {
                        cy.get('@callback_fee').should('eq', 1);
                        cy.get('@callback_total_amount').should((callback_total_amount) => {
                            let total_amount = amount - 1;
                            expect(callback_total_amount).to.eq(total_amount);
                        });
                    } else {
                        cy.get('@callback_fee').should('eq', 10);
                        cy.get('@callback_total_amount').should((callback_total_amount) => {
                            let total_amount = amount - 10;
                            expect(callback_total_amount).to.eq(total_amount);
                        });
                    }
                } else {
                    cy.get('@callback_fee').should('eq', fee_holder);
                    cy.get('@callback_total_amount').should((callback_total_amount) => {
                        let total_amount = amount - fee_holder;
                        expect(callback_total_amount).to.eq(total_amount);
                    });
                }
            }
            cy.get('@callback_credit_amount').should((callback_credit_amount) => {
                expect(payload_amount).to.eq(callback_credit_amount);
            });
        });
    
        cy.get('@payload_transaction_number').then((payload_transaction_number) => {
            cy.get('@callback_transaction_number').should((callback_transaction_number) => {
                expect(payload_transaction_number).to.eq(callback_transaction_number);
            });
        });
    
        if (Cypress.env('status') === 'completed') {
            cy.get('@payload_status').should('eq', 'S');
        } else if (Cypress.env('status') === 'failed') {
            cy.get('@payload_status').should('eq', 'F');
        }
    
        cy.get('@payload_solrefno').then((payload_solrefno) => {
            cy.get('@solution_ref').should((solution_ref) => {
                expect(payload_solrefno).to.eq(solution_ref);
            });
        });
    
        cy.get('@callback_customer_mobile').then((callback_customer_mobile) => {
            cy.get('@mobile').should((mobile) => {
                expect(callback_customer_mobile).to.eq(mobile);
            });
        });
    
        cy.get('@payload_merrefno').then((payload_merrefno) => {
            cy.get('@callback_merrefno').should((callback_merrefno) => {
                expect(payload_merrefno).to.eq(callback_merrefno);
            });
        });
    
        cy.get('@payload_currency').then((payload_currency) => {
            cy.get('@callback_credit_currency').should((callback_credit_currency) => {
                expect(payload_currency).to.eq(callback_credit_currency);
            });
        });
        cy.updateQATouchTestResult('VVa25B', 'passed'); //transaction details activity logs
        cy.task('writeToGoogleSheet', { sheetId, cell: resultCell, value: "PASSED" })
    } catch(error){
        cy.updateQATouchTestResult('VVa25B', 'failed'); //transaction details activity logs
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
