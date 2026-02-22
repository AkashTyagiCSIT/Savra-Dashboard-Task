import React, { useState } from "react";
import Sidebar from "./Sidebar.jsx";
import Dashboard from "./Dashboard.jsx";
import TeacherView from "./TeacherView.jsx";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);

  function openTeacher(id) {
    setSelectedTeacherId(id);
    setPage("teacher");
  }

  function goBack() {
    setPage("dashboard");
    setSelectedTeacherId(null);
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar page={page} onNav={setPage} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {page === "dashboard" && <Dashboard onSelectTeacher={openTeacher} />}
        {page === "teacher" && <TeacherView teacherId={selectedTeacherId} onBack={goBack} />}
        {page === "teachers" && <Dashboard onSelectTeacher={openTeacher} />}
      </div>
    </div>
  );
}
