const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  // reporter: "./node_modules/@kanidjar/cypress-qatouch-reporter",
  // reporterOptions: {
  //    "domain" : "rhgc",
  //    "apiToken": "0ce462087c5c18c7576c2397405e3fc7570f76f5daecaf8c3d7e1d4eff30c37b",
  //    "projectKey": "2aMB",
  //    "testRunKey": "WM7M"
  // },
  viewportWidth: 1920,
  viewportHeight: 1580,

  experimentalMemoryManagement: true, // Add this line
  numTestsKeptInMemory: 0 // Optional, adjust as needed
});
