import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default function SettingsPage() {
  const { userId } = auth()
  if (!userId) {
    return redirect('/')
  }
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-5">Settings</h1>
    </div>
  )
}