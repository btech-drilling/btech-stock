export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import ProjectCloseButton from "../ProjectCloseButton";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;

  const status = params.status ?? "ACTIVE";

  let query = supabase
    .from("projects")
    .select("*")
    .order("project_code", { ascending: true });

  if (status !== "ALL") {
    query = query.eq("status", status);
  }

  const { data: projects, error } = await query;

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  function filterClass(value: string) {
    return status === value
      ? "rounded-xl bg-orange-500 px-4 py-2 text-white"
      : "rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-100";
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-orange-600">
            PROJECT MANAGEMENT
          </p>

          <h1 className="text-4xl font-bold text-slate-900">
            Projects
          </h1>

          <p className="mt-1 text-slate-500">
            Drilling and exploration project tracking
          </p>
        </div>

        <Link
          href="/add-project"
          className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
        >
          + Add Project
        </Link>
      </div>

      <div className="mb-5 flex gap-3">
        <Link
          href="/projects?status=ALL"
          className={filterClass("ALL")}
        >
          All
        </Link>

        <Link
          href="/projects?status=ACTIVE"
          className={filterClass("ACTIVE")}
        >
          Active
        </Link>

        <Link
          href="/projects?status=CLOSED"
          className={filterClass("CLOSED")}
        >
          Closed
        </Link>

        <Link
          href="/projects?status=HOLD"
          className={filterClass("HOLD")}
        >
          Hold
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-xl font-bold text-slate-900">
            Project List
          </h2>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-slate-100 text-left text-sm text-slate-600">
              <th className="p-4">Project Code</th>
              <th className="p-4">Project Name</th>
              <th className="p-4">Client</th>
              <th className="p-4">Location</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {projects?.map((project) => (
              <tr
                key={project.id}
                className="border-t border-slate-100"
              >
                <td className="p-4 font-semibold text-slate-800">
                  {project.project_code}
                </td>

                <td className="p-4 text-slate-700">
                  {project.project_name}
                </td>

                <td className="p-4 text-slate-600">
                  {project.client_name}
                </td>

                <td className="p-4 text-slate-600">
                  {project.location_text}
                </td>

                <td className="p-4">
                  <span
                    className={
                      project.status === "ACTIVE"
                        ? "rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700"
                        : project.status === "HOLD"
                        ? "rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700"
                        : "rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                    }
                  >
                    {project.status}
                  </span>
                </td>

                <td className="p-4">
                  {project.status !== "CLOSED" ? (
                    <ProjectCloseButton id={project.id} />
                  ) : (
                    <span className="text-slate-400">
                      Closed
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}