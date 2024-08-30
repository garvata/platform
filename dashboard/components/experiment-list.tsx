import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from './ui/card';

export interface Experiment {
  id: string;
  name: string;
  description: string;
}

interface ExperimentListProps {
  onSelectExperiment: (experiment: Experiment | null) => void;
  selectedExperiment: Experiment | null;
  experiments: Experiment[];
}

export const ExperimentList: React.FC<ExperimentListProps> = ({ onSelectExperiment, selectedExperiment, experiments }: ExperimentListProps & { experiments: Experiment[] }) => {
  return (
    <div className="overflow-y-auto h-full">
      <ul className="space-y-4">
        {experiments.map((experiment) => (
          <li key={experiment.id}>
            <Card
              className={`cursor-pointer ${selectedExperiment?.id === experiment.id ? 'border-blue-500' : 'hover:border-gray-300'
                }`}
              onClick={() => onSelectExperiment(experiment)}
            >
              <CardHeader>
                <CardTitle className="text-sm">{experiment.name}</CardTitle>
                <CardDescription className="text-xs">{experiment.description}</CardDescription>
              </CardHeader>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExperimentList;