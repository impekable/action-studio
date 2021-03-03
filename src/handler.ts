/* eslint-disable @typescript-eslint/no-explicit-any */
import twilio from 'twilio'
import * as github from '@actions/github'

const path = '.studio.json'

type createOptions = {
  githubToken: string
  client: {
    production: twilio.Twilio
    development: twilio.Twilio
  }
  masterFlow: string
  branch: string
  githubUsername: string
  repo: string
  owner: string
  defaultBranch: string
}

export async function create(options: createOptions): Promise<string> {
  const {
    repo,
    owner,
    branch,
    client,
    masterFlow,
    githubUsername,
    githubToken
  } = options

  let definition: any = {
    description: `Twilio Studio Flow (${githubUsername})`,
    states: [
      {
        name: 'Trigger',
        type: 'trigger',
        transitions: [],
        properties: {
          offset: {
            x: 0,
            y: 0
          }
        }
      }
    ],
    initial_state: 'Trigger',
    flags: {
      allow_concurrent_calls: true
    }
  }

  if (masterFlow) {
    const flow = await client.production.studio.flows(masterFlow).fetch()
    definition = flow.definition
  }

  const flowInstance = await client.development.studio.flows.create({
    commitMessage: `${githubUsername} used Studio Control to create a project`,
    friendlyName: `${githubUsername} flow. (Branch: ${branch})`,
    status: 'published',
    definition
  })

  const flowJSON = flowInstance.toJSON()

  const octokit = github.getOctokit(githubToken)

  await octokit.repos.createOrUpdateFileContents({
    repo,
    owner,
    path,
    message: `${flowInstance.friendlyName} generated flow. SID: ${flowInstance.sid}`,
    content: Buffer.from(JSON.stringify(flowJSON)).toString('base64'),
    branch
  })

  return flowInstance.sid
}

export async function merge(options: createOptions): Promise<void> {
  const {
    repo,
    owner,
    branch,
    client,
    masterFlow,
    githubToken,
    defaultBranch
  } = options

  const octokit = github.getOctokit(githubToken)

  const configFile = await octokit.repos.getContent({
    owner,
    repo,
    path,
    ref: branch
  })

  const configData = configFile.data as any

  const studioConfig = JSON.parse(
    Buffer.from(configData.content, 'base64').toString()
  )

  const current = await client.development.studio
    .flows(studioConfig.sid)
    .fetch()

  const commitMessage = `Merged ${current.friendlyName} to production flow on twilio. Updated .studio.json on github. Created a github release ${current.sid}.json.`

  const master = await client.production.studio.flows(masterFlow).update({
    status: 'published',
    commitMessage,
    definition: current.definition
  })

  const masterJSON = JSON.stringify(master.toJSON())

  await octokit.repos.createOrUpdateFileContents({
    repo,
    owner,
    path,
    message: commitMessage,
    sha: configData.sha,
    content: Buffer.from(masterJSON).toString('base64'),
    branch: defaultBranch
  })

  // create release
  const {data} = await octokit.repos.createRelease({
    owner,
    repo,
    body: master.commitMessage,
    tag_name: `v${current.sid}`,
    name: `Release ${current.sid} (${current.friendlyName})`
  })

  await octokit.repos.uploadReleaseAsset({
    owner,
    repo,
    name: `${current.sid}.json`,
    release_id: data.id,
    data: masterJSON
  })
}
