package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
	"github.com/go-git/go-git/v5/plumbing/transport/http"
	"github.com/spf13/cobra"
	"go.uber.org/zap"
)

type Config struct {
	RepoName     string
	RepoURL      string
	APIToken     string
	RepoBranch   string
	PollInterval time.Duration
}

var rootCmd = &cobra.Command{
	Use:   "repo-watcher",
	Short: "A tool to watch a Git repository for changes",
	Long: `
 ____                  __        __    _       _
|  _ \ ___ _ __   ___ / _|_      / /_ _| |_ ___| |__   ___ _ __
| |_) / _ \ '_ \ / _ \ |_\ \ /\ / / _' | __/ __| '_ \ / _ \ '__|
|  _ <  __/ |_) | (_) |  _|\ V  V / (_| | || (__| | | |  __/ |
|_| \_\___| .__/ \___/_|   \_/\_/ \__,_|\__\___|_| |_|\___|_|
          |_|

repo-watcher is a command-line tool designed to monitor a specified Git repository for changes.
It periodically checks the repository for new commits and can be configured with various options such as:
- Repository name and URL
- API token for authentication
- Branch to watch
- Polling interval

This tool is useful for automating workflows that depend on repository updates or for maintaining
local copies of remote repositories in real-time.`,
	Run: run,
}

var config Config

func init() {
	rootCmd.Flags().StringVar(&config.RepoName, "repo-name", "", "Name of the repository")
	rootCmd.Flags().StringVar(&config.RepoURL, "repo-url", "", "URL of the repository")
	rootCmd.Flags().StringVar(&config.APIToken, "api-token", "", "API token for authentication")
	rootCmd.Flags().StringVar(&config.RepoBranch, "repo-branch", "main", "Branch to watch")
	rootCmd.Flags().DurationVar(&config.PollInterval, "poll-interval", 5*time.Minute, "Interval to poll for changes")

	rootCmd.MarkFlagRequired("repo-name")
	rootCmd.MarkFlagRequired("repo-url")
	rootCmd.MarkFlagRequired("api-token")
}

func run(cmd *cobra.Command, args []string) {
	// Initialize logger
	logger, err := zap.NewProduction()
	if err != nil {
		log.Fatalf("Failed to initialize logger: %v", err)
	}
	defer logger.Sync()

	// Create a context that can be cancelled
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Set up signal handling
	signalChan := make(chan os.Signal, 1)
	signal.Notify(signalChan, os.Interrupt, syscall.SIGTERM)

	go func() {
		select {
		case <-signalChan:
			logger.Info("Received interrupt signal, shutting down...")
			cancel()
		case <-ctx.Done():
		}
	}()

	// Initialize repository watcher
	watcher, err := NewRepoWatcher(&config, logger)
	if err != nil {
		logger.Fatal("Failed to initialize repository watcher", zap.Error(err))
	}

	// Start watching the repository
	if err := watcher.Watch(ctx); err != nil {
		logger.Fatal("Error while watching repository", zap.Error(err))
	}
}

func main() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}

// RepoWatcher represents a repository watcher that monitors a Git repository for changes.
type RepoWatcher struct {
	// config holds the configuration settings for the repository watcher.
	config *Config

	// logger is used for logging operations and errors.
	logger *zap.Logger

	// repo is the Git repository being watched.
	repo *git.Repository
}

// NewRepoWatcher creates and initializes a new RepoWatcher instance.
// It clones the specified repository and sets up the watcher with the provided configuration and logger.
//
// Parameters:
//   - config: A pointer to the Config struct containing repository and authentication details.
//   - logger: A zap.Logger instance for logging operations and errors.
//
// Returns:
//   - A pointer to the initialized RepoWatcher instance.
//   - An error if the repository cloning fails or any other initialization error occurs.
func NewRepoWatcher(config *Config, logger *zap.Logger) (*RepoWatcher, error) {
	// Clone the repository with the provided configuration
	repo, err := git.PlainClone(config.RepoName, false, &git.CloneOptions{
		URL: config.RepoURL,
		Auth: &http.BasicAuth{
			Username: "token",
			Password: config.APIToken,
		},
		ReferenceName: plumbing.NewBranchReferenceName(config.RepoBranch),
		SingleBranch:  true,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to clone repository: %w", err)
	}

	// Create and return the RepoWatcher instance
	return &RepoWatcher{
		config: config,
		logger: logger,
		repo:   repo,
	}, nil
}

// Watch starts the repository watching process.
// It periodically checks for updates and pulls changes from the remote repository.
//
// Parameters:
//   - ctx: A context.Context for cancellation and timeout control.
//
// Returns:
//   - An error if the watching process encounters any issues or is cancelled.
func (w *RepoWatcher) Watch(ctx context.Context) error {
	ticker := time.NewTicker(w.config.PollInterval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-ticker.C:
			if err := w.checkAndPull(); err != nil {
				w.logger.Error("Failed to check and pull repository", zap.Error(err))
			}
		}
	}
}

// checkAndPull fetches and pulls the latest changes from the remote repository.
//
// This function performs the following steps:
// 1. Fetches the latest changes from the remote repository.
// 2. Retrieves the worktree for the local repository.
// 3. Pulls the changes from the remote repository into the local worktree.
//
// If the repository is already up to date, it logs this information.
// Any errors encountered during the process are wrapped and returned.
//
// Returns:
//   - An error if any step in the process fails, or nil if successful.
func (w *RepoWatcher) checkAndPull() error {
	w.logger.Info("Checking for updates")

	// Fetch the latest changes from the remote repository
	err := w.repo.Fetch(&git.FetchOptions{
		Auth: &http.BasicAuth{
			Username: "token",
			Password: w.config.APIToken,
		},
	})
	if err != nil && err != git.NoErrAlreadyUpToDate {
		return fmt.Errorf("failed to fetch repository: %w", err)
	}

	// Get the worktree for the local repository
	worktree, err := w.repo.Worktree()
	if err != nil {
		return fmt.Errorf("failed to get worktree: %w", err)
	}

	// Pull the changes from the remote repository
	err = worktree.Pull(&git.PullOptions{
		Auth: &http.BasicAuth{
			Username: "token",
			Password: w.config.APIToken,
		},
		RemoteName: "origin",
	})
	if err != nil && err != git.NoErrAlreadyUpToDate {
		return fmt.Errorf("failed to pull repository: %w", err)
	}

	w.logger.Info("Repository is up to date")
	return nil
}
