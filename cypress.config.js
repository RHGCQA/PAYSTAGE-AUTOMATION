const { defineConfig } = require("cypress");
const { google } = require('googleapis');
const path = require('path');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // config('task', {
      //   async logs({value}){
      //     console.log(value)
      //     return null;
      //   }
      // });
      on('task', {
        log(message) {
          console.log('Transaction Number: '+ message +'\t\tPASSED');
          return null; // Cypress tasks must return a value
        },

        async writeToGoogleSheet({ sheetId, cell, value }) {
          try {
            const keyFilePath = path.resolve('cypress/support/paystage-automation-tool-8c403695dde6.json');
            // console.log(`Using key file: ${keyFilePath}`);
            
            const auth = new google.auth.GoogleAuth({
              keyFile: keyFilePath,
              scopes: ['https://www.googleapis.com/auth/spreadsheets']
            });

            const sheets = google.sheets({ version: 'v4', auth });
            // console.log(`Authenticated. Writing to sheet ID: ${sheetId}, cell: ${cell}`);

            await sheets.spreadsheets.values.update({
              spreadsheetId: sheetId,
              range: cell,
              valueInputOption: 'RAW',
              resource: {
                values: [[value]]
              }
            });

            // console.log('Write operation successful.');
            return null;
          } catch (error) {
            console.error('Error writing to Google Sheets:', error);
            return { error: error.toString() };
          }
        },

        async readFromGoogleSheet({ sheetId, cell }) {
          try {
            const keyFilePath = path.resolve('cypress/support/paystage-automation-tool-8c403695dde6.json');
            // console.log(`Using key file: ${keyFilePath}`);
            
            const auth = new google.auth.GoogleAuth({
              keyFile: keyFilePath,
              scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
            });

            const sheets = google.sheets({ version: 'v4', auth });
            // console.log(`Authenticated. Reading from sheet ID: ${sheetId}, cell: ${cell}`);

            const response = await sheets.spreadsheets.values.get({
              spreadsheetId: sheetId,
              range: cell
            });

            // console.log('Read operation successful.');
            return response.data.values[0][0];
          } catch (error) {
            console.error('Error reading from Google Sheets:', error);
            return { error: error.toString() };
          }
        }
      });
    },
  },
  projectId: "99db26",
  viewportWidth: 2320,
  viewportHeight: 1580,

  experimentalMemoryManagement: true, // Add this line
  numTestsKeptInMemory: 0 // Optional, adjust as needed
});
