"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import useSWR from "swr";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { portfolioInputSchema, type PortfolioInput } from "@/lib/validation";
import type { PortfolioCompany } from "@/types/portfolio";
import { normaliseStatus } from "@/lib/portfolio";

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  const json = await res.json();
  return json.data as PortfolioCompany[];
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const { data, error, isLoading, mutate } = useSWR<PortfolioCompany[]>(
    session ? "/api/portfolio" : null,
    fetcher,
  );

  const [editingId, setEditingId] = useState<number | null>(null);
  const form = useForm<PortfolioInput>({
    resolver: zodResolver(portfolioInputSchema),
    defaultValues: {
      name: "",
      industry: "",
      tag: "Invested",
      website: "",
      year: "",
    },
  });

  const resetForm = () => {
    form.reset({
      name: "",
      industry: "",
      tag: "Invested",
      website: "",
      year: "",
    });
    setEditingId(null);
  };

  const sortedData = useMemo(() => {
    if (!data) return [] as PortfolioCompany[];
    return [...data].sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload = {
      ...values,
      tag: values.tag || null,
      website: values.website || null,
      industry: values.industry || null,
      year: values.year || null,
    };

    const url = editingId ? `/api/portfolio/${editingId}` : "/api/portfolio";
    const method = editingId ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      const message = json.error?.message || json.error || "Something went wrong";
      alert(message);
      return;
    }

    await mutate();
    resetForm();
  });

  const handleEdit = (company: PortfolioCompany) => {
    setEditingId(company.id);
    form.setValue("name", company.name ?? "");
    form.setValue("industry", company.industry ?? "");
    form.setValue("tag", company.tag ?? "");
    form.setValue("website", company.website ?? "");
    form.setValue("year", company.year ?? "");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this company?")) return;

    const response = await fetch(`/api/portfolio/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      const message = json.error || "Failed to delete";
      alert(message);
      return;
    }

    await mutate();
    if (editingId === id) {
      resetForm();
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-600">Loading…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <button
          onClick={() => signIn("google")}
          className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Portfolio Admin</h1>
            <p className="text-sm text-slate-500">Signed in as {session.user?.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:border-slate-300 hover:text-slate-900"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto mt-10 flex max-w-6xl flex-col gap-12 px-6">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              {editingId ? "Edit company" : "Add company"}
            </h2>
            {editingId && (
              <button
                onClick={resetForm}
                className="text-sm font-medium text-slate-500 hover:text-slate-900"
              >
                Cancel edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-700">Name</span>
              <input
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <span className="text-xs text-red-600">
                  {form.formState.errors.name.message}
                </span>
              )}
            </label>

            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-700">Industry</span>
              <input
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
                {...form.register("industry")}
              />
            </label>

            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-700">Status</span>
              <select
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
                {...form.register("tag")}
              >
                <option value="Invested">Invested</option>
                <option value="Exited">Exited</option>
                <option value="RIP">RIP</option>
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-700">Year</span>
              <input
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
                {...form.register("year")}
              />
              {form.formState.errors.year && (
                <span className="text-xs text-red-600">
                  {form.formState.errors.year.message}
                </span>
              )}
            </label>

            <label className="md:col-span-2 flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-700">Website</span>
              <input
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
                {...form.register("website")}
              />
            </label>

            <div className="md:col-span-2 flex items-center gap-3">
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
              >
                {editingId ? "Save changes" : "Add company"}
              </button>
              {form.formState.isSubmitting && (
                <span className="text-xs text-slate-500">Saving…</span>
              )}
            </div>
          </form>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Companies</h2>
            {isLoading && <span className="text-xs text-slate-500">Loading…</span>}
          </div>

          {error && (
            <p className="mt-4 rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-600">
              Failed to load companies. {error.message}
            </p>
          )}

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Industry</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Year</th>
                  <th className="px-4 py-3">Website</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sortedData.map((company) => (
                  <tr key={company.id} className="bg-white">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {company.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {company.industry ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {normaliseStatus(company.tag) ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {company.year ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {company.website ? (
                        <a
                          href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-900 hover:underline"
                        >
                          {company.website}
                        </a>
                      ) : (
                        <span>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      <button
                        onClick={() => handleEdit(company)}
                        className="mr-3 text-sm font-medium text-slate-600 hover:text-slate-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(company.id)}
                        className="text-sm font-medium text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {sortedData.length === 0 && !isLoading && (
              <p className="px-4 py-6 text-sm text-slate-500">No companies added yet.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
