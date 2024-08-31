"use client"

import LeftNavBar from "@/components/left-nav"
import TopBar from "@/components/top-bar"
import UpgradeCard from "@/components/upgrade-card"
import { useEffect, useState } from "react"


export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [selectedProject, setSelectedProject] = useState<string | null>(null)
    const [projects, setProjects] = useState<string[]>([])

    useEffect(() => {
        const fetchProjects = async () => {
            const response = await fetch('/api/get-projects')
            const data = await response.json()
            setProjects(data)
        }
        fetchProjects()
    }, [])

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-muted/40 md:block">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <LeftNavBar />
                    <div className="mt-auto p-4">
                        <UpgradeCard />
                    </div>
                </div>
            </div>
            <div className="flex flex-col">
                <TopBar
                    selectedProject={selectedProject}
                    setSelectedProject={setSelectedProject}
                    projects={projects}
                />
                {children}
            </div>
        </div>
    )
}

