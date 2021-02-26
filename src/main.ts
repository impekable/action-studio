/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
import twilio from 'twilio'
import * as core from '@actions/core'
import * as github from '@actions/github'
import * as handler from './handler'

require('dotenv').config()

async function run(): Promise<string> {
  const {payload, eventName} = github.context
  const {
    ref: branch,
    ref_type: refType,
    sender,
    repository,
    pull_request: pullRequest,
    action
  } = payload
  const masterFlow = core.getInput('masterFlow')
  const githubToken = core.getInput('githubToken')

  const accountSid =
    core.getInput('TWILIO_ACCOUNT_SID') || process.env.TWILIO_ACCOUNT_SID
  const apiKey = core.getInput('TWILIO_API_KEY') || process.env.TWILIO_API_KEY
  const apiSecret =
    core.getInput('TWILIO_API_SECRET') || process.env.TWILIO_API_SECRET

  core.debug('Creating Flow')
  // console.log(JSON.stringify(github))

  const client = twilio(apiKey, apiSecret, {accountSid})

  const config = {
    client,
    githubToken,
    masterFlow,
    branch,
    githubUsername: sender?.login || '',
    repo: repository?.name || '',
    owner: repository?.owner.login || ''
  }

  let flowInstanceSid = ''

  // studio/* branch created
  if (eventName === 'create' && refType === 'branch') {
    if (!branch.startsWith('studio/')) {
      core.debug(`ignoring: "${branch}" does not match /^studio-/`)
    } else {
      flowInstanceSid = await handler.create(config)
    }
  }

  // studio/* merge to main accepted
  if (action === 'closed' && eventName === 'pull_request') {
    if (pullRequest && !pullRequest?.merged) {
      await handler.merge(config)
    }
  }

  // core.debug('Flow Created!')

  // core.setOutput('flowSid', flowInstanceSid)

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
