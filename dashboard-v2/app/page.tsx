import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <SignedIn>
        <div className="hero min-h-screen flex flex-col items-center justify-center ">
          <h1 className="text-4xl font-bold mb-5">Welcome to Garvata</h1>
          <p>You are signed in. Access your dashboard or projects here.</p>
        </div>
      </SignedIn>
      <SignedOut>
        <div className="hero min-h-screen flex flex-col items-center justify-center ">
          <h2 className="text-5xl font-bold mb-4">Welcome to Garvata</h2>
          <p className="text-lg mb-6">Please sign in to access Garvata features.</p>
          <SignInButton mode="modal">
            <Button variant="outline" size="lg">Sign In</Button>
          </SignInButton>
        </div>
      </SignedOut>
    </div>
  )
}
