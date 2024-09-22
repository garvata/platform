import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Menu } from "lucide-react"
import Link from "next/link"
import { navLinks } from "./nav-links"

export function PopoverLinks() {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Menu className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
                <nav className="flex flex-col space-y-1">
                    {navLinks.map(({ href, icon: Icon, text }) => (
                        <Link
                            key={text}
                            href={href}
                            className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-secondary"
                        >
                            <Icon className="h-4 w-4" />
                            <span>{text}</span>
                        </Link>
                    ))}
                </nav>
            </PopoverContent>
        </Popover>
    )
}