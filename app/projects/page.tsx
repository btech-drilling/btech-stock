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
      ? "bg-black text-white px-4 py-2 rounded"
      : "bg-white border px-4 py-2 rounded";
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>

        <Link
          href="/add-project"
          className="bg-black text-white px-4 py-2 rounded"
        >
          + Add Project
        </Link>
      </div>

      <div className="flex gap-3 mb-4">
        <Link href="/projects?status=ALL" className={filterClass("ALL")}>
          All
        </Link>

        <Link href="/projects?status=ACTIVE" className={filterClass("ACTIVE")}>
          Active
        </Link>

        <Link href="/projects?status=CLOSED" className={filterClass("CLOSED")}>
          Closed
        </Link>

        <Link href="/projects?status=HOLD" className={filterClass("HOLD")}>
          Hold
        </Link>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-3">Project Code</th>
              <th className="p-3">Project Name</th>
              <th className="p-3">Client</th>
              <th className="p-3">Location</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {projects?.map((project) => (
              <tr key={project.id} className="border-t">
                <td className="p-3">{project.project_code}</td>
                <td className="p-3">{project.project_name}</td>
                <td className="p-3">{project.client_name}</td>
                <td className="p-3">{project.location_text}</td>

                <td className="p-3">
                  <span
                    className={
                      project.status === "ACTIVE"
                        ? "bg-green-100 text-green-700 px-2 py-1 rounded text-xs"
                        : project.status === "HOLD"
                        ? "bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs"
                        : "bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                    }
                  >
                    {project.status}
                  </span>
                </td>

                <td className="p-3">
                  {project.status !== "CLOSED" ? (
                    <ProjectCloseButton id={project.id} />
                  ) : (
                    <span className="text-gray-400">Closed</span>
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