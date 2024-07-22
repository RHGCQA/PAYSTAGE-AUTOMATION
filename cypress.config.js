const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  // reporter: "./node_modules/cypress-qatouch-reporter",
  // reporterOptions: {
  //   "domain" : "rhgc",
  //   "apiToken": "7ea772854e8bfb90e92cbdcf321b554cf54de05b565120e9cf31a7de3bbc1975",
  //   "projectKey": "2aMB",
  //   "testRunKey": "Dbe6Z"
  // },
  projectId: "99db26",
  viewportWidth: 1920,
  viewportHeight: 1580,

  experimentalMemoryManagement: true, // Add this line
  numTestsKeptInMemory: 0 // Optional, adjust as needed
});
