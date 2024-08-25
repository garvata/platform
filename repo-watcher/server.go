package main

import (
	"encoding/json"
	"fmt"
	server "net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"go.uber.org/zap"
)

// startHTTPServer initializes and starts an HTTP server for the RepoWatcher.
// It sets up a route for handling branch information requests and listens on port 8080.
//
// The server provides the following endpoint:
// - GET /branches: Returns information about all remote branches
// - GET /branches/{name}: Returns the information about a specific branch
// - GET /branches/{name}/contents: Returns the contents of a specific branch as a gzipped tar archive
func (w *RepoWatcher) startHTTPServer() {
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(30 * time.Second))

	// Use zap logger middleware
	r.Use(func(next server.Handler) server.Handler {
		return server.HandlerFunc(func(_w server.ResponseWriter, r *server.Request) {
			ww := middleware.NewWrapResponseWriter(_w, r.ProtoMajor)
			start := time.Now()
			defer func() {
				w.logger.Info("Request completed",
					zap.String("method", r.Method),
					zap.String("path", r.URL.Path),
					zap.Duration("duration", time.Since(start)),
					zap.Int("status", ww.Status()),
					zap.Int("size", ww.BytesWritten()),
				)
			}()
			next.ServeHTTP(ww, r)
		})
	})

	r.Get("/branches", w.handleBranches)
	r.Get("/branches/{name}", w.handleBranch)
	r.Get("/branches/{name}/contents", w.handleBranchContents)

	w.server = &server.Server{
		Addr:    fmt.Sprintf("%s:%d", w.config.Host, w.config.Port),
		Handler: r,
	}

	w.logger.Info("Starting HTTP server", zap.String("host", w.config.Host), zap.Int("port", w.config.Port))
	if err := w.server.ListenAndServe(); err != nil && err != server.ErrServerClosed {
		w.logger.Error("HTTP server error", zap.Error(err))
	}
}

// handleBranches is an HTTP handler function that responds with information about all remote branches.
// It retrieves the branch information using the getRemoteBranches method and returns it as JSON.
func (w *RepoWatcher) handleBranches(rw server.ResponseWriter, r *server.Request) {
	rw.Header().Set("Content-Type", "application/json")
	json.NewEncoder(rw).Encode(w.branches)
}

// handleBranch is an HTTP handler function that responds with information about a specific branch.
// It retrieves the branch information from the branches map and returns it as JSON.
func (w *RepoWatcher) handleBranch(rw server.ResponseWriter, r *server.Request) {
	branchName := r.PathValue("name")
	branch, ok := w.branches[branchName]
	if !ok {
		server.Error(rw, "Branch not found", server.StatusNotFound)
		return
	}
	rw.Header().Set("Content-Type", "application/json")
	json.NewEncoder(rw).Encode(branch)
}

func (w *RepoWatcher) handleBranchContents(rw server.ResponseWriter, r *server.Request) {
	branchName := r.PathValue("name")
	contents, err := w.getBranchContents(branchName)
	if err != nil {
		w.logger.Error("Failed to get branch contents", zap.String("branch", branchName), zap.Error(err))
		server.Error(rw, "Internal server error", server.StatusInternalServerError)
		return
	}

	rw.Header().Set("Content-Type", "application/gzip")
	rw.Header().Set("Content-Encoding", "gzip")
	rw.Write(contents)
}
