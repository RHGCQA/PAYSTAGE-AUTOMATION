import { common } from "../../fixtures/prd/common";
import { loginpage_locators } from "../../fixtures/prd/locators";
import { sidebarmenu_locators } from "../../fixtures/prd/locators";
import { filterQRPHTransactions } from './filterTransactions'; // Import the filterTransactions function
// npx cypress run --spec "cypress/e2e/PageNavigation/*"
// npx cypress run --spec "cypress/e2e/TransactionChecker/JPay_Withdrawal_Transaction.cy.js"
// npx cypress open

Cypress.config('defaultCommandTimeout', 10000); // Set default timeout to 10 seconds (adjust as needed)
Cypress.on('uncaught:exception', (err, runnable) => {
    // We expect a 'canceled' error, and don't want to fail the test
    if (err.message.includes('canceled')) {
      return false; // returning false here prevents Cypress from failing the test
    }
    // If you want to let other errors fail the test, return true for them
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

        cy.get('[class="rs-table-row"]').its('length').then((rowCount) => {
            // Log the count of elements to the Cypress test runner
            let row_count = rowCount+1
            for(let x=2;x<=3;x++){
                const isTransactionExist = cy.get('[aria-rowindex="'+x+'"] > .rs-table-cell-group > [aria-colindex="2"] > .rs-table-cell-content > a').should('exist');
                //if transactionExist==true
                if(isTransactionExist){
                    // Get all trnsaction number per row
                    cy.get('[aria-rowindex="'+x+'"] > .rs-table-cell-group > [aria-colindex="2"] > .rs-table-cell-content > a')
                    .invoke('text').as('transaction_number');
                    //Get all merchant ref number per row
                    cy.get('[aria-rowindex="'+x+'"] > .rs-table-cell-group > [aria-colindex="3"] > .rs-table-cell-content')
                    .invoke('text').then((merchantNumber) => {
                        Cypress.env('merchant_number', merchantNumber.trim());
                    });
                    cy.get('[aria-rowindex="'+x+'"] > .rs-table-cell-group > [aria-colindex="5"] > .rs-table-cell-content')
                    .invoke('text').then((merchantName) => {
                        Cypress.env('merchant_name', merchantName.trim());
                    });
                    cy.get('[aria-rowindex="'+x+'"] > .rs-table-cell-group > .lowercase > .rs-table-cell-content > span')
                    .invoke('text').then((customerName) => {
                        Cypress.env('customer_name', customerName.trim());
                    });
                    cy.get('[aria-rowindex="'+x+'"] > .rs-table-cell-group > [aria-colindex="7"] > .rs-table-cell-content')
                    .invoke('text').then((transactionType) => {
                        Cypress.env('transaction_type', transactionType.trim());
                    });
                    cy.get('[aria-rowindex="'+x+'"] > .rs-table-cell-group > [aria-colindex="8"] > .rs-table-cell-content > span')
                    .invoke('text').then((method) => {
                        Cypress.env('method', method.trim());
                    });
                    cy.get('[aria-rowindex="'+x+'"] > .rs-table-cell-group > [aria-colindex="9"] > .rs-table-cell-content')
                    .invoke('text').then((vendor) => {
                        Cypress.env('vendor', vendor.trim());
                    });
                    cy.get('[aria-rowindex="'+x+'"] > .rs-table-cell-group > [aria-colindex="10"] > .rs-table-cell-content')
                    .invoke('text').then((solution) => {
                        Cypress.env('solution', solution.trim());
                    });
                    cy.get('[aria-rowindex="'+x+'"] > .rs-table-cell-group > [aria-colindex="11"] > .rs-table-cell-content > span')
                    .invoke('text').then((status) => {
                        Cypress.env('status', status.trim());
                    });
                    cy.get('[aria-rowindex="'+x+'"] > .rs-table-cell-group > [aria-colindex="12"] > .rs-table-cell-content')
                    .invoke('text').then((amount) => {
                        Cypress.env('amount', amount.trim());
                    });
                    cy.get('[aria-rowindex="'+x+'"] > .rs-table-cell-group > [aria-colindex="15"] > .rs-table-cell-content')
                    .invoke('text').then((net_amount) => {
                        Cypress.env('net_amount', net_amount.trim());
                    });
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
                        const storedMethod = Cypress.env('method');
                        const storedVendor = Cypress.env('vendor');
                        const storedSolution = Cypress.env('solution');
                        const storedAmount = Cypress.env('amount');
                        const storedNetAmount = Cypress.env('net_amount');
                        const storedStatus = Cypress.env('status');

                        cy.get('.gap-y-3 > :nth-child(1) > .list-value')
                        .should('be.visible')
                        .and('have.text', storedMerchantNumber);
                        cy.get('.gap-y-3 > :nth-child(2) > .list-value')
                        .should('be.visible')
                        .and('have.text', storedStatus);
                        //insert assertion here the solutionref
                        cy.get('.gap-y-3 > :nth-child(4) > .list-value')
                        .should('be.visible')
                        .and('have.text', storedTransactionType);
                        cy.get(':nth-child(2) > .rs-panel-body > .flex > :nth-child(2) > .list-value')
                        .should('be.visible')
                        .and('have.text', storedMerchantName);
                        cy.get(':nth-child(3) > .rs-panel-body > .flex > :nth-child(1) > .list-value')
                        .should('be.visible')
                        .and('have.text', storedCustomerName);
                        //
                        cy.log("Transactions is completed")
                        cy.get('.gap-y-3 > :nth-child(3) > .list-value').invoke('text').as('solution_ref')
                        cy.get('.flex > :nth-child(3) > .list-value').invoke('text').as('mobile')
                        //clcik the view request button for pending webhook response
                        cy.get('.rs-timeline-item-content > .capitalize > .rs-btn-group > .rs-btn').contains('View Payload').click();
                        cy.wait(1500)
                        //Store the pending webhook response to JSON file
                        cy.get('pre').invoke('text').then((receivedPayload) => {
                            cy.writeFile('cypress/e2e/TransactionChecker/stored_data_payload.json', receivedPayload)
                        });
                        cy.get('[aria-label="close"]').click({timeout: 3000})
                        cy.wait(1500)
                        //clcik the view request button for completed webhook response
                        cy.get('.rs-timeline-item-content > .capitalize > .rs-btn-group > :nth-child(2)').first().contains('View request').click();
                        cy.wait(3500)
                        //Store the completed webhook response to JSON file
                        cy.get('pre').invoke('text').then((sent_payload_completed) => {
                            cy.writeFile('cypress/e2e/TransactionChecker/stored_data_completed.json', sent_payload_completed)
                        });

                        //readfile the stored data pending status and set alias per field
                        cy.readFile('cypress/e2e/TransactionChecker/stored_data_payload.json').then((payloadResponse) => {
                            cy.wrap(payloadResponse.amount).as('payload_amount')
                            cy.wrap(payloadResponse.txnid).as('payload_transaction_number')
                            cy.wrap(payloadResponse.status).as('payload_status')
                            cy.wrap(payloadResponse.refno).as('payload_solrefno')
                            cy.wrap(payloadResponse.transaction.reference_no).as('payload_merrefno')
                            cy.wrap(payloadResponse.transaction.currency).as('payload_currency')
                        });
                        //readfile the stored data completed status and set alias per field
                        cy.readFile('cypress/e2e/TransactionChecker/stored_data_completed.json').then((callbackResponse) => {
                            cy.wrap(callbackResponse.transaction_number).as('callback_transaction_number')
                            cy.wrap(callbackResponse.reference_no).as('callback_merrefno')
                            cy.wrap(callbackResponse.status).as('callback_status')
                            cy.wrap(callbackResponse.customer.mobile).as('callback_customer_mobile')
                            cy.wrap(callbackResponse.details.credit_amount).as('callback_credit_amount')
                            cy.wrap(callbackResponse.details.credit_currency).as('callback_credit_currency')
                            cy.wrap(callbackResponse.details.fee).as('callback_fee')
                            cy.wrap(callbackResponse.details.total_amount).as('callback_total_amount')
                        });
                        // Assertions comparing the pending and completed webhook response
                        // amount = credit_amount
                        cy.get('@payload_amount').then((payload_amount) => {
                            let amount = parseInt(payload_amount)
                            let fee_holder = amount * 0.02;
                            let fee_rounded = Math.ceil(fee_holder);
                            if (fee_rounded < 10){
                                cy.get('@callback_fee').should('eq', 10);
                            }else {
                                cy.get('@callback_fee').should('eq', fee_rounded);
                            }
                            cy.get('@callback_credit_amount').should((callback_credit_amount) => {
                                expect(payload_amount).to.eq(callback_credit_amount);
                            });
                            cy.get('@callback_total_amount').should((callback_total_amount) => {
                                let total_amount = amount - fee_rounded;
                                expect(callback_total_amount).to.eq(total_amount);
                            });
                        });
                        //merchant_transaction_number = transaction_number
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
