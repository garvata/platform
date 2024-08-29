"use client"

import {
    Bell,
    Brain,
    ChevronDown,
    CircleUser,
    Database,
    FlaskConical,
    FolderOpenDot,
    Package2,
    Plus,
    Rocket
} from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
    const [selectedProject, setSelectedProject] = useState<string | null>(null)
    const [selectedExperiment, setSelectedExperiment] = useState<string | null>(null)

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-muted/40 md:block">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                        <Link href="/" className="flex items-center gap-2 font-semibold">
                            <Package2 className="h-6 w-6" />
                            <span className="">Garvata</span>
                        </Link>
                    </div>
                    <div className="flex-1">
                        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                            <Link
                                href="#"
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                            >
                                <FlaskConical className="h-4 w-4" />
                                Experiments
                            </Link>
                            <Link
                                href="#"
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                            >
                                <Brain className="h-4 w-4" />
                                Models
                            </Link>
                            <Link
                                href="#"
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                            >
                                <Database className="h-4 w-4" />
                                Registry
                            </Link>
                            <Link
                                href="#"
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                            >
                                <Rocket className="h-4 w-4" />
                                Deployments
                            </Link>
                        </nav>
                    </div>
                    <div className="mt-auto p-4">
                        <Card>
                            <CardHeader className="p-2 pt-0 md:p-4">
                                <CardTitle>Upgrade to Pro</CardTitle>
                                <CardDescription>
                                    Unlock all features and get unlimited access to our support
                                    team.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                                <Button size="sm" className="w-full">
                                    Upgrade
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            <div className="flex flex-col">
                <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
                    <DropdownMenu>
                        <DropdownMenuTrigger >
                            <Button variant="ghost" className="w-full justify-between">
                                <div className="flex items-center gap-3">
                                    <FolderOpenDot className="h-4 w-4" />
                                    Select Project
                                </div>
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                            <DropdownMenuItem onClick={() => setSelectedProject("Project A")}>Project A</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSelectedProject("Project B")}>Project B</DropdownMenuItem>
                            <DropdownMenuSeparator />
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button variant="ghost" >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Project
                    </Button>
                    <div className="ml-auto">
                        <Button variant="outline" size="icon" className="mr-2 h-8 w-8">
                            <Bell className="h-4 w-4" />
                            <span className="sr-only">Toggle notifications</span>
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="icon" className="rounded-full">
                                    <CircleUser className="h-5 w-5" />
                                    <span className="sr-only">Toggle user menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Settings</DropdownMenuItem>
                                <DropdownMenuItem>Support</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Logout</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                    {selectedProject ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="border rounded-lg p-4">
                                <h2 className="text-lg font-semibold mb-4">Experiments for {selectedProject}</h2>
                                <ul className="space-y-2">
                                    <li>
                                        <Button variant="ghost" onClick={() => setSelectedExperiment("Experiment 1")}>
                                            Experiment 1
                                        </Button>
                                    </li>
                                    <li>
                                        <Button variant="ghost" onClick={() => setSelectedExperiment("Experiment 2")}>
                                            Experiment 2
                                        </Button>
                                    </li>
                                    <li>
                                        <Button variant="ghost" onClick={() => setSelectedExperiment("Experiment 3")}>
                                            Experiment 3
                                        </Button>
                                    </li>
                                </ul>
                            </div>
                            <div className="border rounded-lg p-4">
                                <h2 className="text-lg font-semibold mb-4">Experiment Config</h2>
                                {selectedExperiment ? (
                                    <pre className="bg-muted p-2 rounded">
                                        {JSON.stringify({ name: selectedExperiment, config: "Sample config" }, null, 2)}
                                    </pre>
                                ) : (
                                    <p>Select an experiment to view its configuration.</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
                            <div className="flex flex-col items-center gap-1 text-center">
                                <h3 className="text-2xl font-bold tracking-tight">
                                    Select a project to view experiments
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Choose a project from the top bar dropdown to view experiments.
                                </p>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}