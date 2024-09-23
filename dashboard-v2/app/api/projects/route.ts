import { NextResponse } from 'next/server';

export async function GET() {
  // In a real application, you would fetch this data from a database
  const projects = [
    { value: "project1", label: "Project 1" },
    { value: "project2", label: "Project 2" },
    { value: "project3", label: "Project 3" },
  ];

  return NextResponse.json(projects);
}