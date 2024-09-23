import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from "@/components/ui/toaster"
import { ClerkProvider, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Menu, Package2 } from "lucide-react"
import Link from "next/link"
import "./globals.css"

import { ProjectSelector } from "@/components/project-selector"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ProjectProvider } from '@/contexts/project-context'
import { sitemapItems } from "./sitemap"

export const metadata = {
  title: 'Garvata',
  description: 'MLOps platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
      </head>
      <body className="bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ClerkProvider>
            <SignedIn>
              <AppLayout>{children}</AppLayout>
            </SignedIn>
            <SignedOut>
              {children}
            </SignedOut>
          </ClerkProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProjectProvider>
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
          <div className="flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 mr-2 md:hidden"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <nav className="grid gap-6 text-lg font-medium">
                  <Link
                    href="/"
                    className="flex items-center gap-2 text-lg font-semibold"
                  >
                    <Package2 className="h-6 w-6" />
                    <span>Garvata</span>
                  </Link>
                  {sitemapItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {item.title}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <Link
              href="/"
              className="hidden lg:flex items-center gap-2 text-lg font-semibold md:text-base mr-4"
            >
              <Package2 className="h-6 w-6" />
              <span>Garvata</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-4">
              {sitemapItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <ProjectSelector />
            <ThemeToggle />
            <UserButton />
          </div>
        </header>
        <main className="flex-1 bg-background">
          {children}
        </main>
      </div>
    </ProjectProvider>
  )
}