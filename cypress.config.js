const { defineConfig } = require("cypress");
const { google } = require('googleapis');
const path = require('path');
const XLSX = require('xlsx');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        log(message) {
          console.log('Transaction Number: '+ message +'\t\tPASSED');
          return null; // Cypress tasks must return a value
        },

        async writeToGoogleSheet({ sheetId, cell, value }) {
          try {
            const keyFilePath = path.resolve('cypress/support/paystage-automation-tool-8c403695dde6.json');
            const auth = new google.auth.GoogleAuth({
              keyFile: keyFilePath,
              scopes: ['https://www.googleapis.com/auth/spreadsheets']
            });
            const sheets = google.sheets({ version: 'v4', auth });
            await sheets.spreadsheets.values.update({
              spreadsheetId: sheetId,
              range: cell,
              valueInputOption: 'RAW',
              resource: {
                values: [[value]]
              }
            });
            return null;
          } catch (error) {
            console.error('Error writing to Google Sheets:', error);
            return { error: error.toString() };
          }
        },

        async readFromGoogleSheet({ sheetId, cell }) {
          try {
            const keyFilePath = path.resolve('cypress/support/paystage-automation-tool-8c403695dde6.json');
            const auth = new google.auth.GoogleAuth({
              keyFile: keyFilePath,
              scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
            });
            const sheets = google.sheets({ version: 'v4', auth });
            const response = await sheets.spreadsheets.values.get({
              spreadsheetId: sheetId,
              range: cell
            });
            return response.data.values[0][0];
          } catch (error) {
            console.error('Error reading from Google Sheets:', error);
            return { error: error.toString() };
          }
        },

        async writeToExcel({ filePath, sheetName, cell, value }) {
          const fullPath = path.resolve(config.projectRoot, filePath);
          if (!filePath || typeof filePath !== 'string') {
            console.error(`Invalid filePath provided: ${filePath}`);
            return { error: 'Invalid filePath provided' };
          }
          try {
            const workbook = XLSX.readFile(fullPath);
            const sheet = workbook.Sheets[sheetName];
            if (!sheet) {
              throw new Error(`Sheet "${sheetName}" not found`);
            }
            sheet[cell] = { v: value, t: 's' };
            XLSX.writeFile(workbook, fullPath);
          } catch (error) {
            console.error(`Error writing to Excel: ${error.message}`);
            return { error: error.message };
          }
          return null;
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
