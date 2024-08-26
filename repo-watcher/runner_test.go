package main

import (
	"fmt"
	"strings"
	"testing"
)

func TestParseConfig(t *testing.T) {
	config := `
enabled: true
registry:
  type: huggingface
  api_key: 1234567890
model:
  name: test
  namespace: test
  type: xgboost
train:
  entrypoint: train.py
  base_image: python:3.10
  requirements:
    - numpy
    - pandas
  specs:
    cpu: 1
    memory: 1GB
score:
  score_entry_point: score.py
  base_image: python:3.10
  specs:
    cpu: 1
    memory: 1GB
database:
  type: postgres
  connection_string: postgres://postgres:postgres@localhost:5432/postgres
`
	configBytes := []byte(strings.TrimSpace(config))
	parsedConfig, err := ParseRunnerConfig(configBytes, "test", "main")
	if err != nil {
		t.Fatalf("Failed to parse config: %v", err)
	}
	fmt.Printf("%+v\n", parsedConfig)
}
