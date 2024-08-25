package main

import (
	"context"
	"encoding/json"
	"fmt"
	server "net/http"
	"sort"
	"strings"
	"time"

	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing/transport/http"
	"go.uber.org/zap"
)

// RepoWatcher represents a repository watcher that monitors a Git repository for changes.
type RepoWatcher struct {
	// config holds the configuration settings for the repository watcher.
	config *Config

	// logger is used for logging operations and errors.
	logger *zap.Logger

	// repo is the Git repository being watched.
	repo *git.Repository

	// server is the HTTP server for exposing branch information
	server *server.Server
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
	// Extract repo name from URL
	repoName := extractRepoName(config.RepoURL)

	repo, err := git.PlainClone(repoName, false, &git.CloneOptions{
		URL: config.RepoURL,
		Auth: &http.BasicAuth{
			Username: "token",
			Password: config.AuthToken,
		},
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

// Helper function to extract repo name from URL
func extractRepoName(url string) string {
	parts := strings.Split(url, "/")
	if len(parts) > 0 {
		return strings.TrimSuffix(parts[len(parts)-1], ".git")
	}
	return ""
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

	// Start the HTTP server
	go w.startHTTPServer()

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
			Password: w.config.AuthToken,
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
			Password: w.config.AuthToken,
		},
		RemoteName: "origin",
	})
	if err != nil && err != git.NoErrAlreadyUpToDate {
		return fmt.Errorf("failed to pull repository: %w", err)
	}

	w.logger.Info("Repository is up to date")
	return nil
}

type BranchInfo struct {
	Name       string    `json:"name"`
	LastUpdate time.Time `json:"last_update"`
}

// startHTTPServer initializes and starts an HTTP server for the RepoWatcher.
// It sets up a route for handling branch information requests and listens on port 8080.
//
// The server provides the following endpoint:
// - GET /branches: Returns information about all remote branches
//
// If the server encounters an error while starting or running (excluding server closed errors),
// it logs the error using the RepoWatcher's logger.
func (w *RepoWatcher) startHTTPServer() {
	// Create a new serve mux for routing HTTP requests
	mux := server.NewServeMux()
	// Register the handleBranches function to handle requests to the /branches endpoint
	mux.HandleFunc("/branches", w.handleBranches)

	// Initialize the HTTP server with the created mux and set it to listen on port 8080
	w.server = &server.Server{
		Addr:    ":8080",
		Handler: mux,
	}

	// Log that the server is starting
	w.logger.Info("Starting HTTP server on :8080")
	// Start the server and log any errors that occur during its lifetime
	if err := w.server.ListenAndServe(); err != nil && err != server.ErrServerClosed {
		w.logger.Error("HTTP server error", zap.Error(err))
	}
}

// handleBranches is an HTTP handler function that responds with information about all remote branches.
// It retrieves the branch information using the getRemoteBranches method and returns it as JSON.
//
// The function performs the following steps:
// 1. Calls getRemoteBranches to fetch information about all remote branches.
// 2. If an error occurs during this process, it logs the error and returns a 500 Internal Server Error.
// 3. If successful, it sets the Content-Type header to application/json.
// 4. Encodes the branch information as JSON and writes it to the response.
//
// The JSON response will be an array of BranchInfo objects, each containing:
//   - name: The name of the branch (string)
//   - last_update: The timestamp of the last update to the branch (RFC3339 format)
func (w *RepoWatcher) handleBranches(rw server.ResponseWriter, r *server.Request) {
	branches, err := w.getRemoteBranches()
	if err != nil {
		w.logger.Error("Failed to get remote branches", zap.Error(err))
		server.Error(rw, "Internal server error", server.StatusInternalServerError)
		return
	}

	rw.Header().Set("Content-Type", "application/json")
	json.NewEncoder(rw).Encode(branches)
}

// getRemoteBranches retrieves information about all remote branches for the repository.
//
// This function performs the following steps:
// 1. Fetches the "origin" remote for the repository.
// 2. Lists all references (branches, tags, etc.) from the remote.
// 3. Filters the references to include only branches.
// 4. For each branch, retrieves the latest commit information.
// 5. Creates a BranchInfo struct for each branch, containing its name and last update time.
// 6. Sorts the branches by last update time, with the most recently updated first.
//
// Returns:
//   - []BranchInfo: A slice of BranchInfo structs, each containing information about a remote branch.
//   - error: An error if any step in the process fails, or nil if successful.
//
// Possible errors:
//   - Failure to get the remote
//   - Failure to list remote references
//   - Failure to get commit information for a branch (logged as a warning, branch is skipped)
func (w *RepoWatcher) getRemoteBranches() ([]BranchInfo, error) {
	remote, err := w.repo.Remote("origin")
	if err != nil {
		return nil, fmt.Errorf("failed to get remote: %w", err)
	}

	refs, err := remote.List(&git.ListOptions{
		Auth: &http.BasicAuth{
			Username: "token",
			Password: w.config.AuthToken,
		},
	})
	if err != nil {
		return nil, fmt.Errorf("failed to list remote references: %w", err)
	}

	var branches []BranchInfo
	for _, ref := range refs {
		if ref.Name().IsBranch() {
			commit, err := w.repo.CommitObject(ref.Hash())
			if err != nil {
				w.logger.Warn("Failed to get commit for branch", zap.String("branch", ref.Name().Short()), zap.Error(err))
				continue
			}

			branches = append(branches, BranchInfo{
				Name:       ref.Name().Short(),
				LastUpdate: commit.Author.When,
			})
		}
	}

	// Sort branches by last update time, most recent first
	sort.Slice(branches, func(i, j int) bool {
		return branches[i].LastUpdate.After(branches[j].LastUpdate)
	})

	return branches, nil
}
