# repo-watcher

repo-watcher is a command-line tool designed to monitor a specified Git repository for changes. It periodically checks the repository for new commits and can be configured with various options.

## Features

- Watch a specific Git repository for changes
- Authenticate using API tokens
- Configurable polling interval

## Installation

```bash
go get github.com/garvata/platform/repo-watcher
```

## Usage

```bash
repo-watcher --repo-name=myrepo --repo-url=https://github.com/user/repo.git --api-token=your_token --repo-branch=main --poll-interval=5m
```

### Flags

- `--repo-url`: URL of the repository (required)
- `--auth-token`: API token for authentication (required)
- `--poll-interval`: Interval to poll for changes (default: 5m)
- `--host`: host of the server (default localhost)
- `--port`: port of the server (default 8080)

## Building from source

1. Clone the repository
2. Run `go build`
