import React from 'react';
import { Experiment } from './experiment-list';

interface ExperimentConfigProps {
  experiment: Experiment | null;
}

const ExperimentConfig: React.FC<ExperimentConfigProps> = ({ experiment }) => {
  if (!experiment) {
    return <div className="text-gray-500">Select an experiment to view its configuration.</div>;
  }

  return (
    <div>
      <div className="space-y-2">
        <p><strong>ID:</strong> {experiment.id}</p>
        <p><strong>Name:</strong> {experiment.name}</p>
        {/* Add more configuration details here */}
      </div>
    </div>
  );
};

export default ExperimentConfig;