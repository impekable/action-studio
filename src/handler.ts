/* eslint-disable @typescript-eslint/no-explicit-any */
import twilio from 'twilio'

type createOptions = {
  client: twilio.Twilio
  masterFlow: string
  branch: string
  githubUsername: string
}

export async function create(options: createOptions): Promise<string> {
  const {branch, client, masterFlow, githubUsername} = options

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

  return flowInstance.sid
}
