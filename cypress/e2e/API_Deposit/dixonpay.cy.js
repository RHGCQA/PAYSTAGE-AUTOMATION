import CryptoJS from 'crypto-js';
import { common } from "../../fixtures/dev/common";
import { loginpage_locators } from "../../fixtures/dev/locators";

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

var transaction = 0
let randomInt = getRandomInt(1, 2);
let cardnoselector = ['5111111111111118', '3530111333300000']

for (transaction; transaction < 5; transaction++) {

let PK = "pk_FHmnhpf8iX8CeZd385tt8RwoqYguL42G"
let SK = "sk_WE5KIGte3SU8rnf3NrcBVYQIoY3Z9nJe"

describe('DixonPay', () => {
    let uuid = require("uuid").v4()
    uuid = uuid.slice(1,5)
    let algo = CryptoJS.HmacSHA256(PK + uuid, SK)
    const ref_no = uuid
    const digest = algo.toString(CryptoJS.enc.Hex)

    it('DixonPay', () => {
        cy.request({
            method: 'POST',
            url: 'https://api-develop.paystage.net/deposit/intent',
            headers: {
            'Accept': 'application/json',
            'X-GATEWAY-KEY': PK,
            'X-GATEWAY-SECRET': digest
            },
            body:{
                customer: {
                    address_line_1: "123 Main Street",
                    city: "Anytown",
                    country: "PH",
                    email: "testmailfoobar66@gmail.com",
                    first_name: "馬棲手留",
                    last_name: "似壊数手留",
                    mobile: "+639111111111",
                    state: "ON",
                    zip: 4321
                },
                details: {
                    reference_no: ref_no,
                    method: "credit_debit_card",
                    currency: "USD",
                    amount: 10,
                    redirect_url: "https://example.com"
                }
            }
        }).as('details');
        cy.get('@details').its('status').should('eq', 201);
        cy.get('@details').then((response) => {
            // check the response body
            expect(response.body.data).to.have.property('transaction_number');
            expect(response.body.data).to.have.property('reference_no');
            expect(response.body.data).to.have.property('status');
            expect(response.body.data).to.have.property('checkout_url');
            expect(response.body.data).to.have.property('customer');
            expect(response.body.data).to.have.property('details');

            const transaction_number = JSON.stringify(response.body.data.transaction_number);
            const reference_no = JSON.stringify(response.body.data.reference_no);
            const status = JSON.stringify(response.body.data.status);
            const checkout_url = JSON.stringify(response.body.data.checkout_url);
            const credit_amount = JSON.parse(response.body.data.details.credit_amount);
            const fee = JSON.parse(response.body.data.details.fee);
            const total_amount = JSON.parse(response.body.data.details.total_amount);

            // computation for details response data
            const mdr_fee = (7.5 / 100)*credit_amount
            const fixed_fee = 1
            const total_fee = mdr_fee + fixed_fee
            const total_amount_comp = credit_amount - total_fee
            
            // check the Settlement Details in API response
            expect(fee).to.eq(total_fee);
            expect(total_amount).to.eq(total_amount_comp);

            // check ref.no and transaction status in API response
            expect(response.body.data.reference_no).to.eq(ref_no);
            expect(response.body.data.status).to.eq("pending");
            
            // check Transaction Details
            cy.visit(common.login_url);
            cy.get(loginpage_locators.email_field).type(common.adminEmail)
            cy.get(loginpage_locators.pass_field).type(common.adminPass)
            cy.get(loginpage_locators.submit_button).click()
            cy.wait(2000)
            cy.visit("https://develop.paystage.net/"+ response.body.data.transaction_number +"/transactions")

            //check the status in transaction details if transaction is pending
            cy.get('.gap-y-3 > :nth-child(2) > .list-value').contains('pending')
            cy.wait(2000)

            // check the Settlement Details in Transaction Details
            // check ref.no and transaction status in Transaction Details
            
            // check if API response body is equal to Webhook response body
            // check if Settlement Details in API response is equal to Settlement Details Transaction Details
            // check if ref.no and transaction status in API response is equal to ref.no and transaction status in Transaction Details

            // process the dixonpay transaction
            cy.visit(response.body.data.checkout_url)
            cy.get('#cardNumber').type(cardnoselector[randomInt])
            cy.get('#accountName').type('dxntest')
            cy.get('#cvv').type('111')
            cy.get(':nth-child(4) > .form-control').select('05')
            cy.get(':nth-child(5) > .form-control').select('2042')
            cy.get('#btn-submit').click()

            // check ref.no and transaction status in API response
            // check Transaction Details
            //check the status in transaction details if transaction is pending
            // check the Settlement Details in Transaction Details
            // check ref.no and transaction status in Transaction Details
            
            // check if API response body is equal to Webhook response body
            // check if Settlement Details in API response is equal to Settlement Details Transaction Details
            // check if ref.no and transaction status in API response is equal to ref.no and transaction status in Transaction Details
        })
        cy.wait(5000)
    });
})
}