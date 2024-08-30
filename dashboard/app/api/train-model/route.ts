import { NextResponse } from 'next/server'
import { z } from 'zod'

const TrainModelSchema = z.object({
  experimentId: z.string().uuid(),
})


export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { experimentId } = TrainModelSchema.parse(body)
        
        // Here you would typically:
        // 1. Start the model training process (this could be a long-running task)
        // 2. Update the experiment status in your database
        
        return NextResponse.json({ message: 'Model training started' }, { status: 200 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
        }
        console.error('Error in train-model API:', error)
        return NextResponse.json({ error: 'Failed to start model training' }, { status: 500 })
    }
}