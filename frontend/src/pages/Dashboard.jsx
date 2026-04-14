import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createInterview, deleteInterview, getInterviews, updateInterview } from "../services/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [form, setForm] = useState({
    company: "",
    role: "",
    notes: "",
  });

  // Load interviews
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const data = await getInterviews();
    setInterviews(Array.isArray(data) ? data : []);
  };

  // Add interview
  const handleSubmit = async (e) => {
    e.preventDefault();

    await createInterview(form);

    setForm({ company: "", role: "", notes: "" });
    fetchData();
  };

  const safeInterviews = Array.isArray(interviews) ? interviews : [];

  const stats = {
    applied: safeInterviews.filter(i => i.status === "Applied").length,
    interview: safeInterviews.filter(i => i.status === "Interview").length,
    offer: safeInterviews.filter(i => i.status === "Offer").length,
    rejected: safeInterviews.filter(i => i.status === "Rejected").length,
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Dashboard 🚀
      </h1>

      {/* Top Actions */}
      <div className="flex gap-4 mb-6">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => navigate("/mock")}
        >
          Start Mock Interview 🎤
        </button>

        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={() =>
            window.open(
              "https://resume-analyzer-eight-taupe.vercel.app/",
              "_blank"
            )
          }
        >
          Analyze Resume 📄
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded">
          <p>Applied</p>
          <h2 className="text-xl font-bold">{stats.applied}</h2>
        </div>

        <div className="bg-yellow-100 p-4 rounded">
          <p>Interview</p>
          <h2 className="text-xl font-bold">{stats.interview}</h2>
        </div>

        <div className="bg-green-100 p-4 rounded">
          <p>Offer</p>
          <h2 className="text-xl font-bold">{stats.offer}</h2>
        </div>

        <div className="bg-red-100 p-4 rounded">
          <p>Rejected</p>
          <h2 className="text-xl font-bold">{stats.rejected}</h2>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="font-semibold mb-2">Add Interview</h2>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            className="border p-2 rounded"
            placeholder="Company"
            value={form.company}
            onChange={(e) =>
              setForm({ ...form, company: e.target.value })
            }
          />

          <input
            className="border p-2 rounded"
            placeholder="Role"
            value={form.role}
            onChange={(e) =>
              setForm({ ...form, role: e.target.value })
            }
          />

          <button className="bg-black text-white px-3 rounded">
            Add
          </button>
        </form>
      </div>

      {/* Interview List */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-3">My Interviews</h2>

        {safeInterviews.map((item) => (
          <div
            key={item._id}
            className="border p-3 mb-2 rounded"
          >
            <p className="font-bold">
              {item.company} - {item.role}
            </p>

            <select
              className="border mt-2"
              value={item.status}
              onChange={async (e) => {
                await updateInterview(item._id, {
                  status: e.target.value,
                });
                fetchData();
              }}
            >
              <option>Applied</option>
              <option>Interview</option>
              <option>Offer</option>
              <option>Rejected</option>
            </select>

            <textarea
              className="border w-full mt-2 p-2"
              value={item.notes}
              onChange={async (e) => {
                await updateInterview(item._id, {
                  notes: e.target.value,
                });
                fetchData();
              }}
            />

            <button
              className="bg-red-500 text-white px-2 mt-2 rounded"
              onClick={async () => {
                await deleteInterview(item._id);
                fetchData();
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
