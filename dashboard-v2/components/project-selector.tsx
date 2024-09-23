"use client"

import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Drawer,
    DrawerContent,
    DrawerTrigger,
} from "@/components/ui/drawer"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useProject } from '@/contexts/project-context'
import { useMediaQuery } from "@/hooks/use-media-query"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import * as React from "react"

type Project = {
    value: string;
    label: string;
}

export function ProjectSelector() {
    const [open, setOpen] = React.useState(false)
    const isDesktop = useMediaQuery("(min-width: 768px)")
    const { project, setProject } = useProject()
    const [projects, setProjects] = React.useState<Project[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const { toast } = useToast()

    React.useEffect(() => {
        async function fetchProjects() {
            try {
                setIsLoading(true)
                const response = await fetch('/api/projects')
                if (!response.ok) {
                    throw new Error('Failed to fetch projects')
                }
                const data = await response.json()
                setProjects(data)
            } catch (err) {
                console.error('Error fetching projects:', err)
                toast({
                    title: "Error",
                    description: "Failed to load projects. Please try again later.",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchProjects()
    }, [toast])

    if (isLoading) {
        return <div>Loading projects...</div>
    }

    const selectedProject = project ? projects.find((p) => p.value === project) : null

    const triggerButton = (
        <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
        >
            {selectedProject ? selectedProject.label : "Select project..."}
        </Button>
    )

    if (isDesktop) {
        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    {triggerButton}
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                    <ProjectList setOpen={setOpen} projects={projects} selectedProject={selectedProject} setProject={setProject} />
                </PopoverContent>
            </Popover>
        )
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                {triggerButton}
            </DrawerTrigger>
            <DrawerContent>
                <div className="mt-4 border-t">
                    <ProjectList setOpen={setOpen} projects={projects} selectedProject={selectedProject} setProject={setProject} />
                </div>
            </DrawerContent>
        </Drawer>
    )
}

function ProjectList({
    setOpen,
    projects,
    selectedProject,
    setProject,
}: {
    setOpen: (open: boolean) => void
    projects: Project[]
    selectedProject: Project | null | undefined
    setProject: (value: string | null) => void
}) {
    return (
        <Command>
            <CommandInput placeholder="Search project..." />
            <CommandList>
                <CommandEmpty>No project found.</CommandEmpty>
                <CommandGroup>
                    {projects.map((p) => (
                        <CommandItem
                            key={p.value}
                            value={p.value}
                            onSelect={() => {
                                setProject(p.value === selectedProject?.value ? null : p.value)
                                setOpen(false)
                            }}
                        >
                            <Check
                                className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedProject?.value === p.value ? "opacity-100" : "opacity-0"
                                )}
                            />
                            {p.label}
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </Command>
    )
}