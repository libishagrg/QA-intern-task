## 1. How to Run the Script

To run the Cypress test, follow these steps:

1. Install Node.js and npm on your computer.
2. Download or clone the project from GitHub.
3. Open a terminal in the project folder where `package.json` is located.
4. Run the following commands:

```bash
npm ci
npm test
```

The first command installs all the required packages, and the second command runs the signup test automatically.

To open Cypress and see the test running, use:

```bash
npm run test:open
```

You need an internet connection because the test uses the live website and an online email service.

## 2. Environment and Setup

The project uses the following tools and versions:

- **Programming Language:** JavaScript
- **Testing Framework:** Cypress
- **Runtime:** Node.js 22.22.0
- **Package Manager:** npm 11.11.0
- **Cypress Version:** 15.21.1
- **Browser:** Electron 37.6.0 (Chromium 138)

The test was created and tested on Windows. Cypress uses its own Electron browser, so there is no need to install a separate browser driver.

## 3. Test Data and Accounts Used

The test uses fictional information to create a new recruitment agency account on the live website.

- **User Name:** Cypress Tester
- **Address:** 123 Example Street
- **Website:** example.com
- **Agency Name:** Automatically generated for each run
- **Email:** A temporary email address created using Mail.tm
- **Password:** Automatically generated for each run
- **Phone Number:** A fictional US 555-01xx number
- **Country:** Nepal
- **Experience:** 2 years
- **Students per Year:** 12
- **Success Rate:** 85%
- **Service:** Career Counseling

The test also uploads a sample CSV file named `qa_registration.csv`, which contains fictional testing information.

A temporary email account is created to receive the verification code during signup. The test automatically reads the code and enters it into the website. The temporary inbox is deleted after the test finishes.

No personal accounts, passwords, API keys, or manual verification codes are needed.

**Note:** Every successful test run creates a new account on the live website. The agency approval status may remain Pending after registration.