import { common } from "../../fixtures/prd/common";
import { loginpage_locators } from "../../fixtures/prd/locators";
import { sidebarmenu_locators } from "../../fixtures/prd/locators";
import { transactionpage_locators } from "../../fixtures/prd/locators";
import { transactiondetails_locators } from "../../fixtures/prd/locators";
import { data_response_holder } from "../../fixtures/prd/locators";
import { filterQRPHTransactions } from './filterTransactions';
import { fetchTransactionData } from './base_date_storage';
// npx cypress run --spec "cypress/e2e/TransactionChecker/*"
// npx cypress run --spec "cypress/e2e/TransactionChecker/QRPH_Deposit_Transaction.cy.js"
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

describe('GET ALL TRANSACTION INFORMATION \nPROVIDED IN TRANSACTION PAGE', () => {
    it('Navigate to transaction history page',() =>{
        let TransactionDate = 2 // 1 - today | 2 - yesterday (recommended)
        let PageNav = 1
        cy.visit(common.login_url)
        cy.get(loginpage_locators.email_field).type(common.adminEmail)
        cy.get(loginpage_locators.pass_field).type(common.adminPass)
        cy.get(loginpage_locators.submit_button).click()
        //------------------------------------------------------
        //navigate to transaction page submodule
        cy.get(sidebarmenu_locators.transaction_module).should('be.visible', { timeout: 10000}).click()
        cy.get(sidebarmenu_locators.transaction_submodule).click()
        // Filter transactions
        filterQRPHTransactions('type_deposit', 'vendor_allbank', 'solution_QRPH', TransactionDate, PageNav, { timeout: 10000});
        cy.wait(2200)

        cy.get(transactionpage_locators.tablerow).its('length').then((rowCount) => {
            // Log the count of elements to the Cypress test runner
            let row_count = rowCount+1
            for(let x=2;x<=row_count;x++){
                const isTransactionExist = cy.get(transactionpage_locators.locator_base1+x+
                    transactionpage_locators.locator_base2+transactionpage_locators
                    .exist).should('exist');
                //if transactionExist==true
                if(isTransactionExist){
                    fetchTransactionData(x,'transaction_number', 'merchant_number',
                        'merchant_name', 'customer_name', 'type', 'method', 'vendor',
                        'solution', 'status', 'amount', 'net_amount');
                    //---------------------------------------------
                    // Visit the URL based on the transaction number
                    cy.get('@transaction_number').then((transactionNumber) => {
                        cy.visit(`https://portal.paystage.net/${transactionNumber}/transactions`);
                    });
                    cy.wait(3000)
                    // Use stored merchant number after redirecting
                    cy.get('@transaction_number').then(() => {
                        const storedMerchantNumber = Cypress.env('merchant_number');
                        const storedMerchantName = Cypress.env('merchant_name');
                        const storedCustomerName = Cypress.env('customer_name');
                        const storedTransactionType = Cypress.env('transaction_type');
                        const storedStatus = Cypress.env('status');
                        cy.get(transactiondetails_locators.merchant_number).should('be.visible')
                        .and('have.text', storedMerchantNumber);
                        cy.get(transactiondetails_locators.status).should('be.visible')
                        .and('have.text', storedStatus);
                        cy.get(transactiondetails_locators.type).should('be.visible')
                        .and('have.text', storedTransactionType);
                        cy.get(transactiondetails_locators.merchant_name).should('be.visible')
                        .and('have.text', storedMerchantName);
                        cy.get(transactiondetails_locators.customer_name).should('be.visible')
                        .and('have.text', storedCustomerName);
                        //
                        cy.get(transactiondetails_locators.solution_ref).invoke('text').as('solution_ref')
                        cy.get(transactiondetails_locators.mobile).invoke('text').as('mobile')
                        //clcik the view request button for pending webhook response
                        cy.get(transactiondetails_locators.view_payload).contains('View Payload').click();
                        cy.wait(1500)
                        //Store the pending webhook response to JSON file
                        cy.get(transactiondetails_locators.mobdal_content).invoke('text').then((receivedPayload) => {
                            cy.writeFile(data_response_holder.rwPayload, receivedPayload)
                        });
                        cy.get(transactiondetails_locators.close_modal).click({timeout: 3000})
                        cy.wait(1500)
                        //clcik the view request button for completed webhook response
                        cy.get(transactiondetails_locators.view_request).first().contains('View request').click();
                        cy.wait(3500)
                        //Store the completed webhook response to JSON file
                        cy.get(transactiondetails_locators.mobdal_content).invoke('text').then((sent_payload_completed) => {
                            cy.writeFile(data_response_holder.rwCompleted, sent_payload_completed)
                        });
                        //readfile the stored data pending status and set alias per field
                        cy.readFile(data_response_holder.rwPayload).then((payloadResponse) => {
                            cy.wrap(payloadResponse.amount).as('payload_amount')
                            cy.wrap(payloadResponse.txnid).as('payload_transaction_number')
                            cy.wrap(payloadResponse.status).as('payload_status')
                            cy.wrap(payloadResponse.refno).as('payload_solrefno')
                            cy.wrap(payloadResponse.transaction.reference_no).as('payload_merrefno')
                            cy.wrap(payloadResponse.transaction.currency).as('payload_currency')
                        });
                        //readfile the stored data completed status and set alias per field
                        cy.readFile(data_response_holder.rwCompleted).then((callbackResponse) => {
                            cy.wrap(callbackResponse.transaction_number).as('callback_transaction_number')
                            cy.wrap(callbackResponse.reference_no).as('callback_merrefno')
                            cy.wrap(callbackResponse.status).as('callback_status')
                            cy.wrap(callbackResponse.customer.mobile).as('callback_customer_mobile')
                            cy.wrap(callbackResponse.details.credit_amount).as('callback_credit_amount')
                            cy.wrap(callbackResponse.details.credit_currency).as('callback_credit_currency')
                            cy.wrap(callbackResponse.details.fee).as('callback_fee')
                            cy.wrap(callbackResponse.details.total_amount).as('callback_total_amount')
                        });
                        // Assertions comparing the sent payload and completed webhook response
                        cy.get('@payload_amount').then((payload_amount) => {
                            let amount = parseInt(payload_amount)
                            let fee_holder = amount * 0.02;
                            let fee_rounded = Math.ceil(fee_holder);
                            if (fee_rounded < 10){
                                cy.get('@callback_fee').should('eq', 10);
                                cy.get('@callback_total_amount').should((callback_total_amount) => {
                                    let total_amount = amount - 10;
                                    expect(callback_total_amount).to.eq(total_amount);
                                });
                            }else {
                                cy.get('@callback_fee').should('eq', fee_rounded);
                                cy.get('@callback_total_amount').should((callback_total_amount) => {
                                    let total_amount = amount - fee_rounded;
                                    expect(callback_total_amount).to.eq(total_amount);
                                });
                            }
                            cy.get('@callback_credit_amount').should((callback_credit_amount) => {
                                expect(payload_amount).to.eq(callback_credit_amount);
                            });
                            // cy.get('@callback_total_amount').should((callback_total_amount) => {
                            //     let total_amount = amount - fee_rounded;
                            //     expect(callback_total_amount).to.eq(total_amount);
                            // });
                        });
                        cy.get('@payload_transaction_number').then((payload_transaction_number) => {
                            cy.get('@callback_transaction_number').should((callback_transaction_number) => {
                                expect(payload_transaction_number).to.eq(callback_transaction_number);
                            });
                        });
                        if (storedStatus == 'completed'){
                            cy.get('@payload_status').should('eq', 'S');
                        }else if(storedStatus == 'failed'){
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
                    });
                }else{
                    cy.log("ignore")
                }
                cy.go(-1, {timeout: 10000})
                filterQRPHTransactions('type_deposit', 'vendor_allbank', 'solution_QRPH', TransactionDate, PageNav, { timeout: 10000});
                cy.wait(2200)
            }
        });
    });
});
