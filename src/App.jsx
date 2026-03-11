import{useState,useEffect}from"react"
import{createClient}from"@supabase/supabase-js"
import*as XLSX from"xlsx"

const sb=createClient("https://rrqenxnibtdhtgzykefn.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJycWVueG5pYnRkaHRnenlrZWZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5OTk3NjYsImV4cCI6MjA4ODU3NTc2Nn0.g_5bKEZmZHCQOwlPuJilRfq2DEaOEq8oOtv2nr2Rr1E")

const BM=["Baishakh","Jestha","Ashadh","Shrawan","Bhadra","Ashwin","Kartik","Mangsir","Poush","Magh","Falgun","Chaitra"]
const BD={2079:[31,32,31,32,31,30,30,29,30,29,30,30],2080:[31,31,32,32,31,30,30,29,30,29,30,30],2081:[31,31,32,31,31,31,30,29,30,29,30,30],2082:[31,32,31,32,31,30,30,29,30,29,30,30],2083:[31,31,32,32,31,30,30,29,30,29,30,30]}
const BA={2079:[2022,4,14],2080:[2023,4,14],2081:[2024,4,13],2082:[2025,4,13],2083:[2026,4,14]}
function a2b(date){for(const y of[2083,2082,2081,2080,2079]){const[ay,am,ad]=BA[y];const s=new Date(ay,am-1,ad);let d=Math.floor((date-s)/86400000);if(d<0)continue;const dt=BD[y];for(let m=0;m<12;m++){if(d<dt[m])return{y,m:m+1,d:d+1};d-=dt[m]}}return{y:2082,m:1,d:1}}
function tbs(){return a2b(new Date())}
function bstr(b){return`${b.y}-${String(b.m).padStart(2,"0")}-${String(b.d).padStart(2,"0")}`}
function bdis(s){if(!s||!s.includes("-"))return s||"";const[y,m,d]=s.split("-");const mi=parseInt(m)-1;if(mi<0||mi>11)return s;return`${d} ${BM[mi]} ${y}`}
function cfy(){const b=tbs();const s=b.m>=4?b.y:b.y-1;return{label:`${s}/${s+1}`,year:s}}
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6)
const fmtN=n=>parseFloat(n||0).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})
const fmt=n=>"NPR "+fmtN(n)
const VAT=0.13

const AC=[
{c:"1001",n:"Cash in Hand",g:"Current Assets",t:"asset"},{c:"1002",n:"Cash at Bank",g:"Current Assets",t:"asset"},{c:"1003",n:"Trade Receivables",g:"Current Assets",t:"asset"},{c:"1004",n:"Inventory/Stock",g:"Current Assets",t:"asset"},{c:"1005",n:"VAT Receivable",g:"Current Assets",t:"asset"},{c:"1006",n:"TDS Receivable",g:"Current Assets",t:"asset"},
{c:"1101",n:"Property Plant & Equipment",g:"Non-Current Assets",t:"asset"},{c:"1102",n:"Accumulated Depreciation",g:"Non-Current Assets",t:"asset"},
{c:"2001",n:"Trade Payables",g:"Current Liabilities",t:"liability"},{c:"2002",n:"VAT Payable",g:"Current Liabilities",t:"liability"},{c:"2003",n:"TDS Payable",g:"Current Liabilities",t:"liability"},{c:"2004",n:"Salary Payable",g:"Current Liabilities",t:"liability"},
{c:"2101",n:"Long-term Bank Loan",g:"Non-Current Liabilities",t:"liability"},{c:"2102",n:"Gratuity Provision",g:"Non-Current Liabilities",t:"liability"},
{c:"3001",n:"Owner Capital",g:"Equity",t:"equity"},{c:"3002",n:"Retained Earnings",g:"Equity",t:"equity"},
{c:"4001",n:"Revenue from Sales",g:"Revenue",t:"revenue"},{c:"4002",n:"Service Revenue",g:"Revenue",t:"revenue"},{c:"4101",n:"Interest Income",g:"Other Income",t:"revenue"},
{c:"5001",n:"Cost of Goods Sold",g:"Cost of Sales",t:"expense"},
{c:"6001",n:"Salaries & Wages",g:"Employee Costs",t:"expense"},{c:"6002",n:"SSF Contribution",g:"Employee Costs",t:"expense"},
{c:"6101",n:"Rent Expense",g:"Occupancy",t:"expense"},{c:"6102",n:"Electricity & Water",g:"Occupancy",t:"expense"},
{c:"6201",n:"Telephone & Internet",g:"Admin",t:"expense"},{c:"6202",n:"Printing & Stationery",g:"Admin",t:"expense"},{c:"6203",n:"Travelling & Conveyance",g:"Admin",t:"expense"},
{c:"6301",n:"Audit & Accounting Fee",g:"Professional",t:"expense"},
{c:"6401",n:"Bank Charges",g:"Finance Costs",t:"expense"},{c:"6402",n:"Interest Expense",g:"Finance Costs",t:"expense"},
{c:"6501",n:"Depreciation",g:"Other Expenses",t:"expense"},{c:"6502",n:"Insurance",g:"Other Expenses",t:"expense"},{c:"6503",n:"Repairs & Maintenance",g:"Other Expenses",t:"expense"},{c:"6504",n:"Miscellaneous Expenses",g:"Other Expenses",t:"expense"},
{c:"7001",n:"Income Tax Expense",g:"Taxation",t:"expense"}
]
const AG=["Current Assets","Non-Current Assets","Current Liabilities","Non-Current Liabilities","Equity","Revenue","Other Income","Cost of Sales","Employee Costs","Occupancy","Admin","Professional","Finance Costs","Other Expenses","Taxation"]

function buildLedger(entries){
  const b={}
  AC.forEach(a=>{b[a.c]={...a,dr:0,cr:0}})
  entries.forEach(e=>{
    if(!b[e.account_code])b[e.account_code]={c:e.account_code,n:e.account_name,g:e.account_group,t:e.account_type,dr:0,cr:0}
    b[e.account_code].dr+=Number(e.dr)||0
    b[e.account_code].cr+=Number(e.cr)||0
  })
  return Object.values(b).map(a=>{const net=a.dr-a.cr;return{...a,net,bal:["asset","expense"].includes(a.t)?net:-net}})
}
function gBal(led,g){return led.filter(l=>l.g===g).reduce((s,a)=>s+a.bal,0)}
function aBal(led,c){const a=led.find(l=>l.c===c);return a?a.bal:0}
function gsb(led,gs){return gs.reduce((s,g)=>s+Math.abs(gBal(led,g)),0)}

function mkEntries(type,hdr,tots){
  const en=[];const ca=hdr.via==="bank"?"1002":"1001";const cn=hdr.via==="bank"?"Cash at Bank":"Cash in Hand"
  if(type==="purchase"){
    en.push({ac:"1004",an:"Inventory/Stock",g:"Current Assets",t:"asset",dr:tots.sub,cr:0})
    if(hdr.vatOn&&tots.vat>0)en.push({ac:"1005",an:"VAT Receivable",g:"Current Assets",t:"asset",dr:tots.vat,cr:0})
    hdr.pay==="credit"?en.push({ac:"2001",an:"Trade Payables",g:"Current Liabilities",t:"liability",dr:0,cr:tots.total}):en.push({ac:ca,an:cn,g:"Current Assets",t:"asset",dr:0,cr:tots.total})
  }else if(type==="purchase_return"){
    en.push({ac:"1004",an:"Inventory/Stock",g:"Current Assets",t:"asset",dr:0,cr:tots.sub})
    if(hdr.vatOn&&tots.vat>0)en.push({ac:"1005",an:"VAT Receivable",g:"Current Assets",t:"asset",dr:0,cr:tots.vat})
    hdr.pay==="credit"?en.push({ac:"2001",an:"Trade Payables",g:"Current Liabilities",t:"liability",dr:tots.total,cr:0}):en.push({ac:ca,an:cn,g:"Current Assets",t:"asset",dr:tots.total,cr:0})
  }else if(type==="sales"){
    hdr.pay==="credit"?en.push({ac:"1003",an:"Trade Receivables",g:"Current Assets",t:"asset",dr:tots.total,cr:0}):en.push({ac:ca,an:cn,g:"Current Assets",t:"asset",dr:tots.total,cr:0})
    en.push({ac:"4001",an:"Revenue from Sales",g:"Revenue",t:"revenue",dr:0,cr:tots.sub})
    if(hdr.vatOn&&tots.vat>0)en.push({ac:"2002",an:"VAT Payable",g:"Current Liabilities",t:"liability",dr:0,cr:tots.vat})
    if(tots.cogs>0){en.push({ac:"5001",an:"Cost of Goods Sold",g:"Cost of Sales",t:"expense",dr:tots.cogs,cr:0});en.push({ac:"1004",an:"Inventory/Stock",g:"Current Assets",t:"asset",dr:0,cr:tots.cogs})}
  }else if(type==="sales_return"){
    hdr.pay==="credit"?en.push({ac:"1003",an:"Trade Receivables",g:"Current Assets",t:"asset",dr:0,cr:tots.total}):en.push({ac:ca,an:cn,g:"Current Assets",t:"asset",dr:0,cr:tots.total})
    en.push({ac:"4001",an:"Revenue from Sales",g:"Revenue",t:"revenue",dr:tots.sub,cr:0})
    if(hdr.vatOn&&tots.vat>0)en.push({ac:"2002",an:"VAT Payable",g:"Current Liabilities",t:"liability",dr:tots.vat,cr:0})
    if(tots.cogs>0){en.push({ac:"5001",an:"Cost of Goods Sold",g:"Cost of Sales",t:"expense",dr:0,cr:tots.cogs});en.push({ac:"1004",an:"Inventory/Stock",g:"Current Assets",t:"asset",dr:tots.cogs,cr:0})}
  }else if(type==="cash_exp"){
    const a=AC.find(x=>x.c===hdr.expAc)
    if(hdr.etype==="expense"){en.push({ac:hdr.expAc,an:a?.n||hdr.expAc,g:a?.g||"",t:a?.t||"expense",dr:tots.total,cr:0});en.push({ac:ca,an:cn,g:"Current Assets",t:"asset",dr:0,cr:tots.total})}
    else{en.push({ac:ca,an:cn,g:"Current Assets",t:"asset",dr:tots.total,cr:0});en.push({ac:hdr.expAc,an:a?.n||hdr.expAc,g:a?.g||"",t:a?.t||"revenue",dr:0,cr:tots.total})}
  }
  return en
}

function exportExcel(data,cols,filename){
  const ws=XLSX.utils.json_to_sheet(data.map(r=>{const o={};cols.forEach(c=>{o[c.l]=r[c.k]??""});return o}))
  const wb=XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb,ws,"Report")
  XLSX.writeFile(wb,filename+".xlsx")
}

const CL={bg:"#04111F",card:"#091525",teal:"#14B8A6",blue:"#3B82F6",green:"#10B981",red:"#EF4444",amber:"#F59E0B",purple:"#8B5CF6",text:"#E2E8F0",sub:"#94A3B8",muted:"#4B6080"}
const IS={width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(20,184,166,0.15)",borderRadius:7,padding:"8px 11px",color:CL.text,fontSize:12,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}
const SS={...IS,background:"#091525"}
const Btn=bg=>({background:bg||CL.teal,border:"none",borderRadius:7,padding:"8px 18px",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"})
const Sm=bg=>({background:bg||CL.teal,border:"none",borderRadius:5,padding:"3px 8px",color:"#fff",fontWeight:700,fontSize:10,cursor:"pointer",fontFamily:"inherit"})
const CD={background:CL.card,border:"1px solid rgba(20,184,166,0.12)",borderRadius:12,padding:16}
const TH={padding:"7px 10px",textAlign:"left",fontSize:9,fontWeight:700,color:CL.muted,textTransform:"uppercase",letterSpacing:"0.07em",borderBottom:"1px solid rgba(20,184,166,0.1)",background:"rgba(20,184,166,0.03)"}
const TD={padding:"8px 10px",fontSize:11,color:CL.sub,borderBottom:"1px solid rgba(20,184,166,0.04)"}

const Lb=({label,children,hint})=><div style={{marginBottom:10}}>{label&&<div style={{fontSize:10,fontWeight:700,color:CL.muted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:3}}>{label}</div>}{children}{hint&&<div style={{fontSize:9,color:CL.muted,marginTop:2}}>{hint}</div>}</div>
const In=({label,hint,...p})=><Lb label={label} hint={hint}><input style={IS}{...p}/></Lb>
const Sel=({label,opts,...p})=><Lb label={label}><select style={SS}{...p}>{opts.map(o=><option key={o.v??o}value={o.v??o}>{o.l??o}</option>)}</select></Lb>
const Bdg=({col,ch})=><span style={{background:`${col}20`,border:`1px solid ${col}40`,color:col,borderRadius:4,padding:"2px 7px",fontSize:9,fontWeight:700,display:"inline-block"}}>{ch}</span>
const KPI=({label,val,col,sub})=><div style={{background:`${col}10`,border:`1px solid ${col}28`,borderRadius:10,padding:"12px 14px"}}><div style={{fontSize:9,fontWeight:700,color:CL.muted,textTransform:"uppercase",marginBottom:3}}>{label}</div><div style={{fontSize:15,fontWeight:800,color:col}}>{val}</div>{sub&&<div style={{fontSize:9,color:CL.muted,marginTop:2}}>{sub}</div>}</div>
const Tbl=({cols,rows,empty,onExport,fname})=><div><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{cols.map(c=><th key={c.k}style={TH}>{c.l}</th>)}</tr></thead><tbody>{!rows?.length?<tr><td colSpan={cols.length}style={{...TD,textAlign:"center",padding:22,color:CL.muted}}>{empty||"No data."}</td></tr>:rows.map((r,i)=><tr key={i}style={{background:i%2?"rgba(255,255,255,0.01)":"transparent"}}>{cols.map(c=><td key={c.k}style={TD}>{c.r?c.r(r[c.k],r):r[c.k]??"-"}</td>)}</tr>)}</tbody></table></div>{onExport&&rows?.length>0&&<button onClick={()=>exportExcel(rows,cols,fname||"report")}style={{...Sm(CL.green),marginTop:8}}>📥 Export Excel</button>}</div>
const Modal=({title,onClose,children,w})=><div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,padding:16}}><div style={{background:CL.card,border:`1px solid ${CL.teal}50`,borderRadius:13,width:"100%",maxWidth:w||520,maxHeight:"92vh",overflow:"auto"}}><div style={{padding:"12px 16px",borderBottom:"1px solid rgba(20,184,166,0.12)",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontWeight:700,fontSize:13,color:CL.text}}>{title}</span><button onClick={onClose}style={{background:"none",border:"none",color:CL.muted,fontSize:16,cursor:"pointer"}}>✕</button></div><div style={{padding:16}}>{children}</div></div></div>
const Tabs=({tabs,act,onChange})=><div style={{display:"flex",gap:2,borderBottom:"1px solid rgba(20,184,166,0.12)",marginBottom:14,flexWrap:"wrap"}}>{tabs.map(t=><button key={t.id}onClick={()=>onChange(t.id)}style={{background:"none",border:"none",borderBottom:act===t.id?`2px solid ${CL.teal}`:"2px solid transparent",padding:"6px 13px",color:act===t.id?CL.teal:CL.muted,fontWeight:act===t.id?700:400,fontSize:11,cursor:"pointer",marginBottom:-1,fontFamily:"inherit"}}>{t.l}</button>)}</div>
const Dn=({label,val,onChange})=><Lb label={label} hint={bdis(val)}><input style={IS}placeholder="YYYY-MM-DD"value={val}onChange={e=>onChange(e.target.value)}/></Lb>
const Msg=({m})=>{if(!m)return null;const ok=m.startsWith("✅"),er=m.startsWith("❌");return<div style={{fontSize:11,padding:"6px 10px",borderRadius:6,color:ok?CL.green:er?CL.red:CL.amber,background:ok?"rgba(16,185,129,0.1)":er?"rgba(239,68,68,0.1)":"rgba(245,158,11,0.1)",border:`1px solid ${ok?"rgba(16,185,129,0.25)":er?"rgba(239,68,68,0.25)":"rgba(245,158,11,0.25)"}`}}>{m}</div>}
const SH=({title,col})=><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><div style={{width:4,height:20,borderRadius:2,background:col||CL.teal}}/><h2 style={{margin:0,fontSize:15,fontWeight:800,color:CL.text}}>{title}</h2></div>
const Spin=()=><div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:40,color:CL.teal,fontSize:13}}>Loading...</div>

function Login({onLogin}){
  const[em,setEm]=useState("");const[pw,setPw]=useState("");const[err,setErr]=useState("");const[busy,setBusy]=useState(false)
  const go=async()=>{
    setBusy(true);setErr("")
    const{data,error}=await sb.from("users").select("*").eq("email",em).eq("password",pw).single()
    if(data){onLogin(data)}else{setErr("Invalid email or password.")}
    setBusy(false)
  }
  return<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:`radial-gradient(ellipse at 50% 20%,#0A2040,${CL.bg} 70%)`,padding:16,fontFamily:"'Segoe UI',sans-serif"}}>
    <div style={{width:"100%",maxWidth:380}}>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{width:64,height:64,borderRadius:16,background:`linear-gradient(135deg,${CL.teal},#0EA5E9)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,margin:"0 auto 12px",boxShadow:`0 10px 32px ${CL.teal}50`}}>🏔</div>
        <div style={{fontSize:24,fontWeight:800,color:CL.text}}>Nepal Solution</div>
        <div style={{fontSize:11,color:CL.muted,marginTop:3}}>NFRS for SMEs · Professional Accounting</div>
      </div>
      <div style={{...CD,boxShadow:"0 24px 64px rgba(0,0,0,0.7)",border:`1px solid ${CL.teal}50`}}>
        <In label="Email" type="email" placeholder="your@gmail.com" value={em} onChange={e=>setEm(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()}/>
        <In label="Password" type="password" placeholder="••••••••" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()}/>
        {err&&<div style={{color:CL.red,fontSize:11,marginBottom:8}}>{err}</div>}
        <button onClick={go}disabled={busy}style={{...Btn(`linear-gradient(135deg,${CL.teal},#0EA5E9)`),width:"100%",padding:"10px",fontSize:13,opacity:busy?0.7:1}}>{busy?"Signing in...":"Sign In →"}</button>
        <div style={{marginTop:12,fontSize:10,color:CL.muted,textAlign:"center"}}>Nepal Solution · NFRS for SMEs Accounting Platform</div>
      </div>
    </div>
  </div>
}

function Stock({cid,onRefresh}){
  const[items,setItems]=useState([]);const[tab,setTab]=useState("list");const[loading,setLoading]=useState(true)
  const[f,setF]=useState({name:"",sku:"",unit:"pcs",qty:"0",cost_rate:"",sale_rate:"",min_qty:"5"})
  const[of,setOf]=useState({sku:"",qty:"",cost_rate:""})
  const[msg,setMsg]=useState("");const[omsg,setOmsg]=useState("")
  const load=async()=>{setLoading(true);const{data}=await sb.from("stock").select("*").eq("client_id",cid).order("name");setItems(data||[]);setLoading(false)}
  useEffect(()=>{if(cid)load()},[cid])
  const saveItem=async()=>{
    if(!f.name||!f.sku||!f.cost_rate||!f.sale_rate)return setMsg("❌ Fill all required fields")
    if(items.find(x=>x.sku.toUpperCase()===f.sku.toUpperCase()))return setMsg("❌ SKU already exists")
    const{error}=await sb.from("stock").insert({client_id:cid,name:f.name,sku:f.sku.toUpperCase(),unit:f.unit,qty:parseFloat(f.qty)||0,cost_rate:parseFloat(f.cost_rate),sale_rate:parseFloat(f.sale_rate),min_qty:parseFloat(f.min_qty)||0})
    if(error)return setMsg("❌ "+error.message)
    await load();setF({name:"",sku:"",unit:"pcs",qty:"0",cost_rate:"",sale_rate:"",min_qty:"5"})
    setMsg("✅ Item added");setTimeout(()=>setMsg(""),3000)
  }
  const postOpening=async()=>{
    const si=items.find(x=>x.sku===of.sku);if(!si)return setOmsg("❌ Select item")
    const q=parseFloat(of.qty)||0;const r=parseFloat(of.cost_rate)||si.cost_rate;const val=q*r
    await sb.from("stock").update({qty:si.qty+q,cost_rate:r}).eq("id",si.id)
    const{data:jnl}=await sb.from("journals").insert({client_id:cid,type:"opening",date:bstr(tbs()),ref:`OPG-${uid().slice(0,5).toUpperCase()}`,narration:`Opening Stock — ${si.name}`,subtotal:val,total:val}).select().single()
    if(jnl){await sb.from("journal_entries").insert([{journal_id:jnl.id,account_code:"1004",account_name:"Inventory/Stock",account_group:"Current Assets",account_type:"asset",dr:val,cr:0},{journal_id:jnl.id,account_code:"3001",account_name:"Owner Capital",account_group:"Equity",account_type:"equity",dr:0,cr:val}])}
    await load();setOf({sku:"",qty:"",cost_rate:""});setOmsg("✅ Opening stock posted");setTimeout(()=>setOmsg(""),3000);onRefresh?.()
  }
  const del=async id=>{if(!confirm("Delete item?"))return;await sb.from("stock").delete().eq("id",id);await load()}
  const low=items.filter(i=>i.qty<=i.min_qty&&i.min_qty>0)
  const exCols=[{k:"sku",l:"SKU"},{k:"name",l:"Item Name"},{k:"unit",l:"Unit"},{k:"qty",l:"Stock Qty"},{k:"cost_rate",l:"Cost Rate"},{k:"sale_rate",l:"Sale Rate"},{k:"min_qty",l:"Min Qty"}]
  return<div>
    <SH title="📦 Stock / Inventory" col={CL.teal}/>
    {low.length>0&&<div style={{...CD,marginBottom:10,background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.2)"}}>
      <div style={{fontSize:10,fontWeight:700,color:CL.red,marginBottom:5}}>⚠️ LOW STOCK ALERT</div>
      {low.map(i=><div key={i.id}style={{fontSize:11,color:CL.amber}}>• {i.name} ({i.sku}) — {fmtN(i.qty)} {i.unit} remaining</div>)}
    </div>}
    <Tabs tabs={[{id:"list",l:"Stock List"},{id:"add",l:"Add Item"},{id:"opening",l:"Opening Stock"}]} act={tab} onChange={setTab}/>
    {tab==="list"&&<div style={CD}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginBottom:12}}>
        <KPI label="Total Items" val={items.length} col={CL.teal} sub="in catalogue"/>
        <KPI label="Stock Value" val={fmt(items.reduce((a,i)=>a+i.qty*i.cost_rate,0))} col={CL.green} sub="at cost"/>
        <KPI label="Low Stock" val={low.length} col={low.length>0?CL.red:CL.green} sub="items"/>
      </div>
      {loading?<Spin/>:<Tbl cols={[{k:"sku",l:"SKU"},{k:"name",l:"Item Name"},{k:"qty",l:"In Stock",r:(v,r)=><span style={{color:v<=r.min_qty?CL.red:CL.green,fontWeight:700}}>{fmtN(v)} {r.unit}</span>},{k:"cost_rate",l:"Cost",r:v=>"NPR "+fmtN(v)},{k:"sale_rate",l:"Sale Rate",r:v=>"NPR "+fmtN(v)},{k:"qty",l:"Value",r:(v,r)=><span style={{color:CL.teal}}>{fmt(v*r.cost_rate)}</span>},{k:"id",l:"",r:(_,r)=><button onClick={()=>del(r.id)}style={Sm(CL.red)}>Del</button>}]} rows={items} empty="No items. Use Add Item tab." onExport fname="Stock_List"/>}
    </div>}
    {tab==="add"&&<div style={CD}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10}}>
        <In label="Item Name *" value={f.name} onChange={e=>setF(x=>({...x,name:e.target.value}))}/>
        <In label="SKU Code *" value={f.sku} onChange={e=>setF(x=>({...x,sku:e.target.value}))}/>
        <Sel label="Unit" value={f.unit} onChange={e=>setF(x=>({...x,unit:e.target.value}))} opts={["pcs","kg","ltr","box","bag","dozen","mtr"]}/>
        <In label="Opening Qty" type="number" min="0" value={f.qty} onChange={e=>setF(x=>({...x,qty:e.target.value}))}/>
        <In label="Cost Rate (NPR) *" type="number" min="0" value={f.cost_rate} onChange={e=>setF(x=>({...x,cost_rate:e.target.value}))}/>
        <In label="Selling Rate (NPR) *" type="number" min="0" value={f.sale_rate} onChange={e=>setF(x=>({...x,sale_rate:e.target.value}))}/>
        <In label="Min Stock Qty" type="number" min="0" value={f.min_qty} onChange={e=>setF(x=>({...x,min_qty:e.target.value}))}/>
      </div>
      <div style={{display:"flex",gap:10,alignItems:"center",marginTop:6}}><button onClick={saveItem}style={Btn(CL.green)}>+ Add Item</button><Msg m={msg}/></div>
    </div>}
    {tab==="opening"&&<div style={CD}>
      <div style={{fontSize:11,color:CL.amber,padding:"8px 12px",background:"rgba(245,158,11,0.08)",borderRadius:7,border:"1px solid rgba(245,158,11,0.2)",marginBottom:14}}>
        📌 For existing businesses — records stock before you started using this system. Posts: Dr Inventory / Cr Owner Capital.
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10}}>
        <Lb label="Select Item"><select style={SS}value={of.sku}onChange={e=>setOf(x=>({...x,sku:e.target.value}))}><option value="">-- Select --</option>{items.map(i=><option key={i.sku}value={i.sku}>{i.name} ({i.sku})</option>)}</select></Lb>
        <In label="Qty *" type="number" min="0" value={of.qty} onChange={e=>setOf(x=>({...x,qty:e.target.value}))}/>
        <In label="Cost Rate (blank=item rate)" type="number" min="0" value={of.cost_rate} onChange={e=>setOf(x=>({...x,cost_rate:e.target.value}))}/>
      </div>
      <div style={{display:"flex",gap:10,alignItems:"center",marginTop:6}}><button onClick={postOpening}style={Btn(CL.amber)}>Post Opening Stock</button><Msg m={omsg}/></div>
    </div>}
  </div>
}

function TxnEntry({type,cid,onDone}){
  const today=bstr(tbs())
  const isSales=type==="sales"||type==="sales_return"
  const isRet=type==="sales_return"||type==="purchase_return"
  const[hdr,setH]=useState({date:today,party:"",pan:"",ref:"",vatOn:true,pay:"cash",via:"cash"})
  const[rows,setRows]=useState([{id:uid(),sku:"",name:"",qty:"",rate:"",sub:0,vat:0,total:0,cogs:0}])
  const[stock,setStock]=useState([]);const[msg,setMsg]=useState("");const[busy,setBusy]=useState(false);const[jnl,setJnl]=useState(null)
  useEffect(()=>{if(cid)sb.from("stock").select("*").eq("client_id",cid).then(({data})=>setStock(data||[]))},[cid])
  const calc=(r,vOn)=>{const q=parseFloat(r.qty)||0,rt=parseFloat(r.rate)||0,sub=q*rt,vat=vOn?sub*VAT:0;const si=stock.find(s=>s.sku===r.sku);return{...r,sub,vat,total:sub+vat,cogs:si?q*si.cost_rate:0}}
  const upd=(id,f,v)=>setRows(p=>p.map(r=>{if(r.id!==id)return r;let nr={...r,[f]:v};if(f==="sku"){const si=stock.find(s=>s.sku===v);if(si){nr.name=si.name;nr.rate=isSales?si.sale_rate:si.cost_rate}}return calc(nr,hdr.vatOn)}))
  const togV=v=>{setH(h=>({...h,vatOn:v}));setRows(p=>p.map(r=>calc(r,v)))}
  const tots=rows.reduce((a,r)=>({sub:a.sub+r.sub,vat:a.vat+r.vat,total:a.total+r.total,cogs:a.cogs+r.cogs}),{sub:0,vat:0,total:0,cogs:0})
  const post=async()=>{
    if(!hdr.party||!hdr.ref)return setMsg("⚠️ Fill party name and reference number")
    const valid=rows.filter(r=>r.name&&parseFloat(r.qty)>0&&parseFloat(r.rate)>0)
    if(!valid.length)return setMsg("⚠️ Add at least one valid item")
    setBusy(true)
    if(type==="sales"){
      for(const r of valid){
        if(!r.sku)continue
        const si=stock.find(s=>s.sku===r.sku)
        if(si&&si.qty<parseFloat(r.qty)){setMsg(`❌ Insufficient stock: ${si.name} — Available: ${fmtN(si.qty)}`);setBusy(false);return}
      }
    }
    for(const r of valid){
      if(!r.sku)continue
      const si=stock.find(s=>s.sku===r.sku);if(!si)continue
      const q=parseFloat(r.qty)||0
      const newQty=(type==="purchase"||type==="sales_return")?si.qty+q:Math.max(0,si.qty-q)
      await sb.from("stock").update({qty:newQty}).eq("id",si.id)
    }
    const cogsT=valid.reduce((a,r)=>a+r.cogs,0)
    const labs={sales:"Sales Invoice",purchase:"Purchase Bill",sales_return:"Sales Return",purchase_return:"Purchase Return"}
    const{data:jnlRow,error}=await sb.from("journals").insert({client_id:cid,type,date:hdr.date,ref:hdr.ref,narration:`${labs[type]} — ${hdr.party}`,party:hdr.party,pan:hdr.pan,vat_on:hdr.vatOn,subtotal:tots.sub,vat_amount:tots.vat,total:tots.total,cogs:cogsT}).select().single()
    if(error){setMsg("❌ "+error.message);setBusy(false);return}
    const en=mkEntries(type,hdr,{...tots,cogs:cogsT})
    await sb.from("journal_entries").insert(en.map(e=>({journal_id:jnlRow.id,account_code:e.ac,account_name:e.an,account_group:e.g,account_type:e.t,dr:e.dr,cr:e.cr})))
    setJnl({...jnlRow,entries:en})
    setH({date:today,party:"",pan:"",ref:"",vatOn:true,pay:"cash",via:"cash"})
    setRows([{id:uid(),sku:"",name:"",qty:"",rate:"",sub:0,vat:0,total:0,cogs:0}])
    setMsg("✅ Posted! Journal recorded.");setTimeout(()=>setMsg(""),6000);setBusy(false);onDone?.()
  }
  const tC={sales:CL.green,purchase:CL.blue,sales_return:CL.amber,purchase_return:CL.purple}
  const tL={sales:"🟢 Sales Entry",purchase:"🔵 Purchase Entry",sales_return:"🟡 Sales Return",purchase_return:"🟣 Purchase Return"}
  const col=tC[type]
  return<div>
    <SH title={tL[type]} col={col}/>
    <div style={{...CD,marginBottom:10}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(145px,1fr))",gap:10}}>
        <Dn label="Date (BS)" val={hdr.date} onChange={v=>setH(h=>({...h,date:v}))}/>
        <In label={isSales?"Customer *":"Vendor *"} value={hdr.party} onChange={e=>setH(h=>({...h,party:e.target.value}))}/>
        <In label="PAN" value={hdr.pan} onChange={e=>setH(h=>({...h,pan:e.target.value}))}/>
        <In label={isSales?"Invoice No *":"Bill No *"} value={hdr.ref} onChange={e=>setH(h=>({...h,ref:e.target.value}))}/>
        <Sel label="VAT" value={hdr.vatOn?"y":"n"} onChange={e=>togV(e.target.value==="y")} opts={[{v:"y",l:"VAT 13%"},{v:"n",l:"VAT Exempt"}]}/>
        <Sel label="Payment" value={hdr.pay} onChange={e=>setH(h=>({...h,pay:e.target.value}))} opts={[{v:"cash",l:"Cash"},{v:"bank",l:"Bank"},{v:"credit",l:isSales?"Credit (Receivable)":"Credit (Payable)"}]}/>
        {hdr.pay!=="credit"&&<Sel label="Account" value={hdr.via} onChange={e=>setH(h=>({...h,via:e.target.value}))} opts={[{v:"cash",l:"Cash in Hand"},{v:"bank",l:"Cash at Bank"}]}/>}
      </div>
    </div>
    <div style={CD}>
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:580}}>
        <thead><tr>{["SKU","Item",isSales?"Available":"","Qty","Rate","Subtotal","VAT","Total","COGS",""].map((h,i)=><th key={i}style={TH}>{h}</th>)}</tr></thead>
        <tbody>{rows.map(r=>{
          const si=stock.find(s=>s.sku===r.sku);const ins=type==="sales"&&si&&parseFloat(r.qty)>si.qty
          return<tr key={r.id}style={{background:ins?"rgba(239,68,68,0.06)":"transparent"}}>
            <td style={TD}><select style={{...SS,width:90}}value={r.sku}onChange={e=>upd(r.id,"sku",e.target.value)}><option value="">—</option>{stock.map(s=><option key={s.sku}value={s.sku}>{s.sku}</option>)}</select></td>
            <td style={TD}><input style={{...IS,minWidth:100}}placeholder="Description"value={r.name}onChange={e=>upd(r.id,"name",e.target.value)}/></td>
            {isSales?<td style={{...TD,fontSize:10,color:si?si.qty>si.min_qty?CL.green:CL.red:CL.muted}}>{si?`${fmtN(si.qty)} ${si.unit}`:"—"}</td>:<td style={TD}/>}
            <td style={TD}><input style={{...IS,width:65,border:ins?`1px solid ${CL.red}`:undefined}}type="number"min="0"value={r.qty}onChange={e=>upd(r.id,"qty",e.target.value)}/></td>
            <td style={TD}><input style={{...IS,width:85}}type="number"min="0"value={r.rate}onChange={e=>upd(r.id,"rate",e.target.value)}/></td>
            <td style={{...TD,color:CL.sub}}>{fmtN(r.sub)}</td>
            <td style={{...TD,color:CL.green}}>{fmtN(r.vat)}</td>
            <td style={{...TD,fontWeight:700,color:CL.text}}>{fmtN(r.total)}</td>
            <td style={{...TD,fontSize:10,color:CL.amber}}>{r.cogs>0?fmtN(r.cogs):"—"}</td>
            <td style={TD}><button onClick={()=>setRows(p=>p.filter(x=>x.id!==r.id))}style={{background:"none",border:"none",color:CL.red,cursor:"pointer"}}disabled={rows.length===1}>✕</button></td>
          </tr>
        })}</tbody>
      </table></div>
      <button onClick={()=>setRows(p=>[...p,{id:uid(),sku:"",name:"",qty:"",rate:"",sub:0,vat:0,total:0,cogs:0}])}style={{background:"transparent",border:"1px solid rgba(20,184,166,0.15)",borderRadius:7,padding:"5px 12px",color:CL.sub,fontSize:10,cursor:"pointer",fontFamily:"inherit",marginTop:8}}>+ Add Line</button>
      <div style={{display:"flex",justifyContent:"flex-end",marginTop:10,paddingTop:10,borderTop:"1px solid rgba(20,184,166,0.1)"}}>
        <div style={{minWidth:230}}>{[["Subtotal (excl VAT)",tots.sub,CL.sub,false],["VAT @ 13%",tots.vat,CL.green,false],["Grand Total",tots.total,col,true],["Auto COGS",tots.cogs,CL.amber,false]].map(([l,v,c,b])=><div key={l}style={{display:"flex",justifyContent:"space-between",padding:"3px 0",fontSize:b?13:11,fontWeight:b?800:400,color:c,borderTop:b?"1px solid rgba(20,184,166,0.1)":"none"}}><span>{l}</span><span>NPR {fmtN(v)}</span></div>)}</div>
      </div>
      <div style={{marginTop:12,display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
        <button onClick={post}disabled={busy}style={{...Btn(col),opacity:busy?0.6:1}}>{busy?"Posting...":"✅ POST ENTRY"}</button><Msg m={msg}/>
      </div>
      {jnl&&<div style={{marginTop:14,background:`${col}08`,border:`1px solid ${col}28`,borderRadius:9,padding:12}}>
        <div style={{fontSize:10,fontWeight:700,color:col,marginBottom:8}}>✅ JOURNAL AUTO-POSTED — {jnl.ref}</div>
        <table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr><th style={TH}>Account</th><th style={{...TH,textAlign:"right"}}>Dr</th><th style={{...TH,textAlign:"right"}}>Cr</th></tr></thead>
        <tbody>{jnl.entries?.map((e,i)=><tr key={i}><td style={{...TD,fontSize:10}}>{e.ac} — {e.an}</td><td style={{...TD,textAlign:"right",color:CL.green,fontSize:10}}>{e.dr>0?fmtN(e.dr):"-"}</td><td style={{...TD,textAlign:"right",color:CL.blue,fontSize:10}}>{e.cr>0?fmtN(e.cr):"-"}</td></tr>)}</tbody></table>
      </div>}
    </div>
  </div>
}

function CashEntry({cid,onDone}){
  const today=bstr(tbs())
  const[f,setF]=useState({date:today,etype:"expense",expAc:"",amt:"",desc:"",via:"cash"})
  const[msg,setMsg]=useState("");const[jnl,setJnl]=useState(null)
  const eAcs=AC.filter(a=>["Employee Costs","Occupancy","Admin","Professional","Finance Costs","Other Expenses","Taxation"].includes(a.g))
  const iAcs=AC.filter(a=>["Revenue","Other Income"].includes(a.g))
  const post=async()=>{
    if(!f.expAc||!f.amt||!f.desc)return setMsg("⚠️ Fill all fields")
    const amt=parseFloat(f.amt)
    const en=mkEntries("cash_exp",f,{total:amt})
    const{data:jnlRow,error}=await sb.from("journals").insert({client_id:cid,type:"cashentry",date:f.date,ref:`CE-${uid().slice(0,5).toUpperCase()}`,narration:f.desc,subtotal:amt,total:amt}).select().single()
    if(error)return setMsg("❌ "+error.message)
    await sb.from("journal_entries").insert(en.map(e=>({journal_id:jnlRow.id,account_code:e.ac,account_name:e.an,account_group:e.g,account_type:e.t,dr:e.dr,cr:e.cr})))
    setJnl({...jnlRow,entries:en});setF({date:today,etype:"expense",expAc:"",amt:"",desc:"",via:"cash"})
    setMsg("✅ Posted!");setTimeout(()=>setMsg(""),4000);onDone?.()
  }
  return<div>
    <SH title="💵 Cash / Expense / Income Entry" col={CL.amber}/>
    <div style={CD}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))",gap:10}}>
        <Dn label="Date (BS)" val={f.date} onChange={v=>setF(x=>({...x,date:v}))}/>
        <Sel label="Type" value={f.etype} onChange={e=>setF(x=>({...x,etype:e.target.value,expAc:""}))} opts={[{v:"expense",l:"Expense / Payment"},{v:"income",l:"Income / Receipt"}]}/>
        <Sel label="Via" value={f.via} onChange={e=>setF(x=>({...x,via:e.target.value}))} opts={[{v:"cash",l:"Cash in Hand"},{v:"bank",l:"Cash at Bank"}]}/>
        <Lb label={f.etype==="expense"?"Expense Account *":"Income Account *"}><select style={SS}value={f.expAc}onChange={e=>setF(x=>({...x,expAc:e.target.value}))}><option value="">-- Select --</option>{(f.etype==="expense"?eAcs:iAcs).map(a=><option key={a.c}value={a.c}>{a.c} — {a.n}</option>)}</select></Lb>
        <In label="Amount (NPR) *" type="number" min="0" value={f.amt} onChange={e=>setF(x=>({...x,amt:e.target.value}))}/>
        <In label="Description *" value={f.desc} onChange={e=>setF(x=>({...x,desc:e.target.value}))}/>
      </div>
      <div style={{marginTop:10,display:"flex",gap:10,alignItems:"center"}}><button onClick={post}style={Btn(CL.amber)}>💵 Post Entry</button><Msg m={msg}/></div>
      {jnl&&<div style={{marginTop:14,background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:9,padding:12}}>
        <div style={{fontSize:10,fontWeight:700,color:CL.amber,marginBottom:8}}>✅ POSTED — {jnl.ref}</div>
        <table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr><th style={TH}>Account</th><th style={{...TH,textAlign:"right"}}>Dr</th><th style={{...TH,textAlign:"right"}}>Cr</th></tr></thead>
        <tbody>{jnl.entries?.map((e,i)=><tr key={i}><td style={{...TD,fontSize:10}}>{e.ac} — {e.an}</td><td style={{...TD,textAlign:"right",color:CL.green,fontSize:10}}>{e.dr>0?fmtN(e.dr):"-"}</td><td style={{...TD,textAlign:"right",color:CL.blue,fontSize:10}}>{e.cr>0?fmtN(e.cr):"-"}</td></tr>)}</tbody></table>
      </div>}
    </div>
  </div>
}

function ManualJournal({cid,onDone}){
  const today=bstr(tbs())
  const[date,setDate]=useState(today);const[narr,setNarr]=useState("")
  const[lines,setLines]=useState([{id:uid(),ac:"",dr:"",cr:""},{id:uid(),ac:"",dr:"",cr:""}])
  const[msg,setMsg]=useState("")
  const upd=(id,f,v)=>setLines(p=>p.map(l=>l.id===id?{...l,[f]:v}:l))
  const tDr=lines.reduce((a,l)=>a+(parseFloat(l.dr)||0),0);const tCr=lines.reduce((a,l)=>a+(parseFloat(l.cr)||0),0);const bal=Math.abs(tDr-tCr)<0.01
  const post=async()=>{
    if(!narr)return setMsg("⚠️ Enter narration")
    if(!bal)return setMsg(`⚠️ Unbalanced — Dr:${fmtN(tDr)} Cr:${fmtN(tCr)}`)
    const valid=lines.filter(l=>l.ac&&(parseFloat(l.dr)||parseFloat(l.cr)))
    if(valid.length<2)return setMsg("⚠️ Minimum 2 lines")
    const{data:jnlRow,error}=await sb.from("journals").insert({client_id:cid,type:"journal",date,ref:`JV-${uid().slice(0,5).toUpperCase()}`,narration:narr,subtotal:tDr,total:tDr}).select().single()
    if(error)return setMsg("❌ "+error.message)
    const en=valid.map(l=>{const a=AC.find(x=>x.c===l.ac);return{journal_id:jnlRow.id,account_code:l.ac,account_name:a?.n||l.ac,account_group:a?.g||"",account_type:a?.t||"asset",dr:parseFloat(l.dr)||0,cr:parseFloat(l.cr)||0}})
    await sb.from("journal_entries").insert(en)
    setNarr("");setLines([{id:uid(),ac:"",dr:"",cr:""},{id:uid(),ac:"",dr:"",cr:""}])
    setMsg("✅ Journal posted!");setTimeout(()=>setMsg(""),3000);onDone?.()
  }
  return<div>
    <SH title="📓 Manual Journal Entry" col={CL.teal}/>
    <div style={CD}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:10,marginBottom:12}}>
        <Dn label="Date (BS)" val={date} onChange={setDate}/>
        <In label="Narration *" placeholder="e.g. Depreciation for FY 2081/82" value={narr} onChange={e=>setNarr(e.target.value)}/>
      </div>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr>{["Account","Debit (NPR)","Credit (NPR)",""].map(h=><th key={h}style={TH}>{h}</th>)}</tr></thead>
        <tbody>
          {lines.map(l=><tr key={l.id}>
            <td style={TD}><select style={SS}value={l.ac}onChange={e=>upd(l.id,"ac",e.target.value)}><option value="">-- Select --</option>{AG.map(g=>{const ga=AC.filter(a=>a.g===g);return ga.length?<optgroup key={g}label={g}>{ga.map(a=><option key={a.c}value={a.c}>{a.c} — {a.n}</option>)}</optgroup>:null})}</select></td>
            <td style={TD}><input style={{...IS,width:120}}type="number"min="0"placeholder="0.00"value={l.dr}onChange={e=>upd(l.id,"dr",e.target.value)}/></td>
            <td style={TD}><input style={{...IS,width:120}}type="number"min="0"placeholder="0.00"value={l.cr}onChange={e=>upd(l.id,"cr",e.target.value)}/></td>
            <td style={TD}><button onClick={()=>setLines(p=>p.filter(x=>x.id!==l.id))}style={{background:"none",border:"none",color:CL.red,cursor:"pointer"}}disabled={lines.length<=2}>✕</button></td>
          </tr>)}
          <tr style={{background:"rgba(20,184,166,0.04)"}}><td style={{...TD,fontWeight:700,color:CL.text}}>TOTAL</td><td style={{...TD,fontWeight:700,color:CL.green}}>NPR {fmtN(tDr)}</td><td style={{...TD,fontWeight:700,color:CL.blue}}>NPR {fmtN(tCr)}</td><td style={TD}><Bdg col={bal?CL.green:CL.red}ch={bal?"✅ Balanced":"❌ Unbalanced"}/></td></tr>
        </tbody>
      </table>
      <button onClick={()=>setLines(p=>[...p,{id:uid(),ac:"",dr:"",cr:""}])}style={{background:"transparent",border:"1px solid rgba(20,184,166,0.15)",borderRadius:7,padding:"5px 12px",color:CL.sub,fontSize:10,cursor:"pointer",fontFamily:"inherit",marginTop:8}}>+ Add Line</button>
      <div style={{marginTop:12,display:"flex",gap:10,alignItems:"center"}}><button onClick={post}disabled={!bal}style={{...Btn(CL.teal),opacity:!bal?0.5:1}}>📓 Post Journal</button><Msg m={msg}/></div>
    </div>
  </div>
}

function JournalViewer({cid}){
  const[jnls,setJnls]=useState([]);const[sel,setSel]=useState(null);const[filter,setFilter]=useState("all");const[loading,setLoading]=useState(true)
  const load=async()=>{setLoading(true);const{data}=await sb.from("journals").select("*,journal_entries(*)").eq("client_id",cid).order("posted_at",{ascending:false});setJnls(data||[]);setLoading(false)}
  useEffect(()=>{if(cid)load()},[cid])
  const del=async id=>{if(!confirm("Delete journal?"))return;await sb.from("journals").delete().eq("id",id);setJnls(p=>p.filter(x=>x.id!==id))}
  const tc={sales:CL.green,purchase:CL.blue,sales_return:CL.amber,purchase_return:CL.purple,cashentry:CL.teal,journal:CL.text,opening:CL.muted}
  const filtered=filter==="all"?jnls:jnls.filter(j=>j.type===filter)
  const exCols=[{k:"date",l:"Date"},{k:"type",l:"Type"},{k:"ref",l:"Ref"},{k:"narration",l:"Narration"},{k:"party",l:"Party"},{k:"subtotal",l:"Subtotal"},{k:"vat_amount",l:"VAT"},{k:"total",l:"Total"}]
  return<div>
    <SH title="📒 Posted Journals" col={CL.teal}/>
    <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
      {["all","sales","purchase","sales_return","purchase_return","cashentry","journal","opening"].map(t=><button key={t}onClick={()=>setFilter(t)}style={{...Sm(filter===t?CL.teal:"#1a3050"),fontSize:9}}>{t}</button>)}
    </div>
    <div style={CD}>
      {loading?<Spin/>:<Tbl cols={[{k:"date",l:"Date",r:v=>bdis(v)},{k:"type",l:"Type",r:v=><Bdg col={tc[v]||CL.muted}ch={v}/>},{k:"ref",l:"Ref"},{k:"narration",l:"Narration"},{k:"total",l:"Amount",r:(_,r)=><b>NPR {fmtN(r.total||0)}</b>},{k:"id",l:"",r:(v,r)=><div style={{display:"flex",gap:4}}><button onClick={()=>setSel(r)}style={Sm(CL.teal)}>View</button><button onClick={()=>del(v)}style={Sm(CL.red)}>Del</button></div>}]} rows={filtered} empty="No journals yet." onExport fname="Journal_Register"/>}
    </div>
    {sel&&<Modal title={`Journal — ${sel.ref}`}onClose={()=>setSel(null)}w={580}>
      <div style={{marginBottom:10,fontSize:11,color:CL.sub,lineHeight:1.8}}><b style={{color:CL.text}}>Date:</b> {bdis(sel.date)} | <b style={{color:CL.text}}>Ref:</b> {sel.ref}<br/><b style={{color:CL.text}}>Narration:</b> {sel.narration}</div>
      <table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr><th style={TH}>Account</th><th style={{...TH,textAlign:"right"}}>Dr (NPR)</th><th style={{...TH,textAlign:"right"}}>Cr (NPR)</th></tr></thead>
      <tbody>{sel.journal_entries?.map((e,i)=><tr key={i}style={{background:i%2?"rgba(255,255,255,0.01)":"transparent"}}><td style={{...TD,fontSize:11}}>{e.account_code} — {e.account_name}</td><td style={{...TD,textAlign:"right",color:CL.green,fontWeight:e.dr>0?700:400}}>{e.dr>0?fmtN(e.dr):"-"}</td><td style={{...TD,textAlign:"right",color:CL.blue,fontWeight:e.cr>0?700:400}}>{e.cr>0?fmtN(e.cr):"-"}</td></tr>)}
      <tr style={{background:"rgba(20,184,166,0.05)"}}><td style={{...TD,fontWeight:700,color:CL.text}}>TOTAL</td><td style={{...TD,textAlign:"right",fontWeight:700,color:CL.green}}>NPR {fmtN(sel.journal_entries?.reduce((a,e)=>a+e.dr,0)||0)}</td><td style={{...TD,textAlign:"right",fontWeight:700,color:CL.blue}}>NPR {fmtN(sel.journal_entries?.reduce((a,e)=>a+e.cr,0)||0)}</td></tr></tbody></table>
    </Modal>}
  </div>
}

function TrialBalance({cid}){
  const[entries,setEntries]=useState([]);const[loading,setLoading]=useState(true)
  useEffect(()=>{if(cid)sb.from("journal_entries").select("*,journals!inner(client_id)").eq("journals.client_id",cid).then(({data})=>{setEntries(data||[]);setLoading(false)})},[cid])
  const led=buildLedger(entries).filter(a=>a.dr>0||a.cr>0)
  const tDr=led.reduce((a,l)=>a+l.dr,0),tCr=led.reduce((a,l)=>a+l.cr,0);const bal=Math.abs(tDr-tCr)<0.01
  const exCols=[{k:"c",l:"Code"},{k:"n",l:"Account Name"},{k:"g",l:"Group"},{k:"dr",l:"Debit NPR"},{k:"cr",l:"Credit NPR"},{k:"bal",l:"Net Balance NPR"}]
  return<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <SH title="⚖️ Trial Balance" col={CL.teal}/>
      <Bdg col={bal?CL.green:CL.red}ch={bal?"✅ Balanced":"❌ Not Balanced"}/>
    </div>
    <div style={CD}>
      {loading?<Spin/>:<><Tbl cols={[{k:"c",l:"Code"},{k:"n",l:"Account Name"},{k:"g",l:"Group"},{k:"dr",l:"Debit",r:v=><span style={{color:CL.green}}>{fmtN(v)}</span>},{k:"cr",l:"Credit",r:v=><span style={{color:CL.blue}}>{fmtN(v)}</span>},{k:"bal",l:"Net Balance",r:v=><b style={{color:v>0?CL.text:v<0?CL.red:CL.muted}}>{fmtN(Math.abs(v))}</b>}]} rows={led} empty="No entries yet." onExport fname="Trial_Balance"/>
      <div style={{display:"flex",justifyContent:"flex-end",gap:20,marginTop:10,paddingTop:10,borderTop:"1px solid rgba(20,184,166,0.1)",fontWeight:700,fontSize:12}}>
        <span style={{color:CL.green}}>Total Dr: NPR {fmtN(tDr)}</span><span style={{color:CL.blue}}>Total Cr: NPR {fmtN(tCr)}</span>
      </div></>}
    </div>
  </div>
}

function FinStmt({cid,client}){
  const[tab,setTab]=useState("sfp");const[entries,setEntries]=useState([]);const[loading,setLoading]=useState(true)
  useEffect(()=>{if(cid)sb.from("journal_entries").select("*,journals!inner(client_id)").eq("journals.client_id",cid).then(({data})=>{setEntries(data||[]);setLoading(false)})},[cid])
  const led=buildLedger(entries)
  const ab=c=>Math.abs(aBal(led,c));const gb=g=>Math.abs(gBal(led,g))
  const rev=gb("Revenue");const oInc=gb("Other Income");const cogs=gb("Cost of Sales");const gp=rev-cogs
  const empC=gb("Employee Costs");const occ=gb("Occupancy");const adm=gb("Admin");const prof=gb("Professional");const finC=gb("Finance Costs");const othE=gb("Other Expenses")
  const totOp=empC+occ+adm+prof+othE;const ebit=gp+oInc-totOp;const tax=gb("Taxation");const np=ebit-finC-tax
  const cash=ab("1001")+ab("1002");const recv=ab("1003");const inv=ab("1004");const vatR=ab("1005");const tdsR=ab("1006");const tCA=cash+recv+inv+vatR+tdsR
  const ppe=ab("1101")-ab("1102");const tA=tCA+ppe
  const pay=ab("2001");const vatP=ab("2002");const tdsP=ab("2003");const salP=ab("2004");const tCL=pay+vatP+tdsP+salP
  const ltL=ab("2101");const grat=ab("2102");const tNCL=ltL+grat
  const cap=ab("3001");const ret=ab("3002");const tEq=cap+ret+np;const tLE=tCL+tNCL+tEq
  const depr=ab("1102");const cfO=np+depr-recv+pay;const cfI=-(ppe+depr);const cfF=cap+ltL;const netCF=cfO+cfI+cfF
  const fy=cfy()
  const R=({l,v,bold,col,ind,sep})=><tr style={{borderTop:sep?"1px solid rgba(20,184,166,0.1)":"none"}}><td style={{...TD,paddingLeft:(ind||0)*14+11,fontWeight:bold?700:400,color:bold?CL.text:CL.sub,fontSize:bold?12:11}}>{l}</td><td style={{...TD,textAlign:"right",fontWeight:bold?700:400,color:col||(bold?CL.text:CL.sub),fontSize:bold?12:11}}>{v!=null?`NPR ${fmtN(v)}`:""}</td></tr>
  const Rh=({l})=><tr><td colSpan={2}style={{...TD,fontWeight:800,color:CL.teal,fontSize:10,paddingTop:10,textTransform:"uppercase",letterSpacing:"0.06em"}}>{l}</td></tr>
  const Hdr=({title})=><div style={{marginBottom:12,paddingBottom:10,borderBottom:"1px solid rgba(20,184,166,0.1)"}}><div style={{fontWeight:800,fontSize:13,color:CL.text}}>{client?.name||"Entity"}</div><div style={{fontWeight:700,fontSize:11,color:CL.teal,marginTop:2}}>{title}</div><div style={{fontSize:9,color:CL.muted,marginTop:1}}>Year ended Ashadh {fy.year+1} (FY {fy.label}) · Amounts in NPR</div></div>
  const expStmt=(rows,fname)=>{exportExcel(rows,[{k:"label",l:"Particulars"},{k:"amount",l:"NPR"}],fname)}
  if(loading)return<Spin/>
  return<div>
    <SH title="📊 NFRS Financial Statements" col={CL.teal}/>
    <Tabs tabs={[{id:"sfp",l:"Financial Position"},{id:"sfperf",l:"Financial Performance"},{id:"soce",l:"Changes in Equity"},{id:"scf",l:"Cash Flows"},{id:"notes",l:"Notes"}]} act={tab} onChange={setTab}/>
    {tab==="sfp"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:12}}>
      <div style={CD}><Hdr title="Statement of Financial Position"/>
        <div style={{fontWeight:700,color:CL.text,marginBottom:8}}>ASSETS</div>
        <table style={{width:"100%",borderCollapse:"collapse"}}><tbody>
          <Rh l="Current Assets"/><R l="Cash & Cash Equivalents"v={cash}ind={1}/><R l="Trade Receivables"v={recv}ind={1}/><R l="Inventories"v={inv}ind={1}/><R l="VAT Receivable"v={vatR}ind={1}/><R l="TDS Receivable"v={tdsR}ind={1}/>
          <R l="Total Current Assets"v={tCA}bold sep/>
          <Rh l="Non-Current Assets"/><R l="PPE (net)"v={ppe}ind={1}/>
          <R l="Total Non-Current Assets"v={ppe}bold sep/>
          <R l="TOTAL ASSETS"v={tA}bold col={CL.green}sep/>
        </tbody></table>
        <button onClick={()=>expStmt([{label:"Cash & Cash Equivalents",amount:cash},{label:"Trade Receivables",amount:recv},{label:"Inventories",amount:inv},{label:"Total Current Assets",amount:tCA},{label:"PPE (net)",amount:ppe},{label:"TOTAL ASSETS",amount:tA}],"Financial_Position_Assets")}style={{...Sm(CL.green),marginTop:8}}>📥 Export Excel</button>
      </div>
      <div style={CD}><Hdr title="Statement of Financial Position"/>
        <div style={{fontWeight:700,color:CL.text,marginBottom:8}}>LIABILITIES & EQUITY</div>
        <table style={{width:"100%",borderCollapse:"collapse"}}><tbody>
          <Rh l="Current Liabilities"/><R l="Trade Payables"v={pay}ind={1}/><R l="VAT Payable"v={vatP}ind={1}/><R l="TDS Payable"v={tdsP}ind={1}/><R l="Salary Payable"v={salP}ind={1}/>
          <R l="Total Current Liabilities"v={tCL}bold sep/>
          <Rh l="Non-Current Liabilities"/><R l="Long-term Loan"v={ltL}ind={1}/><R l="Gratuity Provision"v={grat}ind={1}/>
          <R l="Total Non-Current Liabilities"v={tNCL}bold sep/>
          <Rh l="Equity"/><R l="Owner's Capital"v={cap}ind={1}/><R l="Retained Earnings"v={ret}ind={1}/><R l="Profit for the Year"v={np}ind={1}col={np>=0?CL.green:CL.red}/>
          <R l="Total Equity"v={tEq}bold sep/>
          <R l="TOTAL LIABILITIES & EQUITY"v={tLE}bold col={CL.blue}sep/>
        </tbody></table>
      </div>
    </div>}
    {tab==="sfperf"&&<div style={CD}><Hdr title="Statement of Financial Performance"/>
      <table style={{width:"100%",borderCollapse:"collapse"}}><tbody>
        <Rh l="Revenue"/><R l="Revenue from Sales"v={rev}ind={1}/><R l="Other Income"v={oInc}ind={1}/><R l="Total Revenue"v={rev+oInc}bold sep/>
        <Rh l="Cost of Sales"/><R l="Cost of Goods Sold"v={cogs}ind={1}/><R l="GROSS PROFIT"v={gp}bold col={gp>=0?CL.green:CL.red}sep/>
        <Rh l="Operating Expenses"/>
        <R l="Employee Costs"v={empC}ind={1}/><R l="Occupancy"v={occ}ind={1}/><R l="Admin & General"v={adm}ind={1}/><R l="Professional Fees"v={prof}ind={1}/><R l="Other Expenses"v={othE}ind={1}/>
        <R l="Total Operating Expenses"v={totOp}bold sep/>
        <R l="Operating Profit"v={gp+oInc-totOp}bold col={(gp+oInc-totOp)>=0?CL.teal:CL.red}sep/>
        <R l="Finance Costs"v={finC}ind={1}/>
        <R l="PROFIT BEFORE TAX"v={ebit-finC}bold col={(ebit-finC)>=0?CL.teal:CL.red}sep/>
        <R l="Income Tax"v={tax}ind={1}/>
        <R l="PROFIT FOR THE PERIOD"v={np}bold col={np>=0?CL.green:CL.red}sep/>
      </tbody></table>
      <button onClick={()=>expStmt([{label:"Revenue from Sales",amount:rev},{label:"Other Income",amount:oInc},{label:"Total Revenue",amount:rev+oInc},{label:"Cost of Goods Sold",amount:cogs},{label:"Gross Profit",amount:gp},{label:"Total Operating Expenses",amount:totOp},{label:"Profit Before Tax",amount:ebit-finC},{label:"Income Tax",amount:tax},{label:"Profit for the Period",amount:np}],"Financial_Performance")}style={{...Sm(CL.green),marginTop:8}}>📥 Export Excel</button>
    </div>}
    {tab==="soce"&&<div style={CD}><Hdr title="Statement of Changes in Equity"/>
      <table style={{width:"100%",borderCollapse:"collapse",minWidth:500}}>
        <thead><tr>{["","Share Capital","Retained Earnings","Total Equity"].map(h=><th key={h}style={{...TH,textAlign:h===""?"left":"right"}}>{h}</th>)}</tr></thead>
        <tbody>
          {[["Opening Balance",fmtN(cap),fmtN(ret),fmtN(cap+ret)],["Profit for the Year","—",fmtN(np),fmtN(np)],["Dividends Paid","—","—","—"]].map(([l,...vs],i)=><tr key={i}><td style={TD}>{l}</td>{vs.map((v,j)=><td key={j}style={{...TD,textAlign:"right"}}>{v}</td>)}</tr>)}
          <tr style={{borderTop:"2px solid rgba(20,184,166,0.2)"}}><td style={{...TD,fontWeight:800,color:CL.text}}>Closing Balance</td><td style={{...TD,textAlign:"right",fontWeight:700}}>NPR {fmtN(cap)}</td><td style={{...TD,textAlign:"right",fontWeight:700,color:np>=0?CL.green:CL.red}}>NPR {fmtN(ret+np)}</td><td style={{...TD,textAlign:"right",fontWeight:800,color:CL.teal}}>NPR {fmtN(tEq)}</td></tr>
        </tbody>
      </table>
    </div>}
    {tab==="scf"&&<div style={CD}><Hdr title="Statement of Cash Flows (Indirect Method)"/>
      <table style={{width:"100%",borderCollapse:"collapse"}}><tbody>
        <Rh l="A. Operating Activities"/>
        <R l="Profit for the Year"v={np}ind={1}/><R l="Add: Depreciation"v={depr}ind={1}/><R l="(Inc)/Dec in Receivables"v={-recv}ind={2}col={recv>0?CL.red:CL.green}/><R l="(Inc)/Dec in Inventories"v={-inv}ind={2}col={inv>0?CL.red:CL.green}/><R l="Inc/(Dec) in Payables"v={pay}ind={2}col={pay>0?CL.green:CL.red}/>
        <R l="Net Cash from Operations"v={cfO}bold col={cfO>=0?CL.green:CL.red}sep/>
        <Rh l="B. Investing Activities"/><R l="Purchase of PPE"v={-(ppe+depr)}ind={1}col={CL.red}/>
        <R l="Net Cash from Investing"v={cfI}bold col={cfI>=0?CL.green:CL.red}sep/>
        <Rh l="C. Financing Activities"/><R l="Capital Introduced"v={cap}ind={1}col={CL.green}/><R l="Long-term Loans"v={ltL}ind={1}col={CL.green}/>
        <R l="Net Cash from Financing"v={cfF}bold col={cfF>=0?CL.green:CL.red}sep/>
        <R l="NET CHANGE IN CASH"v={netCF}bold col={netCF>=0?CL.green:CL.red}sep/>
        <R l="Cash at Beginning"v={0}ind={1}/><R l="CASH AT END"v={cash}bold col={CL.teal}sep/>
      </tbody></table>
      <button onClick={()=>expStmt([{label:"Profit for the Year",amount:np},{label:"Add Depreciation",amount:depr},{label:"Net Cash from Operations",amount:cfO},{label:"Net Cash from Investing",amount:cfI},{label:"Net Cash from Financing",amount:cfF},{label:"Net Change in Cash",amount:netCF},{label:"Cash at End",amount:cash}],"Cash_Flows")}style={{...Sm(CL.green),marginTop:8}}>📥 Export Excel</button>
    </div>}
    {tab==="notes"&&<div style={{display:"grid",gap:10}}>
      {[["Note 1 — Basis of Preparation","Prepared in accordance with Nepal Financial Reporting Standard for Small and Medium-sized Entities (NFRS for SMEs) issued by AASBN. Historical cost basis. Functional currency: Nepali Rupee (NPR)."],["Note 2 — Significant Accounting Policies","Revenue (Sec 23): Recognised when risks & rewards transferred. Inventories (Sec 13): Lower of cost and NRV, weighted average method. PPE (Sec 17): Cost less depreciation — SLM rates: Building 40yr, Furniture 10yr, Equipment 5yr, Vehicles 8yr, Computers 4yr. Employee Benefits (Sec 28): Gratuity = 1 month basic × years of service (Labour Act 2074). SSF: employer 20% + employee 11%."],["Note 3 — VAT","Registered at 13%. Output VAT collected on taxable sales. Input VAT claimable on purchases. Monthly return (Form VAT 10) due by 25th of following month BS."],["Note 4 — Advance Tax","Payable in 3 instalments: 40% by Poush end, 70% by Chaitra end, 100% by Ashadh end. Late payment: 15% p.a. interest + NPR 1,000 penalty."],["Note 5 — Related Party Transactions","All related party transactions conducted at arm's length. Key management personnel compensation disclosed as required."],["Note 6 — Going Concern","Management is satisfied that adequate resources exist to continue operations for the foreseeable future."],["Note 7 — Events After Reporting Date","No material adjusting or non-adjusting events after the reporting date."]].map(([n,t],i)=><div key={i}style={CD}><div style={{fontWeight:700,color:CL.teal,fontSize:11,marginBottom:7}}>{n}</div><div style={{fontSize:11,color:CL.sub,lineHeight:1.75}}>{t}</div><button onClick={()=>navigator.clipboard?.writeText(t)}style={{...Sm(CL.muted),marginTop:8,fontSize:9}}>📋 Copy</button></div>)}
    </div>}
  </div>
}

function VATModule({cid,client}){
  const fy=cfy()
  const months=BM.map((m,i)=>{const yr=i<3?fy.year+1:fy.year;return{v:`${yr}-${String(i+1).padStart(2,"0")}`,l:`${m} ${yr}`}})
  const bs=tbs();const curM=`${bs.y}-${String(bs.m).padStart(2,"0")}`
  const[period,setPeriod]=useState(months.find(m=>m.v===curM)?.v||months[0]?.v||"")
  const[jnls,setJnls]=useState([]);const[loading,setLoading]=useState(true)
  useEffect(()=>{if(cid)sb.from("journals").select("*").eq("client_id",cid).then(({data})=>{setJnls(data||[]);setLoading(false)})},[cid])
  const sum=(a,f)=>a.reduce((s,j)=>s+(j[f]||0),0)
  const sales=jnls.filter(j=>j.type==="sales"&&j.date?.startsWith(period))
  const purch=jnls.filter(j=>j.type==="purchase"&&j.date?.startsWith(period))
  const sRet=jnls.filter(j=>j.type==="sales_return"&&j.date?.startsWith(period))
  const pRet=jnls.filter(j=>j.type==="purchase_return"&&j.date?.startsWith(period))
  const sV=sum(sales,"vat_amount")-sum(sRet,"vat_amount");const pV=sum(purch,"vat_amount")-sum(pRet,"vat_amount")
  const sA=sum(sales,"subtotal")-sum(sRet,"subtotal");const pA=sum(purch,"subtotal")-sum(pRet,"subtotal")
  const vatPay=sV-pV;const pLabel=months.find(m=>m.v===period)?.l||period
  const expVAT=()=>{exportExcel([{label:"Net Taxable Sales",amount:sA},{label:"Output VAT 13%",amount:sV},{label:"Net Taxable Purchases",amount:pA},{label:"Input VAT 13%",amount:pV},{label:"Net VAT Payable",amount:vatPay}],[{k:"label",l:"Particulars"},{k:"amount",l:"NPR"}],`VAT_Return_${period}`)}
  return<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
      <SH title="🧾 VAT Register & Return (Form VAT 10)" col={CL.amber}/>
      <div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:10,color:CL.muted}}>Period:</span><select style={{...SS,width:150}}value={period}onChange={e=>setPeriod(e.target.value)}>{months.map(m=><option key={m.v}value={m.v}>{m.l}</option>)}</select></div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginBottom:12}}>
      <KPI label="Output VAT" val={fmt(sV)} col={CL.green} sub="Collected"/>
      <KPI label="Input VAT" val={fmt(pV)} col={CL.blue} sub="Claimable"/>
      <KPI label="Net VAT Payable" val={fmt(vatPay)} col={vatPay>=0?CL.amber:CL.green} sub={vatPay>=0?"Due to IRD":"Refundable"}/>
    </div>
    {loading?<Spin/>:<div style={CD}>
      <div style={{borderBottom:"2px solid rgba(20,184,166,0.2)",paddingBottom:10,marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:800,color:CL.text}}>FORM VAT 10 — VAT RETURN</div>
        <div style={{fontSize:10,color:CL.muted}}>IRD Nepal · {client?.name||"—"} | PAN: {client?.pan||"—"} | Period: {pLabel}</div>
      </div>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr><th style={TH}>Particulars</th><th style={{...TH,textAlign:"right"}}>NPR</th></tr></thead>
        <tbody>{[["PART A — OUTPUT TAX",null,true],["1. Net Taxable Sales (excl VAT)",fmtN(sA),false],["2. Output VAT @ 13%",fmtN(sV),false],["PART B — INPUT TAX",null,true],["3. Net Taxable Purchases (excl VAT)",fmtN(pA),false],["4. Input VAT @ 13%",fmtN(pV),false],["PART C — NET",null,true],["5. Output VAT",fmtN(sV),false],["6. Less: Input VAT",fmtN(pV),false],["7. NET VAT PAYABLE / (REFUNDABLE)",fmtN(vatPay),true]].map(([l,v,h],i)=><tr key={i}style={{background:h&&!v?"rgba(20,184,166,0.04)":"transparent",borderTop:h&&!v?"1px solid rgba(20,184,166,0.1)":"none"}}>
          <td style={{...TD,fontWeight:(h&&!v)||i===9?700:400,color:(h&&!v)||i===9?CL.text:CL.sub}}>{l}</td>
          <td style={{...TD,textAlign:"right",fontWeight:i===9?800:400,color:i===9?(vatPay>=0?CL.amber:CL.green):CL.text}}>{v}</td>
        </tr>)}</tbody>
      </table>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:10}}>
        <div style={{fontSize:10,color:CL.amber}}>⚠️ Due: 25th of following month · Late fee: NPR 1,000 + 15% p.a.</div>
        <button onClick={expVAT}style={Sm(CL.green)}>📥 Export Excel</button>
      </div>
    </div>}
  </div>
}

function Dashboard({cid,clients}){
  const cl=clients.find(c=>c.id===cid);const fy=cfy()
  const[jnls,setJnls]=useState([]);const[stock,setStock]=useState([]);const[loading,setLoading]=useState(true)
  useEffect(()=>{
    if(!cid)return
    Promise.all([sb.from("journals").select("*").eq("client_id",cid),sb.from("stock").select("*").eq("client_id",cid)]).then(([{data:j},{data:s}])=>{setJnls(j||[]);setStock(s||[]);setLoading(false)})
  },[cid])
  const sum=(a,f)=>a.reduce((s,j)=>s+(j[f]||0),0)
  const s=jnls.filter(j=>j.type==="sales"),p=jnls.filter(j=>j.type==="purchase")
  const sr=jnls.filter(j=>j.type==="sales_return"),pr=jnls.filter(j=>j.type==="purchase_return")
  const stVal=stock.reduce((a,i)=>a+i.qty*i.cost_rate,0);const low=stock.filter(i=>i.qty<=i.min_qty&&i.min_qty>0).length
  const outV=sum(s,"vat_amount")-sum(sr,"vat_amount");const inV=sum(p,"vat_amount")-sum(pr,"vat_amount")
  const today=bstr(tbs())
  const dl=[{d:"VAT Return (monthly)",due:`${fy.year}-05-25`},{d:"Advance Tax 1st (40%)",due:`${fy.year}-09-30`},{d:"Advance Tax 2nd (70%)",due:`${fy.year}-12-30`},{d:"Advance Tax Final",due:`${fy.year+1}-03-31`},{d:"Income Tax Return",due:`${fy.year+1}-09-30`}]
  if(!cid)return<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:320,color:CL.muted,gap:10}}><div style={{fontSize:52}}>👆</div><div style={{fontSize:14,fontWeight:700}}>Select a client from the sidebar to begin</div></div>
  return<div>
    <div style={{marginBottom:16}}><h1 style={{margin:0,fontSize:20,fontWeight:800,color:CL.text}}>🏠 Dashboard</h1><div style={{fontSize:11,color:CL.muted,marginTop:3}}>{cl?.name} · {bdis(today)} BS · FY {fy.label}</div></div>
    {loading?<Spin/>:<>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,marginBottom:14}}>
      <KPI label="Net Sales" val={fmt(sum(s,"total")-sum(sr,"total"))} col={CL.green} sub={`${s.length} invoices`}/>
      <KPI label="Net Purchases" val={fmt(sum(p,"total")-sum(pr,"total"))} col={CL.blue} sub={`${p.length} bills`}/>
      <KPI label="Output VAT" val={fmt(outV)} col={CL.amber} sub="Collected"/>
      <KPI label="Input VAT" val={fmt(inV)} col={CL.purple} sub="Claimable"/>
      <KPI label="Net VAT Payable" val={fmt(outV-inV)} col={outV-inV>=0?CL.amber:CL.green} sub="To IRD"/>
      <KPI label="Stock Value" val={fmt(stVal)} col={CL.teal} sub="At cost"/>
      <KPI label="Journals" val={jnls.length} col={CL.text} sub="Posted entries"/>
      <KPI label="Low Stock" val={low} col={low>0?CL.red:CL.green} sub="Items"/>
    </div>
    <div style={CD}>
      <div style={{fontSize:10,fontWeight:700,color:CL.muted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:10}}>Compliance Deadlines — FY {fy.label}</div>
      {dl.map((d,i)=>{const parts=d.due.split("-").map(Number);const dy=Math.floor((new Date(parts[0],parts[1]-1,parts[2])-new Date())/86400000);return<div key={i}style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid rgba(20,184,166,0.06)"}}><div style={{fontSize:11,color:CL.text}}>{d.d}</div><div style={{display:"flex",gap:8,alignItems:"center"}}>{dy<0&&<Bdg col={CL.red}ch={`${Math.abs(dy)}d OVERDUE`}/>}{dy>=0&&dy<30&&<Bdg col={CL.amber}ch={`${dy}d left`}/>}<span style={{fontSize:10,color:CL.muted}}>{bdis(d.due)}</span></div></div>})}
    </div></>}
  </div>
}

function ClientMgr({clients,setClients,user}){
  const[show,setShow]=useState(false);const[f,setF]=useState({name:"",pan:"",type:"trading",vat:"monthly",address:"",phone:""})
  const save=async()=>{
    if(!f.name||!f.pan)return alert("Name and PAN required")
    const{data,error}=await sb.from("clients").insert({name:f.name,pan:f.pan,type:f.type,vat:f.vat,address:f.address,phone:f.phone}).select().single()
    if(error)return alert(error.message)
    setClients(p=>[...p,data]);setShow(false);setF({name:"",pan:"",type:"trading",vat:"monthly",address:"",phone:""})
  }
  const del=async id=>{
    if(!confirm("Delete client and all their data?"))return
    await sb.from("clients").delete().eq("id",id)
    setClients(p=>p.filter(c=>c.id!==id))
  }
  return<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <SH title="🏢 Client Management" col={CL.teal}/>
      <button style={Btn(CL.green)}onClick={()=>setShow(true)}>+ Add Client</button>
    </div>
    <div style={CD}><Tbl cols={[{k:"name",l:"Business Name"},{k:"pan",l:"PAN"},{k:"type",l:"Type",r:v=><Bdg col={CL.teal}ch={v}/>},{k:"vat",l:"VAT",r:v=><Bdg col={v==="monthly"?CL.green:CL.blue}ch={v}/>},{k:"phone",l:"Phone"},{k:"address",l:"Address"},{k:"id",l:"",r:(_,r)=><button onClick={()=>del(r.id)}style={Sm(CL.red)}>Delete</button>}]} rows={clients} empty="No clients. Add your first client." onExport fname="Clients_List"/></div>
    {show&&<Modal title="Add New Client"onClose={()=>setShow(false)}>
      <In label="Business Name *"value={f.name}onChange={e=>setF(x=>({...x,name:e.target.value}))}/>
      <In label="PAN *"value={f.pan}onChange={e=>setF(x=>({...x,pan:e.target.value}))}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Sel label="Business Type"value={f.type}onChange={e=>setF(x=>({...x,type:e.target.value}))}opts={["trading","service","manufacturing","restaurant","construction","ngo"]}/>
        <Sel label="VAT Filing"value={f.vat}onChange={e=>setF(x=>({...x,vat:e.target.value}))}opts={[{v:"monthly",l:"Monthly"},{v:"quarterly",l:"Quarterly"}]}/>
        <In label="Phone"value={f.phone}onChange={e=>setF(x=>({...x,phone:e.target.value}))}/>
        <In label="Address"value={f.address}onChange={e=>setF(x=>({...x,address:e.target.value}))}/>
      </div>
      <div style={{display:"flex",gap:10,marginTop:14}}>
        <button style={Btn(CL.green)}onClick={save}>Add Client</button>
        <button style={{background:"transparent",border:"1px solid rgba(20,184,166,0.2)",borderRadius:7,padding:"8px 18px",color:CL.sub,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}onClick={()=>setShow(false)}>Cancel</button>
      </div>
    </Modal>}
  </div>
}

const NAV=[{id:"dash",ic:"🏠",l:"Dashboard",s:""},{id:"stock",ic:"📦",l:"Stock/Inventory",s:"Entries"},{id:"purchase",ic:"🔵",l:"Purchase Entry",s:"Entries"},{id:"sales",ic:"🟢",l:"Sales Entry",s:"Entries"},{id:"sales_return",ic:"🟡",l:"Sales Return",s:"Entries"},{id:"purchase_return",ic:"🟣",l:"Purchase Return",s:"Entries"},{id:"cash",ic:"💵",l:"Cash/Expense",s:"Entries"},{id:"journal",ic:"📓",l:"Manual Journal",s:"Entries"},{id:"journals",ic:"📒",l:"Posted Journals",s:"Entries"},{id:"trial",ic:"⚖️",l:"Trial Balance",s:"Reports"},{id:"statements",ic:"📊",l:"Financial Statements",s:"Reports"},{id:"vat",ic:"🧾",l:"VAT & Return",s:"Tax"},{id:"clients",ic:"🏢",l:"Clients",s:"Setup"}]

export default function App(){
  const[user,setUser]=useState(null);const[pg,setPg]=useState("dash")
  const[clients,setClients]=useState([]);const[cid,setCid]=useState("")
  const[sb2,setSb2]=useState(true);const[refresh,setRefresh]=useState(0);const[loading,setLoading]=useState(true)
  useEffect(()=>{
    sb.from("clients").select("*").order("name").then(({data})=>setClients(data||[]))
    setLoading(false)
  },[])
  const login=u=>setUser(u)
  const logout=()=>{setUser(null);setCid("")}
  const onDone=()=>setRefresh(r=>r+1)
  const client=clients.find(c=>c.id===cid)
  const needClient=!["clients","dash"].includes(pg)
  const renderPage=()=>{
    if(needClient&&!cid)return<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:300,color:CL.muted,gap:10}}><div style={{fontSize:44}}>👆</div><div style={{fontSize:13,fontWeight:700}}>Select a client from the sidebar first</div></div>
    switch(pg){
      case"dash":return<Dashboard key={refresh}cid={cid}clients={clients}/>
      case"stock":return<Stock key={"s"+cid+refresh}cid={cid}onRefresh={onDone}/>
      case"purchase":return<TxnEntry key={"p"+refresh}type="purchase"cid={cid}onDone={onDone}/>
      case"sales":return<TxnEntry key={"sa"+refresh}type="sales"cid={cid}onDone={onDone}/>
      case"sales_return":return<TxnEntry key={"sr"+refresh}type="sales_return"cid={cid}onDone={onDone}/>
      case"purchase_return":return<TxnEntry key={"pr"+refresh}type="purchase_return"cid={cid}onDone={onDone}/>
      case"cash":return<CashEntry key={"c"+refresh}cid={cid}onDone={onDone}/>
      case"journal":return<ManualJournal key={"mj"+refresh}cid={cid}onDone={onDone}/>
      case"journals":return<JournalViewer key={"jv"+refresh}cid={cid}/>
      case"trial":return<TrialBalance key={"tb"+refresh}cid={cid}/>
      case"statements":return<FinStmt key={"fs"+refresh}cid={cid}client={client}/>
      case"vat":return<VATModule key={"vt"+refresh}cid={cid}client={client}/>
      case"clients":return<ClientMgr clients={clients}setClients={setClients}user={user}/>
      default:return null
    }
  }
  if(loading)return<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:CL.bg,color:CL.teal,fontSize:18,fontWeight:700}}>🏔 Loading Nepal Solution...</div>
  if(!user)return<Login onLogin={login}/>
  const secs=[...new Set(NAV.map(n=>n.s))]
  return<div style={{display:"flex",height:"100vh",overflow:"hidden",background:CL.bg,color:CL.text,fontFamily:"'Segoe UI',sans-serif"}}>
    <style>{`*{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:rgba(20,184,166,0.18);border-radius:2px;}input,select,button{font-family:inherit;}`}</style>
    {sb2&&<div style={{width:205,background:CL.card,borderRight:"1px solid rgba(20,184,166,0.12)",display:"flex",flexDirection:"column",flexShrink:0,overflowY:"auto"}}>
      <div style={{padding:"13px 12px 10px",borderBottom:"1px solid rgba(20,184,166,0.12)"}}><div style={{fontSize:13,fontWeight:800,color:CL.teal}}>🏔 Nepal Solution</div><div style={{fontSize:9,color:CL.muted,marginTop:1}}>NFRS for SMEs · Accounting</div></div>
      <div style={{padding:"7px 10px",borderBottom:"1px solid rgba(20,184,166,0.12)",background:"rgba(20,184,166,0.03)"}}>
        <div style={{fontSize:8,fontWeight:700,color:CL.muted,textTransform:"uppercase",marginBottom:3}}>Active Client</div>
        <select style={{...SS,fontSize:10,padding:"5px 8px"}}value={cid}onChange={e=>{setCid(e.target.value);setPg("dash");setRefresh(r=>r+1)}}>
          <option value="">-- Select Client --</option>
          {clients.map(c=><option key={c.id}value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div style={{flex:1,padding:"4px 0"}}>
        {secs.map(sec=><div key={sec}>
          {sec&&<div style={{fontSize:8,fontWeight:700,color:CL.muted,textTransform:"uppercase",letterSpacing:"0.07em",padding:"7px 12px 2px"}}>{sec}</div>}
          {NAV.filter(n=>n.s===sec).map(n=><div key={n.id}onClick={()=>setPg(n.id)}style={{display:"flex",alignItems:"center",gap:7,padding:"6px 12px",cursor:"pointer",background:pg===n.id?`${CL.teal}18`:"transparent",color:pg===n.id?CL.teal:CL.sub,fontWeight:pg===n.id?700:400,fontSize:11,borderLeft:pg===n.id?`2px solid ${CL.teal}`:"2px solid transparent"}}><span>{n.ic}</span><span>{n.l}</span></div>)}
        </div>)}
      </div>
      <div style={{padding:"9px 12px",borderTop:"1px solid rgba(20,184,166,0.12)"}}><div style={{fontSize:10,fontWeight:600,color:CL.text,marginBottom:3}}>{user.name}</div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><Bdg col={CL.amber}ch={user.role}/><button onClick={logout}style={{background:"none",border:"none",color:CL.muted,fontSize:9,cursor:"pointer"}}>Sign out</button></div></div>
    </div>}
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"8px 14px",borderBottom:"1px solid rgba(20,184,166,0.12)",display:"flex",alignItems:"center",gap:10,background:CL.card,flexShrink:0}}>
        <button onClick={()=>setSb2(s=>!s)}style={{background:"none",border:"none",color:CL.muted,cursor:"pointer",fontSize:15,padding:0}}>☰</button>
        <span style={{fontSize:11,fontWeight:700,color:CL.sub}}>{NAV.find(n=>n.id===pg)?.ic} {NAV.find(n=>n.id===pg)?.l}</span>
        {client&&<div style={{marginLeft:"auto"}}><Bdg col={CL.teal}ch={`${client.name} · PAN ${client.pan}`}/></div>}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:16}}>{renderPage()}</div>
    </div>
  </div>
}
