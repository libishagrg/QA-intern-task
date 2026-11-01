const { defineConfig } = require('cypress')
const mailbox = require('./cypress/tasks/mailbox')

module.exports = defineConfig({
  allowCypressEnv: false,
  viewportWidth: 1280,
  viewportHeight: 900,
  defaultCommandTimeout: 15000,
  video: true,
  reporter: 'junit',
  reporterOptions: { mochaFile: 'artifacts/results.xml', toConsole: true },
  e2e: {
    baseUrl: 'https://authorized-partner.vercel.app',
    supportFile: false,
    setupNodeEvents(on) {
      on('task', mailbox)
    },
  },
})
