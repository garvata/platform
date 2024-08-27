import MainNav from "@/components/main-nav";
import TeamSwitcher from "@/components/team-switcher";
import { ModeToggle } from "@/components/ui/dark-mode-toggle";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <div className="hidden md:flex">
                <TeamSwitcher />
                <MainNav />
                <ModeToggle />
            </div>
            <main className="flex-1">{children}</main>
        </>
    );
}
