import { common } from "../../fixtures/dev/common";
import { loginpage_locators } from "../../fixtures/dev/locators";
import { sidebarmenu_locators } from "../../fixtures/dev/locators";
import { transactionpage_locators } from "../../fixtures/dev/locators";
// npx cypress run --spec "cypress/e2e/PageNavigation/*"
// npx cypress run --spec "cypress/e2e/TransactionChecker/JPay_Withdrawal_Transaction.cy.js"
// npx cypress open
Cypress.config('defaultCommandTimeout', 10000); // Set default timeout to 10 seconds (adjust as needed)

describe('GET ALL TRANSACTION INFORMATION \nPROVIDED IN TRANSACTION PAGE', () => {
    it('Navigate to transaction history page',() =>{
        cy.visit(common.login_url)
        cy.get(loginpage_locators.email_field).type(common.adminEmail)
        cy.get(loginpage_locators.pass_field).type(common.adminPass)
        cy.get(loginpage_locators.submit_button).click()
        //------------------------------------------------------
        //navigate to transaction page submodule
        cy.get(sidebarmenu_locators.transaction_module).should('be.visible', { timeout: 10000}).click()
        cy.get(sidebarmenu_locators.transaction_submodule).click()
        //filter transaction - Withdrawal
        cy.get(transactionpage_locators.type_dropdown).click()
        cy.get(transactionpage_locators.type_withdrawal).click()
        cy.wait(2200)
        //filter transaction - JPAY
        cy.get(transactionpage_locators.vendor_dropdown).click()
        cy.get(transactionpage_locators.vendor_jpay).click()
        cy.wait(2200)
        //Filtered  by date
        cy.get(':nth-child(8) > .w-full > .rs-picker-toggle > .rs-stack > [style="flex-grow: 1; overflow: hidden;"] > .rs-picker-toggle-textbox').click()
        cy.get('.rs-picker-toolbar-ranges > :nth-child(1) > .rs-btn').click()
        cy.wait(3200)
        cy.get('.rs-pagination-btn-active').invoke('text').then((text) => {
            // Use the 'text' variable here or perform aassertions on it
            let firstpage = text;
            const firstpage_num = parseInt(firstpage,10);
            cy.wrap(firstpage_num).as('FistintNumber');
        });
        //click page-end
        cy.get('[aria-label="Last"]').click()
        cy.get('.rs-pagination-btn-active').invoke('text').then((text) => {
            // Use the 'text' variable here or perform aassertions on it
            let lastpage = text;
            const lastpage_num = parseInt(lastpage,10);
            cy.wrap(lastpage_num).as('LastintNumber');
        });
        cy.wait(3000)
        cy.get('[aria-label="First"]').click()
        cy.wait(3000)
            cy.get('@FistintNumber').then((FistintNumber) => {
                cy.log(`Aliased Integer: ${FistintNumber}`);
                cy.get('@LastintNumber').then((LastintNumber) => {
                    cy.log(`Aliased Integer: ${LastintNumber}`);
                    for(let i=FistintNumber;i<=LastintNumber;i++){
                        cy.get('[class="rs-table-row"]').its('length').then((rowCount) => {
                            // Log the count of elements to the Cypress test runner
                            let row_count = rowCount+1
                            for(let x=2;x<=row_count;x++){
                                const isTransactionExist = cy.get('[aria-rowindex="'+x+'"] > .rs-table-cell-group > [aria-colindex="2"] > .rs-table-cell-content > a').should('exist');
                                //if transactionExist==true
                                if(isTransactionExist){
                                    cy.get('[aria-rowindex="'+x+'"] > .rs-table-cell-group > [aria-colindex="2"] > .rs-table-cell-content > a').invoke('text').then((transaction) => {
                                        cy.log(transaction).as('transaction_number')
                                        //FETCH ALL TRANSACTION HERE
                                        //MAKE A LIST
                                        //MAKE LOOP FOR OTHER COLUMNS FOR OTHER TRNASCATION DETAILS
                                    });
                                }else{
                                    cy.log("ignore")
                                }
                            }
                            cy.get('[aria-label="Next"]').then(nextButton => {
                                // Check if the next button is enabled
                                const isNextButtonEnabled = !nextButton.hasClass('rs-pagination-btn-disabled');
                                if (isNextButtonEnabled) {
                                  // Click the next button if it's enabled
                                cy.get('[aria-label="Next"]').click();
                                cy.wait(2500)
                                } else {
                                  // Log a message if the next button is disabled
                                cy.log('Next button is disabled, ignoring click');
                                cy.wait(2500)
                                }
                            });
                        });
                    }
                });
            });
        
        // https://develop.paystage.net/2437560954/transactions 
        // OPEN SPECIFIC TRNASACTION
        // CHECK DETAILS
        // CHECK RESPONSE
        // REPEAT
        
    })
});
