'use server'

export async function GET(req: Request) {
    return Response.json([
        "Project 1",
        "Project 2",
        "Project 3",
    ])
}