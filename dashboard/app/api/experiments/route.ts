import { NextResponse } from "next/server";
import { Experiment } from "@/lib/models";

const data: Record<string, Experiment[]> = {
  1: [
    {
      id: "1",
      name: "Experiment 1",
      description: "Description 1",
    },
  ],
  2: [
    {
      id: "2",
      name: "Experiment 2",
      description: "Description 2",
    },
  ],
  3: [
    {
      id: "3",
      name: "Experiment 3",
      description: "Description 3",
    },
  ],
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (id) {
    return NextResponse.json(data[id]);
  }
  return NextResponse.json([]);
}
