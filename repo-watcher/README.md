# repo-watcher

repo-watcher is a command-line tool designed to monitor a specified Git repository for changes. It periodically checks the repository for new commits and can be configured with various options.

## Features

- Watch a specific Git repository for changes
- Authenticate using API tokens
- Configurable polling interval
- Supports watching a specific branch

## Installation

```bash
go get github.com/garvata/platform/repo-watcher
```

## Usage

```bash
repo-watcher --repo-name=myrepo --repo-url=https://github.com/user/repo.git --api-token=your_token --repo-branch=main --poll-interval=5m
```

### Flags

- `--repo-name`: Name of the repository (required)
- `--repo-url`: URL of the repository (required)
- `--api-token`: API token for authentication (required)
- `--repo-branch`: Branch to watch (default: "main")
- `--poll-interval`: Interval to poll for changes (default: 5m)

## Building from source

1. Clone the repository
2. Run `go build`

## Dependencies

- github.com/go-git/go-git/v5
- github.com/spf13/cobra
- go.uber.org/zap
