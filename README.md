# Impekable Twilio Studio GitHub Action

Automated version control for Twilio Studio Flows.

## Prerequisites

- A Twilio Account. [Get twilio credentials](https://www.twilio.com/console)
- A [Twilio API Key and Secret](https://www.twilio.com/docs/iam/keys/api-key)

## Usage

1. Set up the credentials of the clients production environment as secrets in your repository settings using `TWILIO_ACCOUNT_SID_PRODUCTION`, `TWILIO_API_KEY_PRODUCTION`, `TWILIO_API_SECRET_PRODUCTION`

2. Set up the credentials of the development production environment as secrets in your repository settings using `TWILIO_ACCOUNT_SID_DEVELOPMENT`, `TWILIO_API_KEY_DEVELOPMENT`, `TWILIO_API_SECRET_DEVELOPMENT`

3. Add the following to your workflow

```yml
  name: 'Deploy to Studio'
  on:
    create:
      branches:
        - 'studio/*'
    pull_request:
      types: [ closed ]
      branches:
        - 'main'
        - 'master'

    run_studio_control:
      runs-on: ubuntu-latest
      steps:
        - name: Checkout Repo
          uses: actions/checkout@v2
        - name: Create and Deploy
          uses: impekable/actions-studio@main
          with:
            twilio-master-flow-sid: ${{ secrets.TWILIO_MASTER_FLOW_SID }}
            github-token: ${{ secrets.GITHUB_TOKEN }}
          env:
            TWILIO_ACCOUNT_SID_PRODUCTION: ${{ secrets.TWILIO_ACCOUNT_SID_PRODUCTION }}
            TWILIO_API_KEY_PRODUCTION: ${{ secrets.TWILIO_API_KEY_PRODUCTION }}
            TWILIO_API_SECRET_PRODUCTION: ${{ secrets.TWILIO_API_SECRET_PRODUCTION }}
            TWILIO_ACCOUNT_SID_DEVELOPMENT: ${{ secrets.TWILIO_ACCOUNT_SID_DEVELOPMENT }}
            TWILIO_API_KEY_DEVELOPMENT: ${{ secrets.TWILIO_API_KEY_DEVELOPMENT }}
            TWILIO_API_SECRET_DEVELOPMENT: ${{ secrets.TWILIO_API_SECRET_DEVELOPMENT }}

```

## Inputs

### `twilio-master-flow-sid`

**Optional** The sid of the main flow that you want the development flows to be based on

### `github-token`

**Required** Github token to create json files. This does not need to be filled out manually. Github automatically fills in `secrets.GITHUB_TOKEN`

## Production Secrets

### `TWILIO_ACCOUNT_SID_PRODUCTION`

Twilio Account SID for production environment

### `TWILIO_API_KEY_PRODUCTION`

Twilio API Key for production environment

### `TWILIO_API_SECRET_PRODUCTION`

Twilio API Secret for production environment

## Development Secrets

### `TWILIO_ACCOUNT_SID_DEVELOPMENT`

Twilio Account SID for development environment

### `TWILIO_API_KEY_DEVELOPMENT`

Twilio API Key for development environment

### `TWILIO_API_SECRET_DEVELOPMENT`

Twilio API Secret for development environment

## Contributing

## Third Party Licenses

This GitHub Action uses a couple of Node.js modules to work.

License and other copyright information for each module are included in the release branch of each action version under `node_modules/{module}`.

More information for each package can be found at `https://www.npmjs.com/package/{package}`

## License

[![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](https://lbesson.mit-license.org/)
