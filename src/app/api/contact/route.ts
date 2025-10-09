import { supabaseServer } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

interface ContactPayload {
  full_name: string;
  work_email: string;
  company?: string;
  project_budget?: string;
  project_goals: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as ContactPayload;
  const supabase = supabaseServer();

  const { error } = await supabase.from("contacts").insert([body]);

  if (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
