/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
import twilio from 'twilio'
import * as core from '@actions/core'
import * as github from '@actions/github'
import * as handler from './handler'

require('dotenv').config()

async function run(): Promise<string> {
  const {payload, eventName} = github.context
  const {ref: branch, ref_type: refType, sender, repository} = payload
  const masterFlow = core.getInput('masterFlow')

  const accountSid =
    core.getInput('TWILIO_ACCOUNT_SID') || process.env.TWILIO_ACCOUNT_SID
  const apiKey = core.getInput('TWILIO_API_KEY') || process.env.TWILIO_API_KEY
  const apiSecret =
    core.getInput('TWILIO_API_SECRET') || process.env.TWILIO_API_SECRET

  core.debug('Creating Flow')
  console.log(JSON.stringify(github.context))

  const client = twilio(apiKey, apiSecret, {accountSid})

  let flowInstanceSid = ''

  if (refType === 'branch') {
    if (!branch.startsWith('studio/')) {
      core.debug(`ignoring: "${branch}" does not match /^studio-/`)
    } else if (eventName !== 'create') {
      core.debug(`ignoring: "${eventName}" is not a create event`)
    } else {
      flowInstanceSid = await handler.create({
        client,
        masterFlow,
        branch,
        githubUsername: sender?.login || '',
        repo: repository?.name || '',
        owner: repository?.owner.login || ''
      })
    }
  }

  core.debug('Flow Created!')

  core.setOutput('flowSid', flowInstanceSid)

  return flowInstanceSid
}

async function execute(): Promise<string | void> {
  try {
    return await run()
  } catch ({message}) {
    core.error(`Failed to create flow:: ${message}`)
    core.setFailed(message)
  }
}

module.exports = execute

execute()
