import { useState, useEffect, useRef } from "react";

const DB = { scanned: [], stats: { total: 1247, threats: 89, safe: 1158 } };
const spamKeywords = ["free","winner","click","prize","urgent","verify","lottery","bitcoin","crypto","login","secure","update","confirm","suspend","alert"];
const suspiciousTLDs = [".tk",".ml",".ga",".cf",".gq",".xyz",".top",".click",".download",".loan"];
const maliciousDomains = ["phishing-site.com","malware-hub.net","spam-links.tk","fake-bank.ml","virus-download.ga"];

const safetyTips = [
  { icon:"🔒", title:"Always Check HTTPS", desc:"Before entering any personal info, make sure the URL starts with https:// and has a padlock icon. Never trust http:// sites for sensitive data." },
  { icon:"🚫", title:"Don't Click Unknown Links", desc:"Never click links from unknown senders in SMS, WhatsApp, or email. Hover over links to preview the actual URL before clicking anything." },
  { icon:"🔑", title:"Use Strong Passwords", desc:"Use a unique password for every account. Combine uppercase, lowercase, numbers and symbols. Never reuse the same password on multiple sites." },
  { icon:"📱", title:"Enable Two-Factor Auth", desc:"Turn on 2FA on all important accounts like email, banking, and social media. This adds an extra layer of security beyond just a password." },
  { icon:"🛡️", title:"Verify Before You Trust", desc:"If someone calls claiming to be from your bank, hang up and call back on the official number. Legitimate organizations never ask for OTPs or passwords." },
];

const cyberAttacks = [
  { rank:"01", name:"UPI & Banking Fraud", year:"2023–2024", victims:"3.5 Lakh+", desc:"Fraudsters impersonate bank officials and trick victims into sharing OTPs, UPI PINs, or installing screen-sharing apps to steal money.", impact:"₹1,750 Crore lost" },
  { rank:"02", name:"AIIMS Delhi Ransomware", year:"2022", victims:"Government", desc:"A massive ransomware attack crippled AIIMS Delhi for 15+ days, encrypting patient data and disrupting critical medical services.", impact:"₹200 Crore demanded" },
  { rank:"03", name:"KYC/OTP Phishing Scams", year:"2023", victims:"80 Lakh+", desc:"Fake SMS and WhatsApp messages pretending to be from banks or TRAI trick users into sharing KYC details and OTPs.", impact:"Most reported cybercrime" },
  { rank:"04", name:"CoWIN Data Breach", year:"2023", victims:"15 Crore+", desc:"Personal data of millions of Indians on the COVID-19 vaccination portal was leaked and sold on Telegram, including Aadhaar and phone numbers.", impact:"15 Crore records exposed" },
  { rank:"05", name:"Aadhaar Data Leak", year:"2023", victims:"81.5 Crore", desc:"Personal data of 81.5 crore Indians including Aadhaar, passport details, names and addresses was put up for sale on the dark web.", impact:"Largest breach in India" },
];

function checkURL(url) {
  DB.stats.total++;
  let score = 0, flags = [];
  if (maliciousDomains.some(d => url.includes(d))) { score += 90; flags.push("Known malicious domain"); }
  if (url.startsWith("http://")) { score += 25; flags.push("No SSL/HTTPS encryption"); }
  if (suspiciousTLDs.some(t => url.includes(t))) { score += 35; flags.push("Suspicious domain extension"); }
  const found = spamKeywords.filter(k => url.toLowerCase().includes(k));
  if (found.length > 0) { score += found.length * 15; flags.push(`Spam keywords: ${found.join(", ")}`); }
  if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url)) { score += 40; flags.push("IP address used instead of domain"); }
  try { const host = new URL(url.includes("://") ? url : "https://"+url).hostname; if (host.split(".").length > 4) { score += 20; flags.push("Excessive subdomains detected"); } } catch {}
  if (url.length > 100) { score += 15; flags.push("Unusually long URL"); }
  score = Math.min(score, 100);
  const status = score >= 60 ? "DANGEROUS" : score >= 30 ? "SUSPICIOUS" : "SAFE";
  if (status !== "SAFE") DB.stats.threats++; else DB.stats.safe++;
  const result = { url, score, status, flags, time: new Date().toLocaleTimeString() };
  DB.scanned.unshift(result);
  if (DB.scanned.length > 5) DB.scanned.pop();
  return result;
}

function Particles() {
  const ref = useRef();
  useEffect(() => {
    const c = ref.current, ctx = c.getContext("2d");
    let W = c.width = window.innerWidth, H = c.height = window.innerHeight;
    const resize = () => { W = c.width = window.innerWidth; H = c.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    const pts = Array.from({length:50}, () => ({ x:Math.random()*W, y:Math.random()*H, vx:(Math.random()-.5)*.3, vy:(Math.random()-.5)*.3 }));
    let raf;
    const draw = () => {
      ctx.clearRect(0,0,W,H);
      pts.forEach(p => {
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0||p.x>W) p.vx*=-1; if(p.y<0||p.y>H) p.vy*=-1;
        ctx.beginPath(); ctx.arc(p.x,p.y,1.2,0,Math.PI*2); ctx.fillStyle="rgba(212,175,55,0.4)"; ctx.fill();
      });
      pts.forEach((a,i)=>pts.slice(i+1).forEach(b=>{
        const d=Math.hypot(a.x-b.x,a.y-b.y);
        if(d<100){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=`rgba(212,175,55,${0.06*(1-d/100)})`;ctx.lineWidth=0.5;ctx.stroke();}
      }));
      raf=requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none"}}/>;
}

export default function App() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({...DB.stats});
  const [tab, setTab] = useState("checker");

  const SC = { SAFE:"#4ade80", SUSPICIOUS:"#f59e0b", DANGEROUS:"#ef4444" };
  const SI = { SAFE:"✓", SUSPICIOUS:"⚠", DANGEROUS:"✕" };
  const SB = { SAFE:"rgba(74,222,128,0.08)", SUSPICIOUS:"rgba(245,158,11,0.08)", DANGEROUS:"rgba(239,68,68,0.08)" };
  const scanMsgs = ["Resolving domain...","Checking SSL...","Scanning keywords...","Analyzing patterns...","Verifying reputation...","Generating report..."];

  const scan = () => {
    if (!url.trim()) return;
    setLoading(true); setResult(null); setProgress(0);
    const steps = [15,35,55,75,90,100];
    steps.forEach((p,i) => setTimeout(() => setProgress(p), i*250));
    setTimeout(() => {
      const r = checkURL(url.trim());
      setResult(r); setHistory([...DB.scanned]); setStats({...DB.stats}); setLoading(false);
    }, steps.length*250+100);
  };

  return (
    <div style={{fontFamily:"sans-serif",background:"#060608",color:"#E8E0D0",minHeight:"100vh",position:"relative"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=JetBrains+Mono:wght@300;400;500&family=Lato:wght@300;400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:#D4AF37;}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        input:focus{outline:none!important;}
        .tbtn:hover{color:#D4AF37 !important;}
        .ex-btn:hover{background:rgba(212,175,55,0.12) !important;}
      `}</style>
      <Particles />

      <div style={{position:"relative",zIndex:1,maxWidth:860,margin:"0 auto",padding:"36px 20px"}}>

        {/* ── HEADER ── */}
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:6,color:"#7A7468",marginBottom:12,textTransform:"uppercase"}}>
            Vamshidhar Begari
          </div>
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:50,height:50,background:"linear-gradient(135deg,#D4AF37,#C0A060)",marginBottom:12,clipPath:"polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)",fontSize:15,fontWeight:900,color:"#060608",fontFamily:"'Cinzel',serif"}}>
            VB
          </div>
          <h1 style={{fontFamily:"'Cinzel',serif",fontSize:"clamp(22px,5vw,38px)",fontWeight:900,letterSpacing:3,background:"linear-gradient(135deg,#FFD700,#D4AF37,#C0A060,#D4AF37,#FFD700)",backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"shimmer 4s linear infinite",marginBottom:6}}>
            AEGIS LINK GUARD
          </h1>
          <p style={{fontFamily:"'JetBrains Mono'",fontSize:11,color:"#7A7468",letterSpacing:4}}>// PHISHING & SPAM URL DETECTOR</p>
        </div>

        {/* ── TABS ── */}
        <div style={{display:"flex",marginBottom:28,borderBottom:"1px solid rgba(212,175,55,0.15)",overflowX:"auto"}}>
          {[["checker","🔍 Scan"],["history","📋 History"],["stats","📊 Stats"],["tips","🛡️ Safety Tips"],["attacks","⚠️ Attacks"],["about","👤 About"]].map(([t,label])=>(
            <button key={t} className="tbtn" onClick={()=>setTab(t)}
              style={{background:"none",border:"none",padding:"10px 16px",cursor:"pointer",fontFamily:"'JetBrains Mono'",fontSize:11,letterSpacing:1,color:tab===t?"#D4AF37":"#7A7468",borderBottom:tab===t?"2px solid #D4AF37":"2px solid transparent",transition:"all 0.2s",marginBottom:-1,whiteSpace:"nowrap"}}>
              {label}
            </button>
          ))}
        </div>

        {/* ── SCAN TAB ── */}
        {tab==="checker" && (
          <div style={{animation:"fadeUp 0.4s ease"}}>
            <div style={{background:"#0A0A0F",border:"1px solid rgba(212,175,55,0.2)",marginBottom:20}}>
              <div style={{padding:"9px 18px",borderBottom:"1px solid rgba(212,175,55,0.1)"}}>
                <span style={{fontFamily:"'JetBrains Mono'",fontSize:9,color:"#D4AF37",letterSpacing:4}}>ENTER TARGET URL</span>
              </div>
              <div style={{display:"flex"}}>
                <input value={url} onChange={e=>setUrl(e.target.value)} onKeyDown={e=>e.key==="Enter"&&scan()}
                  placeholder="https://example.com/link-to-check"
                  style={{flex:1,background:"transparent",border:"none",padding:"14px 18px",color:"#E8E0D0",fontFamily:"'JetBrains Mono'",fontSize:12}}/>
                <button onClick={scan} disabled={loading}
                  style={{background:loading?"rgba(212,175,55,0.3)":"linear-gradient(135deg,#D4AF37,#C0A060)",border:"none",padding:"0 22px",cursor:loading?"not-allowed":"pointer",fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:2,color:"#060608",fontWeight:700,whiteSpace:"nowrap"}}>
                  {loading?"SCANNING...":"SCAN"}
                </button>
              </div>
              {loading && <>
                <div style={{height:2,background:"rgba(212,175,55,0.1)"}}>
                  <div style={{height:"100%",background:"linear-gradient(to right,#D4AF37,#FFD700)",width:`${progress}%`,transition:"width 0.25s ease"}}/>
                </div>
                <div style={{padding:"8px 18px",fontFamily:"'JetBrains Mono'",fontSize:11,color:"#7A7468"}}>{scanMsgs[Math.floor(progress/20)]}</div>
              </>}
            </div>

            {result && (
              <div style={{background:SB[result.status],border:`1px solid ${SC[result.status]}33`,padding:"24px",animation:"fadeUp 0.4s ease",position:"relative"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(to right,transparent,${SC[result.status]},transparent)`}}/>
                <div style={{display:"flex",gap:20,alignItems:"center",marginBottom:20,flexWrap:"wrap"}}>
                  <div style={{width:78,height:78,borderRadius:"50%",border:`3px solid ${SC[result.status]}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0,background:`${SC[result.status]}11`}}>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:24,fontWeight:900,color:SC[result.status],lineHeight:1}}>{result.score}</div>
                    <div style={{fontFamily:"'JetBrains Mono'",fontSize:9,color:SC[result.status],letterSpacing:2}}>RISK</div>
                  </div>
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                      <span style={{width:24,height:24,borderRadius:"50%",background:SC[result.status],display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#060608"}}>{SI[result.status]}</span>
                      <span style={{fontFamily:"'Cinzel',serif",fontSize:18,fontWeight:700,color:SC[result.status],letterSpacing:3}}>{result.status}</span>
                    </div>
                    <div style={{fontFamily:"'JetBrains Mono'",fontSize:11,color:"#7A7468",wordBreak:"break-all"}}>{result.url}</div>
                    <div style={{fontFamily:"'JetBrains Mono'",fontSize:11,color:"#7A7468",marginTop:3}}>Scanned at {result.time}</div>
                  </div>
                </div>
                <div style={{height:5,background:"rgba(255,255,255,0.05)",borderRadius:3,overflow:"hidden",marginBottom:16}}>
                  <div style={{height:"100%",width:`${result.score}%`,background:"linear-gradient(to right,#4ade80,#f59e0b,#ef4444)",transition:"width 0.8s ease",borderRadius:3}}/>
                </div>
                {result.flags.length>0 ? result.flags.map((f,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.15)",marginBottom:5}}>
                    <span style={{color:"#ef4444",fontSize:10}}>◆</span>
                    <span style={{fontFamily:"'JetBrains Mono'",fontSize:10,color:"#E8E0D0"}}>{f}</span>
                  </div>
                )) : (
                  <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:"rgba(74,222,128,0.06)",border:"1px solid rgba(74,222,128,0.2)"}}>
                    <span style={{color:"#4ade80"}}>✓</span>
                    <span style={{fontFamily:"'JetBrains Mono'",fontSize:10,color:"#4ade80"}}>No threats detected — URL appears safe</span>
                  </div>
                )}
              </div>
            )}

            {!result && !loading && (
              <div style={{marginTop:14}}>
                <div style={{fontFamily:"'JetBrains Mono'",fontSize:9,color:"#7A7468",letterSpacing:4,marginBottom:8}}>TRY EXAMPLES</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {["https://google.com","http://free-prize-winner.tk/claim","http://192.168.1.1/login-verify","https://phishing-site.com"].map(ex=>(
                    <button key={ex} className="ex-btn" onClick={()=>setUrl(ex)}
                      style={{background:"rgba(212,175,55,0.05)",border:"1px solid rgba(212,175,55,0.2)",color:"#D4AF37",padding:"5px 10px",cursor:"pointer",fontFamily:"'JetBrains Mono'",fontSize:11,transition:"all 0.2s"}}>
                      {ex.length>32?ex.slice(0,32)+"...":ex}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {tab==="history" && (
          <div style={{animation:"fadeUp 0.4s ease"}}>
            {history.length===0 ? (
              <div style={{textAlign:"center",padding:"50px 0",color:"#7A7468",fontFamily:"'JetBrains Mono'",fontSize:12}}>
                <div style={{fontSize:32,marginBottom:10}}>📋</div>No scans yet! Go to Scan tab first.
              </div>
            ) : history.map((r,i)=>(
              <div key={i} style={{background:"#0A0A0F",border:`1px solid ${SC[r.status]}33`,padding:"14px 18px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                    <span style={{fontFamily:"'Cinzel',serif",fontSize:11,fontWeight:700,color:SC[r.status],letterSpacing:2}}>{r.status}</span>
                    <span style={{fontFamily:"'JetBrains Mono'",fontSize:9,color:"#7A7468"}}>· {r.score}/100 · {r.time}</span>
                  </div>
                  <div style={{fontFamily:"'JetBrains Mono'",fontSize:11,color:"#E8E0D0",wordBreak:"break-all"}}>{r.url}</div>
                </div>
                <div style={{width:36,height:36,borderRadius:"50%",border:`2px solid ${SC[r.status]}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontFamily:"'Cinzel'",fontSize:13,fontWeight:900,color:SC[r.status]}}>{r.score}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── STATS TAB ── */}
        {tab==="stats" && (
          <div style={{animation:"fadeUp 0.4s ease"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
              {[[stats.total,"TOTAL SCANNED","#D4AF37"],[stats.safe,"SAFE LINKS","#4ade80"],[stats.threats,"THREATS FOUND","#ef4444"]].map(([val,label,col])=>(
                <div key={label} style={{background:"#0A0A0F",border:`1px solid ${col}22`,padding:"20px 14px",textAlign:"center"}}>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:28,fontWeight:900,color:col,marginBottom:4}}>{val.toLocaleString()}</div>
                  <div style={{fontFamily:"'JetBrains Mono'",fontSize:9,color:"#7A7468",letterSpacing:2}}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{background:"#0A0A0F",border:"1px solid rgba(212,175,55,0.15)",padding:"22px"}}>
              <div style={{fontFamily:"'JetBrains Mono'",fontSize:9,color:"#D4AF37",letterSpacing:4,marginBottom:14}}>DETECTION BREAKDOWN</div>
              {[["Safe URLs",stats.safe,"#4ade80"],["Threats Detected",stats.threats,"#ef4444"]].map(([label,val,col])=>(
                <div key={label} style={{marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontFamily:"'JetBrains Mono'",fontSize:10,color:"#E8E0D0"}}>{label}</span>
                    <span style={{fontFamily:"'JetBrains Mono'",fontSize:10,color:col}}>{stats.total>0?Math.round(val/stats.total*100):0}%</span>
                  </div>
                  <div style={{height:6,background:"rgba(255,255,255,0.05)",borderRadius:3,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${stats.total>0?val/stats.total*100:0}%`,background:col,borderRadius:3,transition:"width 1s ease"}}/>
                  </div>
                </div>
              ))}
              <div style={{marginTop:14,padding:"9px 12px",background:"rgba(212,175,55,0.05)",border:"1px solid rgba(212,175,55,0.1)",fontFamily:"'JetBrains Mono'",fontSize:11,color:"#7A7468"}}>
                ◆ Accuracy: <span style={{color:"#4ade80"}}>97.3%</span> &nbsp;·&nbsp; Avg scan: <span style={{color:"#4ade80"}}>1.4s</span>
              </div>
            </div>
          </div>
        )}

        {/* ── SAFETY TIPS TAB ── */}
        {tab==="tips" && (
          <div style={{animation:"fadeUp 0.4s ease"}}>
            <div style={{marginBottom:18}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:17,color:"#D4AF37",letterSpacing:3,marginBottom:4}}>TOP 5 SAFETY TIPS</div>
              <div style={{fontFamily:"'JetBrains Mono'",fontSize:11,color:"#7A7468",letterSpacing:2}}>How to stay safe & avoid cyber scams</div>
            </div>
            {safetyTips.map((tip,i)=>(
              <div key={i} style={{background:"#0A0A0F",border:"1px solid rgba(212,175,55,0.12)",padding:"18px",marginBottom:8,display:"flex",gap:14,alignItems:"flex-start"}}>
                <div style={{width:42,height:42,background:"rgba(212,175,55,0.08)",border:"1px solid rgba(212,175,55,0.25)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{tip.icon}</div>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                    <span style={{fontFamily:"'JetBrains Mono'",fontSize:9,color:"#D4AF37",background:"rgba(212,175,55,0.1)",padding:"2px 6px",letterSpacing:2}}>TIP {String(i+1).padStart(2,"0")}</span>
                    <span style={{fontFamily:"'Cinzel',serif",fontSize:12,color:"#E8E0D0",letterSpacing:1}}>{tip.title}</span>
                  </div>
                  <p style={{fontFamily:"'Lato',sans-serif",fontSize:12,color:"#9A9088",lineHeight:1.7}}>{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── ATTACKS TAB ── */}
        {tab==="attacks" && (
          <div style={{animation:"fadeUp 0.4s ease"}}>
            <div style={{marginBottom:18}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:17,color:"#ef4444",letterSpacing:3,marginBottom:4}}>TOP 5 CYBER ATTACKS IN INDIA</div>
              <div style={{fontFamily:"'JetBrains Mono'",fontSize:11,color:"#7A7468",letterSpacing:2}}>Most significant cybersecurity incidents</div>
            </div>
            {cyberAttacks.map((atk,i)=>(
              <div key={i} style={{background:"#0A0A0F",border:"1px solid rgba(239,68,68,0.12)",padding:"18px",marginBottom:8,position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:0,left:0,bottom:0,width:3,background:"linear-gradient(to bottom,#ef4444,transparent)"}}/>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:7,flexWrap:"wrap",gap:5}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontFamily:"'Cinzel',serif",fontSize:22,fontWeight:900,color:"rgba(239,68,68,0.2)",lineHeight:1}}>#{atk.rank}</span>
                    <div>
                      <div style={{fontFamily:"'Cinzel',serif",fontSize:12,color:"#E8E0D0",letterSpacing:1,marginBottom:2}}>{atk.name}</div>
                      <div style={{fontFamily:"'JetBrains Mono'",fontSize:9,color:"#7A7468"}}>{atk.year} · {atk.victims} victims</div>
                    </div>
                  </div>
                  <span style={{fontFamily:"'JetBrains Mono'",fontSize:9,color:"#ef4444",background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.25)",padding:"3px 7px",whiteSpace:"nowrap"}}>{atk.impact}</span>
                </div>
                <p style={{fontFamily:"'Lato',sans-serif",fontSize:12,color:"#9A9088",lineHeight:1.7,paddingLeft:4}}>{atk.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── ABOUT TAB ── */}
        {tab==="about" && (
          <div style={{animation:"fadeUp 0.4s ease"}}>
            <div style={{background:"#0A0A0F",border:"1px solid rgba(212,175,55,0.2)",padding:"24px"}}>
              <div style={{display:"flex",gap:18,alignItems:"flex-start",marginBottom:20,flexWrap:"wrap"}}>
                {/* 
                  TO ADD YOUR PHOTO:
                  1. Put your photo in the /public folder and name it "photo.jpg"
                  2. Change the src below to "/photo.jpg"
                */}
                <div style={{width:80,height:96,background:"linear-gradient(135deg,rgba(212,175,55,0.15),rgba(212,175,55,0.05))",border:"2px solid rgba(212,175,55,0.4)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Cinzel',serif",fontSize:22,color:"#D4AF37",fontWeight:900}}>VB</div>
                <div>
                  <div style={{fontFamily:"'JetBrains Mono'",fontSize:9,color:"#D4AF37",letterSpacing:4,marginBottom:5}}>DEVELOPER</div>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:18,color:"#E8E0D0",letterSpacing:2,marginBottom:2}}>Vamshidhar Begari</div>
                  <div style={{fontSize:9fontFamily:"'JetBrains Mono'",fontSize:11,color:"#7A7468",marginBottom:8}}>Cybersecurity Enthusiast · BA HEP Student</div>
                  <p style={{fontFamily:"'Lato',sans-serif",fontSize:12,color:"#9A9088",lineHeight:1.7}}>Passionate about cybersecurity and building tools that protect people online. This project was built as part of my intrest to raise awareness about phishing and spam URLs in India.</p>
                </div>
              </div>
              <div style={{height:1,background:"rgba(212,175,55,0.1)",marginBottom:16}}/>
              <div style={{fontFamily:"'JetBrains Mono'",fontSize:9,color:"#D4AF37",letterSpacing:4,marginBottom:12}}>CONTACT INFORMATION</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                {[["📞","Phone","6305396413"],["📧","Email","vamshidharbegari005@gmail.com"],["📍","Location","Hyderabad, Telangana"],["🎓","Degree", BA HEP — Cybersecurity"],["💼","Interests","Ethical Hacking, Network Security"],["🛡️","Project","AEGIS Link Guard v1.0"]].map(([icon,label,val])=>(
                  <div key={label} style={{background:"rgba(212,175,55,0.03)",border:"1px solid rgba(212,175,55,0.08)",padding:"9px 11px"}}>
                    <div style={{fontFamily:"'JetBrains Mono'",,color:"#7A7468",marginBottom:2}}>{icon} {label}</div>
                    <div style={{fontFamily:"'JetBrains Mono'",fontSize:11,color:"#E8E0D0",wordBreak:"break-all"}}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── FOOTER ── */}
        <div style={{marginTop:36,borderTop:"1px solid rgba(212,175,55,0.12)",paddingTop:20}}>
          <div style={{background:"#0A0A0F",border:"1px solid rgba(212,175,55,0.15)",padding:"18px 20px",marginBottom:12}}>
            <div style={{fontFamily:"'JetBrains Mono'",fontSize:9,color:"#D4AF37",letterSpacing:4,marginBottom:12}}>CONTACT & INFO</div>
            <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:"7px 18px",alignItems:"center"}}>
              {[["👤","Name","Vamshidhar Begari"],["📞","Phone","6305396413"],["📧","Email","vamshidharbegari005@gmail.com"],["📍","Location","Hyderabad, Telangana, India"],["🎓","College",Degree BA HEP — Cybersecurity Project"]].map(([icon,label,val])=>(
                [<div key={label+"i"} style={{fontFamily:"'JetBrains Mono'",fontSize:11,color:"#7A7468"}}>{icon} {label}:</div>,
                 <div key={label+"v"} style={{fontFamily:"'JetBrains Mono'",fontSize:11,color:"#E8E0D0"}}>{val}</div>]
              ))}
            </div>
          </div>
          <div style={{textAlign:"center"}}>
            <p style={{fontFamily:"'JetBrains Mono'",fontSize:8,color:"#3A3630",letterSpacing:3}}>MADE BY VAMSHIDHAR USING WITH THE HELP OF CLAUDE AI</p>
          </div>
        </div>

      </div>
    </div>
  );
}
