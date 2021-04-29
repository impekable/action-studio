import twilio from 'twilio'
import * as core from '@actions/core'
import * as github from '@actions/github'
import * as handler from './handler'

async function run(): Promise<void> {
  const {payload, eventName} = github.context
  const {
    ref: branch,
    ref_type: refType,
    sender = {
      login: ''
    },
    repository = {
      default_branch: 'main',
      name: '',
      owner: {
        login: ''
      }
    },
    pull_request: pullRequest
  } = payload

  // Inputs
  const masterFlow = core.getInput('twilio-master-flow-sid')
  const githubToken = core.getInput('github-token')

  // Secrets
  const productionAccountSid = process.env.TWILIO_ACCOUNT_SID_PRODUCTION
  const productionApiKey = process.env.TWILIO_API_KEY_PRODUCTION
  const productionApiSecret = process.env.TWILIO_API_SECRET_PRODUCTION

  const developmentAccountSid = process.env.TWILIO_ACCOUNT_SID_DEVELOPMENT
  const developmentApiKey = process.env.TWILIO_API_KEY_DEVELOPMENT
  const developmentApiSecret = process.env.TWILIO_API_SECRET_DEVELOPMENT

  if (!githubToken) {
    return core.setFailed(`github-token is required but got ${githubToken}`)
  }

  if (!productionAccountSid || !productionApiKey || !productionApiSecret) {
    return core.setFailed(
      'Twilio credentials required for production environment'
    )
  }

  if (!developmentAccountSid || !developmentApiKey || !developmentApiSecret) {
    return core.setFailed(
      'Twilio credentials required for development environment'
    )
  }

  // Twilio Client
  const productionClient = twilio(productionApiKey, productionApiSecret, {
    accountSid: productionAccountSid
  })

  const developmentClient = twilio(developmentApiKey, developmentApiSecret, {
    accountSid: developmentAccountSid
  })

  core.debug('Creating Flow')

  const config = {
    branch,
    masterFlow,
    githubToken,
    developmentClient,
    client: {
      production: productionClient,
      development: developmentClient
    },
    githubUsername: sender.login,
    repo: repository.name,
    owner: repository.owner.login,
    defaultBranch: repository.deault_branch
  }

  // Trigger: studio/* branch created
  if (eventName === 'create' && refType === 'branch') {
    if (branch.startsWith('studio/')) {
      await handler.create(config)
    }
  }

  // Trigger: studio/* merge to main branch accepted
  if (eventName === 'pull_request' && pullRequest) {
    if (pullRequest.merged) {
      await handler.merge({...config, branch: pullRequest.head.ref})
    }
  }
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
