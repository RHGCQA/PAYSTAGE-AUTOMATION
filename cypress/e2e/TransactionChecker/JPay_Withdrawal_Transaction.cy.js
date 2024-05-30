import { common } from "../../fixtures/prd/common";
import { loginpage_locators } from "../../fixtures/prd/locators";
import { sidebarmenu_locators } from "../../fixtures/prd/locators";
import { filterTransactions } from './filterTransactions'; // Import the filterTransactions function
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
        let PageNav = 2
        cy.visit(common.login_url)
        cy.get(loginpage_locators.email_field).type(common.adminEmail)
        cy.get(loginpage_locators.pass_field).type(common.adminPass)
        cy.get(loginpage_locators.submit_button).click()
        //------------------------------------------------------
        //navigate to transaction page submodule
        cy.get(sidebarmenu_locators.transaction_module).should('be.visible', { timeout: 10000}).click()
        cy.get(sidebarmenu_locators.transaction_submodule).click()
        // Filter transactions
        filterTransactions('type_withdrawal', 'vendor_jpay', TransactionDate, PageNav, { timeout: 10000});
        cy.wait(2200)
        cy.get('[class="rs-table-row"]').its('length').then((rowCount) => {
            // Log the count of elements to the Cypress test runner
            let row_count = rowCount+1
            for(let x=4;x<=4;x++){
                const isTransactionExist = cy.get('[aria-rowindex="'+x+'"] > .rs-table-cell-group > [aria-colindex="2"] > .rs-table-cell-content > a').should('exist');
                //if transactionExist==true
                if(isTransactionExist){
                    cy.log("Transaction EXIST!")
                    // Get all trnsaction number per row
                    cy.get('[aria-rowindex="'+x+'"] > .rs-table-cell-group > [aria-colindex="2"] > .rs-table-cell-content > a')
                    .invoke('text').as('transaction_number');
                    //Get all merchant ref number per row
                    cy.get('[aria-rowindex="'+x+'"] > .rs-table-cell-group > [aria-colindex="3"] > .rs-table-cell-content')
                    .invoke('text').then((merchantNumber) => {
                        Cypress.env('merchant_number', merchantNumber.trim());
                    });
                    //---------------------------------------------
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
                        cy.get(':nth-child(2) > .rs-panel-body > .flex > :nth-child(2) > .list-value')
                        .should('be.visible')
                        .and('have.text', storedMerchantName);
                        cy.get(':nth-child(3) > .rs-panel-body > .flex > :nth-child(1) > .list-value')
                        .should('be.visible')
                        .and('have.text', storedCustomerName);
                        // Assertion depending on the Transaction status
                        if(storedStatus == 'pending'){
                            cy.log("status is Pending!!")
                            cy.get('.gap-y-3 > :nth-child(3) > .list-value').invoke('text').then(transactionType => {
                                if (transactionType.trim() === storedTransactionType){
                                    cy.log("Transactions intent")
                                    //PENDING - INTENT
                                    cy.get('.gap-y-3 > :nth-child(3) > .list-value').should('have.text', storedTransactionType)
                                    cy.get('.gap-y-3 > :nth-child(4) > .list-value').should('have.text', storedMethod)
                                    cy.get('.gap-y-3 > :nth-child(2) > .flex').invoke('text').then(debit_amount => {
                                        const extractedDebitAmount = debit_amount.split(' ')[1]; // Split by space and get the second part
                                        cy.log(extractedDebitAmount)
                                    })
                                    cy.get(':nth-child(4) > .flex').invoke('text').then(fee => {
                                        const extractedFee = fee.split(' ')[1]; // Split by space and get the second part
                                        cy.log(extractedFee)
                                    })
                                    cy.get(':nth-child(6) > .flex').invoke('text').then(total_amount => {
                                        const extractedTotalAmount = total_amount.split(' ')[1]; // Split by space and get the second part
                                        cy.log(extractedTotalAmount)
                                    })
                                    //click the completed webhook
                                    cy.get(':nth-child(2) > .rs-timeline-item-content > .capitalize > .rs-btn-group > :nth-child(2)').click()
                                    //get text sent payload
                                    cy.get('pre').invoke('text').then((sent_payload_completed) => {
                                        cy.writeFile('cypress/e2e/TransactionChecker/storedData.json', sent_payload_completed)
                                    });
                                    cy.readFile('cypress/e2e/TransactionChecker/storedData.json').then((parsedData) => {
                                        cy.wrap(parsedData.transaction_number).as('pre_transactionNumber')
                                        cy.wrap(parsedData.reference_no).as('pre_referenceNumber')
                                        cy.wrap(parsedData.status).as('pre_status')
                                        cy.wrap(parsedData.details.credit_amount).as('pre_credAmount')
                                        cy.wrap(parsedData.details.debit_amount).as('pre_debitAmount')
                                        cy.wrap(parsedData.details.fee).as('pre_fee')
                                        cy.wrap(parsedData.details.method).as('pre_method')
                                        cy.wrap(parsedData.details.type).as('pre_type')
                                        cy.wrap(parsedData.details.total_amount).as('pre_totalAmount')
                                    });
                                    cy.log('Assertion passed: The element has text ' + storedTransactionType);
                                } else {
                                    cy.log("Transactions intent")
                                    // //PENDING - PROCESSED
                                    cy.log('Assertion failed: The element does not have text ' + storedTransactionType);
                                }
                            });
                            //get the pagination of the activity logs
                            cy.get('.rs-pagination-btn-active').invoke('text').then((firstPageActivityLogs) => {
                                let firstpage_activitylogs = firstPageActivityLogs;
                                const firstpage_num = parseInt(firstpage_activitylogs,10);
                                cy.wrap(firstpage_num).as('FirstPage_ActivityLogs');
                            });
                            //click page-end
                            cy.get('[aria-label="Last"]').then(lastButton => {
                                // Check if the next button is enabled
                                const isLastButtonEnabled = !lastButton.hasClass('rs-pagination-btn-disabled');
                                if (isLastButtonEnabled) {
                                    // Click the next button if it's enabled
                                    cy.get('[aria-label="Last"]').click()
                                    cy.wait(2000)
                                    cy.get('.rs-pagination-btn-active').invoke('text').then((lastPageActivityLogs) => {
                                        // Use the 'text' variable here or perform aassertions on it
                                        let lastpage_activitylogs = lastPageActivityLogs;
                                        const lastpage_num = parseInt(lastpage_activitylogs,10);
                                        cy.wrap(lastpage_num).as('LastPage_ActivityLogs');
                                        cy.get('[aria-label="First"]').click()
                                        cy.wait(2000)
                                    });
                                } else {
                                    // Log a message if the next button is disabled
                                    cy.log('Last button is disabled, ignoring click');
                                    cy.wait(2500)
                                }
                            });
                        }else if(storedStatus == 'completed'){
                            cy.log("Transactions is completed")
                            cy.get('.gap-y-3 > :nth-child(3) > .list-value').invoke('text').then((solution_ref) => {
                                cy.log(solution_ref)
                            });
                            cy.get('.gap-y-3 > :nth-child(4) > .list-value').should('have.text', storedTransactionType)
                            cy.get('.gap-y-3 > :nth-child(5) > .list-value').should('have.text', storedMethod)
                            cy.wait(2000)
                            //click the last button of Activity logs pagination
                            cy.get('[aria-label="Last"]').click({timeout: 3000})
                            //clcik the view request button for pending webhook response
                            cy.get(':nth-child(4) > .rs-timeline-item-content > .capitalize > .rs-btn-group > :nth-child(2)')
                            .should('be.visible').click({timeout: 3000})
                            cy.wait(1500)
                            //Store the pending webhook response to JSON file
                            cy.get('pre').invoke('text').then((sent_payload_pending) => {
                                cy.writeFile('cypress/e2e/TransactionChecker/stored_data_pending.json', sent_payload_pending)
                            });
                            cy.get('[aria-label="close"]').click({timeout: 3000})
                            cy.get('[aria-label="First"]').click({timeout: 3000})
                            //clcik the view request button for completed webhook response
                            cy.get(':nth-child(2) > .rs-timeline-item-content > .capitalize > .rs-btn-group > :nth-child(2)')
                            .should('be.visible').click({timeout: 3000})
                            cy.wait(1500)
                            //Store the completed webhook response to JSON file
                            cy.get('pre').invoke('text').then((sent_payload_completed) => {
                                cy.writeFile('cypress/e2e/TransactionChecker/stored_data_completed.json', sent_payload_completed)
                            });
                            //readfile the stored data pending status and set alias per field
                            cy.readFile('cypress/e2e/TransactionChecker/stored_data_pending.json').then((pendingResponse) => {
                                cy.wrap(pendingResponse.transaction_number).as('pending_transactionNumber')
                                cy.wrap(pendingResponse.reference_no).as('pending_referenceNumber')
                                cy.wrap(pendingResponse.status).as('pending_status')
                                cy.wrap(pendingResponse.details.credit_amount).as('pending_credAmount')
                                cy.wrap(pendingResponse.details.debit_amount).as('pending_debitAmount')
                                cy.wrap(pendingResponse.details.fee).as('pending_fee')
                                cy.wrap(pendingResponse.details.method).as('pending_method')
                                cy.wrap(pendingResponse.details.type).as('pending_type')
                                cy.wrap(pendingResponse.details.total_amount).as('pending_totalAmount')
                            });
                            //readfile the stored data completed status and set alias per field
                            cy.readFile('cypress/e2e/TransactionChecker/stored_data_completed.json').then((completedResponse) => {
                                cy.wrap(completedResponse.transaction_number).as('completed_transactionNumber')
                                cy.wrap(completedResponse.reference_no).as('completed_referenceNumber')
                                cy.wrap(completedResponse.status).as('completed_status')
                                cy.wrap(completedResponse.details.credit_amount).as('completed_credAmount')
                                cy.wrap(completedResponse.details.debit_amount).as('completed_debitAmount')
                                cy.wrap(completedResponse.details.fee).as('completed_fee')
                                cy.wrap(completedResponse.details.method).as('completed_method')
                                cy.wrap(completedResponse.details.type).as('completed_type')
                                cy.wrap(completedResponse.details.total_amount).as('completed_totalAmount')
                            });
                            // Assertions comparing the pending and completed webhook response
                            cy.get('@pending_transactionNumber').then((pending_transactionNumber) => {
                                cy.get('@completed_transactionNumber').should((completed_transactionNumber) => {
                                    expect(pending_transactionNumber).to.eq(completed_transactionNumber);
                                });
                            });
                            cy.get('@pending_referenceNumber').then((pending_referenceNumber) => {
                                cy.get('@completed_referenceNumber').should((completed_referenceNumber) => {
                                    expect(pending_referenceNumber).to.eq(completed_referenceNumber);
                                });
                            });
                            cy.get('@pending_credAmount').then((pending_credAmount) => {
                                cy.get('@completed_credAmount').then((completed_credAmount) => {
                                    expect(pending_credAmount).to.eq(completed_credAmount);
                                    let credAmount = pending_credAmount
                                    let feeComp = credAmount * 0.018
                                    let totalamountComp = credAmount + feeComp
                                    cy.get('@completed_fee').then((fee)=>{
                                        expect(feeComp).to.eq(fee)
                                    })
                                    cy.get('@completed_totalAmount').then((totalamount)=>{
                                        expect(totalamountComp).to.eq(totalamount)
                                    })
                                });
                            });
                            cy.get('@pending_method').then((pending_method) => {
                                cy.get('@completed_method').then((completed_method) => {
                                    expect(pending_method).to.eq(completed_method);
                                });
                            });
                            cy.get('@pending_type').then((pending_type) => {
                                cy.get('@completed_type').then((completed_type) => {
                                    expect(pending_type).to.eq(completed_type);
                                });
                            });
                            cy.get('@completed_debitAmount').then((completed_debitAmount) => {
                                cy.get('@completed_credAmount').then((completed_credAmount) => {
                                    expect(completed_debitAmount).to.eq(completed_credAmount);
                                });
                            });
                            cy.get('@pending_status').should('eq', 'pending')
                            cy.get('@completed_status').should('eq', 'completed')
                            cy.get('@pending_debitAmount').should('eq', 0)
                            cy.get('@pending_fee').should('eq', 0)
                            cy.get('@pending_totalAmount').should('eq', 0)
                        }
                    });
                }else{
                    cy.log("ignore")
                }
            }
        });
    });
});
