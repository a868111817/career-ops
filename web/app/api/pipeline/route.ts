import { createSupabaseAdminClient } from "@/lib/supabase";

export async function GET() {
  const db = createSupabaseAdminClient();
  const { data, error } = await db
    .from("pipeline_items")
    .select("*")
    .order("added_at", { ascending: false })
    .limit(50);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.url || typeof body.url !== "string") {
    return Response.json({ error: "url is required" }, { status: 400 });
  }

  const db = createSupabaseAdminClient();
  const { data, error } = await db
    .from("pipeline_items")
    .insert({
      url: body.url,
      company: body.company ?? null,
      role: body.role ?? null,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data, { status: 201 });
}
