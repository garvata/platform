"use client"

import LeftNavBar from "@/components/left-nav"
import TopBar from "@/components/top-bar"
import UpgradeCard from "@/components/upgrade-card"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { Project } from "@/lib/models"

import useSWR from 'swr'
import { fetcher } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react" // Import icons


function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)
    const [isNavCollapsed, setIsNavCollapsed] = useState(false) // New state for nav collapse
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
        <div className={`grid min-h-screen w-full ${isNavCollapsed ? 'md:grid-cols-[60px_1fr]' : 'md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]'}`}>
            <div className={`hidden border-r bg-muted/40 md:flex md:flex-col ${isNavCollapsed ? 'items-center' : ''}`}>
                <div className="flex h-full max-h-screen flex-col gap-2 w-full">
                    <LeftNavBar setSelectedProject={setSelectedProject} isCollapsed={isNavCollapsed} />
                    {!isNavCollapsed && (
                        <div className="mt-auto p-4">
                            <UpgradeCard />
                        </div>
                    )}
                    <button
                        onClick={() => setIsNavCollapsed(!isNavCollapsed)}
                        className="p-2 mt-auto mb-4 mx-auto hover:bg-muted/60 rounded-full"
                    >
                        {isNavCollapsed ? <ChevronRight size={16} /> : <div className="flex items-right gap-2"><ChevronLeft size={16} /> <span className="text-sm font-medium">Collapse</span></div>}
                    </button>
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

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <Suspense>
            <Layout>
                {children}
            </Layout>
        </Suspense>
    )
}

