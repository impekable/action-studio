const core = require('@actions/core')
const twilio = require('twilio')
const run = require('../lib/main.js')

jest.mock('@actions/core')
jest.mock('twilio')

test('Log failures', async () => {
  const errorMessage = 'Error from twilio'

  twilio.mockImplementation(() => {
    throw new Error(errorMessage)
  })

  await run()

  expect(core.error.mock.calls).toEqual(
    expect.arrayContaining([[`Failed to create flow:: ${errorMessage}`]])
  )

  expect(core.setFailed.mock.calls).toEqual(
    expect.arrayContaining([[errorMessage]])
  )
})

// test('Returns message sid', async () => {
//   const sid = 'ID123'

//   twilio.mockReturnValue({
//     studio: {
//       flows: {
//         fetch: () => ({sid}),
//         create: () => ({sid})
//       }
//     }
//   })

//   const resultSid = await run()
//   expect(resultSid).toEqual(sid)
// })
