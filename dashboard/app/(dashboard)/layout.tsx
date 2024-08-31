"use client"

import LeftNavBar from "@/components/left-nav"
import TopBar from "@/components/top-bar"
import UpgradeCard from "@/components/upgrade-card"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Project } from "@/lib/models"

import useSWR from 'swr'
import { fetcher } from "@/lib/utils"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)
    const router = useRouter()
    const { data: projects = [] } = useSWR<Project[]>('/api/projects', fetcher)

    const searchParams = useSearchParams()
    useEffect(() => {
        if (selectedProject) {
            router.push(`?project=${selectedProject.id}`, { scroll: false })
        } else if (searchParams.get('project') != null) {
            router.push(`?project=`, { scroll: false })
        }
    }, [router, selectedProject, searchParams])

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-muted/40 md:block">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <LeftNavBar setSelectedProject={setSelectedProject} />
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

