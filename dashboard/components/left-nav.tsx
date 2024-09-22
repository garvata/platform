import { Button } from "@/components/ui/button"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Project } from "@/lib/models"
import Link from "next/link"
import { navLinks } from "./nav-links"

type LeftNavBarProps = {
    setSelectedProject: (project: Project | null) => void
    isCollapsed: boolean
}

export function LeftNavBar({ setSelectedProject, isCollapsed }: LeftNavBarProps) {
    return (
        <div className={`flex flex-col h-full max-h-screen gap-2 transition-all duration-300 ease-in-out`}>
            <div className="flex flex-row h-14 items-center justify-center border-b px-2">
                <Link
                    href="/"
                    onClick={() => {
                        setSelectedProject(null);
                        window.location.href = '/';
                    }}
                    className="transition-all duration-300 ease-in-out"
                >
                    {!isCollapsed && <span className="font-bold">Garvata</span>}
                </Link>

            </div>
            <div className="flex-1">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-2">
                    {navLinks.map(({ href, icon: Icon, text }) => (
                        isCollapsed ? (
                            <HoverCard key={text} openDelay={100} closeDelay={0}>
                                <HoverCardTrigger asChild>
                                    <Link
                                        key={text}
                                        href={href}
                                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                                        title={text}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </Link>
                                </HoverCardTrigger>
                                <HoverCardContent side="right" className="w-auto p-2">
                                    <span className="text-xs">{text}</span>
                                </HoverCardContent>
                            </HoverCard>
                        ) : (
                            <Link
                                key={text}
                                href={href}
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                                title={text}
                            >
                                <Icon className="h-4 w-4" />
                                <span className="transition-opacity duration-300 ease-in-out">{text}</span>
                            </Link>
                        )
                    ))}
                </nav>
            </div>
        </div>
    )
}
