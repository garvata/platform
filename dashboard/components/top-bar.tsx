import { addProject } from "@/app/(dashboard)/actions"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Bell, ChevronDown, CircleUser, FolderOpenDot, Plus } from "lucide-react"
import { useRouter } from 'next/navigation'
import { useEffect } from "react"
import { useFormState } from "react-dom"

interface TopBarProps {
    selectedProject: string | null;
    setSelectedProject: (project: string) => void;
    projects: string[];
}


export default function TopBar({ selectedProject, setSelectedProject, projects }: TopBarProps) {
    const [formState, formAction] = useFormState(addProject, { message: '', isError: false })
    const { toast } = useToast()
    const router = useRouter();

    useEffect(() => {
        if (formState.message) {
            toast({
                variant: formState.isError ? 'destructive' : 'default',
                title: formState.isError ? 'Error' : 'Success',
                description: formState.message,
            })
            if (!formState.isError) {
                router.refresh();
            }
        }
    }, [formState, toast, router])

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

            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="ghost">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Project
                    </Button>
                </DialogTrigger>
                <DialogContent >
                    <DialogHeader >
                        <DialogTitle>Add New Project</DialogTitle>
                        <DialogDescription>
                            Enter the details for your new project.
                        </DialogDescription>
                    </DialogHeader>
                    <form action={formAction}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="gitUrl" className="text-right">
                                    Git URL
                                </Label>
                                <Input id="gitUrl" name="gitUrl" type="url" className="col-span-3" placeholder="https://github.com/username/repository.git" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="authKey" className="text-right">
                                    Auth Key
                                </Label>
                                <Input id="authKey" name="authKey" className="col-span-3" required />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Add Project</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
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