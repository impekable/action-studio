/* eslint-disable @typescript-eslint/no-explicit-any */
import twilio from 'twilio'
import * as core from '@actions/core'
import * as github from '@actions/github'

type createOptions = {
  client: twilio.Twilio
  masterFlow: string
  branch: string
  githubUsername: string
  repo: string
  owner: string
}

export async function create(options: createOptions): Promise<string> {
  const {repo, owner, branch, client, masterFlow, githubUsername} = options

  let definition: any = {}

  if (masterFlow) {
    const flow = await client.studio.flows(masterFlow).fetch()
    definition = flow.definition
  }

  const flowInstance = await client.studio.flows.create({
    commitMessage: `${githubUsername} used Studio Control to create a project`,
    friendlyName: `${githubUsername} development flow. Branch${branch}`,
    status: 'draft',
    definition
  })

  const githubToken = core.getInput('githubToken') || process.env.GITHUB_TOKEN

  if (githubToken) {
    const config = {
      flowSid: flowInstance.sid,
      flowJSON: flowInstance.toJSON()
    }

    const octokit = github.getOctokit(githubToken)
    await octokit.repos.createOrUpdateFileContents({
      repo,
      owner,
      path: '.studio.json',
      message: 'Created initial configuration file',
      content: Buffer.from(JSON.stringify(config)).toString('base64'),
      branch
    })
  }

  return flowInstance.sid
}
