package main

import (
	"fmt"
	"os"

	"gopkg.in/yaml.v3"
)

type ModelType string

const (
	ModelTypeXGBoost     ModelType = "xgboost"
	ModelTypeScikitLearn ModelType = "scikit-learn"
	ModelTypeTensorFlow  ModelType = "tensorflow"
	ModelTypePyTorch     ModelType = "pytorch"
	ModelTypeLLM         ModelType = "llm"
	ModelTypeCustom      ModelType = "custom"
)

type ModelRegistryType string

const (
	ModelRegistryTypeGarvata     ModelRegistryType = "garvata"
	ModelRegistryTypeHuggingFace ModelRegistryType = "huggingface"
)

type ModelRegistry struct {
	Type   ModelRegistryType `yaml:"type" json:"type"`
	ApiKey string            `yaml:"api_key" json:"api_key"`
}

type Model struct {
	Type      ModelType `yaml:"type" json:"type"`
	Name      string    `yaml:"name" json:"name"`
	Namespace string    `yaml:"namespace" json:"namespace"`
}

type Database struct {
	Type             string `yaml:"type" json:"type"`
	ConnectionString string `yaml:"connection_string" json:"connection_string"`
}

type Specs struct {
	Memory string `yaml:"memory" json:"memory"`
	Cpu    string `yaml:"cpu" json:"cpu"`
	Gpu    string `yaml:"gpu" json:"gpu"`
}

type InputParam struct {
	Name string `yaml:"name" json:"name"`
	Type string `yaml:"type" json:"type"`
}

type ModelTrain struct {
	Entrypoint       string       `yaml:"entrypoint" json:"entrypoint"`
	BaseImage        string       `yaml:"base_image" json:"base_image"`
	Requirements     []string     `yaml:"requirements" json:"requirements"`
	RequirementsFile string       `yaml:"requirements_file" json:"requirements_file"`
	Specs            Specs        `yaml:"specs" json:"specs"`
	TrainParams      []InputParam `yaml:"train_params" json:"train_params"`
}

type ModelScore struct {
	ScoreEntryPoint string       `yaml:"score_entry_point" json:"score_entry_point"`
	BaseImage       string       `yaml:"base_image" json:"base_image"`
	Specs           Specs        `yaml:"specs" json:"specs"`
	ScoreParams     []InputParam `yaml:"score_params" json:"score_params"`
}

type RunnerConfig struct {
	Enabled  bool          `yaml:"enabled" json:"enabled"`
	Registry ModelRegistry `yaml:"registry" json:"registry"`
	Model    Model         `yaml:"model" json:"model"`
	Database Database      `yaml:"database" json:"database"`
	Train    ModelTrain    `yaml:"train" json:"train"`
	Score    ModelScore    `yaml:"score" json:"score"`
}

func ParseRunnerConfig(data []byte, repoName, branchName string) (*RunnerConfig, error) {
	var config RunnerConfig
	err := yaml.Unmarshal(data, &config)
	if err != nil {
		return nil, err
	}

	switch config.Registry.Type {
	case ModelRegistryTypeGarvata, ModelRegistryTypeHuggingFace:
		if config.Registry.ApiKey == "" {
			return nil, fmt.Errorf("API key is not set for registry type: %s", config.Registry.Type)
		}
	default:
		return nil, fmt.Errorf("invalid registry type: %s", config.Registry.Type)
	}

	switch config.Model.Type {
	case ModelTypeXGBoost, ModelTypeScikitLearn, ModelTypeTensorFlow, ModelTypePyTorch, ModelTypeLLM, ModelTypeCustom:
		// Valid model types, do nothing
	default:
		return nil, fmt.Errorf("invalid model type: %s", config.Model.Type)
	}

	if config.Train.Entrypoint == "" {
		return nil, fmt.Errorf("entrypoint is not set")
	}

	if config.Train.BaseImage == "" {
		return nil, fmt.Errorf("base image is not set")
	}

	if config.Score.ScoreEntryPoint == "" {
		return nil, fmt.Errorf("score entrypoint is not set")
	}

	if config.Score.BaseImage == "" {
		config.Score.BaseImage = config.Train.BaseImage
	}

	if config.Model.Name == "" {
		config.Model.Name = repoName
	}

	if config.Model.Namespace == "" {
		config.Model.Namespace = branchName
	}

	return &config, nil
}

func ParseRunnerConfigFromFile(filename string, repoName, branchName string) (*RunnerConfig, error) {
	data, err := os.ReadFile(filename)
	if err != nil {
		return nil, err
	}
	return ParseRunnerConfig(data, repoName, branchName)
}
