"use server";

import { NextResponse } from "next/server";

export async function GET(req: Request) {
  return NextResponse.json([
    {
      id: "1",
      name: "Project 1",
      description: "Description 1",
    },
    {
      id: "2",
      name: "Project 2",
      description: "Description 2",
    },
    {
      id: "3",
      name: "Project 3",
      description: "Description 3",
    },
  ]);
}
