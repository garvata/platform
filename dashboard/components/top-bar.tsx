import { Bell, ChevronDown, CircleUser, FolderOpenDot, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TopBarProps {
    selectedProject: string | null;
    setSelectedProject: (project: string) => void;
    projects: string[];
}

export default function TopBar({ selectedProject, setSelectedProject, projects }: TopBarProps) {
    return (
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className=" justify-between">
                        <div className="flex items-center gap-3">
                            <FolderOpenDot className="h-4 w-4" />
                            {selectedProject || "Select Project"}
                        </div>
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {
                        projects.map((project) => (
                            <DropdownMenuItem key={project} onClick={() => setSelectedProject(project)}>
                                {project}
                            </DropdownMenuItem>
                        ))
                    }
                </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost">
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
    )
}