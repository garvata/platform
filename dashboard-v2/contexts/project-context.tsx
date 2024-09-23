"use client"

import React, { createContext, useState, useContext, ReactNode } from 'react'

type ProjectContextType = {
    project: string | null
    setProject: (project: string | null) => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
    const [project, setProject] = useState<string | null>(null)

    return (
        <ProjectContext.Provider value={{ project, setProject }}>
            {children}
        </ProjectContext.Provider>
    )
}

export function useProject() {
    const context = useContext(ProjectContext)
    if (context === undefined) {
        throw new Error('useProject must be used within a ProjectProvider')
    }
    return context
}