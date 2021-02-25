import * as core from '@actions/core'
import * as github from '@actions/github'
import twilio from 'twilio'

async function run(): Promise<void> {
  try {
    // eslint-disable-next-line no-console
    console.log(github.context)

    const from = core.getInput('fromPhoneNumber')
    const to = core.getInput('toPhoneNumber')
    const message = core.getInput('message')

    const accountSid =
      core.getInput('TWILIO_ACCOUNT_SID') || process.env.TWILIO_ACCOUNT_SID
    const apiKey = core.getInput('TWILIO_API_KEY') || process.env.TWILIO_API_KEY
    const apiSecret =
      core.getInput('TWILIO_API_SECRET') || process.env.TWILIO_API_SECRET

    core.debug('Sending SMS')

    const client = twilio(apiKey, apiSecret, {accountSid})

    const resultMessage = await client.messages.create({
      from,
      to,
      body: message
    })
    core.debug('SMS sent!')

    core.setOutput('messageSid', resultMessage.sid)
    // const ms: string = core.getInput('milliseconds')
    // core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true

    // core.debug(new Date().toTimeString())
    // await wait(parseInt(ms, 10))
    // core.debug(new Date().toTimeString())

    // core.setOutput('time', new Date().toTimeString())
  } catch ({message}) {
    core.error(`Failed to send message: ${message}`)
    core.setFailed(message)
  }
}

run()
