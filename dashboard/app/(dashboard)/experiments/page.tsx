"use client"

import ExperimentConfig from "@/components/experiment-config"
import { ExperimentList } from "@/components/experiment-list"
import { SkeletonCard } from "@/components/skeleton-card"
import { Button } from "@/components/ui/button"
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import { useToast } from "@/hooks/use-toast"
import { Experiment } from "@/lib/models"
import { fetcher } from "@/lib/utils"
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from "react"
import useSWR, { useSWRConfig } from 'swr'
import useSWRMutation from 'swr/mutation'

async function scheduleExperiment(url: string, { arg }: { arg: { experimentId: string } }) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(arg),
    })
    if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to schedule experiment')
    }
    return response.json()
}

export default function ExperimentsPage() {
    const searchParams = useSearchParams()
    const projectId = searchParams.get('project')
    const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null)

    useEffect(() => { setSelectedExperiment(null) }, [projectId])

    const { data: experiments = [], error, isLoading } = useSWR<Experiment[]>(
        projectId ? `/api/experiments?id=${projectId}` : null,
        fetcher
    )
    const { trigger: scheduleExperimentTrigger, isMutating } = useSWRMutation('/api/schedule-experiment', scheduleExperiment)
    const { toast } = useToast()

    const handleTrainModel = async () => {
        if (selectedExperiment == null) return
        try {
            await scheduleExperimentTrigger({ experimentId: selectedExperiment.id })
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
        <main className="flex flex-1 flex-col">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={20} minSize={20} className="p-2">
                    {isLoading ? (
                        <SkeletonCard />
                    ) : error ? (
                        <div className="text-red-500 p-4">
                            Error loading experiments: {error.message}
                        </div>
                    ) : (
                        <ExperimentList
                            onSelectExperiment={setSelectedExperiment}
                            selectedExperiment={selectedExperiment}
                            experiments={experiments}
                        />
                    )}
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={80} minSize={60} className="p-2">
                    <div className="flex flex-col h-full">
                        <div className="flex flex-row justify-between items-start w-full">
                            <Button
                                variant={"default"}
                                onClick={handleTrainModel}
                                disabled={!selectedExperiment || isMutating || isLoading}
                            >
                                {isMutating ? 'Scheduling...' : 'Train Model'}
                            </Button>
                        </div>
                        <div className="m-2 flex-grow">
                            <ExperimentConfig experiment={selectedExperiment} />
                        </div>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </main>
    )
}