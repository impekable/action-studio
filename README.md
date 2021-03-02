# Impekable Twilio Studio GitHub Action

Automated version control for Twilio Studio Flows.

## Prerequisites

- A Twilio Account. [Sign up for free](https://www.twilio.com/try-twilio)
- A [Twilio API Key and Secret](https://www.twilio.com/docs/iam/keys/api-key)

## Usage

1. Set up your credentials as secrets in your repository settings using `TWILIO_ACCOUNT_SID`, `TWILIO_API_KEY`, `TWILIO_API_SECRET`

2. Add the following to your workflow

```yml
- name: 'Automated version control for Twilio Studio Flows'
  uses: impekable/actions-studio@v1
  with:
    masterFlow: FW4xxxxxxxxxxxx
    githubToken: ${{ secrets.GITHUB_TOKEN }}
  env:
    TWILIO_ACCOUNT_SID: ${{ secrets.TWILIO_ACCOUNT_SID }}
    TWILIO_API_KEY: ${{ secrets.TWILIO_API_KEY }}
    TWILIO_API_SECRET: ${{ secrets.TWILIO_API_SECRET }}
```

## Inputs

### `masterFlow`

**Required** The main flow

### `githubToken`

**Required** Github token to create json files

### `TWILIO_ACCOUNT_SID`

A Twilio Account SID. Can alternatively be stored in environment

### `TWILIO_API_KEY`

A Twilio API Key. Can alternatively be stored in environment

### `TWILIO_API_SECRET`

A Twilio API Secret. Can alternatively be stored in environment

## Contributing

## Third Party Licenses

This GitHub Action uses a couple of Node.js modules to work.

License and other copyright information for each module are included in the release branch of each action version under `node_modules/{module}`.

More information for each package can be found at `https://www.npmjs.com/package/{package}`

## License

[![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](https://lbesson.mit-license.org/)
