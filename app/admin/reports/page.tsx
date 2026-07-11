"use client";

import { useEffect, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL || "";

export default function AdminReportsPage() {

  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {

    try {

      const res = await fetch(
        `${API_BASE}/api/admin/reports`
      );

      const data = await res.json();

      if (data.success) {
        setReports(data.data || []);
      }

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  }

  async function hideVideo(video_id: string) {

    const res = await fetch(
  `${API_BASE}/api/admin/hide-video`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      video_id,
    }),
  }
);

const data = await res.json();

console.log(data);
alert("Video hidden successfully");

    fetchReports();

  }

  async function unhideVideo(video_id: string) {

const res = await fetch(
  `${API_BASE}/api/admin/unhide-video`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      video_id,
    }),
  }
);

const data = await res.json();

console.log(data);
alert("Video unhidden");

    fetchReports();

  }

  async function resolveReport(report_id: string) {


const res = await fetch(
  `${API_BASE}/api/admin/resolve-report`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      report_id,
    }),
  }
);

const data = await res.json();

console.log(data);
alert("Report resolved");

    fetchReports();

  }

  if (loading) {
    return (
      <div className="p-6 text-white bg-black min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">

      <h1 className="text-2xl font-bold mb-6">
        Reports Queue
      </h1>

      <div className="space-y-4">

        {reports.map((report) => (

          <div
            key={report.id}
            className="border border-white/20 rounded-xl p-4"
          >
		  
		  {report.video_url && (
  <video
    src={report.video_url}
    controls
    className="w-48 rounded-lg mb-4"
  />
)}

            <div className="space-y-2">

              <div>
                <span className="font-bold">
                  Report Type:
                </span>{" "}
                {report.target_type}
              </div>

              <div>
                <span className="font-bold">
                  Reason:
                </span>{" "}
                {report.reason}
              </div>

              <div>
                <span className="font-bold">
                  Status:
                </span>{" "}
                {report.status}
              </div>

              <div>
                <span className="font-bold">
                  Reporter:
                </span>{" "}
                {report.reporter?.username || "Unknown"}
              </div>

              <div>
                <span className="font-bold">
                  Target ID:
                </span>{" "}
                {report.target_id}
              </div>
			  
			  <div>
  <span className="font-bold">
    Caption:
  </span>{" "}
  {report.caption || "No caption"}
</div>

<div>
  <span className="font-bold">
    Creator ID:
  </span>{" "}
  {report.creator_id}
</div>

<div>
  <span className="font-bold">
    Hidden:
  </span>{" "}
  {report.hidden ? "YES" : "NO"}
</div>

              <div>
                <span className="font-bold">
                  Created:
                </span>{" "}
                {new Date(
                  report.created_at
                ).toLocaleString()}
              </div>

            </div>

            <div className="flex gap-3 mt-4">

              {report.target_type === "video" && (
                <>
                  <button
                    onClick={() =>
                      hideVideo(report.target_id)
                    }
                    className="bg-red-500 px-4 py-2 rounded-lg"
                  >
                    Hide
                  </button>

                  <button
                    onClick={() =>
                      unhideVideo(report.target_id)
                    }
                    className="bg-green-500 px-4 py-2 rounded-lg"
                  >
                    Unhide
                  </button>
                </>
              )}

              <button
                onClick={() =>
                  resolveReport(report.id)
                }
                className="bg-blue-500 px-4 py-2 rounded-lg"
              >
                Resolve
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}