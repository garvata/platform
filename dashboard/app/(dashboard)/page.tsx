"use client"

import { useState } from "react"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import { Experiment, ExperimentList } from "@/components/experiment-list"
import ExperimentConfig from "@/components/experiment-config"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function DashboardPage() {
    const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null)
    const { toast } = useToast()
    const handleTrainModel = async () => {
        if (selectedExperiment == null) return
        try {
            const response = await fetch('/api/schedule-experiment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ experimentId: selectedExperiment.id }),
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Failed to schedule experiment')
            toast({
                title: 'Experiment scheduled',
                description: 'The experiment has been scheduled successfully',
            })
        } catch (error) {
            console.error('Error scheduling experiment:', error)
            toast({
                title: 'Error scheduling experiment',
                description: 'An error occurred while scheduling the experiment',
            })
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
                        <div className="flex flex-row justify-between items-start w-full">
                            <Button
                                variant={"default"}
                                onClick={handleTrainModel}
                                disabled={!selectedExperiment}
                            >
                                Train Model
                            </Button>
                        </div>
                        <div className="m-2 flex-grow">
                            <ExperimentConfig experiment={selectedExperiment} />
                        </div>
                    </div>
                </Panel>
            </PanelGroup>
        </main>
    )
}