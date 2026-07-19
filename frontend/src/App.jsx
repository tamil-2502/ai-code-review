import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Code2, History, UserRound, Settings, LogOut,
  Bell, Menu, FileCode2, Upload, Sparkles, BarChart3, ShieldCheck,
  AlertTriangle, Info, Trash2, Search, ArrowLeft, Download
} from "lucide-react";
import api from "./api";

function App() {
  const token = localStorage.getItem("token");
  return <Routes>
    <Route path="/login" element={<Auth mode="login" />} />
    <Route path="/register" element={<Auth mode="register" />} />
    <Route path="/*" element={token ? <Shell /> : <Navigate to="/login" />} />
  </Routes>;
}

function Shell() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const nav = [
    ["/", "Dashboard", LayoutDashboard],
    ["/review", "Code Review", Code2],
    ["/history", "Review History", History],
    ["/profile", "Profile", UserRound],
    ["/settings", "Settings", Settings]
  ];

  return <div className="app">
    <aside className={collapsed ? "sidebar collapsed" : "sidebar"}>
      <div className="brand"><span>AI</span> Code Review</div>
      <nav>
        {nav.map(([path, label, Icon]) => (
          <button key={path} className={location.pathname === path ? "nav active" : "nav"} onClick={() => navigate(path)}>
            <Icon size={19} /> {!collapsed && <span>{label}</span>}
          </button>
        ))}
        <button className="nav" onClick={logout}><LogOut size={19} /> {!collapsed && <span>Logout</span>}</button>
      </nav>
      {!collapsed && <div className="help">Need Help?<small>Review your code with confidence.</small></div>}
    </aside>

    <main className="main">
      <header className="topbar">
        <button className="iconBtn" onClick={() => setCollapsed(!collapsed)}><Menu size={20}/></button>
        <div className="topRight"><Bell size={19}/><div className="avatar">T</div><span>Tamilarasi</span></div>
      </header>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/history/:id" element={<ReportPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </main>
  </div>;
}

function Auth({ mode }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async e => {
  e.preventDefault();

  try {
    const { data } = await api.post(`/auth/${mode}`, form);

    console.log("LOGIN SUCCESS", data);

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    console.log("NAVIGATING TO DASHBOARD");

    navigate("/");
  } catch (err) {
    console.log("LOGIN ERROR", err);
    setError(err.response?.data?.message || "Something went wrong");
  }
};

  return <div className="authPage">
    <div className="authCard">
      <div className="brand"><span>AI</span> Code Review</div>
      <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
      <p>{mode === "login" ? "Sign in to continue reviewing your code." : "Start improving your code quality today."}</p>
      <form onSubmit={submit}>
        {mode === "register" && <input placeholder="Full name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />}
        <input type="email" placeholder="Email address" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
        <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
        {error && <div className="errorBox">{error}</div>}
        <button className="primary full">{mode === "login" ? "Sign In" : "Create Account"}</button>
      </form>
      <p className="switch">{mode === "login" ? "Don't have an account?" : "Already have an account?"} <button
  type="button"
  onClick={() => navigate(mode === "login" ? "/register" : "/login")}
>{mode === "login" ? "Register" : "Login"}</button></p>
    </div>
  </div>;
}

function Dashboard() {
  const [stats, setStats] = useState({ totalReviews: 0, averageScore: 0, totalIssues: 0, passedReviews: 0 });
  const [reviews, setReviews] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/reviews/dashboard").then(r => setStats(r.data));
    api.get("/reviews").then(r => setReviews(r.data.slice(0, 4)));
  }, []);

  return <section className="page">
    <div className="pageHead"><div><h1>Dashboard</h1><p>Welcome back, Tamilarasi!</p></div></div>
    <div className="stats">
      <Stat icon={<FileCode2/>} label="Total Reviews" value={stats.totalReviews}/>
      <Stat icon={<ShieldCheck/>} label="Passed Reviews" value={stats.passedReviews}/>
      <Stat icon={<AlertTriangle/>} label="Issues Found" value={stats.totalIssues}/>
      <Stat icon={<Sparkles/>} label="Avg Code Quality" value={`${stats.averageScore}/100`}/>
    </div>
    <div className="grid2">
      <div className="card">
        <div className="cardHead"><h2>Recent Reviews</h2><button className="link" onClick={() => navigate("/history")}>View All</button></div>
        {reviews.length ? reviews.map(r => <div className="reviewRow" key={r.id} onClick={() => navigate(`/history/${r.id}`)}>
          <div><b>{r.submission.title}</b><small>{r.submission.language}</small></div><strong>{r.overallScore}/100</strong>
        </div>) : <Empty text="No reviews yet. Start your first code review." />}
      </div>
      <div className="card">
        <h2>Quick Actions</h2>
        <button className="action blue" onClick={() => navigate("/review")}><Code2/><div><b>New Code Review</b><small>Analyze your source code</small></div></button>
        <button className="action green" onClick={() => navigate("/review")}><Upload/><div><b>Upload Code Files</b><small>Upload and review files</small></div></button>
      </div>
    </div>
  </section>;
}

function Stat({ icon, label, value }) {
  return <div className="stat card"><div className="statIcon">{icon}</div><div><b>{value}</b><small>{label}</small></div></div>;
}

function ReviewPage() {
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("My Code Review");
  const [language, setLanguage] = useState("JavaScript");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const analyze = async () => {
    setLoading(true); setError("");
    try {
      const { data } = await api.post("/reviews", { title, language, sourceCode: code });
      navigate(`/history/${data.id}`);
    } catch (e) {
      setError(e.response?.data?.message || "Analysis failed");
    } finally { setLoading(false); }
  };

  const upload = e => {
    const file = e.target.files[0];
    if (!file) return;
    setTitle(file.name);
    const reader = new FileReader();
    reader.onload = () => setCode(reader.result);
    reader.readAsText(file);
  };

  return <section className="page">
    <div className="pageHead"><div><h1>Code Review</h1><p>Paste your code or upload a source file to analyze.</p></div></div>
    <div className="reviewBox card">
      <div className="tabs"><span className="tab active">Paste Code</span><label className="tab">Upload Files<input type="file" accept=".js,.jsx,.txt" hidden onChange={upload}/></label></div>
      <div className="reviewLayout">
        <div>
          <input className="titleInput" value={title} onChange={e => setTitle(e.target.value)} placeholder="Review title"/>
          <textarea className="codeEditor" value={code} onChange={e => setCode(e.target.value)} spellCheck="false"/>
          <div className="reviewBottom">
            <select value={language} onChange={e => setLanguage(e.target.value)}><option>JavaScript</option><option>Python</option></select>
            <button className="primary" onClick={analyze} disabled={loading}>{loading ? "Analyzing..." : "▶ Analyze Code"}</button>
          </div>
          {error && <div className="errorBox">{error}</div>}
        </div>
        <div className="options">
          <h3>Analysis Options</h3>
          <label><input type="checkbox" checked readOnly/> Static Analysis</label>
          <label><input type="checkbox" checked readOnly/> AI Code Review</label>
          <label><input type="checkbox" checked readOnly/> Complexity Analysis</label>
          <label><input type="checkbox"/> Generate Documentation</label>
          <div className="info"><Sparkles size={18}/><span>All selected analyses are performed together and displayed in one structured report.</span></div>
        </div>
      </div>
    </div>
  </section>;
}

function HistoryPage() {
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

 const load = () => {
  api.get("/reviews").then(r => setReviews(r.data));
};
useEffect(() => { load(); }, []);
  const remove = async id => {
    if (!confirm("Delete this review?")) return;
    await api.delete(`/reviews/${id}`);
    load();
  };

  const filtered = reviews.filter(r =>
  (r.submission?.title || "").toLowerCase().includes(search.toLowerCase())
);

  return <section className="page">
    <div className="pageHead"><div><h1>Review History</h1><p>View and manage all your previous code reviews.</p></div><button className="primary" onClick={() => navigate("/review")}>+ New Review</button></div>
    <div className="card">
      <div className="search"><Search size={18}/><input placeholder="Search reviews..." value={search} onChange={e => setSearch(e.target.value)}/></div>
      {filtered.map(r => <div className="historyRow" key={r.id}>
        <div><b>{r.submission?.title || "Untitled Review"}</b>
<small>
  {r.submission?.language || "Unknown"} ·{" "}
  {new Date(r.createdAt).toLocaleDateString()}
</small></div>
        <span className={`score ${r.overallScore >= 70 ? "good" : "bad"}`}>{r.overallScore}/100</span>
        <span>{r.findings.length} issues</span>
        <button className="iconBtn" onClick={() => navigate(`/history/${r.id}`)}>View</button>
        <button className="delete" onClick={() => remove(r.id)}><Trash2 size={17}/></button>
      </div>)}
      {!filtered.length && <Empty text="No reviews found." />}
    </div>
  </section>;
}

function ReportPage() {
  const [review, setReview] = useState(null);
  const [tab, setTab] = useState("static");
  const navigate = useNavigate();

  useEffect(() => {
    const id = location.pathname.split("/").pop();
    api.get(`/reviews/${id}`).then(r => setReview(r.data));
  }, []);

  if (!review) return <section className="page"><div className="loading">Loading report...</div></section>;

  const metrics = review.metrics || {};
  const ai = metrics.ai || {};
  const errors = review.findings.filter(f => f.severity === "Error").length;
  const warnings = review.findings.filter(f => f.severity === "Warning").length;
  const suggestions = review.findings.filter(f => f.severity === "Suggestion").length;
  const downloadReport = () => {
  const report = `
CODE REVIEW REPORT

Title: ${review.submission.title}
Language: ${review.submission.language}

Overall Score: ${review.overallScore}/100
Errors: ${errors}
Warnings: ${warnings}
Suggestions: ${suggestions}
Complexity: ${metrics.level || "Low"}

FINDINGS:
${review.findings.map((f, i) =>
  `${i + 1}. ${f.message || f.explanation || "Issue found"} 
Severity: ${f.severity}
Line: ${f.line || "N/A"}`
).join("\n\n")}
`;

  const blob = new Blob([report], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${review.submission.title}-report.txt`;
  a.click();

  URL.revokeObjectURL(url);
};
  return <section className="page">
    <div className="pageHead"><div><button className="back" onClick={() => navigate("/history")}><ArrowLeft size={16}/> Back to History</button><h1>Code Review Results</h1><p>{review.submission.title}</p></div><button className="secondary" onClick={downloadReport}>
  <Download size={16}/> Download Report
</button></div>
    <div className="stats">
      <Stat icon={<Sparkles/>} label="Overall Score" value={`${review.overallScore}/100`}/>
      <Stat icon={<AlertTriangle/>} label="Errors" value={errors}/>
      <Stat icon={<Info/>} label="Warnings" value={warnings}/>
      <Stat icon={<BarChart3/>} label="Complexity" value={metrics.level || "Low"}/>
    </div>
    <div className="report card">
      <div className="reportTabs">
        {[
          ["static", "Static Analysis"],
          ["ai", "AI Code Review"],
          ["complexity", "Complexity Analysis"],
          ["docs", "Documentation"]
        ].map(([id, label]) => <button className={tab === id ? "active" : ""} onClick={() => setTab(id)} key={id}>{label}</button>)}
      </div>
      {tab === "static" && <StaticReport findings={review.findings} code={review.submission.sourceCode} />}
      {tab === "ai" && <AIReport ai={ai} />}
      {tab === "complexity" && <ComplexityReport metrics={metrics}/>}
      {tab === "docs" && (
  <div className="documentationPanel">
    <FileCode2 size={40} />

    <h2>Documentation Generator</h2>

    <p>
      Generate documentation for functions and classes from your analyzed source code.
    </p>

    <button
      className="primary"
      onClick={() => {
        const sourceCode = review.submission.sourceCode;

const functions = [...sourceCode.matchAll(
  /function\s+([a-zA-Z_$][\w$]*)\s*\(([^)]*)\)/g
)];

const classes = [...sourceCode.matchAll(
  /class\s+([a-zA-Z_$][\w$]*)/g
)];

let generatedDocs = "";

if (functions.length > 0) {
  generatedDocs += "FUNCTION DOCUMENTATION\n";
  generatedDocs += "======================\n\n";

  functions.forEach((match, index) => {
    const functionName = match[1];
    const parameters = match[2].trim();

    generatedDocs += `${index + 1}. Function: ${functionName}\n`;
    generatedDocs += `Description: This function performs a specific operation in the source code.\n`;
    generatedDocs += `Parameters: ${parameters || "None"}\n`;
    generatedDocs += `Returns: Not specified\n\n`;
  });
}

if (classes.length > 0) {
  generatedDocs += "CLASS DOCUMENTATION\n";
  generatedDocs += "===================\n\n";

  classes.forEach((match, index) => {
    generatedDocs += `${index + 1}. Class: ${match[1]}\n`;
    generatedDocs += `Description: This class represents a structured object in the source code.\n\n`;
  });
}

if (!generatedDocs) {
  generatedDocs = "No functions or classes were detected in the source code.\n";
}

const documentation = `
CODE DOCUMENTATION

Project: ${review.submission.title}
Language: ${review.submission.language}

========================================

${generatedDocs}

========================================
Generated by AI Code Review Assistant
========================================
`;

        const blob = new Blob([documentation], {
          type: "text/plain"
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");

        a.href = url;
        a.download = `${review.submission.title}-documentation.txt`;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
      }}
    >
      Generate Documentation
    </button>
  </div>
)}
    </div>
  </section>;
}

function StaticReport({ findings, code }) {
  return <div className="reportContent">
    <div className="reportMain">
      <h2>Static Analysis Report <span className="badge">{findings.length} Issues Found</span></h2>
      <p className="muted">Potential issues detected in your source code.</p>
      <div className="table">
        <div className="tableHead"><span>Line</span><span>Severity</span><span>Issue</span><span>Explanation</span><span>Suggested Fix</span></div>
        {findings.map(f => <div className="tableRow" key={f.id || `${f.issue}-${f.lineNumber}`}><span>{f.lineNumber}</span><span><i className={`severity ${f.severity.toLowerCase()}`}>{f.severity}</i></span><span>{f.issue}</span><span>{f.explanation}</span><span>{f.suggestedFix}</span></div>)}
      </div>
    </div>
    <div className="codeOverview"><h3>Code Overview</h3><pre>{code}</pre><p>Lines of Code <b>{code.split("\n").length}</b></p><p>Language <b>JavaScript</b></p></div>
  </div>;
}

function AIReport({ ai }) {
  return <div className="aiReport">
    <div className="aiHero"><Sparkles/><div><h2>AI Review Summary</h2><p>{ai.summary || "No AI summary available."}</p></div></div>
    <div className="aiGrid">
      <div className="card"><h3>Suggestions</h3>{(ai.suggestions || []).map(x => <p className="bullet" key={x}>✓ {x}</p>)}</div>
      <div className="card"><h3>Code Smells</h3>{(ai.codeSmells || []).map(x => <p className="bullet" key={x}>⚠ {x}</p>)}</div>
      <div className="card"><h3>Performance</h3>{(ai.performance || []).map(x => <p className="bullet" key={x}>⚡ {x}</p>)}</div>
    </div>
  </div>;
}

function ComplexityReport({ metrics }) {
  return <div className="complexity">
    <h2>Complexity Analysis</h2><p className="muted">Understand the structural complexity of your source code.</p>
    <div className="metricGrid">
      <Metric label="Lines of Code" value={metrics.linesOfCode}/>
      <Metric label="Functions" value={metrics.functions}/>
      <Metric label="Classes" value={metrics.classes}/>
      <Metric label="Cyclomatic Complexity" value={metrics.cyclomaticComplexity}/>
      <Metric label="Complexity Level" value={metrics.level}/>
    </div>
  </div>;
}

function Metric({ label, value }) { return <div className="metric card"><small>{label}</small><b>{value}</b></div>; }
function Empty({ text }) { return <div className="empty">{text}</div>; }
function Profile() { const u = JSON.parse(localStorage.getItem("user") || "{}"); return <section className="page"><h1>Profile</h1><div className="card profile"><div className="bigAvatar">{u.name?.[0] || "T"}</div><h2>{u.name}</h2><p>{u.email}</p></div></section>; }
function SettingsPage() { return <section className="page"><h1>Settings</h1><div className="card settings"><h2>Application Settings</h2><label><input type="checkbox" defaultChecked/> Enable analysis notifications</label><label><input type="checkbox" defaultChecked/> Show AI suggestions</label></div></section>; }

export default App;