import { supabaseServer } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

interface ContactPayload {
  full_name: string;
  work_email: string;
  phone_number?: string;
  company?: string;
  project_budget?: string;
  project_goals?: string;
  source?: string;
  order_status?: "pending" | "complete" | "error";
}

export async function POST(request: Request) {
  const body = (await request.json()) as ContactPayload;
  const supabase = supabaseServer();

  if (!body.full_name || !body.work_email) {
    return NextResponse.json(
      { success: false, message: "Missing required form fields." },
      { status: 400 }
    );
  }

  const insertPayload = {
    full_name: body.full_name,
    work_email: body.work_email,
    phone_number: body.phone_number ?? null,
    company: body.company ?? null,
    project_budget: body.project_budget ?? null,
    project_goals: body.project_goals ?? null,
    source: body.source ?? null,
    order_status: body.order_status ?? null,
  };

  const { data, error } = await supabase
    .from("contacts")
    .insert([insertPayload])
    .select("id")
    .single();

  if (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, recordId: data?.id ?? null });
}
