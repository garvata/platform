package main

import (
	"archive/tar"
	"bytes"
	"compress/gzip"
	"context"
	"errors"
	"fmt"
	"time"

	server "net/http"

	"github.com/go-git/go-billy/v5/memfs"
	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
	"github.com/go-git/go-git/v5/plumbing/object"
	"github.com/go-git/go-git/v5/plumbing/transport/http"
	"github.com/go-git/go-git/v5/storage/memory"
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

	// storer is the storage for the repository.
	storer *memory.Storage

	// server is the HTTP server for exposing branch information
	server *server.Server

	// branches is a map of branch names to their information.
	branches map[string]BranchInfo
}

type BranchInfo struct {
	LastUpdate         time.Time `json:"last_update"`
	LastUpdatedBy      string    `json:"last_updated_by"`
	LastUpdatedByEmail string    `json:"last_updated_by_email"`
}

// NewRepoWatcher creates and initializes a new RepoWatcher instance.
// It clones the specified repository and sets up the watcher with the provided configuration and logger.
func NewRepoWatcher(ctx context.Context, config *Config, logger *zap.Logger) (*RepoWatcher, error) {
	logger.Info("Cloning repository", zap.String("url", config.RepoURL))
	inMemory := memory.NewStorage()
	fs := memfs.New()
	repo, err := git.CloneContext(ctx, inMemory, fs, &git.CloneOptions{
		URL: config.RepoURL,
		Auth: &http.BasicAuth{
			Username: "token",
			Password: config.AuthToken,
		},
		Depth:  1,
		Mirror: true,
	})

	if err != nil {
		return nil, fmt.Errorf("failed to clone repository: %w", err)
	}

	return &RepoWatcher{
		config:   config,
		logger:   logger,
		repo:     repo,
		storer:   inMemory,
		branches: make(map[string]BranchInfo),
	}, nil
}

// Watch starts the repository watching process.
// It periodically checks for updates and pulls changes from the remote repository.
func (w *RepoWatcher) Watch(ctx context.Context) error {
	ticker := time.NewTicker(w.config.PollInterval)
	defer ticker.Stop()

	if err := w.checkAndPull(ctx); err != nil {
		return fmt.Errorf("failed to check and pull repository: %w", err)
	}

	// Start the HTTP server
	go w.startHTTPServer()

	for {
		select {
		case <-ctx.Done():
			return nil
		case <-ticker.C:
			if err := w.checkAndPull(ctx); err != nil {
				if errors.Is(err, context.Canceled) {
					return nil
				}
				w.logger.Error("Failed to check and pull repository", zap.Error(err))
			}
		}
	}
}

// checkAndPull fetches and pulls the latest changes from the remote repository.
func (w *RepoWatcher) checkAndPull(ctx context.Context) error {
	w.logger.Info("Checking for updates")
	if err := w.getRemoteBranches(); err != nil {
		return fmt.Errorf("failed to get remote branches: %w", err)
	}

	// Fetch the latest changes from the remote repository
	err := w.repo.FetchContext(ctx, &git.FetchOptions{
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
	err = worktree.PullContext(ctx, &git.PullOptions{
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

// getRemoteBranches retrieves information about all remote branches for the repository.
func (w *RepoWatcher) getRemoteBranches() error {
	remote, err := w.repo.Remote("origin")
	if err != nil {
		return fmt.Errorf("failed to get remote: %w", err)
	}

	refs, err := remote.List(&git.ListOptions{
		Auth: &http.BasicAuth{
			Username: "token",
			Password: w.config.AuthToken,
		},
	})
	if err != nil {
		return fmt.Errorf("failed to list remote references: %w", err)
	}

	for _, ref := range refs {
		if ref.Name().IsBranch() {
			commit, err := w.repo.CommitObject(ref.Hash())
			if err != nil {
				w.logger.Warn("Failed to get commit for branch", zap.String("branch", ref.Name().Short()), zap.Error(err))
				continue
			}

			branchName := ref.Name().Short()
			lastUpdate := commit.Author.When
			lastUpdatedBy := commit.Author.Name
			lastUpdatedByEmail := commit.Author.Email

			w.branches[branchName] = BranchInfo{
				LastUpdate:         lastUpdate,
				LastUpdatedBy:      lastUpdatedBy,
				LastUpdatedByEmail: lastUpdatedByEmail,
			}
		}
	}
	return nil
}

// getBranchContents retrieves the contents of a specific branch as a gzipped tar archive.
func (w *RepoWatcher) getBranchContents(branchName string) ([]byte, error) {
	// Get the reference for the specified branch
	branchRef := plumbing.ReferenceName("refs/heads/" + branchName)
	ref, err := w.repo.Reference(branchRef, true)
	if err != nil {
		return nil, fmt.Errorf("failed to get reference for branch %s: %w", branchName, err)
	}

	// Get the commit object for the branch
	commit, err := w.repo.CommitObject(ref.Hash())
	if err != nil {
		return nil, fmt.Errorf("failed to get commit object for branch %s: %w", branchName, err)
	}

	// Get the tree for the commit
	tree, err := commit.Tree()
	if err != nil {
		return nil, fmt.Errorf("failed to get tree for commit: %w", err)
	}

	// Create a buffer to store the gzipped tar archive
	var buffer bytes.Buffer
	gzipWriter := gzip.NewWriter(&buffer)
	tarWriter := tar.NewWriter(gzipWriter)

	// Iterate through the tree and add files to the tar archive
	err = tree.Files().ForEach(func(f *object.File) error {
		contents, err := f.Contents()
		if err != nil {
			return fmt.Errorf("failed to get contents of file %s: %w", f.Name, err)
		}

		header := &tar.Header{
			Name: f.Name,
			Mode: 0644,
			Size: int64(len(contents)),
		}

		if err := tarWriter.WriteHeader(header); err != nil {
			return fmt.Errorf("failed to write tar header for %s: %w", f.Name, err)
		}

		if _, err := tarWriter.Write([]byte(contents)); err != nil {
			return fmt.Errorf("failed to write file contents to tar for %s: %w", f.Name, err)
		}

		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to iterate through files: %w", err)
	}

	if err := tarWriter.Close(); err != nil {
		return nil, fmt.Errorf("failed to close tar writer: %w", err)
	}
	if err := gzipWriter.Close(); err != nil {
		return nil, fmt.Errorf("failed to close gzip writer: %w", err)
	}

	return buffer.Bytes(), nil
}
