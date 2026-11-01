// These tasks run in Node. Only the address and the received code reach the test.
const { randomUUID } = require('node:crypto')
const { setTimeout: sleep } = require('node:timers/promises')

const baseUrl = 'https://api.mail.tm'
let currentInbox

async function request(path, method = 'GET', body) {
  const headers = { Accept: 'application/ld+json' }
  if (body) headers['Content-Type'] = 'application/json'
  if (currentInbox?.token) headers.Authorization = 'Bearer ' + currentInbox.token
  const response = await fetch(baseUrl + path, {
    method, headers, body: JSON.stringify(body), signal: AbortSignal.timeout(10000),
  })
  if (!response.ok) throw new Error(`Mail.tm ${method} ${path} returned HTTP ${response.status}.`)
  return response.status === 204 ? null : response.json()
}

async function createInbox() {
  const domains = await request('/domains')
  const domain = domains['hydra:member'].find(item => item.isActive && !item.isPrivate)
  if (!domain) throw new Error('Mail.tm has no active public domain.')
  const credentials = {
    address: `signup-qa-${randomUUID()}@${domain.domain}`,
    password: randomUUID(),
  }
  const account = await request('/accounts', 'POST', credentials)
  const { token } = await request('/token', 'POST', credentials)
  currentInbox = { id: account.id, token }
  return credentials.address
}

async function readSignupCode() {
  const deadline = Date.now() + 120000
  while (Date.now() < deadline) {
    const messages = await request('/messages')
    for (const item of messages['hydra:member']) {
      const message = await request('/messages/' + item.id)
      const html = (message.html || []).join(' ').replace(/<[^>]*>/g, ' ')
      const content = [message.subject, message.text || html].join(' ')
      if (!/verification|verify|otp|one.time|code/i.test(content)) continue
      const digits = content.match(/\b\d{6}\b/)
      if (digits) return digits[0]
    }
    await sleep(3000)
  }
  throw new Error('No six-digit signup email arrived in the new Mail.tm inbox within two minutes.')
}

async function deleteInbox() {
  if (currentInbox) {
    await request('/accounts/' + currentInbox.id, 'DELETE')
    currentInbox = undefined
  }
  return null
}

module.exports = { createInbox, readSignupCode, deleteInbox }
