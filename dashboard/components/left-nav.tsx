import Link from "next/link"
import { Package2, FlaskConical, Brain, Database, Rocket } from "lucide-react"
import { Project } from "@/lib/models"

type LeftNavBarProps = {
    setSelectedProject: (project: Project | null) => void
}

export default function LeftNavBar({ setSelectedProject }: LeftNavBarProps) {
    return (
        <>
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link
                    href="/"
                    className="flex items-center gap-2 font-semibold"
                    onClick={() => {
                        setSelectedProject(null);
                        window.location.href = '/';
                    }}
                >
                    <Package2 className="h-6 w-6" />
                    <span className="">Garvata</span>
                </Link>
            </div>
            <div className="flex-1">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                    <Link
                        href="/experiments"
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
        </>
    )
}