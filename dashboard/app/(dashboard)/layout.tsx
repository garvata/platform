"use client"

import { LeftNavBar } from "@/components/left-nav"
import TopBar from "@/components/top-bar"
import { Project } from "@/lib/models"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"

import { fetcher } from "@/lib/utils"
import useSWR from 'swr'

const useCheckMobileScreen = () => {
    const [width, setWidth] = useState<number | null>(null);
    const handleWindowSizeChange = () => {
        if (typeof window !== 'undefined') {
            setWidth(window.innerWidth);
        }
    }

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setWidth(window.innerWidth);
            window.addEventListener('resize', handleWindowSizeChange);
            return () => {
                window.removeEventListener('resize', handleWindowSizeChange);
            }
        }
    }, []);

    return width !== null ? width <= 768 : false;
}

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
    const isMobile = useCheckMobileScreen()
    return (
        <div className="flex flex-row w-full">
            {!isMobile &&
                <div className={`hidden border-r bg-muted/40 md:flex md:flex-col`}>
                    <LeftNavBar setSelectedProject={setSelectedProject} isCollapsed={isNavCollapsed} />
                </div>
            }
            <div className="flex flex-col flex-grow">
                <TopBar
                    selectedProject={selectedProject}
                    setSelectedProject={setSelectedProject}
                    projects={projects}
                    isCollapsed={isNavCollapsed}
                    setIsCollapsed={setIsNavCollapsed}
                    isMobile={isMobile}
                />
                <div className="flex-grow">
                    {children}
                </div>
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

