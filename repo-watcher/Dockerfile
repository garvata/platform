# Build stage
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o repo-watcher .

# Final stage
FROM golang:1.23-alpine

# Copy the binary from the builder stage
COPY --from=builder /app/repo-watcher /repo-watcher

ENV REPO_URL=""
ENV AUTH_TOKEN=""
ENV POLL_INTERVAL="30s"
ENV HOST=""
ENV PORT="8080"
# Expose the port specified by the PORT environment variable
EXPOSE $PORT

# Run the binary
CMD ["/bin/sh", "-c", "/repo-watcher --repo-url=$REPO_URL --auth-token=$AUTH_TOKEN --poll-interval=$POLL_INTERVAL --host=$HOST --port=$PORT"]
