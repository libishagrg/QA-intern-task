describe('Agency signup', () => {
  afterEach(() => cy.task('deleteInbox', null, { log: false }))

  it('signs up a new agency and opens its saved profile', () => {
    const id = crypto.randomUUID()
    const agency = 'QA Agency ' + id.slice(0, 8)
    const password = 'Qa7!' + id

    const area = Cypress._.sample(['202', '303', '312', '415', '617', '646', '702', '718', '917'])
    const phone = area + '55501' + String(Cypress._.random(0, 99)).padStart(2, '0')


    cy.visit('/')
    cy.contains('header a', 'Get Started').click()
    cy.contains('h3', 'Register Your Agency').should('be.visible')
    cy.get('#remember').click().should('have.attr', 'aria-checked', 'true')
    cy.contains('button', /^Continue$/).click()

    cy.contains('h3', 'Provide your personal details.').should('be.visible')
    cy.get('[name="firstName"]').type('Cypress')
    cy.get('[name="lastName"]').type('Tester')
    cy.task('createInbox').as('email')
    cy.get('@email').then(email => cy.get('[name="email"]').type(email))
    cy.get('form button[role="combobox"]').click()
    cy.get('[placeholder="Search..."]').type('United States')
    cy.get('[role="option"]').should('have.length', 1).click()

    cy.intercept('GET', '**/validate-mobile-number/+1' + phone + '/').as('phoneCheck')
    cy.get('[name="phoneNumber"]').type(phone)
    cy.get('[name="password"]').type(password, { log: false })
    cy.get('[name="confirmPassword"]').type(password, { log: false })
    cy.wait('@phoneCheck').its('response.body.is_valid').should('eq', true)
    cy.contains('button', /^Next$/).click()

    cy.contains('h2', 'Email Verification code').should('be.visible')
    cy.task('readSignupCode', null, { timeout: 140000, log: false }).then(code => {
      cy.get('form input[maxlength="6"]').type(code, { log: false })
    })
    cy.get('form button[type="submit"]').click()

    cy.contains('h3', 'About your Agency').should('be.visible')
    cy.get('[name="agency_name"]').type(agency)
    cy.get('[name="role_in_agency"]').type('Test Coordinator')
    cy.get('@email').then(email => cy.get('[name="agency_email"]').type(email))
    cy.get('[name="agency_website"]').type('example.com')
    cy.get('[name="agency_address"]').type('123 Example Street')
    cy.contains('button', 'Select Your Region of Operation').click()
    cy.get('[role="dialog"] input').type('Nepal')
    cy.contains('[role="dialog"] span', /^Nepal$/).click()
    cy.get('[role="dialog"] input').type('{esc}')
    cy.get('form button[type="submit"]').click()

    cy.contains('h3', 'Experience and Performance Metrics').should('be.visible')
    cy.get('form button[role="combobox"]').click()
    cy.contains('[role="option"]', /^2 years$/).click()
    cy.get('[name="number_of_students_recruited_annually"]').type('12')
    cy.get('[name="focus_area"]').type('Undergraduate admissions to Canada')
    cy.get('[name="success_metrics"]').type('85')
    cy.contains('label', /^Career Counseling$/i).click()
    cy.get('form button[type="submit"]').click()

    cy.contains('h3', 'Provide Business Details and Set Preferences').should('be.visible')
    cy.get('[name="business_registration_number"]').type('QA-' + id.slice(0, 8))
    cy.contains('button', 'Select Your Preferred Countries').click()
    cy.get('[role="dialog"] input').type('Canada')
    cy.contains('[role="dialog"] span', /^Canada$/).click()
    cy.get('[role="dialog"] input').type('{esc}')
    cy.contains('label', /^Universities$/).click()
    cy.get('form input[type="file"]').first()
      .selectFile('cypress/fixtures/qa_registration.csv', { force: true })
    cy.contains('form', 'qa_registration.csv').should('be.visible')

    cy.intercept('POST', '**/api/verification-preferences/').as('preferences')
    cy.intercept('POST', '**/api/document/').as('upload')
    cy.intercept('GET', '**/api/user/agent-profile-detail/').as('profile')
    cy.get('form button[type="submit"]').click()
    cy.wait('@preferences').its('response.statusCode').should('be.within', 200, 299)
    cy.wait('@upload').its('response.statusCode').should('be.within', 200, 299)

    cy.location('pathname', { timeout: 30000 }).should('eq', '/admin/profile')
    cy.wait('@profile').then(({ response }) => {
      expect(response.statusCode).to.eq(200)
      expect(JSON.stringify(response.body)).to.include(agency)
    })
    cy.contains('Cypress Tester').should('be.visible')
    cy.screenshot('signup-complete', { capture: 'viewport' })
  })
})
