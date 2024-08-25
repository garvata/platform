package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/spf13/cobra"
	"go.uber.org/zap"
)

type Config struct {
	RepoURL      string
	AuthToken    string
	PollInterval time.Duration
	Host         string
	Port         int
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
- Repository URL
- Authentication token
- Polling interval
- Host for the HTTP server
- Port for the HTTP server

This tool is useful for automating workflows that depend on repository updates or for maintaining
local copies of remote repositories in real-time.

The tool also provides HTTP endpoints for accessing repository information:
- GET /branches: Returns information about all remote branches
- GET /branch/{name}: Returns the GZIP compressed contents of a specific branch

These endpoints allow for easy integration with other services and provide a way to retrieve
up-to-date information about the monitored repository.`,
	Run: run,
}

var config Config

func init() {
	rootCmd.Flags().StringVar(&config.RepoURL, "repo-url", "", "URL of the repository")
	rootCmd.Flags().StringVar(&config.AuthToken, "auth-token", "", "auth token for authentication")
	rootCmd.Flags().DurationVar(&config.PollInterval, "poll-interval", 5*time.Minute, "Interval to poll for changes")
	rootCmd.Flags().StringVar(&config.Host, "host", "localhost", "Host for the HTTP server")
	rootCmd.Flags().IntVar(&config.Port, "port", 8080, "Port for the HTTP server")

	rootCmd.MarkFlagRequired("repo-url")
	rootCmd.MarkFlagRequired("auth-token")
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
	watcher, err := NewRepoWatcher(ctx, &config, logger)
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