import CryptoJS from 'crypto-js';
import 'cypress-file-upload';
import { common } from "../../fixtures/dev/common";
import { loginpage_locators } from "../../fixtures/dev/locators";

describe('File Upload Test', () => {
    it('should upload a file', () => {
        cy.visit(common.login_url);
        cy.get(loginpage_locators.email_field).type(common.adminEmail)
        cy.get(loginpage_locators.pass_field).type(common.adminPass)
        cy.get(loginpage_locators.submit_button).click()
        cy.wait(2000)

        cy.visit('https://develop.paystage.net/api-documentation')
        cy.get



        cy.visit('your_page_with_file_input_url');
    
      // Replace 'file.txt' with the path to your file
    cy.get('input[type="file"]').attachFile('file.txt');

      // Add any additional assertions or actions you need
    });
});
