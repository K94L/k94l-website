import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { portfolioInputSchema, type PortfolioInput } from "@/lib/validation";
import { getServiceSupabaseClient } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";


const toDbPayload = (input: PortfolioInput) => ({
  name: input.name,
  industry: input.industry ?? null,
  tag: input.tag ?? "Invested",
  website: input.website ?? null,
  year: input.year ?? null,
});
async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return null;
  }
  return session;
}

export async function GET() {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceSupabaseClient();
  const { data, error } = await supabase
    .from("portfolio_companies")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = portfolioInputSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = getServiceSupabaseClient();
  const payload = toDbPayload(parsed.data);
  const { data, error } = await supabase
    .from("portfolio_companies")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/");
  return NextResponse.json({ data }, { status: 201 });
}
