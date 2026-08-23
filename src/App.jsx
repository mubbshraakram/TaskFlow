import { useState, useRef, useMemo, useEffect } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Layout, LayoutDashboard, Calendar, Users, BarChart2, Settings,
  Plus, Trash2, Pencil, X, ChevronLeft, ChevronRight, ChevronDown,
  Circle, Menu, Clock,
} from "lucide-react";
 
/* ════════════════════════════════════════
   DESIGN TOKENS
════════════════════════════════════════ */
const C = {
  navy:"#1E1B2E", navyH:"#2A2640", accent:"#8B5CF6", accentL:"#A78BFA",
  bg:"#F0EEF8", colBg:"#E8E4F4", surface:"#FFFFFF", border:"#D5D0EC",
  text:"#1A1628", navText:"#9B8EC4", muted:"#6B5F8A", mutedL:"#9B8EC4",
};
const SR = "'Cormorant Garamond', serif";
const SN = "'DM Sans', system-ui, sans-serif";
 
/* ════════════════════════════════════════
   CONSTANTS
════════════════════════════════════════ */
const COLS     = ["To Do","In Progress","In Review","Done"];
const COL_CFG  = {
  "To Do":       { accent:"#9B8EC4", countBg:"#EDE9FE", countC:"#6D28D9" },
  "In Progress": { accent:"#8B5CF6", countBg:"#F3E8FF", countC:"#7C3AED" },
  "In Review":   { accent:"#EC4899", countBg:"#FDF2F8", countC:"#BE185D" },
  "Done":        { accent:"#059669", countBg:"#D1FAE5", countC:"#065F46" },
};
const PCFG = {
  High:   { color:"#BE185D", bg:"#FDF2F8" },
  Medium: { color:"#6D28D9", bg:"#EDE9FE" },
  Low:    { color:"#0369A1", bg:"#E0F2FE" },
};
const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTH_FULL  = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WEEKDAYS    = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const TEAM_COLORS = ["#8B5CF6","#EC4899","#0891B2","#059669","#D97706","#DC2626"];
const NAV_PAGES   = [
  { id:"dashboard", label:"Dashboard", Icon:LayoutDashboard },
  { id:"calendar",  label:"Calendar",  Icon:Calendar },
  { id:"team",      label:"Team",      Icon:Users },
  { id:"reports",   label:"Reports",   Icon:BarChart2 },
  { id:"settings",  label:"Settings",  Icon:Settings },
];
const LOG_COLORS = { move:C.accent, add:"#059669", edit:"#0891B2", delete:"#BE185D" };
 
/* ════════════════════════════════════════
   SEED DATA
════════════════════════════════════════ */
const INIT_CATS   = [
  { id:"CAT1", name:"Personal",     expanded:true },
  { id:"CAT2", name:"Professional", expanded:true },
];
const INIT_BOARDS = [
  { id:"B001", name:"Project Alpha",    catId:"CAT2" },
  { id:"B002", name:"Marketing",        catId:"CAT2" },
  { id:"B003", name:"Personal Goals",   catId:"CAT1" },
  { id:"B004", name:"Health & Fitness", catId:"CAT1" },
];
const INIT_CARDS  = {
  B001:[
    { id:"C001", title:"Design wireframes",  desc:"Homepage & dashboard wireframes", priority:"High",   due:"Dec 15", col:"To Do",      assignee:"MA" },
    { id:"C002", title:"Setup REST API",     desc:"Configure all API endpoints",     priority:"High",   due:"Dec 12", col:"In Progress", assignee:"ZM" },
    { id:"C003", title:"Write unit tests",   desc:"Test all major components",       priority:"Medium", due:"Dec 20", col:"To Do",      assignee:"HR" },
    { id:"C004", title:"Deploy to staging",  desc:"QA on staging server",            priority:"Medium", due:"Dec 18", col:"In Review",  assignee:"SK" },
    { id:"C005", title:"Database schema",    desc:"Implement final DB schema",       priority:"High",   due:"Dec 10", col:"Done",       assignee:"ZM" },
    { id:"C006", title:"CI/CD pipeline",     desc:"Automate build and deploy",       priority:"Low",    due:"Dec 22", col:"To Do",      assignee:"MA" },
  ],
  B002:[
    { id:"C007", title:"Content calendar",   desc:"Monthly plan for all platforms",  priority:"Medium", due:"Dec 20", col:"To Do",      assignee:"SK" },
    { id:"C008", title:"Email campaign",     desc:"Design & send newsletter",        priority:"High",   due:"Dec 14", col:"In Progress", assignee:"MA" },
    { id:"C009", title:"Blog articles",      desc:"3 SEO-optimized articles",        priority:"Low",    due:"Dec 25", col:"To Do",      assignee:"SK" },
    { id:"C010", title:"Analytics report",   desc:"Q4 performance summary",          priority:"Medium", due:"Dec 31", col:"Done",       assignee:"MA" },
  ],
  B003:[
    { id:"C011", title:"Learn TypeScript",   desc:"Finish advanced TS course",       priority:"Medium", due:"Jan 5",  col:"In Progress", assignee:"MA" },
    { id:"C012", title:"Portfolio website",  desc:"Build & deploy portfolio",        priority:"High",   due:"Dec 31", col:"To Do",      assignee:"MA" },
    { id:"C013", title:"Upwork profile",     desc:"Optimize freelance profile",      priority:"High",   due:"Dec 28", col:"To Do",      assignee:"MA" },
    { id:"C014", title:"Read Clean Code",    desc:"Finish chapters 5–10",            priority:"Low",    due:"Jan 10", col:"Done",       assignee:"MA" },
  ],
  B004:[
    { id:"C015", title:"Morning workout",    desc:"30 min daily exercise",           priority:"Medium", due:"Dec 20", col:"In Progress", assignee:"MA" },
    { id:"C016", title:"Meal prep",          desc:"Weekly Sunday meal prep",         priority:"Low",    due:"Dec 22", col:"To Do",      assignee:"MA" },
    { id:"C017", title:"10k steps daily",    desc:"Track with health app",           priority:"Low",    due:"Dec 31", col:"Done",       assignee:"MA" },
  ],
};
const INIT_TEAM = [
  { id:"TM001", initials:"MA", name:"Mubbshra A.", role:"Project Lead", color:"#8B5CF6" },
  { id:"TM002", initials:"SK", name:"Sara K.",     role:"UI Designer",  color:"#EC4899" },
  { id:"TM003", initials:"ZM", name:"Zara M.",     role:"Backend Dev",  color:"#0891B2" },
  { id:"TM004", initials:"HR", name:"Hana R.",     role:"QA Engineer",  color:"#059669" },
];
 
/* ════════════════════════════════════════
   HELPERS
════════════════════════════════════════ */
function useIsMobile() {
  const [m, setM] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setM(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return m;
}
const loadLS = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } };
const saveLS = (k, v)  => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const logTime = () => new Date().toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit", hour12:true });
 
// Formats "2025-12-15" → "Dec 15" and keeps "Dec 15" as-is
const formatDue = (due) => {
  if (!due) return null;
  if (due.includes("-")) {
    const [, m, d] = due.split("-");
    return `${MONTH_SHORT[parseInt(m)-1]} ${parseInt(d)}`;
  }
  return due;
};
 
// Parses both "2025-12-15" and "Dec 15" formats for calendar
const parseDueDay = (due, targetMonth) => {
  if (!due) return null;
  if (due.includes("-")) {
    const [, m, d] = due.split("-");
    if (parseInt(m) - 1 !== targetMonth) return null;
    return parseInt(d);
  }
  const pts = due.split(" ");
  const mi  = MONTH_SHORT.indexOf(pts[0]);
  const day = parseInt(pts[1]);
  if (mi !== targetMonth || isNaN(day)) return null;
  return day;
};
 
/* ════════════════════════════════════════
   SHARED UI
════════════════════════════════════════ */
const INP = {
  width:"100%", padding:"9px 11px", border:"1px solid #D5D0EC", borderRadius:7,
  background:"#F0EEF8", fontFamily:"'DM Sans',system-ui,sans-serif",
  fontSize:13, color:"#1A1628", outline:"none", boxSizing:"border-box",
};
 
function Fld({ label, children }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:"block", fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase", color:C.mutedL, fontFamily:SN, marginBottom:5 }}>{label}</label>
      {children}
    </div>
  );
}
 
function Modal({ title, onClose, onSubmit, btnLabel, children, error }) {
  const isMobile = useIsMobile();
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(30,27,46,0.55)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding: isMobile ? 16 : 0 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:18, padding: isMobile ? "22px 20px" : "30px 34px", width:"100%", maxWidth:460, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(30,27,46,0.3)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:22 }}>
          <div style={{ fontSize:21, fontFamily:SR, fontWeight:600, color:C.text }}>{title}</div>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, padding:3, lineHeight:1 }}><X size={17}/></button>
        </div>
        {children}
        {error && <div style={{ fontSize:12, color:"#BE185D", marginBottom:12, fontFamily:SN }}>{error}</div>}
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onSubmit} style={{ flex:1, padding:"11px", background:C.accent, color:"#fff", border:"none", borderRadius:9, fontSize:13, fontWeight:600, fontFamily:SN, cursor:"pointer" }}>{btnLabel}</button>
          <button onClick={onClose}  style={{ flex:1, padding:"11px", background:"transparent", color:C.muted, border:`1px solid ${C.border}`, borderRadius:9, fontSize:13, fontFamily:SN, cursor:"pointer" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
 
function StatCard({ label, value, sub, dark=false }) {
  return (
    <div style={{ background:dark?C.navy:C.surface, border:`1px solid ${dark?"rgba(255,255,255,0.06)":C.border}`, borderTop:`3px solid ${C.accent}`, borderRadius:12, padding:"20px 22px" }}>
      <div style={{ fontSize:10, letterSpacing:"0.13em", textTransform:"uppercase", color:dark?C.accentL:C.mutedL, fontFamily:SN, marginBottom:6 }}>{label}</div>
      <div style={{ fontSize:36, fontWeight:600, color:dark?"#EDE8F8":C.text, fontFamily:SR, lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:dark?C.accentL:C.muted, fontFamily:SN, marginTop:5 }}>{sub}</div>}
    </div>
  );
}
 
function PageHeader({ title, sub, children }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:26, paddingBottom:20, borderBottom:`1px solid ${C.border}`, flexWrap:"wrap", gap:10 }}>
      <div>
        <h1 style={{ fontSize:26, fontFamily:SR, fontWeight:600, color:C.text, margin:0 }}>{title}</h1>
        {sub && <p style={{ fontSize:12, color:C.muted, fontFamily:SN, margin:"4px 0 0" }}>{sub}</p>}
      </div>
      <div style={{ display:"flex", gap:8 }}>{children}</div>
    </div>
  );
}
 
function Btn({ onClick, children, variant="primary" }) {
  const s = {
    primary: { background:C.accent,      color:"#fff",     border:"none"                   },
    outline: { background:"transparent", color:C.muted,    border:`1px solid ${C.border}`  },
    danger:  { background:"#FDF2F8",     color:"#BE185D",  border:"1px solid #FBCFE8"      },
  };
  return (
    <button onClick={onClick} style={{ padding:"8px 16px", borderRadius:9, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:SN, display:"flex", alignItems:"center", gap:6, ...s[variant] }}>
      {children}
    </button>
  );
}
 
function Avt({ initials, color, size=36 }) {
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:color, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.33, fontWeight:600, fontFamily:SN, flexShrink:0 }}>
      {initials}
    </div>
  );
}
 
function Toggle({ checked, onChange }) {
  return (
    <div onClick={() => onChange(!checked)} style={{ width:40, height:22, borderRadius:11, background:checked?C.accent:C.border, cursor:"pointer", position:"relative", transition:"background 0.2s", flexShrink:0 }}>
      <div style={{ position:"absolute", top:3, left:checked?20:3, width:16, height:16, borderRadius:"50%", background:"#fff", transition:"left 0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }}/>
    </div>
  );
}
 
const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 13px", fontFamily:SN, fontSize:12, boxShadow:"0 4px 12px rgba(30,27,46,0.12)" }}>
      <div style={{ fontWeight:600, marginBottom:3, color:C.text }}>{label}</div>
      {payload.map(p => <div key={p.dataKey||p.name} style={{ color:C.muted }}>{p.name||p.dataKey}: <span style={{ color:C.text, fontWeight:600 }}>{p.value}</span></div>)}
    </div>
  );
};
 
/* ════════════════════════════════════════
   ACTIVITY LOG PANEL
════════════════════════════════════════ */
function ActivityLogPanel({ logs, boardId, onClose, isMobile }) {
  const [filter, setFilter] = useState("all");
  const today = new Date().toDateString();
  const boardLogs = logs.filter(l => l.boardId === boardId);
  const shown = filter === "today" ? boardLogs.filter(l => new Date(l.ts).toDateString() === today) : boardLogs;
 
  const panelStyle = isMobile
    ? { position:"fixed", bottom:0, left:0, right:0, zIndex:201, background:C.surface, borderRadius:"18px 18px 0 0", maxHeight:"65vh", display:"flex", flexDirection:"column", boxShadow:"0 -8px 40px rgba(30,27,46,0.2)" }
    : { width:240, flexShrink:0, background:C.surface, borderLeft:`1px solid ${C.border}`, display:"flex", flexDirection:"column", overflow:"hidden" };
 
  return (
    <div style={panelStyle}>
      {/* Handle bar (mobile) */}
      {isMobile && <div style={{ width:36, height:4, borderRadius:2, background:C.border, margin:"10px auto 0" }}/>}
 
      {/* Header */}
      <div style={{ padding:"13px 16px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
          <Clock size={14} color={C.accent}/>
          <span style={{ fontSize:13, fontWeight:600, fontFamily:SN, color:C.text }}>Activity</span>
          {shown.length > 0 && <span style={{ fontSize:10, background:C.accent, color:"#fff", padding:"1px 7px", borderRadius:10, fontFamily:SN, fontWeight:600 }}>{shown.length}</span>}
        </div>
        <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, lineHeight:1, display:"flex", alignItems:"center" }}><X size={14}/></button>
      </div>
 
      {/* Filter tabs */}
      <div style={{ padding:"8px 16px", borderBottom:`1px solid ${C.border}`, display:"flex", gap:6, flexShrink:0 }}>
        {[["all","All"],["today","Today"]].map(([v, label]) => (
          <button key={v} onClick={() => setFilter(v)} style={{ padding:"3px 10px", borderRadius:12, fontSize:11, fontFamily:SN, cursor:"pointer", fontWeight:filter===v?600:400, border:`1px solid ${filter===v?C.accent:C.border}`, background:filter===v?C.accent:"transparent", color:filter===v?"#fff":C.muted }}>{label}</button>
        ))}
      </div>
 
      {/* Log entries */}
      <div style={{ flex:1, overflowY:"auto", padding:"8px 0" }}>
        {shown.length === 0 && (
          <div style={{ textAlign:"center", padding:"30px 16px", color:C.muted, fontFamily:SN, fontSize:12 }}>
            <Clock size={22} color={C.border} style={{ display:"block", margin:"0 auto 8px" }}/>
            No activity yet.<br/>Start moving cards!
          </div>
        )}
        {shown.map(log => (
          <div key={log.id} style={{ padding:"9px 16px", borderBottom:`1px solid ${C.bg}` }}>
            <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
              <span style={{ width:7, height:7, borderRadius:"50%", background:LOG_COLORS[log.type]||C.accent, flexShrink:0, marginTop:4, display:"inline-block" }}/>
              <div>
                <div style={{ fontSize:12, color:C.text, fontFamily:SN, lineHeight:1.5 }}>{log.msg}</div>
                <div style={{ fontSize:10, color:C.muted, fontFamily:SN, marginTop:2 }}>{log.time}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
 
/* ════════════════════════════════════════
   KANBAN CARD
════════════════════════════════════════ */
function KCard({ card, colIdx, onEdit, onDel, onMove, onDragStart, team }) {
  const p   = PCFG[card.priority];
  const mbr = team.find(t => t.initials === card.assignee);
  return (
    <div draggable onDragStart={() => onDragStart(card.id)}
      style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:"13px 14px", marginBottom:9, cursor:"grab", boxShadow:"0 1px 4px rgba(30,27,46,0.07)", transition:"all 0.15s", userSelect:"none" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow="0 4px 16px rgba(139,92,246,0.15)"; e.currentTarget.style.transform="translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow="0 1px 4px rgba(30,27,46,0.07)"; e.currentTarget.style.transform="translateY(0)"; }}
    >
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
        <span style={{ padding:"2px 9px", borderRadius:10, fontSize:10, fontWeight:600, fontFamily:SN, background:p.bg, color:p.color }}>{card.priority}</span>
        <div style={{ display:"flex", gap:1 }}>
          {colIdx>0 && <button onClick={() => onMove(card.id,-1)} style={{ background:"none",border:"none",cursor:"pointer",color:C.mutedL,padding:2,lineHeight:1 }} onMouseEnter={e=>e.currentTarget.style.color=C.accent} onMouseLeave={e=>e.currentTarget.style.color=C.mutedL}><ChevronLeft size={13}/></button>}
          {colIdx<3  && <button onClick={() => onMove(card.id, 1)} style={{ background:"none",border:"none",cursor:"pointer",color:C.mutedL,padding:2,lineHeight:1 }} onMouseEnter={e=>e.currentTarget.style.color=C.accent} onMouseLeave={e=>e.currentTarget.style.color=C.mutedL}><ChevronRight size={13}/></button>}
          <button onClick={() => onEdit(card)} style={{ background:"none",border:"none",cursor:"pointer",color:C.mutedL,padding:2,lineHeight:1 }} onMouseEnter={e=>e.currentTarget.style.color=C.navy} onMouseLeave={e=>e.currentTarget.style.color=C.mutedL}><Pencil size={12}/></button>
          <button onClick={() => onDel(card.id)} style={{ background:"none",border:"none",cursor:"pointer",color:C.mutedL,padding:2,lineHeight:1 }} onMouseEnter={e=>e.currentTarget.style.color="#BE185D"} onMouseLeave={e=>e.currentTarget.style.color=C.mutedL}><Trash2 size={12}/></button>
        </div>
      </div>
      <div style={{ fontSize:13, fontWeight:600, fontFamily:SN, color:C.text, marginBottom:4, lineHeight:1.4 }}>{card.title}</div>
      {card.desc && <div style={{ fontSize:11, color:C.muted, fontFamily:SN, lineHeight:1.5, marginBottom:8 }}>{card.desc}</div>}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        {card.due ? <div style={{ fontSize:11, color:C.mutedL, fontFamily:SN, display:"flex", alignItems:"center", gap:4 }}><Circle size={5} fill={C.mutedL} color={C.mutedL}/> Due {formatDue(card.due)}</div> : <span/>}
        {mbr && <Avt initials={mbr.initials} color={mbr.color} size={22}/>}
      </div>
    </div>
  );
}
 
/* ════════════════════════════════════════
   KANBAN COLUMN
════════════════════════════════════════ */
function KCol({ col, colIdx, cards, onAdd, onEdit, onDel, onMove, onDragStart, onDrop, team }) {
  const [over, setOver] = useState(false);
  const cfg = COL_CFG[col];
  return (
    <div style={{ width:272, flexShrink:0, display:"flex", flexDirection:"column" }}
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={() => { onDrop(col); setOver(false); }}>
      <div style={{ background:over?`${cfg.accent}18`:C.colBg, border:`1px solid ${over?cfg.accent:C.border}`, borderRadius:12, padding:"11px 14px", marginBottom:10, display:"flex", alignItems:"center", justifyContent:"space-between", transition:"all 0.15s" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ width:8,height:8,borderRadius:"50%",background:cfg.accent,display:"inline-block" }}/>
          <span style={{ fontSize:13,fontWeight:600,fontFamily:SN,color:C.text }}>{col}</span>
          <span style={{ padding:"1px 8px",borderRadius:10,fontSize:11,fontWeight:600,fontFamily:SN,background:cfg.countBg,color:cfg.countC }}>{cards.length}</span>
        </div>
        <button onClick={() => onAdd(col)} style={{ background:"none",border:"none",cursor:"pointer",color:C.muted,padding:2,lineHeight:1 }} onMouseEnter={e=>e.currentTarget.style.color=C.accent} onMouseLeave={e=>e.currentTarget.style.color=C.muted}><Plus size={14}/></button>
      </div>
      <div style={{ flex:1,minHeight:80,padding:"2px 0",borderRadius:9,background:over?`${cfg.accent}08`:"transparent",border:over?`2px dashed ${cfg.accent}50`:"2px dashed transparent",transition:"all 0.15s" }}>
        {cards.map(c => <KCard key={c.id} card={c} colIdx={colIdx} onEdit={onEdit} onDel={onDel} onMove={onMove} onDragStart={onDragStart} team={team}/>)}
        {cards.length === 0 && <div style={{ textAlign:"center",padding:"22px 12px",color:C.mutedL,fontFamily:SN,fontSize:12 }}>Drop cards here</div>}
      </div>
      <button onClick={() => onAdd(col)}
        style={{ marginTop:8,padding:"8px",borderRadius:9,fontSize:12,fontFamily:SN,color:C.muted,background:"transparent",border:`1px dashed ${C.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5,transition:"all 0.13s" }}
        onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.color=C.accent;}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted;}}
      ><Plus size={12}/> Add card</button>
    </div>
  );
}
 
/* ════════════════════════════════════════
   PAGE: BOARD
════════════════════════════════════════ */
function BoardPage({ boardId, boards, cards, setCards, team, logs, addLog }) {
  const isMobile = useIsMobile();
  const [prio,    setPrio]   = useState("All");
  const [modal,   setModal]  = useState(false);
  const [editId,  setEditId] = useState(null);
  const [form,    setForm]   = useState({ title:"", desc:"", priority:"Medium", due:"", col:"To Do", assignee:"" });
  const [err,     setErr]    = useState("");
  const [logOpen, setLogOpen]= useState(false);
  const drag = useRef(null);
  const sf = (k,v) => setForm(p => ({...p,[k]:v}));
 
  const board = boards.find(b => b.id === boardId);
  const bc    = cards[boardId] || [];
  const shown = prio === "All" ? bc : bc.filter(c => c.priority === prio);
  const done  = bc.filter(c => c.col === "Done").length;
  const pct   = bc.length > 0 ? Math.round(done/bc.length*100) : 0;
  const gc    = isMobile ? "1fr" : "1fr 1fr";
 
  const openAdd  = col => { setForm({title:"",desc:"",priority:"Medium",due:"",col,assignee:""}); setEditId(null); setErr(""); setModal(true); };
  const openEdit = card => { setForm({title:card.title,desc:card.desc,priority:card.priority,due:card.due,col:card.col,assignee:card.assignee||""}); setEditId(card.id); setErr(""); setModal(true); };
 
  const save = () => {
    if (!form.title.trim()) { setErr("Title required."); return; }
    const who = form.assignee || "MA";
    if (editId) {
      addLog({ boardId, msg:`${who} edited '${form.title}'`, type:"edit" });
      setCards(p => ({...p,[boardId]:p[boardId].map(c => c.id===editId?{...c,...form}:c)}));
    } else {
      addLog({ boardId, msg:`${who} added '${form.title}' to ${form.col}`, type:"add" });
      setCards(p => ({...p,[boardId]:[...(p[boardId]||[]),{id:`C${Date.now()}`,...form}]}));
    }
    setModal(false);
  };
 
  const del = id => {
    const card = bc.find(c => c.id === id);
    if (card) addLog({ boardId, msg:`${card.assignee||"MA"} deleted '${card.title}'`, type:"delete" });
    setCards(p => ({...p,[boardId]:p[boardId].filter(c => c.id!==id)}));
  };
 
  const move = (id, dir) => {
    const card = bc.find(x => x.id === id);
    if (!card) return;
    const ni = COLS.indexOf(card.col) + dir;
    if (ni<0||ni>3) return;
    const newCol = COLS[ni];
    addLog({ boardId, msg:`${card.assignee||"MA"} moved '${card.title}' → ${newCol}`, type:"move" });
    setCards(p => ({...p,[boardId]:p[boardId].map(x => x.id===id?{...x,col:newCol}:x)}));
  };
 
  const onDragStart = id => { drag.current = id; };
  const onDrop = col => {
    if (!drag.current) return;
    const card = bc.find(x => x.id === drag.current);
    if (card && card.col !== col) addLog({ boardId, msg:`${card.assignee||"MA"} moved '${card.title}' → ${col}`, type:"move" });
    setCards(p => ({...p,[boardId]:p[boardId].map(c => c.id===drag.current?{...c,col}:c)}));
    drag.current = null;
  };
 
  const [lastSeen, setLastSeen] = useState(0);
  const unreadCount = logs.filter(l => l.boardId === boardId && l.ts > lastSeen).length;
 
  return (
    <div style={{ display:"flex", flexDirection:"column", flex:1, minHeight:0, overflow:"hidden" }}>
      {modal && (
        <Modal title={editId?"Edit Card":"Add Card"} onClose={() => setModal(false)} onSubmit={save} btnLabel={editId?"Save":"Add Card"} error={err}>
          <Fld label="Title"><input value={form.title} onChange={e=>sf("title",e.target.value)} placeholder="Card title" style={INP}/></Fld>
          <Fld label="Description"><textarea value={form.desc} onChange={e=>sf("desc",e.target.value)} placeholder="Brief description…" rows={3} style={{...INP,resize:"vertical"}}/></Fld>
          <div style={{display:"grid",gridTemplateColumns:gc,gap:12}}>
            <Fld label="Priority"><select value={form.priority} onChange={e=>sf("priority",e.target.value)} style={INP}>{["Low","Medium","High"].map(p=><option key={p}>{p}</option>)}</select></Fld>
            <Fld label="Due Date"><input type="date" value={form.due} onChange={e=>sf("due",e.target.value)} style={INP}/></Fld>
          </div>
          <div style={{display:"grid",gridTemplateColumns:gc,gap:12}}>
            <Fld label="Column"><select value={form.col} onChange={e=>sf("col",e.target.value)} style={INP}>{COLS.map(c=><option key={c}>{c}</option>)}</select></Fld>
            <Fld label="Assignee"><select value={form.assignee} onChange={e=>sf("assignee",e.target.value)} style={INP}><option value="">— None —</option>{team.map(t=><option key={t.id} value={t.initials}>{t.name}</option>)}</select></Fld>
          </div>
        </Modal>
      )}
 
      {/* Board Header */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding: isMobile?"12px 16px":"14px 28px", display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexShrink:0, flexWrap:"wrap", gap: isMobile?10:0 }}>
        <div>
          <h1 style={{ fontSize: isMobile?18:22, fontFamily:SR, fontWeight:600, color:C.text, margin:0 }}>{board?.name}</h1>
          <div style={{ fontSize:12, color:C.muted, fontFamily:SN, marginTop:3, display:"flex", alignItems:"center", gap:10 }}>
            <span>{bc.length} cards · {done} done</span>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:70,height:4,background:C.border,borderRadius:2,overflow:"hidden" }}>
                <div style={{ height:"100%",width:`${pct}%`,background:C.accent,borderRadius:2,transition:"width 0.4s" }}/>
              </div>
              <span style={{ color:C.accent,fontWeight:600,fontSize:12 }}>{pct}%</span>
            </div>
          </div>
        </div>
        <div style={{ display:"flex", gap:7, alignItems:"center", flexWrap:"wrap" }}>
          {["All","Low","Medium","High"].map(p => (
            <button key={p} onClick={() => setPrio(p)} style={{ padding:"5px 12px",borderRadius:20,fontSize:12,cursor:"pointer",fontFamily:SN,border:`1px solid ${prio===p?C.accent:C.border}`,background:prio===p?C.accent:"transparent",color:prio===p?"#fff":C.muted }}>{p}</button>
          ))}
          <Btn onClick={() => openAdd("To Do")}><Plus size={13}/> Add Card</Btn>
          {/* Activity Toggle */}
          <button onClick={() => { const next = !logOpen; setLogOpen(next); if (next) setLastSeen(Date.now()); }}
            style={{ padding:"6px 12px", borderRadius:9, fontSize:12, cursor:"pointer", fontFamily:SN, display:"flex", alignItems:"center", gap:5, border:`1px solid ${logOpen?C.accent:C.border}`, background:logOpen?`${C.accent}15`:"transparent", color:logOpen?C.accent:C.muted, fontWeight:logOpen?600:400, position:"relative" }}>
            <Clock size={13}/> Activity
            {!logOpen && unreadCount > 0 && <span style={{ position:"absolute",top:-6,right:-6,width:16,height:16,borderRadius:"50%",background:"#BE185D",color:"#fff",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:SN }}>{unreadCount > 99 ? "99" : unreadCount}</span>}
          </button>
        </div>
      </div>
 
      {/* Body: columns + desktop log panel */}
      <div style={{ display:"flex", flex:1, minHeight:0, overflow:"hidden" }}>
        <div style={{ flex:1, overflowX:"auto", overflowY:"auto", padding: isMobile?"14px":"22px 24px", display:"flex", gap:14, alignItems:"flex-start" }}>
          {COLS.map((col,i) => (
            <KCol key={col} col={col} colIdx={i} cards={shown.filter(c => c.col===col)}
              onAdd={openAdd} onEdit={openEdit} onDel={del} onMove={move}
              onDragStart={onDragStart} onDrop={onDrop} team={team}/>
          ))}
        </div>
        {/* Desktop Activity Panel */}
        {logOpen && !isMobile && <ActivityLogPanel logs={logs} boardId={boardId} onClose={() => setLogOpen(false)} isMobile={false}/>}
      </div>
 
      {/* Mobile Activity: backdrop + bottom sheet */}
      {logOpen && isMobile && (
        <>
          <div onClick={() => setLogOpen(false)} style={{ position:"fixed",inset:0,zIndex:200,background:"rgba(30,27,46,0.5)" }}/>
          <ActivityLogPanel logs={logs} boardId={boardId} onClose={() => setLogOpen(false)} isMobile={true}/>
        </>
      )}
    </div>
  );
}
 
/* ════════════════════════════════════════
   PAGE: DASHBOARD
════════════════════════════════════════ */
function DashboardPage({ cards, boards, team, onNav }) {
  const isMobile = useIsMobile();
  const all    = useMemo(() => Object.values(cards).flat(), [cards]);
  const done   = all.filter(c => c.col==="Done").length;
  const inProg = all.filter(c => c.col==="In Progress").length;
  const high   = all.filter(c => c.priority==="High" && c.col!=="Done").length;
  const byStatus = COLS.map(col => ({ name:col.split(" ")[0], count:all.filter(c=>c.col===col).length }));
  const PIE_C  = ["#9B8EC4","#8B5CF6","#EC4899","#059669"];
  const pad    = isMobile ? "20px 16px" : "28px 34px";
 
  return (
    <div style={{ padding:pad, overflowY:"auto", flex:1, minHeight:0, boxSizing:"border-box" }}>
      <PageHeader title="Dashboard" sub="Overview across all boards"/>
      <div style={{ display:"grid", gridTemplateColumns: isMobile?"1fr 1fr":"repeat(4,1fr)", gap:12, marginBottom:22 }}>
        <StatCard dark label="Total Tasks"   value={all.length} sub="All boards"/>
        <StatCard      label="Completed"     value={done}       sub="Done"/>
        <StatCard      label="In Progress"   value={inProg}     sub="Active"/>
        <StatCard      label="High Priority" value={high}       sub="Pending"/>
      </div>
      <div style={{ display:"grid", gridTemplateColumns: isMobile?"1fr":"1fr 1fr", gap:14, marginBottom:14 }}>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:"22px 24px" }}>
          <div style={{ fontSize:14, fontWeight:600, fontFamily:SN, color:C.text, marginBottom:18 }}>Tasks by Status</div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={byStatus} margin={{top:0,right:0,left:-20,bottom:0}}>
              <CartesianGrid stroke={C.border} strokeDasharray="4 4" vertical={false}/>
              <XAxis dataKey="name" tick={{fill:C.mutedL,fontSize:11,fontFamily:SN}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:C.mutedL,fontSize:11,fontFamily:SN}} axisLine={false} tickLine={false}/>
              <Tooltip content={<ChartTip/>}/>
              <Bar dataKey="count" name="Tasks" radius={[5,5,0,0]} barSize={40}>
                {byStatus.map((_,i) => <Cell key={i} fill={PIE_C[i]}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:"22px 24px" }}>
          <div style={{ fontSize:14, fontWeight:600, fontFamily:SN, color:C.text, marginBottom:16 }}>Studio Snapshot</div>
          {[
            `${done} of ${all.length} tasks completed across all boards`,
            `${inProg} tasks currently in progress`,
            `${high} high-priority tasks need attention`,
            `${boards.length} active boards · ${team.length} team members`,
          ].map((t,i) => (
            <div key={i} style={{ display:"flex", gap:12, paddingBottom:i<3?13:0, borderBottom:i<3?`1px solid ${C.bg}`:"none", marginBottom:i<3?13:0 }}>
              <span style={{ width:7,height:7,borderRadius:"50%",background:C.accent,flexShrink:0,marginTop:5,display:"inline-block" }}/>
              <div style={{ fontSize:13, color:C.text, fontFamily:SN, lineHeight:1.5 }}>{t}</div>
            </div>
          ))}
          <div style={{ marginTop:16, paddingTop:14, borderTop:`1px solid ${C.border}`, display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
            {team.map(t => (
              <div key={t.id} style={{ textAlign:"center" }}>
                <Avt initials={t.initials} color={t.color} size={32}/>
                <div style={{ fontSize:9, color:C.muted, fontFamily:SN, marginTop:3 }}>{t.initials}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:"22px 24px" }}>
        <div style={{ fontSize:14, fontWeight:600, fontFamily:SN, color:C.text, marginBottom:16 }}>Boards Progress</div>
        <div style={{ display:"grid", gridTemplateColumns: isMobile?"1fr 1fr":"repeat(4,1fr)", gap:12 }}>
          {boards.map(b => {
            const bc=(cards[b.id]||[]); const d=bc.filter(c=>c.col==="Done").length;
            const pct=bc.length>0?Math.round(d/bc.length*100):0;
            return (
              <div key={b.id} onClick={() => onNav(b.id)} style={{ padding:"14px 16px",background:C.bg,borderRadius:10,border:`1px solid ${C.border}`,cursor:"pointer",transition:"border-color 0.13s" }}
                onMouseEnter={e=>e.currentTarget.style.borderColor=C.accent} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                <div style={{ fontSize:13,fontWeight:600,fontFamily:SN,color:C.text,marginBottom:6 }}>{b.name}</div>
                <div style={{ fontSize:11,color:C.muted,fontFamily:SN,marginBottom:8 }}>{bc.length} tasks · {d} done</div>
                <div style={{ height:4,background:C.border,borderRadius:2,overflow:"hidden" }}>
                  <div style={{ height:"100%",width:`${pct}%`,background:C.accent,borderRadius:2 }}/>
                </div>
                <div style={{ fontSize:11,color:C.accent,fontWeight:600,fontFamily:SN,marginTop:4 }}>{pct}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
 
/* ════════════════════════════════════════
   PAGE: CALENDAR
════════════════════════════════════════ */
function CalendarPage({ cards }) {
  const isMobile = useIsMobile();
  const today = new Date();
  const [yr, setYr] = useState(today.getFullYear());
  const [mo, setMo] = useState(today.getMonth());
  const [sel, setSel] = useState(null);
  const all = useMemo(() => Object.values(cards).flat(), [cards]);
  const tasksByDay = useMemo(() => {
    const map = {};
    all.forEach(c => {
      if (!c.due) return;
      const day = parseDueDay(c.due, mo);
      if (!day || isNaN(day)) return;
      if (!map[day]) map[day] = [];
      map[day].push(c);
    });
    return map;
  }, [all, mo]);
  const daysInMonth = new Date(yr,mo+1,0).getDate();
  const firstDay    = new Date(yr,mo,1).getDay();
  const cells       = [...Array(firstDay).fill(null), ...Array.from({length:daysInMonth},(_,i)=>i+1)];
  const prev = () => { if(mo===0){setYr(y=>y-1);setMo(11);}else setMo(m=>m-1); setSel(null); };
  const next = () => { if(mo===11){setYr(y=>y+1);setMo(0);}else setMo(m=>m+1); setSel(null); };
  const pad  = isMobile ? "20px 16px" : "28px 34px";
 
  return (
    <div style={{ padding:pad, overflowY:"auto", flex:1, minHeight:0, boxSizing:"border-box" }}>
      <PageHeader title="Calendar" sub="Tasks scheduled by due date"/>
      <div style={{ display:"grid", gridTemplateColumns: isMobile?"1fr":"1fr 280px", gap:16 }}>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:"22px 24px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
            <div style={{ fontSize:18, fontFamily:SR, fontWeight:600, color:C.text }}>{MONTH_FULL[mo]} {yr}</div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={prev} style={{ background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"5px 9px",cursor:"pointer",color:C.muted,display:"flex",alignItems:"center" }}><ChevronLeft size={15}/></button>
              <button onClick={next} style={{ background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"5px 9px",cursor:"pointer",color:C.muted,display:"flex",alignItems:"center" }}><ChevronRight size={15}/></button>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, marginBottom:6 }}>
            {WEEKDAYS.map(d => <div key={d} style={{ fontSize:11,fontWeight:600,color:C.mutedL,fontFamily:SN,textAlign:"center",padding:"4px 0" }}>{d}</div>)}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 }}>
            {cells.map((day,i) => {
              if(!day) return <div key={`e${i}`}/>;
              const tasks=tasksByDay[day]||[]; const isToday=day===today.getDate()&&mo===today.getMonth()&&yr===today.getFullYear(); const isSel=sel===day;
              return (
                <div key={day} onClick={() => setSel(day===sel?null:day)}
                  style={{ minHeight: isMobile?38:54,padding:"6px 7px",borderRadius:9,cursor:"pointer",border:`1px solid ${isSel?C.accent:tasks.length?"rgba(139,92,246,0.25)":C.border}`,background:isSel?`${C.accent}12`:isToday?`${C.accent}08`:C.bg,transition:"all 0.12s" }}
                  onMouseEnter={e=>{ if(!isSel) e.currentTarget.style.borderColor=C.accent; }}
                  onMouseLeave={e=>{ if(!isSel) e.currentTarget.style.borderColor=tasks.length?"rgba(139,92,246,0.25)":C.border; }}>
                  <div style={{ fontSize:12,fontWeight:isToday||isSel?700:400,color:isToday?C.accent:C.text,fontFamily:SN,marginBottom: isMobile?0:4 }}>{day}</div>
                  {!isMobile && <div style={{ display:"flex",flexWrap:"wrap",gap:2 }}>
                    {tasks.slice(0,3).map(t=><span key={t.id} style={{ width:7,height:7,borderRadius:"50%",background:PCFG[t.priority]?.color,display:"inline-block" }}/>)}
                    {tasks.length>3 && <span style={{ fontSize:9,color:C.muted,fontFamily:SN }}>+{tasks.length-3}</span>}
                  </div>}
                  {isMobile && tasks.length>0 && <div style={{ width:5,height:5,borderRadius:"50%",background:C.accent,display:"inline-block" }}/>}
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:"22px 20px" }}>
          <div style={{ fontSize:14,fontWeight:600,fontFamily:SN,color:C.text,marginBottom:16 }}>{sel?`${MONTH_SHORT[mo]} ${sel} — Tasks`:"Select a date"}</div>
          {!sel && <div style={{ fontSize:12,color:C.muted,fontFamily:SN }}>Click on any date to see tasks due that day.</div>}
          {sel && (tasksByDay[sel]||[]).length===0 && <div style={{ fontSize:12,color:C.muted,fontFamily:SN }}>No tasks due on this day.</div>}
          {(tasksByDay[sel]||[]).map(t => (
            <div key={t.id} style={{ padding:"11px 13px",borderRadius:9,border:`1px solid ${C.border}`,background:C.bg,marginBottom:9 }}>
              <div style={{ fontSize:13,fontWeight:600,fontFamily:SN,color:C.text,marginBottom:6 }}>{t.title}</div>
              <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                <span style={{ padding:"2px 8px",borderRadius:9,fontSize:10,fontWeight:600,fontFamily:SN,background:PCFG[t.priority].bg,color:PCFG[t.priority].color }}>{t.priority}</span>
                <span style={{ padding:"2px 8px",borderRadius:9,fontSize:10,fontWeight:600,fontFamily:SN,background:COL_CFG[t.col].countBg,color:COL_CFG[t.col].countC }}>{t.col}</span>
              </div>
            </div>
          ))}
          <div style={{ marginTop:20,paddingTop:14,borderTop:`1px solid ${C.border}` }}>
            <div style={{ fontSize:10,color:C.mutedL,fontFamily:SN,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10 }}>Priority Legend</div>
            {Object.entries(PCFG).map(([p,cfg]) => (
              <div key={p} style={{ display:"flex",alignItems:"center",gap:8,marginBottom:7 }}>
                <span style={{ width:8,height:8,borderRadius:"50%",background:cfg.color,display:"inline-block" }}/>
                <span style={{ fontSize:12,color:C.muted,fontFamily:SN }}>{p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
 
/* ════════════════════════════════════════
   PAGE: TEAM
════════════════════════════════════════ */
function TeamPage({ team, setTeam, cards }) {
  const isMobile = useIsMobile();
  const [modal,setModal]=useState(false); const [err,setErr]=useState(""); const [form,setForm]=useState({name:"",role:"",initials:""});
  const sf = (k,v) => setForm(p=>({...p,[k]:v}));
  const all = useMemo(()=>Object.values(cards).flat(),[cards]);
  const add = () => {
    if(!form.name.trim()||!form.role.trim()){setErr("Name and role are required.");return;}
    const ini=form.initials.trim()||form.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
    setTeam(prev=>[...prev,{id:`TM${Date.now()}`,initials:ini,name:form.name.trim(),role:form.role.trim(),color:TEAM_COLORS[prev.length%TEAM_COLORS.length]}]);
    setForm({name:"",role:"",initials:""}); setErr(""); setModal(false);
  };
  const pad = isMobile?"20px 16px":"28px 34px";
  return (
    <div style={{ padding:pad,overflowY:"auto",flex:1,minHeight:0,boxSizing:"border-box" }}>
      {modal && <Modal title="Add Team Member" onClose={()=>setModal(false)} onSubmit={add} btnLabel="Add Member" error={err}>
        <Fld label="Full Name"><input value={form.name} onChange={e=>sf("name",e.target.value)} placeholder="e.g. Sara Khan" style={INP}/></Fld>
        <Fld label="Role"><input value={form.role} onChange={e=>sf("role",e.target.value)} placeholder="e.g. UI Designer" style={INP}/></Fld>
        <Fld label="Initials (optional)"><input value={form.initials} onChange={e=>sf("initials",e.target.value)} placeholder="e.g. SK" style={INP} maxLength={2}/></Fld>
      </Modal>}
      <PageHeader title="Team" sub={`${team.length} members`}><Btn onClick={()=>setModal(true)}><Plus size={13}/> Add Member</Btn></PageHeader>
      <div style={{ display:"grid", gridTemplateColumns: isMobile?"1fr":"1fr 1fr", gap:14 }}>
        {team.map(m => {
          const mine=all.filter(c=>c.assignee===m.initials); const done=mine.filter(c=>c.col==="Done").length;
          return (
            <div key={m.id} style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"22px 24px" }}>
              <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:16 }}>
                <div style={{ display:"flex",alignItems:"center",gap:14 }}>
                  <Avt initials={m.initials} color={m.color} size={46}/>
                  <div>
                    <div style={{ fontSize:15,fontWeight:600,fontFamily:SN,color:C.text }}>{m.name}</div>
                    <div style={{ fontSize:12,color:C.muted,fontFamily:SN,marginTop:2 }}>{m.role}</div>
                  </div>
                </div>
                {team.length>1 && <button onClick={()=>setTeam(p=>p.filter(t=>t.id!==m.id))} style={{ background:"none",border:"none",cursor:"pointer",color:C.mutedL,padding:4 }} onMouseEnter={e=>e.currentTarget.style.color="#BE185D"} onMouseLeave={e=>e.currentTarget.style.color=C.mutedL}><Trash2 size={14}/></button>}
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14 }}>
                {[["Total",mine.length],["Done",done],["Active",mine.length-done]].map(([l,v])=>(
                  <div key={l} style={{ textAlign:"center",padding:"8px 10px",background:C.bg,borderRadius:8 }}>
                    <div style={{ fontSize:20,fontWeight:600,fontFamily:SR,color:C.text }}>{v}</div>
                    <div style={{ fontSize:10,color:C.muted,fontFamily:SN,marginTop:1 }}>{l}</div>
                  </div>
                ))}
              </div>
              {mine.length>0 && <div>
                <div style={{ fontSize:10,color:C.mutedL,fontFamily:SN,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:8 }}>Tasks</div>
                {mine.slice(0,3).map(t=>(
                  <div key={t.id} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 10px",background:C.bg,borderRadius:7,marginBottom:5 }}>
                    <span style={{ fontSize:12,fontFamily:SN,color:C.text,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1,marginRight:8 }}>{t.title}</span>
                    <span style={{ padding:"1px 7px",borderRadius:9,fontSize:10,fontWeight:600,fontFamily:SN,background:COL_CFG[t.col].countBg,color:COL_CFG[t.col].countC,flexShrink:0 }}>{t.col.split(" ")[0]}</span>
                  </div>
                ))}
                {mine.length>3 && <div style={{ fontSize:11,color:C.muted,fontFamily:SN,marginTop:4 }}>+{mine.length-3} more tasks</div>}
              </div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
 
/* ════════════════════════════════════════
   PAGE: REPORTS
════════════════════════════════════════ */
function ReportsPage({ cards, boards }) {
  const isMobile  = useIsMobile();
  const all        = useMemo(()=>Object.values(cards).flat(),[cards]);
  const byStatus   = COLS.map(col=>({name:col.split(" ")[0],tasks:all.filter(c=>c.col===col).length}));
  const byPriority = ["High","Medium","Low"].map(p=>({name:p,value:all.filter(c=>c.priority===p).length}));
  const byBoard    = boards.map(b=>({name:b.name.split(" ")[0],total:(cards[b.id]||[]).length,done:(cards[b.id]||[]).filter(c=>c.col==="Done").length}));
  const SCOL=["#9B8EC4","#8B5CF6","#EC4899","#059669"]; const PCOL=["#BE185D","#6D28D9","#0369A1"];
  const rate=all.length>0?Math.round(all.filter(c=>c.col==="Done").length/all.length*100):0;
  const pad=isMobile?"20px 16px":"28px 34px";
  return (
    <div style={{ padding:pad,overflowY:"auto",flex:1,minHeight:0,boxSizing:"border-box" }}>
      <PageHeader title="Reports" sub="Analytics across all boards"/>
      <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)",gap:12,marginBottom:22 }}>
        <StatCard dark label="Total Tasks"     value={all.length} sub="All boards"/>
        <StatCard      label="Completion Rate" value={`${rate}%`} sub="Tasks done"/>
        <StatCard      label="High Priority"   value={all.filter(c=>c.priority==="High"&&c.col!=="Done").length} sub="Unresolved"/>
        <StatCard      label="Active Boards"   value={boards.length} sub="Total"/>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:14,marginBottom:14 }}>
        <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"22px 24px" }}>
          <div style={{ fontSize:14,fontWeight:600,fontFamily:SN,color:C.text,marginBottom:18 }}>Tasks by Status</div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={byStatus} margin={{top:0,right:0,left:-20,bottom:0}}>
              <CartesianGrid stroke={C.border} strokeDasharray="4 4" vertical={false}/>
              <XAxis dataKey="name" tick={{fill:C.mutedL,fontSize:11,fontFamily:SN}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:C.mutedL,fontSize:11,fontFamily:SN}} axisLine={false} tickLine={false}/>
              <Tooltip content={<ChartTip/>}/>
              <Bar dataKey="tasks" name="Tasks" radius={[5,5,0,0]} barSize={42}>{byStatus.map((_,i)=><Cell key={i} fill={SCOL[i]}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"22px 24px" }}>
          <div style={{ fontSize:14,fontWeight:600,fontFamily:SN,color:C.text,marginBottom:18 }}>Priority Breakdown</div>
          <ResponsiveContainer width="100%" height={145}>
            <PieChart>
              <Pie data={byPriority} cx="50%" cy="50%" innerRadius={44} outerRadius={68} paddingAngle={2} dataKey="value">
                {byPriority.map((_,i)=><Cell key={i} fill={PCOL[i]} stroke="none"/>)}
              </Pie>
              <Tooltip formatter={v=>`${v} tasks`} contentStyle={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,fontFamily:SN,fontSize:12}}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:"flex",justifyContent:"center",gap:16,marginTop:8,flexWrap:"wrap" }}>
            {byPriority.map((p,i)=>(<div key={p.name} style={{ display:"flex",alignItems:"center",gap:6 }}><span style={{ width:8,height:8,borderRadius:"50%",background:PCOL[i],display:"inline-block" }}/><span style={{ fontSize:12,color:C.muted,fontFamily:SN }}>{p.name} ({p.value})</span></div>))}
          </div>
        </div>
      </div>
      <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"22px 24px" }}>
        <div style={{ fontSize:14,fontWeight:600,fontFamily:SN,color:C.text,marginBottom:18 }}>Board Performance</div>
        <ResponsiveContainer width="100%" height={175}>
          <BarChart data={byBoard} margin={{top:0,right:0,left:-20,bottom:0}}>
            <CartesianGrid stroke={C.border} strokeDasharray="4 4" vertical={false}/>
            <XAxis dataKey="name" tick={{fill:C.mutedL,fontSize:11,fontFamily:SN}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:C.mutedL,fontSize:11,fontFamily:SN}} axisLine={false} tickLine={false}/>
            <Tooltip content={<ChartTip/>}/>
            <Bar dataKey="total" name="Total" fill={`${C.accent}45`} radius={[4,4,0,0]} barSize={26}/>
            <Bar dataKey="done"  name="Done"  fill={C.accent}        radius={[4,4,0,0]} barSize={26}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
 
/* ════════════════════════════════════════
   PAGE: SETTINGS
════════════════════════════════════════ */
function SettingsPage({ cards, setCards }) {
  const isMobile=useIsMobile();
  const [profile,setProfile]=useState({name:"Mubbshra Akram",role:"Full-Stack Developer",email:"mubbshra@studio.com"});
  const [notifs,setNotifs]=useState({email:true,push:true,weekly:false});
  const [saved,setSaved]=useState(false);
  const save=()=>{setSaved(true);setTimeout(()=>setSaved(false),2000);};
  const clearDone=()=>setCards(prev=>{const u={};Object.keys(prev).forEach(bid=>{u[bid]=prev[bid].filter(c=>c.col!=="Done");});return u;});
  const pad=isMobile?"20px 16px":"28px 34px";
  return (
    <div style={{ padding:pad,overflowY:"auto",flex:1,minHeight:0,boxSizing:"border-box" }}>
      <PageHeader title="Settings" sub="Manage your preferences"/>
      <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:16 }}>
        <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"22px 24px" }}>
          <div style={{ fontSize:15,fontWeight:600,fontFamily:SN,color:C.text,marginBottom:4 }}>Profile</div>
          <div style={{ fontSize:12,color:C.muted,fontFamily:SN,marginBottom:18 }}>Your personal information</div>
          <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:20,padding:"14px 16px",background:C.bg,borderRadius:10 }}>
            <Avt initials="MA" color={C.accent} size={46}/>
            <div><div style={{ fontSize:15,fontWeight:600,fontFamily:SN,color:C.text }}>{profile.name}</div><div style={{ fontSize:12,color:C.muted,fontFamily:SN }}>{profile.role}</div></div>
          </div>
          {[["Name","name"],["Role","role"],["Email","email"]].map(([l,k])=>(
            <Fld key={k} label={l}><input value={profile[k]} onChange={e=>setProfile(p=>({...p,[k]:e.target.value}))} style={INP}/></Fld>
          ))}
          <Btn onClick={save}>{saved?"✓ Saved!":"Save Changes"}</Btn>
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"22px 24px" }}>
            <div style={{ fontSize:15,fontWeight:600,fontFamily:SN,color:C.text,marginBottom:4 }}>Notifications</div>
            <div style={{ fontSize:12,color:C.muted,fontFamily:SN,marginBottom:6 }}>Manage how you receive updates</div>
            {[["Email notifications","email","Task updates via email"],["Push notifications","push","Browser push alerts"],["Weekly digest","weekly","Summary every Monday"]].map(([label,key,sub])=>(
              <div key={key} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 0",borderBottom:`1px solid ${C.border}` }}>
                <div><div style={{ fontSize:13,fontWeight:500,fontFamily:SN,color:C.text }}>{label}</div><div style={{ fontSize:11,color:C.muted,fontFamily:SN,marginTop:2 }}>{sub}</div></div>
                <Toggle checked={notifs[key]} onChange={v=>setNotifs(p=>({...p,[key]:v}))}/>
              </div>
            ))}
          </div>
          <div style={{ background:C.surface,border:"1px solid #FBCFE8",borderRadius:12,padding:"22px 24px" }}>
            <div style={{ fontSize:15,fontWeight:600,fontFamily:SN,color:"#BE185D",marginBottom:4 }}>Danger Zone</div>
            <div style={{ fontSize:12,color:C.muted,fontFamily:SN,marginBottom:16 }}>These actions cannot be undone</div>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",background:"#FDF2F8",borderRadius:9,flexWrap:"wrap",gap:10 }}>
              <div><div style={{ fontSize:13,fontWeight:500,fontFamily:SN,color:C.text }}>Clear completed tasks</div><div style={{ fontSize:11,color:C.muted,fontFamily:SN,marginTop:2 }}>Remove all "Done" cards from every board</div></div>
              <Btn onClick={clearDone} variant="danger">Clear Done</Btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
 
/* ════════════════════════════════════════
   MOBILE TOP BAR
════════════════════════════════════════ */
function MobileBar({ onMenuOpen, title }) {
  return (
    <div style={{ display:"flex",alignItems:"center",gap:12,padding:"0 16px",height:52,background:C.navy,borderBottom:"1px solid rgba(255,255,255,0.08)",flexShrink:0,zIndex:10 }}>
      <button onClick={onMenuOpen} style={{ background:"none",border:"none",cursor:"pointer",color:"#EDE8F8",display:"flex",alignItems:"center",padding:4,lineHeight:1 }}><Menu size={20}/></button>
      <span style={{ fontSize:16,fontFamily:SR,fontWeight:600,color:"#EDE8F8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{title}</span>
    </div>
  );
}
 
/* ════════════════════════════════════════
   SIDEBAR
════════════════════════════════════════ */
function Sidebar({ active, onNav, boards, cats, setCats, isMobile, sidebarOpen, onClose }) {
  const toggle = id => setCats(prev => prev.map(c => c.id===id?{...c,expanded:!c.expanded}:c));
  const cs = isMobile
    ? { position:"fixed",top:0,left:0,bottom:0,zIndex:100,width:228,transform:sidebarOpen?"translateX(0)":"translateX(-100%)",transition:"transform 0.25s cubic-bezier(0.25,0.46,0.45,0.94)" }
    : { width:228,flexShrink:0,position:"sticky",top:0 };
  return (
    <div style={{ ...cs,background:C.navy,height:"100vh",display:"flex",flexDirection:"column",borderRight:"1px solid rgba(255,255,255,0.05)" }}>
      {/* Brand */}
      <div style={{ padding:"22px 18px 18px",borderBottom:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",gap:10 }}>
        <div style={{ width:34,height:34,borderRadius:9,background:C.accent,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><Layout size={16} color="#fff"/></div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:17,fontFamily:SR,fontWeight:600,color:"#EDE8F8",lineHeight:1.2 }}>TaskFlow</div>
          <div style={{ fontSize:10,color:"rgba(167,139,250,0.6)",marginTop:1,letterSpacing:"0.06em" }}>Project Manager</div>
        </div>
        {isMobile && <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:C.navText,padding:4,lineHeight:1,flexShrink:0 }}><X size={18}/></button>}
      </div>
      <div style={{ flex:1,overflowY:"auto",padding:"12px 10px" }}>
        <div style={{ fontSize:9,letterSpacing:"0.12em",textTransform:"uppercase",color:"rgba(155,142,196,0.38)",fontFamily:SN,padding:"4px 12px",marginBottom:8 }}>Workspaces</div>
        {cats.map(cat => (
          <div key={cat.id} style={{ marginBottom:4 }}>
            <button onClick={() => toggle(cat.id)} style={{ width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 12px",borderRadius:8,background:"transparent",border:"none",color:C.navText,fontSize:12,fontFamily:SN,cursor:"pointer" }}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <span style={{ fontWeight:600,letterSpacing:"0.03em" }}>{cat.name}</span>
              <ChevronDown size={13} style={{ transform:cat.expanded?"rotate(0deg)":"rotate(-90deg)",transition:"transform 0.2s",flexShrink:0 }}/>
            </button>
            {cat.expanded && (
              <div style={{ paddingLeft:8 }}>
                {boards.filter(b=>b.catId===cat.id).map(b => {
                  const a=active===b.id;
                  return (
                    <button key={b.id} onClick={() => onNav(b.id)} style={{ width:"100%",display:"flex",alignItems:"center",gap:8,padding:"7px 12px",borderRadius:8,marginBottom:2,cursor:"pointer",textAlign:"left",background:a?C.accent:"transparent",border:"none",color:a?"#fff":C.navText,fontSize:12,fontFamily:SN,transition:"background 0.12s" }}
                      onMouseEnter={e=>{ if(!a) e.currentTarget.style.background="rgba(255,255,255,0.06)"; }} onMouseLeave={e=>{ if(!a) e.currentTarget.style.background="transparent"; }}>
                      <Circle size={5} fill={a?"#fff":C.navText} color={a?"#fff":C.navText} style={{ flexShrink:0 }}/>
                      <span style={{ overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{b.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
        <div style={{ margin:"12px 10px",height:1,background:"rgba(255,255,255,0.07)" }}/>
        <div style={{ fontSize:9,letterSpacing:"0.12em",textTransform:"uppercase",color:"rgba(155,142,196,0.38)",fontFamily:SN,padding:"4px 12px",marginBottom:8 }}>Navigation</div>
        {NAV_PAGES.map(({ id, label, Icon }) => {
          const a=active===id;
          return (
            <button key={id} onClick={() => onNav(id)} style={{ width:"100%",display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:9,marginBottom:3,cursor:"pointer",textAlign:"left",background:a?C.accent:"transparent",border:"none",color:a?"#fff":C.navText,fontSize:13,fontFamily:SN,transition:"background 0.13s" }}
              onMouseEnter={e=>{ if(!a) e.currentTarget.style.background="rgba(255,255,255,0.06)"; }} onMouseLeave={e=>{ if(!a) e.currentTarget.style.background="transparent"; }}>
              <Icon size={15} color={a?"#fff":C.navText} strokeWidth={a?2:1.5}/>{label}
            </button>
          );
        })}
      </div>
      <div style={{ padding:"12px 18px",borderTop:"1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ fontSize:10,color:"rgba(155,142,196,0.25)",fontFamily:SN }}>TaskFlow v2.0</div>
      </div>
    </div>
  );
}
 
/* ════════════════════════════════════════
   ROOT APP
════════════════════════════════════════ */
export default function App() {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState("dashboard");
  const [boards, setBoards] = useState(() => loadLS("tf_boards", INIT_BOARDS));
  const [cards,  setCards]  = useState(() => loadLS("tf_cards",  INIT_CARDS));
  const [team,   setTeam]   = useState(() => loadLS("tf_team",   INIT_TEAM));
  const [cats,   setCats]   = useState(() => loadLS("tf_cats",   INIT_CATS));
  const [logs,   setLogs]   = useState(() => loadLS("tf_logs",   []));
 
  useEffect(() => { saveLS("tf_boards", boards); }, [boards]);
  useEffect(() => { saveLS("tf_cards",  cards);  }, [cards]);
  useEffect(() => { saveLS("tf_team",   team);   }, [team]);
  useEffect(() => { saveLS("tf_cats",   cats);   }, [cats]);
  useEffect(() => { saveLS("tf_logs",   logs);   }, [logs]);
 
  const addLog = ({ boardId, msg, type }) => {
    setLogs(prev => [{ id:Date.now()+Math.random(), ts:Date.now(), boardId, msg, type, time:logTime() }, ...prev].slice(0, 300));
  };
 
  const navTo    = p => { setActive(p); if(isMobile) setSidebarOpen(false); };
  const isPage   = NAV_PAGES.some(p => p.id === active);
  const pageTitle= isPage ? NAV_PAGES.find(p=>p.id===active)?.label : boards.find(b=>b.id===active)?.name || "Board";
 
  return (
    <div style={{ display:"flex",minHeight:"100vh",background:C.bg,fontFamily:SN,color:C.text }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet"/>
 
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position:"fixed",inset:0,background:"rgba(30,27,46,0.6)",zIndex:90 }}/>
      )}
 
      <Sidebar active={active} onNav={navTo} boards={boards} cats={cats} setCats={setCats} isMobile={isMobile} sidebarOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}/>
 
      <main style={{ flex:1,overflow:"hidden",display:"flex",flexDirection:"column" }}>
        {isMobile && <MobileBar onMenuOpen={() => setSidebarOpen(true)} title={pageTitle}/>}
        <div style={{ flex:1,minHeight:0,overflow:"hidden",display:"flex",flexDirection:"column" }}>
          {isPage ? (
            <>
              {active==="dashboard" && <DashboardPage cards={cards} boards={boards} team={team} onNav={navTo}/>}
              {active==="calendar"  && <CalendarPage  cards={cards}/>}
              {active==="team"      && <TeamPage      team={team} setTeam={setTeam} cards={cards}/>}
              {active==="reports"   && <ReportsPage   cards={cards} boards={boards}/>}
              {active==="settings"  && <SettingsPage  cards={cards} setCards={setCards}/>}
            </>
          ) : (
            <BoardPage boardId={active} boards={boards} cards={cards} setCards={setCards} team={team} logs={logs} addLog={addLog}/>
          )}
        </div>
      </main>
    </div>
  );
}
 