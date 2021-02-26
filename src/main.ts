/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
import * as core from '@actions/core'
import * as github from '@actions/github'
import twilio from 'twilio'
import {FlowInstance} from 'twilio/lib/rest/studio/v2/flow'

require('dotenv').config()

async function run(): Promise<FlowInstance> {
  const {context} = github
  const masterFlow = core.getInput('masterFlow')

  const accountSid =
    core.getInput('TWILIO_ACCOUNT_SID') || process.env.TWILIO_ACCOUNT_SID
  const apiKey = core.getInput('TWILIO_API_KEY') || process.env.TWILIO_API_KEY
  const apiSecret =
    core.getInput('TWILIO_API_SECRET') || process.env.TWILIO_API_SECRET

  core.debug('Creating Flow')

  const client = twilio(apiKey, apiSecret, {accountSid})

  // eslint-disable-next-line no-console
  console.log(context)
  core.debug(JSON.stringify(context))

  let definition: any = {}

  if (masterFlow) {
    const flow = await client.studio.flows(masterFlow).fetch()
    definition = flow.definition
  }

  const flowInstance = await client.studio.flows.create({
    commitMessage: `Twilio used Studio Control to create a project`,
    friendlyName: 'Flow',
    status: 'draft',
    definition
  })

  core.debug('Flow Created!')

  core.setOutput('flowSid', flowInstance.sid)

  return flowInstance
}

async function execute(): Promise<FlowInstance | void> {
  try {
    return await run()
  } catch ({message}) {
    core.error(`Failed to create flow:: ${message}`)
    core.setFailed(message)
  }
}

module.exports = execute

execute()
