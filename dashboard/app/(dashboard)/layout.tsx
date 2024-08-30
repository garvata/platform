"use client"

import { useState } from "react"
import LeftNavBar from "@/components/left-nav"
import UpgradeCard from "@/components/upgrade-card"
import TopBar from "@/components/top-bar"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [selectedProject, setSelectedProject] = useState<string | null>(null)

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
                    projects={["Project 1", "Project 2", "Project 3"]}
                />
                {children}
            </div>
        </div>
    )
}

