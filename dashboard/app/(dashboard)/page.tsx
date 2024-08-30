"use client"

import { useState } from "react"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import { Experiment, ExperimentList } from "@/components/experiment-list"
import ExperimentConfig from "@/components/experiment-config"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
    const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null)
    const [isTraining, setIsTraining] = useState<boolean>(false)
    const [trainError, setTrainError] = useState<Error | null>(null)

    const handleTrainModel = async () => {
        if (selectedExperiment == null) return
        setIsTraining(true)
        setTrainError(null)
        try {
            const response = await fetch('/api/train-model', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ experimentId: selectedExperiment.id }),
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Failed to train model')
            // Handle successful response
            console.log(data.message)
            // You might want to update the experiment status here
        } catch (error) {
            console.error('Error training model:', error)
            setTrainError(error as Error)
        } finally {
            setIsTraining(false)
        }
    }

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            <PanelGroup direction="horizontal">
                <Panel defaultSize={20} minSize={20}>
                    <ExperimentList
                        onSelectExperiment={setSelectedExperiment}
                        selectedExperiment={selectedExperiment}
                        experiments={[
                            { id: '1', name: 'Experiment 1', description: 'Description 1' },
                            { id: '2', name: 'Experiment 2', description: 'Description 2' },
                            { id: '3', name: 'Experiment 3', description: 'Description 3' },
                        ]}
                    />
                </Panel>
                <PanelResizeHandle className="w-1 mx-2 bg-gray-400 transition-colors" />
                <Panel minSize={50} defaultSize={80}>
                    <div className="flex flex-col h-full">
                        <Button
                            onClick={handleTrainModel}
                            className="bg-blue-500 text-white px-4 py-2 rounded mb-4 disabled:bg-gray-400"
                            disabled={!selectedExperiment || isTraining}
                        >
                            {isTraining ? 'Training...' : 'Train Model'}
                        </Button>
                        {trainError && (
                            <p className="text-red-500 mb-4">{trainError.message}</p>
                        )}
                        <ExperimentConfig experiment={selectedExperiment} />
                    </div>
                </Panel>
            </PanelGroup>
        </main>
    )
}