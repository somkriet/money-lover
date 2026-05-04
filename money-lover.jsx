import React, { useState, useEffect, useMemo } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, LineChart, Line, CartesianGrid, Legend
} from "recharts";
import { Home, List, Target, BarChart2, Wallet, Plus, ArrowLeftRight, Settings, Menu, ChevronLeft, ChevronRight } from "lucide-react";

// ── Theme ──────────────────────────────────────────────────────────────────
const C = {
  bg:'#07100a', surface:'#0d1810', card:'#121f15', cardHover:'#172617',
  border:'#1a3020', borderHover:'#27442e',
  primary:'#22c55e', primaryDark:'#16a34a', primaryBg:'#052e16', primaryBdr:'#14532d',
  text:'#f0fdf4', textSec:'#86efac', textMuted:'#4b7a5a',
  income:'#22c55e', incomeBg:'#052e16', incomeBdr:'#14532d',
  expense:'#f87171', expenseBg:'#3b0a0a', expenseBdr:'#7f1d1d',
  warning:'#fbbf24', info:'#60a5fa',
  teal:'#2dd4bf', tealBg:'#042f2e', tealBdr:'#134e4a',
  purple:'#c084fc', purpleBg:'#1a0935', purpleBdr:'#581c87',
};

// ── Default Categories (can be extended by user) ───────────────────────────
const DEFAULT_INCOME_CATS = [
  { id:'salary',     name:'เงินเดือน',      emoji:'💼', color:'#22c55e', builtIn:true },
  { id:'freelance',  name:'ฟรีแลนซ์',       emoji:'💻', color:'#06b6d4', builtIn:true },
  { id:'investment', name:'การลงทุน',       emoji:'📈', color:'#f59e0b', builtIn:true },
  { id:'bonus',      name:'โบนัส',          emoji:'🎁', color:'#a855f7', builtIn:true },
  { id:'transfer_in',name:'โอนเงินเข้า',    emoji:'↪️', color:'#64748b', builtIn:true },
  { id:'other_in',   name:'รายรับอื่นๆ',    emoji:'💰', color:'#64748b', builtIn:true },
];
const DEFAULT_EXPENSE_CATS = [
  { id:'food',          name:'อาหาร',           emoji:'🍜', color:'#ef4444', builtIn:true },
  { id:'transport',     name:'การเดินทาง',      emoji:'🚗', color:'#f97316', builtIn:true },
  { id:'shopping',      name:'ช้อปปิ้ง',        emoji:'🛍️', color:'#ec4899', builtIn:true },
  { id:'entertainment', name:'บันเทิง',          emoji:'🎬', color:'#a855f7', builtIn:true },
  { id:'health',        name:'สุขภาพ',           emoji:'💊', color:'#06b6d4', builtIn:true },
  { id:'utilities',     name:'ค่าสาธารณูปโภค',  emoji:'💡', color:'#eab308', builtIn:true },
  { id:'rent',          name:'ค่าเช่า/บ้าน',   emoji:'🏠', color:'#8b5cf6', builtIn:true },
  { id:'education',     name:'การศึกษา',         emoji:'📚', color:'#0ea5e9', builtIn:true },
  { id:'transfer_out',  name:'โอนเงินออก',       emoji:'↩️', color:'#64748b', builtIn:true },
  { id:'other_ex',      name:'รายจ่ายอื่นๆ',    emoji:'📌', color:'#6b7280', builtIn:true },
];

// Mutable module-level refs — updated from App state so all components see latest
let _incomeCats  = DEFAULT_INCOME_CATS;
let _expenseCats = DEFAULT_EXPENSE_CATS;
let _allCats     = [..._incomeCats, ..._expenseCats];
const getCat = (id) => _allCats.find(c => c.id === id);

// Emoji palettes for category picker
const CAT_EMOJIS_INCOME  = ['💼','💰','💻','📈','🎁','🏦','🏪','🎯','🎨','📝','🚀','⭐','🌟','🏆','💎','🤝','📦','🎤'];
const CAT_EMOJIS_EXPENSE = ['🍜','🚗','🛍️','🎬','💊','💡','🏠','📚','✈️','🎮','🐾','👗','☕','🍕','🎪','💇','🏋️','🎵','🔧','🐶','🌿','🎂','🏖️','🎭'];
const CAT_COLORS = ['#22c55e','#06b6d4','#f59e0b','#a855f7','#ef4444','#f97316','#ec4899','#8b5cf6','#0ea5e9','#eab308','#64748b','#14b8a6','#f43f5e','#84cc16','#6366f1','#fb923c'];

// ── Account types ──────────────────────────────────────────────────────────
const ACCT_TYPES = [
  { id:'cash',     label:'เงินสด',           emoji:'💵', desc:'เงินสดในมือ'           },
  { id:'savings',  label:'บัญชีออมทรัพย์',  emoji:'🏧', desc:'บัญชีธนาคารออมทรัพย์' },
  { id:'checking', label:'บัญชีเดินสะพัด',  emoji:'🏦', desc:'บัญชีธนาคารเดินสะพัด' },
  { id:'credit',   label:'บัตรเครดิต',       emoji:'💳', desc:'บัตรเครดิต/ผ่อนชำระ'  },
];
const CARD_BRANDS    = ['VISA','Mastercard','JCB','American Express','UnionPay'];
const WALLET_EMOJIS  = ['💵','💰','🏦','🏧','💳','💎','🎒','👛','📱','🌟','🔑','🏠','🎯','🪙','📊'];

// ── Default wallets ────────────────────────────────────────────────────────
const INIT_WALLETS = [
  { id:'w1', name:'เงินสด',           emoji:'💵', type:'cash',     initBal:5000,     currency:'THB', enabled:true },
  { id:'w2', name:'กสิกรเงินออม',     emoji:'🏧', type:'savings',  initBal:12322.36, currency:'THB', enabled:true },
  { id:'w3', name:'กสิกรเงินเดือน',   emoji:'🏦', type:'checking', initBal:5,        currency:'THB', enabled:true },
  { id:'w4', name:'ไทยพาณิชย์',       emoji:'🏦', type:'checking', initBal:34.23,    currency:'THB', enabled:true },
  { id:'w5', name:'กรุงไทย',          emoji:'🏦', type:'savings',  initBal:0,        currency:'THB', enabled:true },
  {
    id:'w6', name:'บัตรเครดิต VISA',  emoji:'💳', type:'credit',   initBal:0, currency:'THB', enabled:true,
    creditLimit:74000, cardBrand:'VISA', paymentDueDay:8, billingCycleDay:23,
    reminderDays:10, reminderEnabled:true,
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────
const TH_MONTHS  = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
const fmt        = (n)  => new Intl.NumberFormat('th-TH',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n||0);
const fmtShort   = (n)  => n>=1000?`${(n/1000).toFixed(1)}k`:String(Math.round(n||0));
const nowYM      = ()   => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; };
const walletBal  = (w,txs) => { const i=txs.filter(t=>t.wallet===w.id&&t.type==='income').reduce((s,t)=>s+t.amount,0); const e=txs.filter(t=>t.wallet===w.id&&t.type==='expense').reduce((s,t)=>s+t.amount,0); return (w.initBal||0)+i-e; };
const creditUsed = (w,txs) => { const e=txs.filter(t=>t.wallet===w.id&&t.type==='expense').reduce((s,t)=>s+t.amount,0); const p=txs.filter(t=>t.wallet===w.id&&t.type==='income').reduce((s,t)=>s+t.amount,0); return Math.max(0,e-p); };

// ── Sample data ────────────────────────────────────────────────────────────
const makeSampleTx = () => {
  const [y,m]=nowYM().split('-').map(Number);
  const d=(n)=>`${y}-${String(m).padStart(2,'0')}-${String(n).padStart(2,'0')}`;
  return [
    {id:'s1', type:'income', category:'salary',       amount:45000, note:'เงินเดือน',           date:d(1),  wallet:'w3'},
    {id:'s2', type:'expense',category:'rent',         amount:8000,  note:'ค่าเช่าห้อง',         date:d(2),  wallet:'w3'},
    {id:'s3', type:'expense',category:'food',         amount:320,   note:'ข้าวกลางวัน',          date:d(5),  wallet:'w1'},
    {id:'s4', type:'expense',category:'transport',    amount:130,   note:'BTS/MRT',              date:d(5),  wallet:'w1'},
    {id:'s5', type:'expense',category:'shopping',     amount:2500,  note:'เสื้อผ้า',             date:d(10), wallet:'w6'},
    {id:'s6', type:'income', category:'freelance',    amount:12000, note:'งาน Freelance Design', date:d(15), wallet:'w2'},
    {id:'s7', type:'expense',category:'food',         amount:260,   note:'อาหารเย็น',            date:d(16), wallet:'w1'},
    {id:'s8', type:'expense',category:'entertainment',amount:590,   note:'หนัง + ขนม',           date:d(18), wallet:'w6'},
    {id:'s9', type:'expense',category:'utilities',    amount:850,   note:'ค่าไฟ + ค่าน้ำ',       date:d(20), wallet:'w3'},
    {id:'s10',type:'expense',category:'health',       amount:450,   note:'วิตามิน + ยา',          date:d(22), wallet:'w1'},
  ];
};
const makeSampleBudgets = () => [
  {category:'food',         amount:5000},
  {category:'transport',    amount:2000},
  {category:'shopping',     amount:3000},
  {category:'entertainment',amount:1500},
  {category:'utilities',    amount:1200},
];

// ── Shared style helpers ───────────────────────────────────────────────────
const card  = (x={}) => ({background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:'20px 24px',...x});
const iBase = {width:'100%',background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,color:C.text,padding:'10px 14px',fontSize:14,outline:'none',fontFamily:"'Sarabun','Noto Sans Thai',sans-serif",transition:'border-color 0.15s'};

// ── Auth helpers ───────────────────────────────────────────────────────────
const USER_AVATARS = ['😊','🧑','👩','👨','🧒','👧','🦊','🐼','🐨','🦁','🐯','🦋'];
const hashPin = (pin) => { let h=0; for(let i=0;i<pin.length;i++){h=Math.imul(31,h)+pin.charCodeAt(i)|0;} return h.toString(36); };

// ══════════════════════════════════════════════════════════════════════════
// ROOT APP
// ══════════════════════════════════════════════════════════════════════════
export default function App() {
  const load = (key,def) => { try{return JSON.parse(localStorage.getItem(key)||'null')||def;}catch{return def;} };

  // ── ALL hooks must be declared unconditionally first ──
  const [authed,       setAuthed]      = useState(false);
  const [authData,     setAuthData]    = useState(()=>{ try{return JSON.parse(localStorage.getItem('ml_auth')||'null');}catch{return null;} });
  const [view,         setView]        = useState('dashboard');
  const [wallets,      setWallets]     = useState(()=>load('ml_wlt',INIT_WALLETS));
  const [txs,          setTxs]         = useState(()=>load('ml_txs',makeSampleTx()));
  const [budgets,      setBudgets]     = useState(()=>load('ml_bgt',makeSampleBudgets()));
  const [incomeCats,   setIncomeCats]  = useState(()=>load('ml_icat',DEFAULT_INCOME_CATS));
  const [expenseCats,  setExpenseCats] = useState(()=>load('ml_ecat',DEFAULT_EXPENSE_CATS));
  const [showTxModal,  setShowTxModal] = useState(false);
  const [editTx,       setEditTx]      = useState(null);
  const [selMonth,     setSelMonth]    = useState(nowYM);
  const [showTransfer, setShowTransfer]= useState(false);
  const [sideOpen,     setSideOpen]    = useState(window.innerWidth>768);
  const [winW,         setWinW]        = useState(window.innerWidth);
  useEffect(()=>{
    const fn=()=>{setWinW(window.innerWidth);if(window.innerWidth<=768)setSideOpen(false);};
    window.addEventListener('resize',fn);
    return()=>window.removeEventListener('resize',fn);
  },[]);
  const isMobile=winW<=768;

  useEffect(()=>{ localStorage.setItem('ml_wlt', JSON.stringify(wallets)); },[wallets]);
  useEffect(()=>{ localStorage.setItem('ml_txs', JSON.stringify(txs)); },[txs]);
  useEffect(()=>{ localStorage.setItem('ml_bgt', JSON.stringify(budgets)); },[budgets]);
  useEffect(()=>{ localStorage.setItem('ml_icat',JSON.stringify(incomeCats)); _incomeCats=incomeCats; _allCats=[...incomeCats,...expenseCats]; },[incomeCats]);
  useEffect(()=>{ localStorage.setItem('ml_ecat',JSON.stringify(expenseCats)); _expenseCats=expenseCats; _allCats=[...incomeCats,...expenseCats]; },[expenseCats]);

  const monthTx      = useMemo(()=>txs.filter(t=>t.date.startsWith(selMonth)).sort((a,b)=>b.date.localeCompare(a.date)),[txs,selMonth]);
  const totalIncome  = useMemo(()=>monthTx.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0),[monthTx]);
  const totalExpense = useMemo(()=>monthTx.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0),[monthTx]);

  // ── Handlers ──
  const handleSetup  = (d) => { localStorage.setItem('ml_auth',JSON.stringify(d)); setAuthData(d); setAuthed(true); };
  const handleLogout = ()  => setAuthed(false);
  const handleReset  = ()  => { localStorage.removeItem('ml_auth'); setAuthData(null); setAuthed(false); };

  const saveTx = (tx) => { setTxs(prev=>editTx?prev.map(t=>t.id===editTx.id?{...tx,id:editTx.id}:t):[...prev,{...tx,id:Date.now().toString()}]); setShowTxModal(false); setEditTx(null); };
  const deleteTx = (id) => setTxs(prev=>prev.filter(t=>t.id!==id));
  const openEdit = (tx) => { setEditTx(tx); setShowTxModal(true); };

  const doTransfer = ({fromId,toId,amount,note,date}) => {
    const id=Date.now().toString();
    const fromW=wallets.find(w=>w.id===fromId);
    const toW  =wallets.find(w=>w.id===toId);
    setTxs(prev=>[...prev,
      {id:id+'a',type:'expense',category:'transfer_out',amount,note:`โอน→${toW?.name}${note?' '+note:''}`,  date,wallet:fromId},
      {id:id+'b',type:'income', category:'transfer_in', amount,note:`จาก ${fromW?.name}${note?' '+note:''}`,date,wallet:toId},
    ]);
    setShowTransfer(false);
  };

  const [y,m]=selMonth.split('-').map(Number);
  const monthLabel=`${TH_MONTHS[m-1]} ${y+543}`;

  const nav=[
    {id:'dashboard',   label:'ภาพรวม',  Icon:Home},
    {id:'transactions',label:'รายการ',   Icon:List},
    {id:'wallets',     label:'บัญชี',    Icon:Wallet},
    {id:'budget',      label:'งบประมาณ',Icon:Target},
    {id:'reports',     label:'รายงาน',  Icon:BarChart2},
    {id:'settings',    label:'ตั้งค่า',  Icon:Settings},
  ];

  // ── Early return AFTER all hooks ──
  if (!authed) {
    return authData
      ? <LoginScreen  authData={authData} onSuccess={()=>setAuthed(true)}/>
      : <SetupScreen  onDone={handleSetup}/>;
  }

  return (
    <div style={{display:'flex',minHeight:'100vh',background:C.bg,color:C.text,fontFamily:"'Sarabun','Noto Sans Thai',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px}
        input,select,textarea,button{font-family:'Sarabun','Noto Sans Thai',sans-serif}
        input:focus,select:focus{border-color:${C.primary}!important}
        input[type=date]::-webkit-calendar-picker-indicator{filter:invert(0.5)}
        .nb:hover{background:${C.primaryBg}!important;color:${C.textSec}!important}
        .txr:hover{background:${C.cardHover}!important}
        .wltr:hover{background:${C.cardHover}!important}
        .emb:hover{transform:scale(1.2)}
        @media(max-width:768px){
          .stat-grid{grid-template-columns:1fr 1fr!important}
          .stat-grid>div:last-child{grid-column:1/-1}
          .main-pad{padding:18px 14px 80px!important}
        }
      `}</style>

      {/* ── Mobile Backdrop ── */}
      {isMobile&&sideOpen&&<div onClick={()=>setSideOpen(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:999}}/>}

      {/* ── Sidebar ── */}
      <aside style={{
        width:isMobile?230:sideOpen?230:64,
        background:C.surface,borderRight:`1px solid ${C.border}`,
        display:'flex',flexDirection:'column',padding:'24px 0',
        position:isMobile?'fixed':'sticky',top:0,left:0,
        height:'100vh',flexShrink:0,
        zIndex:isMobile?1000:1,
        transform:isMobile&&!sideOpen?'translateX(-100%)':'translateX(0)',
        transition:'transform 0.25s ease, width 0.2s ease',
        overflow:'hidden',
      }}>
        <button onClick={()=>setSideOpen(o=>!o)} style={{position:'absolute',top:16,right:8,background:'none',border:'none',color:C.textMuted,cursor:'pointer',padding:4,borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center'}}>
          {sideOpen||isMobile?<ChevronLeft size={16}/>:<ChevronRight size={16}/>}
        </button>
        <div style={{padding:'0 16px 28px',overflow:'hidden'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,minWidth:0}}>
            <div style={{width:40,height:40,borderRadius:12,background:C.primaryBg,border:`1px solid ${C.primaryBdr}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{authData?.avatar||'💚'}</div>
            {(sideOpen||isMobile)&&<div style={{minWidth:0}}>
              <div style={{fontWeight:700,fontSize:14,color:C.text,lineHeight:1.2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{authData?.name||'Money Lover'}</div>
              <div style={{fontSize:11,color:C.textMuted}}>บัญชีรายรับ-รายจ่าย</div>
            </div>}
          </div>
        </div>
        {(sideOpen||isMobile)&&<div style={{padding:'0 14px 20px'}}>
          <MonthYearPicker selMonth={selMonth} onChange={setSelMonth}/>
        </div>}
        <nav style={{flex:1,overflow:'auto'}}>
          {nav.map(({id,label,Icon})=>(
            <button key={id} className="nb" onClick={()=>{setView(id);if(isMobile)setSideOpen(false);}} style={{
              width:'100%',display:'flex',alignItems:'center',
              gap:sideOpen||isMobile?12:0,
              justifyContent:sideOpen||isMobile?'flex-start':'center',
              padding:sideOpen||isMobile?'11px 20px':'13px 0',
              background:view===id?C.primaryBg:'none',
              border:'none',borderLeft:view===id?`3px solid ${C.primary}`:'3px solid transparent',
              color:view===id?C.primary:C.textMuted,cursor:'pointer',fontSize:14,fontWeight:view===id?600:400,textAlign:'left',transition:'all 0.15s',
            }}><Icon size={17}/>{(sideOpen||isMobile)&&label}</button>
          ))}
        </nav>
        <div style={{padding:'16px 10px 0',display:'flex',flexDirection:'column',gap:8}}>
          {sideOpen||isMobile?<>
            <button onClick={()=>{setEditTx(null);setShowTxModal(true);if(isMobile)setSideOpen(false);}} style={{width:'100%',padding:'11px',borderRadius:10,background:C.primary,border:'none',color:'#fff',fontWeight:700,fontSize:14,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}><Plus size={16}/>เพิ่มรายการ</button>
            <button onClick={()=>{setShowTransfer(true);if(isMobile)setSideOpen(false);}} style={{width:'100%',padding:'9px',borderRadius:10,background:C.card,border:`1px solid ${C.border}`,color:C.textMuted,fontWeight:500,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}><ArrowLeftRight size={14}/>โอนเงินข้ามบัญชี</button>
          </>:<>
            <button onClick={()=>{setEditTx(null);setShowTxModal(true);}} style={{width:'100%',padding:'10px 0',borderRadius:10,background:C.primary,border:'none',color:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Plus size={18}/></button>
            <button onClick={()=>setShowTransfer(true)} style={{width:'100%',padding:'9px 0',borderRadius:10,background:C.card,border:`1px solid ${C.border}`,color:C.textMuted,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><ArrowLeftRight size={15}/></button>
          </>}
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="main-pad" style={{flex:1,overflow:'auto',padding:'28px 28px 40px',minWidth:0}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:24}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            {isMobile&&<button onClick={()=>setSideOpen(true)} style={{background:'none',border:`1px solid ${C.border}`,borderRadius:8,color:C.textSec,cursor:'pointer',padding:'6px 8px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <Menu size={18}/>
            </button>}
            <div><h1 style={{fontSize:22,fontWeight:700,color:C.text}}>{nav.find(n=>n.id===view)?.label}</h1>
            <p style={{fontSize:12,color:C.textMuted,marginTop:2}}>เดือน{monthLabel}</p></div>
          </div>
        </div>
        {view!=='settings'&&(
          <div className="stat-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:24}}>
            <StatCard label="รายรับทั้งหมด"  value={totalIncome}              type="income"/>
            <StatCard label="รายจ่ายทั้งหมด" value={totalExpense}             type="expense"/>
            <StatCard label="คงเหลือสุทธิ"   value={totalIncome-totalExpense} type="balance"/>
          </div>
        )}

        {view==='dashboard'    && <DashboardView    monthTx={monthTx} txs={txs} selMonth={selMonth} budgets={budgets} wallets={wallets}/>}
        {view==='transactions' && <TransactionsView monthTx={monthTx} wallets={wallets} onEdit={openEdit} onDelete={deleteTx}/>}
        {view==='wallets'      && <WalletsView      wallets={wallets} setWallets={setWallets} txs={txs} onTransfer={()=>setShowTransfer(true)}/>}
        {view==='budget'       && <BudgetView       budgets={budgets} setBudgets={setBudgets} monthTx={monthTx} expenseCats={expenseCats}/>}
        {view==='reports'      && <ReportsView      txs={txs} selMonth={selMonth}/>}
        {view==='settings'     && <SettingsView     incomeCats={incomeCats} setIncomeCats={setIncomeCats} expenseCats={expenseCats} setExpenseCats={setExpenseCats} authData={authData} onLogout={handleLogout} onReset={handleReset}/>}
      </main>

      {showTxModal  && <TxModal   editTx={editTx} wallets={wallets} incomeCats={incomeCats} expenseCats={expenseCats} onSave={saveTx} onClose={()=>{setShowTxModal(false);setEditTx(null);}}/>}
      {showTransfer && <TransferModal wallets={wallets} onTransfer={doTransfer} onClose={()=>setShowTransfer(false)}/>}
    </div>
  );
}

// ── Month Year Picker ──────────────────────────────────────────────────────
function MonthYearPicker({selMonth,onChange}) {
  const [open,setOpen]=useState(false);
  const [y,m]=selMonth.split('-').map(Number);
  const [pickerYear,setPickerYear]=useState(y);

  // Close when clicking outside
  const ref=React.useRef(null);
  React.useEffect(()=>{
    if(!open)return;
    const fn=(e)=>{ if(ref.current&&!ref.current.contains(e.target))setOpen(false); };
    document.addEventListener('mousedown',fn);
    return()=>document.removeEventListener('mousedown',fn);
  },[open]);

  const selectMonth=(mi)=>{
    onChange(`${pickerYear}-${String(mi).padStart(2,'0')}`);
    setOpen(false);
  };

  const thMonth=`${TH_MONTHS[m-1]} ${y+543}`;
  const nowY=new Date().getFullYear();
  const years=Array.from({length:11},(_,i)=>nowY-5+i); // ±5 years

  return(
    <div ref={ref} style={{position:'relative'}}>
      {/* Trigger button */}
      <button onClick={()=>{setPickerYear(y);setOpen(o=>!o);}} style={{
        width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',
        background:C.card,border:`1px solid ${open?C.primary:C.border}`,borderRadius:10,
        padding:'8px 12px',cursor:'pointer',transition:'border-color 0.15s',
      }}>
        <span style={{fontSize:13,fontWeight:600,color:C.textSec}}>{thMonth}</span>
        <span style={{fontSize:11,color:C.textMuted,transition:'transform 0.2s',display:'inline-block',transform:open?'rotate(180deg)':'rotate(0deg)'}}>▼</span>
      </button>

      {/* Dropdown */}
      {open&&(
        <div style={{
          position:'absolute',top:'calc(100% + 8px)',left:0,right:0,zIndex:500,
          background:C.surface,border:`1px solid ${C.primary}`,borderRadius:14,
          boxShadow:'0 12px 40px rgba(0,0,0,0.6)',overflow:'hidden',
          animation:'fadeIn 0.12s ease',
        }}>
          <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>

          {/* Year row */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 12px',borderBottom:`1px solid ${C.border}`,background:C.primaryBg}}>
            <button onClick={()=>setPickerYear(v=>v-1)} style={{background:'none',border:'none',color:C.textMuted,cursor:'pointer',fontSize:18,padding:'2px 8px',borderRadius:6,lineHeight:1}}>‹</button>
            {/* Year quick-select */}
            <select value={pickerYear} onChange={e=>setPickerYear(+e.target.value)} style={{background:'transparent',border:'none',color:C.primary,fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:"'Sarabun',sans-serif",outline:'none',textAlign:'center'}}>
              {years.map(yr=><option key={yr} value={yr} style={{background:C.surface,color:C.text}}>{yr+543}</option>)}
            </select>
            <button onClick={()=>setPickerYear(v=>v+1)} style={{background:'none',border:'none',color:C.textMuted,cursor:'pointer',fontSize:18,padding:'2px 8px',borderRadius:6,lineHeight:1}}>›</button>
          </div>

          {/* Month grid */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:4,padding:'10px'}}>
            {TH_MONTHS.map((mn,i)=>{
              const mi=i+1;
              const isSelected=mi===m&&pickerYear===y;
              const isToday=mi===new Date().getMonth()+1&&pickerYear===new Date().getFullYear();
              return(
                <button key={i} onClick={()=>selectMonth(mi)} style={{
                  padding:'9px 4px',borderRadius:8,border:`1px solid ${isSelected?C.primary:isToday?C.primaryBdr:'transparent'}`,
                  background:isSelected?C.primary:isToday?C.primaryBg:'none',
                  color:isSelected?'#fff':isToday?C.income:C.textMuted,
                  cursor:'pointer',fontSize:13,fontWeight:isSelected?700:400,
                  transition:'all 0.1s',
                }}>
                  {mn}
                </button>
              );
            })}
          </div>

          {/* Quick jump: today */}
          <div style={{padding:'8px 10px',borderTop:`1px solid ${C.border}`}}>
            <button onClick={()=>{const d=new Date();onChange(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`);setOpen(false);}} style={{width:'100%',padding:'7px',borderRadius:8,background:C.primaryBg,border:`1px solid ${C.primaryBdr}`,color:C.income,fontSize:12,fontWeight:600,cursor:'pointer'}}>
              📅 กลับเดือนปัจจุบัน
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({label,value,type}) {
  const s=type==='income'?{bg:C.incomeBg,bdr:C.incomeBdr,text:C.income,sign:'+'}:type==='expense'?{bg:C.expenseBg,bdr:C.expenseBdr,text:C.expense,sign:'-'}:{bg:value>=0?C.incomeBg:C.expenseBg,bdr:value>=0?C.incomeBdr:C.expenseBdr,text:value>=0?C.income:C.expense,sign:value>=0?'':'-'};
  return(<div style={{background:s.bg,border:`1px solid ${s.bdr}`,borderRadius:16,padding:'18px 20px'}}><div style={{fontSize:11,color:s.text,opacity:0.75,fontWeight:600,marginBottom:6,letterSpacing:'0.05em',textTransform:'uppercase'}}>{label}</div><div style={{fontSize:20,fontWeight:700,color:s.text}}>{s.sign}฿{fmt(Math.abs(value))}</div></div>);
}

// ── Dashboard ──────────────────────────────────────────────────────────────
function DashboardView({monthTx,txs,selMonth,budgets,wallets}) {
  const expByCat=useMemo(()=>{const m={};monthTx.filter(t=>t.type==='expense').forEach(t=>{m[t.category]=(m[t.category]||0)+t.amount;});return Object.entries(m).map(([id,v])=>{const c=getCat(id);return{name:c?.name||id,value:v,color:c?.color||'#888',emoji:c?.emoji||'📌'};}).sort((a,b)=>b.value-a.value);},[monthTx]);
  const trendData=useMemo(()=>{const[sy,sm]=selMonth.split('-').map(Number);return Array.from({length:6},(_,i)=>{const d=new Date(sy,sm-1-(5-i));const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;const t2=txs.filter(t=>t.date.startsWith(k));return{month:TH_MONTHS[d.getMonth()],income:t2.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0),expense:t2.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0)};});},[txs,selMonth]);
  const wltSummary=wallets.filter(w=>w.enabled).map(w=>w.type==='credit'?{...w,dispBal:w.creditLimit-creditUsed(w,txs),sub:`ใช้แล้ว ฿${fmt(creditUsed(w,txs))}`,isCredit:true}:{...w,dispBal:walletBal(w,txs),sub:null,isCredit:false});
  const totalAssets=wltSummary.filter(w=>!w.isCredit).reduce((s,w)=>s+w.dispBal,0);
  const recent=monthTx.slice(0,6);
  const dailyData=useMemo(()=>{const m={};monthTx.forEach(t=>{const day=t.date.split('-')[2];if(!m[day])m[day]={day:parseInt(day),income:0,expense:0};if(t.type==='income')m[day].income+=t.amount;else m[day].expense+=t.amount;});return Object.values(m).sort((a,b)=>a.day-b.day);},[monthTx]);
  return(
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
      <div style={card({gridColumn:'1 / -1'})}>
        <h3 style={{fontSize:14,fontWeight:600,marginBottom:18,color:C.textSec}}>แนวโน้ม 6 เดือนย้อนหลัง</h3>
        <ResponsiveContainer width="100%" height={190}><BarChart data={trendData} barGap={4} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
          <XAxis dataKey="month" tick={{fill:C.textMuted,fontSize:12}} axisLine={false} tickLine={false}/>
          <YAxis tick={{fill:C.textMuted,fontSize:11}} axisLine={false} tickLine={false} tickFormatter={fmtShort} width={40}/>
          <Tooltip contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,fontSize:12}} formatter={(v,n)=>[`฿${fmt(v)}`,n==='income'?'รายรับ':'รายจ่าย']}/>
          <Bar dataKey="income" fill={C.income} radius={[5,5,0,0]}/><Bar dataKey="expense" fill={C.expense} radius={[5,5,0,0]}/>
        </BarChart></ResponsiveContainer>
      </div>
      <div style={card({gridColumn:'1 / -1'})}>
        <h3 style={{fontSize:14,fontWeight:600,marginBottom:18,color:C.textSec}}>รายรับ-รายจ่ายรายวัน (เดือนนี้)</h3>
        {dailyData.length===0?(<div style={{textAlign:'center',color:C.textMuted,padding:'50px 0',fontSize:13}}>ยังไม่มีรายการในเดือนนี้</div>):(
          <ResponsiveContainer width="100%" height={200}><BarChart data={dailyData} barGap={4} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
            <XAxis dataKey="day" tick={{fill:C.textMuted,fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:C.textMuted,fontSize:11}} axisLine={false} tickLine={false} tickFormatter={fmtShort} width={40}/>
            <Tooltip contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,fontSize:12}} formatter={(v,n)=>[`฿${fmt(v)}`,n==='income'?'รายรับ':'รายจ่าย']} labelFormatter={d=>`วันที่ ${d}`}/>
            <Legend formatter={n=>n==='income'?'รายรับ':'รายจ่าย'} wrapperStyle={{fontSize:12,color:C.textMuted,paddingTop:8}}/>
            <Bar dataKey="income" fill={C.income} radius={[4,4,0,0]}/><Bar dataKey="expense" fill={C.expense} radius={[4,4,0,0]}/>
          </BarChart></ResponsiveContainer>
        )}
      </div>
      <div style={card()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
          <h3 style={{fontSize:14,fontWeight:600,color:C.textSec}}>สรุปบัญชีทั้งหมด</h3>
          <span style={{fontSize:12,color:C.textMuted}}>รวม ฿{fmt(totalAssets)}</span>
        </div>
        {wltSummary.slice(0,5).map((w,i)=>(
          <div key={w.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:i<Math.min(wltSummary.length,5)-1?`1px solid ${C.border}`:'none'}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:20}}>{w.emoji}</span>
              <div><div style={{fontSize:13,fontWeight:500,color:C.text}}>{w.name}</div>{w.sub&&<div style={{fontSize:10,color:C.textMuted}}>{w.sub}</div>}</div>
            </div>
            <div style={{fontSize:13,fontWeight:700,color:w.isCredit?C.teal:w.dispBal>=0?C.income:C.expense}}>฿{fmt(w.dispBal)}</div>
          </div>
        ))}
      </div>
      <div style={card()}>
        <h3 style={{fontSize:14,fontWeight:600,marginBottom:14,color:C.textSec}}>สัดส่วนรายจ่าย</h3>
        {expByCat.length===0?(<div style={{textAlign:'center',color:C.textMuted,padding:'50px 0',fontSize:13}}>ยังไม่มีรายจ่าย</div>):(
          <><ResponsiveContainer width="100%" height={150}><PieChart><Pie data={expByCat} cx="50%" cy="50%" innerRadius={45} outerRadius={68} dataKey="value" paddingAngle={3}>{expByCat.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,fontSize:12}} formatter={v=>`฿${fmt(v)}`}/></PieChart></ResponsiveContainer>
          <div style={{marginTop:10}}>{expByCat.slice(0,5).map((e,i)=>(<div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:7}}><div style={{display:'flex',alignItems:'center',gap:8}}><div style={{width:8,height:8,borderRadius:'50%',background:e.color}}/><span style={{fontSize:12,color:C.textMuted}}>{e.emoji} {e.name}</span></div><span style={{fontSize:12,fontWeight:600,color:C.text}}>฿{fmt(e.value)}</span></div>))}</div></>
        )}
      </div>
    </div>
  );
}

// ── Transactions ───────────────────────────────────────────────────────────
function TransactionsView({monthTx,wallets,onEdit,onDelete}) {
  const [filter,setFilter]=useState('all');
  const [search,setSearch]=useState('');
  const [catF,setCatF]=useState('');
  const filtered=useMemo(()=>monthTx.filter(t=>{if(filter!=='all'&&t.type!==filter)return false;if(catF&&t.category!==catF)return false;if(search){const c=getCat(t.category);const q=search.toLowerCase();return t.note?.toLowerCase().includes(q)||c?.name.toLowerCase().includes(q);}return true;}),[monthTx,filter,search,catF]);
  const total=filtered.reduce((s,t)=>s+(t.type==='income'?t.amount:-t.amount),0);
  return(
    <div>
      <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍  ค้นหา..." style={{...iBase,flex:1,minWidth:180,padding:'8px 12px'}}/>
        <select value={catF} onChange={e=>setCatF(e.target.value)} style={{...iBase,flex:1,minWidth:150,padding:'8px 12px'}}>
          <option value="">ทุกหมวดหมู่</option>
          {_allCats.map(c=><option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
        </select>
        {['all','income','expense'].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{padding:'8px 16px',borderRadius:8,fontSize:13,cursor:'pointer',background:filter===f?(f==='income'?C.incomeBg:f==='expense'?C.expenseBg:C.primary):C.card,border:`1px solid ${filter===f?(f==='income'?C.incomeBdr:f==='expense'?C.expenseBdr:C.primary):C.border}`,color:filter===f?(f==='income'?C.income:f==='expense'?C.expense:'#fff'):C.textMuted,fontWeight:500}}>
            {f==='all'?'ทั้งหมด':f==='income'?'💚 รายรับ':'❤️ รายจ่าย'}
          </button>
        ))}
      </div>
      {filtered.length>0&&<div style={{fontSize:13,color:C.textMuted,marginBottom:12}}>{filtered.length} รายการ · ยอดสุทธิ <span style={{fontWeight:700,color:total>=0?C.income:C.expense}}>{total>=0?'+':''}฿{fmt(total)}</span></div>}
      <div style={card({padding:0})}>
        {filtered.length===0?(<div style={{textAlign:'center',padding:'60px 0',color:C.textMuted}}>ไม่พบรายการที่ต้องการ</div>):filtered.map((tx,i)=>{
          const cat=getCat(tx.category);const wlt=wallets.find(w=>w.id===tx.wallet);
          return(<div key={tx.id} className="txr" style={{display:'flex',alignItems:'center',gap:12,padding:'13px 20px',borderBottom:i<filtered.length-1?`1px solid ${C.border}`:'none',transition:'background 0.1s',background:'transparent'}}>
            <div style={{width:40,height:40,borderRadius:10,flexShrink:0,background:tx.type==='income'?C.incomeBg:C.expenseBg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{cat?.emoji}</div>
            <div style={{flex:1,minWidth:0}}><div style={{fontSize:14,fontWeight:500,color:C.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{tx.note||cat?.name}</div><div style={{fontSize:11,color:C.textMuted,marginTop:2}}>{cat?.name} · {tx.date} · {wlt?.emoji} {wlt?.name}</div></div>
            <div style={{fontSize:15,fontWeight:700,color:tx.type==='income'?C.income:C.expense,minWidth:110,textAlign:'right'}}>{tx.type==='income'?'+':'-'}฿{fmt(tx.amount)}</div>
            <button onClick={()=>onEdit(tx)} style={{background:'none',border:'none',color:C.textMuted,cursor:'pointer',padding:6,fontSize:15}}>✏️</button>
            <button onClick={()=>{if(confirm('ลบรายการนี้?'))onDelete(tx.id);}} style={{background:'none',border:'none',color:C.textMuted,cursor:'pointer',padding:6,fontSize:15}}>🗑️</button>
          </div>);
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// WALLETS VIEW
// ══════════════════════════════════════════════════════════════════════════
function WalletsView({wallets,setWallets,txs,onTransfer}) {
  const [showModal,setShowModal]=useState(false);
  const [editWlt,  setEditWlt] =useState(null);
  const [showAll,  setShowAll]  =useState(true);

  const openAdd  = ()=>{ setEditWlt(null); setShowModal(true); };
  const openEdit = (w)=>{ setEditWlt(w); setShowModal(true); };
  const saveW    = (data)=>{ setWallets(prev=>editWlt?prev.map(w=>w.id===editWlt.id?{...data,id:editWlt.id}:w):[...prev,{...data,id:'w'+Date.now()}]); setShowModal(false); setEditWlt(null); };
  const deleteW  = (id)=>{ if(confirm('ลบบัญชีนี้?'))setWallets(prev=>prev.filter(w=>w.id!==id)); };
  const toggleW  = (id)=>setWallets(prev=>prev.map(w=>w.id===id?{...w,enabled:!w.enabled}:w));

  const totalAssets      = wallets.filter(w=>w.type!=='credit').reduce((s,w)=>s+walletBal(w,txs),0);
  const totalCreditLimit = wallets.filter(w=>w.type==='credit').reduce((s,w)=>s+(w.creditLimit||0),0);
  const totalCreditUsed  = wallets.filter(w=>w.type==='credit').reduce((s,w)=>s+creditUsed(w,txs),0);

  // Credit payment reminders
  const today=new Date();
  const alerts=wallets.filter(w=>w.type==='credit'&&w.reminderEnabled).map(w=>{
    const due=new Date(today.getFullYear(),today.getMonth(),w.paymentDueDay||1);
    if(due<today) due.setMonth(due.getMonth()+1);
    const days=Math.ceil((due-today)/(86400000));
    const used=creditUsed(w,txs);
    return days<=(w.reminderDays||10)&&used>0?{w,days,used}:null;
  }).filter(Boolean);

  return(
    <div>
      {/* Alerts */}
      {alerts.map((a,i)=>(
        <div key={i} style={{background:'#451a03',border:'1px solid #7c2d12',borderRadius:12,padding:'12px 16px',marginBottom:12,display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:18}}>⏰</span>
          <div><span style={{fontSize:13,fontWeight:600,color:C.warning}}>แจ้งเตือนชำระบัตร! </span><span style={{fontSize:13,color:C.textMuted}}>{a.w.name} · ยอดค้าง ฿{fmt(a.used)} · ครบกำหนดอีก {a.days} วัน</span></div>
        </div>
      ))}

      {/* KPI */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20}}>
        {[{label:'สินทรัพย์รวม (ไม่รวมเครดิต)',val:totalAssets,col:C.income},{label:'วงเงินเครดิตรวม',val:totalCreditLimit,col:C.teal},{label:'ใช้บัตรเครดิตไปแล้ว',val:totalCreditUsed,col:C.warning}].map((s,i)=>(
          <div key={i} style={card()}><div style={{fontSize:11,color:C.textMuted,marginBottom:6}}>{s.label}</div><div style={{fontSize:17,fontWeight:700,color:s.col}}>฿{fmt(s.val)}</div></div>
        ))}
      </div>

      {/* List */}
      <div style={card({padding:0,marginBottom:14})}>
        {wallets.length===0?(<div style={{textAlign:'center',padding:'40px 0',color:C.textMuted}}>ยังไม่มีบัญชี</div>)
        :wallets.map((w,i)=>{
          const isCr=w.type==='credit';
          const bal  = isCr ? w.creditLimit-creditUsed(w,txs) : walletBal(w,txs);
          const used = isCr ? creditUsed(w,txs) : null;
          const pct  = isCr ? Math.min((creditUsed(w,txs)/(w.creditLimit||1))*100,100) : null;
          const acctType=ACCT_TYPES.find(a=>a.id===w.type);
          return(
            <div key={w.id} className="wltr" style={{display:'flex',alignItems:'center',gap:12,padding:'14px 20px',borderBottom:i<wallets.length-1?`1px solid ${C.border}`:'none',transition:'background 0.1s',background:'transparent'}}>
              {/* Icon */}
              <div style={{width:46,height:46,borderRadius:12,flexShrink:0,background:isCr?C.purpleBg:C.primaryBg,border:`1px solid ${isCr?C.purpleBdr:C.primaryBdr}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>{w.emoji}</div>
              {/* Info */}
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                  <span style={{fontSize:14,fontWeight:600,color:C.text}}>{w.name}</span>
                  <span style={{fontSize:10,background:isCr?C.purpleBg:C.primaryBg,color:isCr?C.purple:C.income,padding:'2px 7px',borderRadius:6,border:`1px solid ${isCr?C.purpleBdr:C.primaryBdr}`,fontWeight:500}}>{acctType?.label}</span>
                  {isCr&&w.cardBrand&&<span style={{fontSize:10,background:'#1e293b',color:'#94a3b8',padding:'2px 7px',borderRadius:6}}>{w.cardBrand}</span>}
                </div>
                {isCr?(
                  <div style={{marginTop:5}}>
                    <div style={{fontSize:11,color:C.textMuted,marginBottom:3}}>ใช้ ฿{fmt(used)} / วงเงิน ฿{fmt(w.creditLimit)} · ชำระวันที่ {w.paymentDueDay}</div>
                    <div style={{background:C.border,borderRadius:4,height:5,width:200,overflow:'hidden'}}><div style={{width:`${pct}%`,height:'100%',borderRadius:4,background:pct>80?C.expense:pct>60?C.warning:C.teal}}/></div>
                  </div>
                ):(
                  <div style={{fontSize:12,color:C.textMuted,marginTop:3}}>ยอดคงเหลือ · {w.currency||'THB'}</div>
                )}
              </div>
              {/* Balance */}
              <div style={{textAlign:'right',flexShrink:0,marginRight:8}}>
                <div style={{fontSize:15,fontWeight:700,color:isCr?C.teal:bal>=0?C.income:C.expense}}>฿{fmt(Math.abs(bal))}</div>
                {isCr&&<div style={{fontSize:10,color:C.textMuted,marginTop:1}}>วงเงินคงเหลือ</div>}
              </div>
              <Toggle checked={w.enabled} onChange={()=>toggleW(w.id)}/>
              <button onClick={()=>openEdit(w)} style={{background:'none',border:'none',color:C.textMuted,cursor:'pointer',padding:6,fontSize:18,lineHeight:1,marginLeft:4}}>›</button>
            </div>
          );
        })}
      </div>

      {/* Show combined toggle */}
      <div style={{...card({padding:'12px 20px'}),display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
        <span style={{fontSize:13,color:C.textMuted}}>แสดงข้อมูลรวมทุกบัญชีในหน้าแรก</span>
        <Toggle checked={showAll} onChange={()=>setShowAll(v=>!v)}/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <button onClick={onTransfer} style={{padding:'13px',borderRadius:12,background:C.card,border:`1px solid ${C.border}`,color:C.textMuted,fontWeight:600,fontSize:14,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
          <ArrowLeftRight size={16}/>โอนเงินข้ามบัญชี
        </button>
        <button onClick={openAdd} style={{padding:'13px',borderRadius:12,background:C.primary,border:'none',color:'#fff',fontWeight:700,fontSize:14,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
          <Plus size={16}/>เพิ่มบัญชีใหม่
        </button>
      </div>

      {showModal&&<WalletModal editWlt={editWlt} onSave={saveW} onDelete={editWlt?(id)=>{deleteW(id);setShowModal(false);}:null} onClose={()=>{setShowModal(false);setEditWlt(null);}}/>}
    </div>
  );
}

// ── Toggle ─────────────────────────────────────────────────────────────────
function Toggle({checked,onChange}) {
  return(<div onClick={onChange} style={{width:44,height:24,borderRadius:12,background:checked?C.primary:C.border,cursor:'pointer',position:'relative',transition:'background 0.2s',flexShrink:0}}>
    <div style={{position:'absolute',top:3,left:checked?23:3,width:18,height:18,borderRadius:'50%',background:'#fff',transition:'left 0.2s',boxShadow:'0 1px 3px rgba(0,0,0,0.3)'}}/>
  </div>);
}

// ── Wallet Modal ───────────────────────────────────────────────────────────
function WalletModal({editWlt,onSave,onDelete,onClose}) {
  const [type,           setType]          =useState(editWlt?.type           ||'cash');
  const [name,           setName]          =useState(editWlt?.name           ||'');
  const [emoji,          setEmoji]         =useState(editWlt?.emoji          ||'🏦');
  const [initBal,        setInitBal]       =useState(editWlt?.initBal!=null   ?String(editWlt.initBal):'0');
  const [creditLimit,    setCreditLimit]   =useState(editWlt?.creditLimit     ||0);
  const [cardBrand,      setCardBrand]     =useState(editWlt?.cardBrand       ||'VISA');
  const [paymentDueDay,  setPaymentDueDay] =useState(editWlt?.paymentDueDay   ||1);
  const [billingCycleDay,setBillingCycleDay]=useState(editWlt?.billingCycleDay||1);
  const [reminderDays,   setReminderDays]  =useState(editWlt?.reminderDays    ||10);
  const [reminderEnabled,setReminderEnabled]=useState(editWlt?.reminderEnabled!=null?editWlt.reminderEnabled:true);

  const acctType=ACCT_TYPES.find(a=>a.id===type);
  const isCredit=type==='credit';

  const handleSave=()=>{
    if(!name.trim()){alert('กรุณากรอกชื่อบัญชี');return;}
    const base={type,name:name.trim(),emoji,currency:'THB',enabled:editWlt?.enabled??true,initBal:parseFloat(initBal)||0};
    onSave(isCredit?{...base,creditLimit:parseFloat(creditLimit)||0,cardBrand,paymentDueDay:+paymentDueDay,billingCycleDay:+billingCycleDay,reminderDays:+reminderDays,reminderEnabled}:base);
  };

  const lbl=(t)=><label style={{fontSize:12,color:C.textMuted,marginBottom:5,display:'block'}}>{t}</label>;

  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:16}}>
      <div style={{...card(),width:500,maxWidth:'100%',maxHeight:'90vh',overflowY:'auto',boxShadow:'0 24px 60px rgba(0,0,0,0.5)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:22}}>
          <h2 style={{fontSize:17,fontWeight:700,color:C.text}}>{editWlt?`✏️ แก้ไขบัญชี — ${editWlt.name}`:'💳 เพิ่มบัญชีใหม่'}</h2>
          <button onClick={onClose} style={{background:'none',border:'none',color:C.textMuted,cursor:'pointer',fontSize:20,lineHeight:1}}>✕</button>
        </div>

        {/* Type chooser (new only) */}
        {!editWlt&&(
          <div style={{marginBottom:20}}>
            {lbl('ประเภทบัญชี')}
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
              {ACCT_TYPES.map(a=>(
                <button key={a.id} onClick={()=>setType(a.id)} style={{padding:'12px 6px',borderRadius:10,border:`1px solid ${type===a.id?C.primary:C.border}`,background:type===a.id?C.primaryBg:C.bg,color:type===a.id?C.income:C.textMuted,cursor:'pointer',textAlign:'center',fontSize:12,transition:'all 0.15s'}}>
                  <div style={{fontSize:22,marginBottom:5}}>{a.emoji}</div>
                  <div style={{fontWeight:type===a.id?600:400,lineHeight:1.3}}>{a.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}
        {editWlt&&(
          <div style={{marginBottom:16,padding:'10px 14px',background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,display:'flex',alignItems:'center',gap:10}}>
            <span style={{fontSize:22}}>{acctType?.emoji}</span>
            <div><div style={{fontSize:12,color:C.textMuted}}>ประเภทบัญชี</div><div style={{fontSize:14,fontWeight:600,color:C.text}}>{acctType?.label}</div></div>
            <div style={{marginLeft:'auto',fontSize:11,color:C.textMuted}}>เปลี่ยนประเภทไม่ได้</div>
          </div>
        )}

        {/* Section: รายละเอียดบัญชี */}
        <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:12,overflow:'hidden',marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:600,color:C.textMuted,padding:'10px 14px',borderBottom:`1px solid ${C.border}`}}>รายละเอียดบัญชี</div>
          {/* Name */}
          <div style={{display:'flex',alignItems:'center',padding:'12px 14px',borderBottom:`1px solid ${C.border}`,gap:12}}>
            <span style={{fontSize:18,width:24,flexShrink:0}}>🏷️</span>
            <span style={{fontSize:14,color:C.textMuted,width:80,flexShrink:0}}>ชื่อบัญชี</span>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder={acctType?.desc||''} style={{...iBase,border:'none',background:'transparent',padding:'2px 0',flex:1,fontSize:14,color:C.text,textAlign:'right'}}/>
          </div>
          {/* Emoji */}
          <div style={{padding:'12px 14px',borderBottom:`1px solid ${C.border}`}}>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
              <span style={{fontSize:18,width:24,flexShrink:0}}>⭐</span>
              <span style={{fontSize:14,color:C.textMuted}}>สัญลักษณ์</span>
              <span style={{marginLeft:'auto',fontSize:22}}>{emoji}</span>
            </div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',paddingLeft:36}}>
              {WALLET_EMOJIS.map(e=>(
                <button key={e} className="emb" onClick={()=>setEmoji(e)} style={{width:34,height:34,borderRadius:8,border:`1px solid ${emoji===e?C.primary:C.border}`,background:emoji===e?C.primaryBg:C.card,fontSize:17,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'transform 0.15s'}}>{e}</button>
              ))}
            </div>
          </div>
          {/* Currency */}
          <div style={{display:'flex',alignItems:'center',padding:'12px 14px',gap:12}}>
            <span style={{fontSize:18,width:24,flexShrink:0}}>💱</span>
            <span style={{fontSize:14,color:C.textMuted,flex:1}}>สกุลเงิน</span>
            <span style={{fontSize:14,color:C.text}}>🇹🇭 บาท (฿)</span>
          </div>
        </div>

        {/* Section: ประเภทบัญชี (cash/savings/checking: initial balance) */}
        {!isCredit&&(
          <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:12,overflow:'hidden',marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:600,color:C.textMuted,padding:'10px 14px',borderBottom:`1px solid ${C.border}`}}>ประเภทบัญชี {acctType?.label}</div>
            <div style={{display:'flex',alignItems:'center',padding:'12px 14px',gap:12}}>
              <span style={{fontSize:18,width:24,flexShrink:0}}>🪙</span>
              <span style={{fontSize:14,color:C.textMuted,flex:1}}>ยอดเงิน</span>
              <input type="number" value={initBal} onChange={e=>setInitBal(e.target.value)} style={{...iBase,border:'none',background:'transparent',padding:'2px 0',width:120,fontSize:14,color:C.text,textAlign:'right'}}/>
            </div>
          </div>
        )}

        {/* Section: Credit card */}
        {isCredit&&(
          <div style={{background:C.purpleBg,border:`1px solid ${C.purpleBdr}`,borderRadius:12,overflow:'hidden',marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:600,color:C.purple,padding:'10px 14px',borderBottom:`1px solid ${C.purpleBdr}`}}>ประเภทบัญชี บัตรเครดิต</div>
            {[
              {icon:'💳',label:'ประเภทบัตร',content:<select value={cardBrand} onChange={e=>setCardBrand(e.target.value)} style={{...iBase,border:'none',background:'transparent',padding:'2px 0',fontSize:14,color:C.text,width:'auto',textAlign:'right'}}>{CARD_BRANDS.map(b=><option key={b}>{b}</option>)}</select>},
              {icon:'💰',label:'วงเงิน',content:<input type="number" value={creditLimit} onChange={e=>setCreditLimit(e.target.value)} style={{...iBase,border:'none',background:'transparent',padding:'2px 0',width:120,fontSize:14,color:C.text,textAlign:'right'}}/>},
              {icon:'📅',label:'กำหนดชำระวันที่',content:<select value={paymentDueDay} onChange={e=>setPaymentDueDay(e.target.value)} style={{...iBase,border:'none',background:'transparent',padding:'2px 0',fontSize:14,color:C.text,width:60,textAlign:'right'}}>{Array.from({length:28},(_,i)=><option key={i+1} value={i+1}>{i+1}</option>)}</select>},
              {icon:'📆',label:'วันเริ่มต้นรอบบัญชี',content:<select value={billingCycleDay} onChange={e=>setBillingCycleDay(e.target.value)} style={{...iBase,border:'none',background:'transparent',padding:'2px 0',fontSize:14,color:C.text,width:60,textAlign:'right'}}>{Array.from({length:28},(_,i)=><option key={i+1} value={i+1}>{i+1}</option>)}</select>},
            ].map((row,i,arr)=>(
              <div key={i} style={{display:'flex',alignItems:'center',padding:'12px 14px',borderBottom:i<arr.length-1?`1px solid ${C.purpleBdr}`:'none',gap:12}}>
                <span style={{fontSize:18,width:24,flexShrink:0}}>{row.icon}</span>
                <span style={{fontSize:14,color:C.textMuted,flex:1}}>{row.label}</span>
                {row.content}
              </div>
            ))}
            {/* Reminder row */}
            <div style={{display:'flex',alignItems:'center',padding:'12px 14px',gap:12,borderTop:`1px solid ${C.purpleBdr}`}}>
              <span style={{fontSize:18,width:24,flexShrink:0}}>🔔</span>
              <span style={{fontSize:14,color:C.textMuted,flex:1}}>แจ้งเตือนล่วงหน้า (วัน)</span>
              <input type="number" value={reminderDays} onChange={e=>setReminderDays(e.target.value)} min={1} max={30} style={{...iBase,border:'none',background:'transparent',padding:'2px 0',width:50,fontSize:14,color:C.text,textAlign:'right'}}/>
              <Toggle checked={reminderEnabled} onChange={()=>setReminderEnabled(v=>!v)}/>
            </div>
          </div>
        )}

        <div style={{fontSize:11,color:C.textMuted,textAlign:'center',marginBottom:14}}>
          {editWlt?'หลังจากบันทึกแล้ว จะไม่สามารถเปลี่ยนแปลงประเภทบัญชีได้':'ยอดเงินเริ่มต้นจะถูกรวมกับรายการที่บันทึกในภายหลัง'}
        </div>

        {editWlt&&onDelete&&(
          <button onClick={()=>onDelete(editWlt.id)} style={{width:'100%',padding:'11px',borderRadius:10,background:C.expenseBg,border:`1px solid ${C.expenseBdr}`,color:C.expense,fontWeight:600,fontSize:14,cursor:'pointer',marginBottom:10}}>🗑️ ลบบัญชี</button>
        )}
        <div style={{display:'flex',gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:'12px',borderRadius:10,background:C.bg,border:`1px solid ${C.border}`,color:C.textMuted,cursor:'pointer',fontSize:14,fontWeight:500}}>ยกเลิก</button>
          <button onClick={handleSave} style={{flex:2,padding:'12px',borderRadius:10,background:C.primary,border:'none',color:'#fff',fontWeight:700,fontSize:14,cursor:'pointer'}}>💾 บันทึก</button>
        </div>
      </div>
    </div>
  );
}

// ── Transfer Modal ─────────────────────────────────────────────────────────
function TransferModal({wallets,onTransfer,onClose}) {
  const [fromId,setFromId]=useState(wallets[0]?.id||'');
  const [toId,  setToId]  =useState(wallets[1]?.id||'');
  const [amount,setAmount]=useState('');
  const [note,  setNote]  =useState('');
  const [date,  setDate]  =useState(new Date().toISOString().split('T')[0]);

  const fromW=wallets.find(w=>w.id===fromId);
  const toW  =wallets.find(w=>w.id===toId);

  const handle=()=>{
    if(!fromId||!toId||fromId===toId){alert('กรุณาเลือกบัญชีต้นทางและปลายทางที่แตกต่างกัน');return;}
    const amt=parseFloat(amount);
    if(!amt||amt<=0){alert('กรุณากรอกจำนวนเงิน');return;}
    onTransfer({fromId,toId,amount:amt,note,date});
  };

  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:16}}>
      <div style={{...card(),width:460,maxWidth:'100%',boxShadow:'0 24px 60px rgba(0,0,0,0.5)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:22}}>
          <h2 style={{fontSize:17,fontWeight:700,color:C.text}}>↔️ โอนเงินข้ามบัญชี</h2>
          <button onClick={onClose} style={{background:'none',border:'none',color:C.textMuted,cursor:'pointer',fontSize:20}}>✕</button>
        </div>

        {/* Visual from→to */}
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:20,background:C.bg,borderRadius:12,padding:'14px'}}>
          <div style={{flex:1,textAlign:'center'}}>
            <div style={{fontSize:24,marginBottom:4}}>{fromW?.emoji||'💵'}</div>
            <div style={{fontSize:12,fontWeight:600,color:C.text}}>{fromW?.name||'—'}</div>
            <div style={{fontSize:11,color:C.textMuted}}>ต้นทาง</div>
          </div>
          <div style={{fontSize:22,color:C.primary}}>→</div>
          <div style={{flex:1,textAlign:'center'}}>
            <div style={{fontSize:24,marginBottom:4}}>{toW?.emoji||'🏦'}</div>
            <div style={{fontSize:12,fontWeight:600,color:C.text}}>{toW?.name||'—'}</div>
            <div style={{fontSize:11,color:C.textMuted}}>ปลายทาง</div>
          </div>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div>
              <label style={{fontSize:12,color:C.textMuted,marginBottom:5,display:'block'}}>บัญชีต้นทาง</label>
              <select value={fromId} onChange={e=>setFromId(e.target.value)} style={iBase}>{wallets.map(w=><option key={w.id} value={w.id}>{w.emoji} {w.name}</option>)}</select>
            </div>
            <div>
              <label style={{fontSize:12,color:C.textMuted,marginBottom:5,display:'block'}}>บัญชีปลายทาง</label>
              <select value={toId} onChange={e=>setToId(e.target.value)} style={iBase}>{wallets.map(w=><option key={w.id} value={w.id}>{w.emoji} {w.name}</option>)}</select>
            </div>
          </div>
          <div>
            <label style={{fontSize:12,color:C.textMuted,marginBottom:5,display:'block'}}>จำนวนเงิน (บาท) *</label>
            <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00" style={iBase}/>
          </div>
          <div>
            <label style={{fontSize:12,color:C.textMuted,marginBottom:5,display:'block'}}>หมายเหตุ</label>
            <input value={note} onChange={e=>setNote(e.target.value)} placeholder="รายละเอียดการโอน..." style={iBase}/>
          </div>
          <div>
            <label style={{fontSize:12,color:C.textMuted,marginBottom:5,display:'block'}}>วันที่</label>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={iBase}/>
          </div>
        </div>

        <div style={{display:'flex',gap:10,marginTop:22}}>
          <button onClick={onClose} style={{flex:1,padding:'12px',borderRadius:10,background:C.bg,border:`1px solid ${C.border}`,color:C.textMuted,cursor:'pointer',fontSize:14}}>ยกเลิก</button>
          <button onClick={handle}  style={{flex:2,padding:'12px',borderRadius:10,background:C.primary,border:'none',color:'#fff',fontWeight:700,fontSize:14,cursor:'pointer'}}>✅ ยืนยันการโอน</button>
        </div>
      </div>
    </div>
  );
}

// ── Budget ─────────────────────────────────────────────────────────────────
function BudgetView({budgets,setBudgets,monthTx,expenseCats}) {
  const [editCat,setEditCat]=useState('');
  const [editAmt,setEditAmt]=useState('');
  const expByCat=useMemo(()=>{const m={};monthTx.filter(t=>t.type==='expense').forEach(t=>{m[t.category]=(m[t.category]||0)+t.amount;});return m;},[monthTx]);
  const save=()=>{const amt=parseFloat(editAmt);if(!editCat||!amt||amt<=0)return;setBudgets(prev=>{const ex=prev.find(b=>b.category===editCat);return ex?prev.map(b=>b.category===editCat?{...b,amount:amt}:b):[...prev,{category:editCat,amount:amt}];});setEditCat('');setEditAmt('');};
  const tB=budgets.reduce((s,b)=>s+b.amount,0);
  const tS=budgets.reduce((s,b)=>s+(expByCat[b.category]||0),0);
  return(
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20}}>
        {[{label:'งบทั้งหมด',val:tB,col:C.info},{label:'ใช้ไปแล้ว',val:tS,col:C.expense},{label:'งบคงเหลือ',val:tB-tS,col:tB-tS>=0?C.income:C.expense}].map((s,i)=>(
          <div key={i} style={card()}><div style={{fontSize:11,color:C.textMuted,marginBottom:6}}>{s.label}</div><div style={{fontSize:18,fontWeight:700,color:s.col}}>฿{fmt(Math.abs(s.val))}</div></div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:14,marginBottom:20}}>
        {budgets.map(b=>{const cat=getCat(b.category);const sp=expByCat[b.category]||0;const pct=Math.min((sp/b.amount)*100,100);const over=sp>b.amount;
          return(<div key={b.category} style={card()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}><span style={{fontSize:20}}>{cat?.emoji}</span><span style={{fontWeight:600,fontSize:14,color:C.text}}>{cat?.name}</span></div>
              <div style={{display:'flex',gap:4}}>
                <button onClick={()=>{setEditCat(b.category);setEditAmt(String(b.amount));}} style={{background:'none',border:'none',cursor:'pointer',color:C.textMuted,fontSize:14}}>✏️</button>
                <button onClick={()=>setBudgets(prev=>prev.filter(x=>x.category!==b.category))} style={{background:'none',border:'none',cursor:'pointer',color:C.textMuted,fontSize:14}}>🗑️</button>
              </div>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><span style={{fontSize:12,color:C.textMuted}}>ใช้ ฿{fmt(sp)}</span><span style={{fontSize:12,color:C.textMuted}}>จาก ฿{fmt(b.amount)}</span></div>
            <div style={{background:C.border,borderRadius:6,height:7,overflow:'hidden'}}><div style={{width:`${pct}%`,height:'100%',borderRadius:6,background:over?C.expense:pct>80?C.warning:C.income}}/></div>
            <div style={{marginTop:7,fontSize:11,fontWeight:500,color:over?C.expense:pct>80?C.warning:C.textMuted}}>{over?`⚠️ เกินงบ ฿${fmt(sp-b.amount)}`:`✔ เหลือ ฿${fmt(b.amount-sp)} (${(100-pct).toFixed(0)}%)`}</div>
          </div>);
        })}
      </div>
      <div style={card()}>
        <h3 style={{fontSize:14,fontWeight:600,marginBottom:14,color:C.textSec}}>{editCat?`แก้ไขงบ: ${getCat(editCat)?.emoji} ${getCat(editCat)?.name}`:'เพิ่มงบประมาณใหม่'}</h3>
        <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
          <select value={editCat} onChange={e=>setEditCat(e.target.value)} style={{...iBase,flex:1,minWidth:180}}>
            <option value="">เลือกหมวดหมู่รายจ่าย</option>
            {expenseCats.filter(c=>!budgets.find(b=>b.category===c.id)||c.id===editCat).map(c=><option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
          </select>
          <input type="number" value={editAmt} onChange={e=>setEditAmt(e.target.value)} placeholder="งบประมาณ (บาท)" style={{...iBase,flex:1,minWidth:140}}/>
          <button onClick={save} style={{padding:'10px 24px',borderRadius:10,background:C.primary,border:'none',color:'#fff',fontWeight:700,cursor:'pointer',fontSize:14}}>💾 บันทึก</button>
          {editCat&&<button onClick={()=>{setEditCat('');setEditAmt('');}} style={{padding:'10px 16px',borderRadius:10,background:C.card,border:`1px solid ${C.border}`,color:C.textMuted,cursor:'pointer',fontSize:14}}>ยกเลิก</button>}
        </div>
      </div>
    </div>
  );
}

// ── Reports ────────────────────────────────────────────────────────────────
function ReportsView({txs,selMonth}) {
  const [y,m]=selMonth.split('-').map(Number);
  const monthly12=useMemo(()=>Array.from({length:12},(_,i)=>{const d=new Date(y,m-1-(11-i));const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;const t2=txs.filter(t=>t.date.startsWith(k));const inc=t2.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);const exp=t2.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);return{month:TH_MONTHS[d.getMonth()],income:inc,expense:exp,saving:inc-exp};}),[txs,selMonth]);
  const catBreakdown=useMemo(()=>{const map={};txs.filter(t=>t.date.startsWith(selMonth)&&t.type==='expense').forEach(t=>{map[t.category]=(map[t.category]||0)+t.amount;});return Object.entries(map).map(([id,v])=>{const c=getCat(id);return{name:c?.name||id,value:v,color:c?.color||'#888',emoji:c?.emoji||'📌'};}).sort((a,b)=>b.value-a.value);},[txs,selMonth]);
  const totalExp=catBreakdown.reduce((s,c)=>s+c.value,0);
  const avgInc=monthly12.reduce((s,d)=>s+d.income,0)/12;
  const avgExp=monthly12.reduce((s,d)=>s+d.expense,0)/12;
  const maxSav=Math.max(0,...monthly12.map(d=>d.saving));
  return(
    <div style={{display:'grid',gap:18}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
        {[{label:'รายรับเฉลี่ย/เดือน',val:avgInc,col:C.income},{label:'รายจ่ายเฉลี่ย/เดือน',val:avgExp,col:C.expense},{label:'ออมสูงสุด (12 เดือน)',val:maxSav,col:C.info}].map((k,i)=>(
          <div key={i} style={card()}><div style={{fontSize:11,color:C.textMuted,marginBottom:6}}>{k.label}</div><div style={{fontSize:18,fontWeight:700,color:k.col}}>฿{fmt(k.val)}</div></div>
        ))}
      </div>
      <div style={card()}>
        <h3 style={{fontSize:14,fontWeight:600,marginBottom:18,color:C.textSec}}>แนวโน้ม 12 เดือน</h3>
        <ResponsiveContainer width="100%" height={220}><LineChart data={monthly12}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
          <XAxis dataKey="month" tick={{fill:C.textMuted,fontSize:11}} axisLine={false} tickLine={false}/>
          <YAxis tick={{fill:C.textMuted,fontSize:11}} axisLine={false} tickLine={false} tickFormatter={fmtShort} width={42}/>
          <Tooltip contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,fontSize:12}} formatter={(v,n)=>[`฿${fmt(v)}`,n==='income'?'รายรับ':n==='expense'?'รายจ่าย':'ออม']}/>
          <Legend formatter={v=>v==='income'?'รายรับ':v==='expense'?'รายจ่าย':'ออม'} wrapperStyle={{fontSize:12,color:C.textMuted}}/>
          <Line type="monotone" dataKey="income"  stroke={C.income}  strokeWidth={2} dot={{fill:C.income, r:3}}/>
          <Line type="monotone" dataKey="expense" stroke={C.expense} strokeWidth={2} dot={{fill:C.expense,r:3}}/>
          <Line type="monotone" dataKey="saving"  stroke={C.info}    strokeWidth={2} strokeDasharray="5 3" dot={false}/>
        </LineChart></ResponsiveContainer>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
        <div style={card()}>
          <h3 style={{fontSize:14,fontWeight:600,marginBottom:14,color:C.textSec}}>รายจ่ายตามหมวดหมู่</h3>
          {catBreakdown.length===0?(<div style={{textAlign:'center',color:C.textMuted,padding:'50px 0',fontSize:13}}>ยังไม่มีข้อมูล</div>):(<ResponsiveContainer width="100%" height={200}><PieChart><Pie data={catBreakdown} cx="50%" cy="50%" outerRadius={80} dataKey="value" paddingAngle={3}>{catBreakdown.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,fontSize:12}} formatter={v=>`฿${fmt(v)}`}/></PieChart></ResponsiveContainer>)}
        </div>
        <div style={card()}>
          <h3 style={{fontSize:14,fontWeight:600,marginBottom:14,color:C.textSec}}>% รายจ่ายแต่ละหมวด</h3>
          {catBreakdown.length===0?(<div style={{textAlign:'center',color:C.textMuted,padding:'50px 0',fontSize:13}}>ยังไม่มีข้อมูล</div>):catBreakdown.map((c,i)=>{const pct=totalExp>0?(c.value/totalExp)*100:0;return(<div key={i} style={{marginBottom:12}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontSize:12,color:C.textMuted}}>{c.emoji} {c.name}</span><span style={{fontSize:12,fontWeight:600,color:C.text}}>฿{fmt(c.value)} · {pct.toFixed(1)}%</span></div><div style={{background:C.border,borderRadius:4,height:5}}><div style={{width:`${pct}%`,height:'100%',borderRadius:4,background:c.color}}/></div></div>);})}
        </div>
      </div>
    </div>
  );
}

// ── Transaction Modal ──────────────────────────────────────────────────────
function TxModal({editTx,wallets,incomeCats,expenseCats,onSave,onClose}) {
  const [type,    setType]    =useState(editTx?.type     ||'expense');
  const [category,setCategory]=useState(editTx?.category ||'');
  const [amount,  setAmount]  =useState(editTx?String(editTx.amount):'');
  const [note,    setNote]    =useState(editTx?.note     ||'');
  const [date,    setDate]    =useState(editTx?.date     ||new Date().toISOString().split('T')[0]);
  const [wallet,  setWallet]  =useState(editTx?.wallet   ||wallets[0]?.id||'');
  const cats=type==='income'?incomeCats:expenseCats;
  const handle=()=>{const amt=parseFloat(amount);if(!category||!amt||amt<=0){alert('กรุณากรอกข้อมูลให้ครบ');return;}onSave({type,category,amount:amt,note,date,wallet});};
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:16}}>
      <div style={{...card(),width:460,maxWidth:'100%',boxShadow:'0 24px 60px rgba(0,0,0,0.5)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:22}}>
          <h2 style={{fontSize:17,fontWeight:700,color:C.text}}>{editTx?'✏️ แก้ไขรายการ':'➕ เพิ่มรายการใหม่'}</h2>
          <button onClick={onClose} style={{background:'none',border:'none',color:C.textMuted,cursor:'pointer',fontSize:20,lineHeight:1}}>✕</button>
        </div>
        <div style={{display:'flex',background:C.bg,borderRadius:12,padding:4,marginBottom:20,gap:4}}>
          {['expense','income'].map(t=>(
            <button key={t} onClick={()=>{setType(t);setCategory('');}} style={{flex:1,padding:'9px',borderRadius:8,border:type===t?`1px solid ${t==='income'?C.incomeBdr:C.expenseBdr}`:'1px solid transparent',background:type===t?(t==='income'?C.incomeBg:C.expenseBg):'none',color:type===t?(t==='income'?C.income:C.expense):C.textMuted,cursor:'pointer',fontSize:14,fontWeight:500}}>{t==='income'?'💚 รายรับ':'❤️ รายจ่าย'}</button>
          ))}
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div>
            <label style={{fontSize:12,color:C.textMuted,marginBottom:8,display:'block'}}>หมวดหมู่ *</label>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,maxHeight:200,overflowY:'auto',paddingRight:4}}>
              {cats.map(c=>(
                <button key={c.id} onClick={()=>setCategory(c.id)} style={{
                  display:'flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:10,cursor:'pointer',textAlign:'left',
                  border:`1px solid ${category===c.id?c.color:C.border}`,
                  background:category===c.id?`${c.color}22`:C.bg,
                  transition:'all 0.1s',
                }}>
                  <span style={{fontSize:18,flexShrink:0}}>{c.emoji}</span>
                  <span style={{fontSize:12,color:category===c.id?C.text:C.textMuted,fontWeight:category===c.id?600:400,lineHeight:1.2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div><label style={{fontSize:12,color:C.textMuted,marginBottom:5,display:'block'}}>จำนวนเงิน (บาท) *</label><input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00" style={iBase}/></div>
          <div><label style={{fontSize:12,color:C.textMuted,marginBottom:5,display:'block'}}>บันทึกช่วยจำ</label><input value={note} onChange={e=>setNote(e.target.value)} placeholder="รายละเอียดเพิ่มเติม..." style={iBase}/></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div><label style={{fontSize:12,color:C.textMuted,marginBottom:5,display:'block'}}>วันที่</label><input type="date" value={date} onChange={e=>setDate(e.target.value)} style={iBase}/></div>
            <div><label style={{fontSize:12,color:C.textMuted,marginBottom:5,display:'block'}}>บัญชี</label><select value={wallet} onChange={e=>setWallet(e.target.value)} style={iBase}>{wallets.map(w=><option key={w.id} value={w.id}>{w.emoji} {w.name}</option>)}</select></div>
          </div>
        </div>
        <div style={{display:'flex',gap:10,marginTop:22}}>
          <button onClick={onClose} style={{flex:1,padding:'12px',borderRadius:10,background:C.bg,border:`1px solid ${C.border}`,color:C.textMuted,cursor:'pointer',fontSize:14,fontWeight:500}}>ยกเลิก</button>
          <button onClick={handle}  style={{flex:2,padding:'12px',borderRadius:10,background:C.primary,border:'none',color:'#fff',fontWeight:700,fontSize:14,cursor:'pointer'}}>💾 บันทึกรายการ</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// SETTINGS VIEW
// ══════════════════════════════════════════════════════════════════════════
function SettingsView({incomeCats,setIncomeCats,expenseCats,setExpenseCats,authData,onLogout,onReset}) {
  const [tab,      setTab]      = useState('expense');
  const [editCat,  setEditCat]  = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showChangePIN, setShowChangePIN] = useState(false);

  const cats    = tab==='income' ? incomeCats  : expenseCats;
  const setCats = tab==='income' ? setIncomeCats : setExpenseCats;

  const openNew  = ()=>{ setEditCat(null); setShowForm(true); };
  const openEdit = (c)=>{ setEditCat(c); setShowForm(true); };
  const closeForm= ()=>{ setEditCat(null); setShowForm(false); };

  const saveCat = (data) => {
    if(editCat) { setCats(prev=>prev.map(c=>c.id===editCat.id?{...c,...data}:c)); }
    else        { setCats(prev=>[...prev,{...data,id:'cat_'+Date.now(),builtIn:false}]); }
    closeForm();
  };
  const deleteCat = (id) => { setCats(prev=>prev.filter(c=>c.id!==id)); closeForm(); };

  return(
    <div style={{display:'grid',gap:18}}>
      {/* ── Account card ── */}
      <div style={card()}>
        <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:20}}>
          <div style={{width:56,height:56,borderRadius:16,background:C.primaryBg,border:`1px solid ${C.primaryBdr}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28}}>{authData?.avatar||'😊'}</div>
          <div>
            <div style={{fontSize:17,fontWeight:700,color:C.text}}>{authData?.name}</div>
            <div style={{fontSize:12,color:C.textMuted,marginTop:2}}>บัญชีส่วนตัว · PIN 4 หลัก</div>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <button onClick={()=>setShowChangePIN(true)} style={{padding:'10px',borderRadius:10,background:C.card,border:`1px solid ${C.border}`,color:C.textSec,fontSize:13,fontWeight:500,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
            🔑 เปลี่ยน PIN
          </button>
          <button onClick={()=>{if(confirm('ออกจากระบบ?'))onLogout();}} style={{padding:'10px',borderRadius:10,background:C.card,border:`1px solid ${C.border}`,color:C.textMuted,fontSize:13,fontWeight:500,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
            🚪 ออกจากระบบ
          </button>
        </div>
        <button onClick={()=>{if(confirm('ล้างข้อมูลทั้งหมดและรีเซ็ตแอป?\nการกระทำนี้ไม่สามารถย้อนกลับได้'))onReset();}} style={{width:'100%',marginTop:10,padding:'10px',borderRadius:10,background:C.expenseBg,border:`1px solid ${C.expenseBdr}`,color:C.expense,fontSize:13,fontWeight:500,cursor:'pointer'}}>
          ⚠️ ล้างข้อมูลทั้งหมด &amp; รีเซ็ต
        </button>
      </div>

      {/* ── Section: หมวดหมู่ ── */}
      <div style={card({marginBottom:0})}>
        {/* Section header */}
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}>
          <div style={{width:36,height:36,borderRadius:10,background:C.primaryBg,border:`1px solid ${C.primaryBdr}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>🗂️</div>
          <div>
            <div style={{fontWeight:700,fontSize:15,color:C.text}}>จัดการหมวดหมู่</div>
            <div style={{fontSize:12,color:C.textMuted}}>เพิ่ม แก้ไข หรือลบหมวดหมู่รายรับ-รายจ่าย</div>
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{display:'flex',background:C.bg,borderRadius:12,padding:4,marginBottom:20,gap:4}}>
          {[{id:'expense',label:'❤️ รายจ่าย',col:C.expense,bg:C.expenseBg,bdr:C.expenseBdr},{id:'income',label:'💚 รายรับ',col:C.income,bg:C.incomeBg,bdr:C.incomeBdr}].map(t=>(
            <button key={t.id} onClick={()=>{setTab(t.id);setShowForm(false);setEditCat(null);}} style={{
              flex:1,padding:'10px',borderRadius:8,border:tab===t.id?`1px solid ${t.bdr}`:'1px solid transparent',
              background:tab===t.id?t.bg:'none',color:tab===t.id?t.col:C.textMuted,
              cursor:'pointer',fontSize:14,fontWeight:tab===t.id?600:400,
            }}>{t.label}<span style={{marginLeft:6,fontSize:11,opacity:0.7}}>({cats.length})</span></button>
          ))}
        </div>

        {/* Category list */}
        <div style={{marginBottom:16}}>
          {cats.map((c,i)=>(
            <div key={c.id} style={{
              display:'flex',alignItems:'center',gap:12,padding:'11px 14px',
              borderRadius:10,marginBottom:6,
              background:editCat?.id===c.id?`${c.color}18`:C.bg,
              border:`1px solid ${editCat?.id===c.id?c.color:C.border}`,
              transition:'all 0.15s',
            }}>
              {/* Color dot + emoji + name */}
              <div style={{width:38,height:38,borderRadius:10,background:`${c.color}22`,border:`1px solid ${c.color}44`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{c.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:500,color:C.text}}>{c.name}</div>
                <div style={{display:'flex',alignItems:'center',gap:6,marginTop:2}}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:c.color}}/>
                  <span style={{fontSize:11,color:C.textMuted}}>{c.builtIn?'หมวดหมู่มาตรฐาน':'หมวดหมู่ที่สร้าง'}</span>
                </div>
              </div>
              <button onClick={()=>openEdit(c)} style={{background:'none',border:'none',cursor:'pointer',color:C.textMuted,fontSize:15,padding:'4px 8px',borderRadius:6}}>✏️</button>
              {!c.builtIn&&(
                <button onClick={()=>{if(confirm(`ลบ "${c.name}"?`))deleteCat(c.id);}} style={{background:'none',border:'none',cursor:'pointer',color:C.textMuted,fontSize:15,padding:'4px 8px',borderRadius:6}}>🗑️</button>
              )}
            </div>
          ))}
        </div>

        {/* Add button */}
        {!showForm&&(
          <button onClick={openNew} style={{width:'100%',padding:'11px',borderRadius:10,background:C.primaryBg,border:`1px dashed ${C.primaryBdr}`,color:C.income,fontWeight:600,fontSize:14,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
            <span style={{fontSize:18}}>＋</span> เพิ่มหมวดหมู่{tab==='income'?'รายรับ':'รายจ่าย'}ใหม่
          </button>
        )}
      </div>

      {showForm&&(
        <CategoryForm
          editCat={editCat}
          tab={tab}
          onSave={saveCat}
          onDelete={editCat&&!editCat.builtIn?(id)=>deleteCat(id):null}
          onClose={closeForm}
        />
      )}
      {showChangePIN&&(
        <ChangePINModal
          authData={authData}
          onDone={(newAuth)=>{ localStorage.setItem('ml_auth',JSON.stringify(newAuth)); setShowChangePIN(false); alert('เปลี่ยน PIN เรียบร้อยแล้ว!'); }}
          onClose={()=>setShowChangePIN(false)}
        />
      )}
    </div>
  );
}

// ── Category Form ──────────────────────────────────────────────────────────
function CategoryForm({editCat,tab,onSave,onDelete,onClose}) {
  const emojiPool = tab==='income' ? CAT_EMOJIS_INCOME : CAT_EMOJIS_EXPENSE;
  const [name,  setName]  = useState(editCat?.name  ||'');
  const [emoji, setEmoji] = useState(editCat?.emoji ||emojiPool[0]);
  const [color, setColor] = useState(editCat?.color ||CAT_COLORS[0]);

  const handleSave = ()=>{
    if(!name.trim()){alert('กรุณากรอกชื่อหมวดหมู่');return;}
    onSave({name:name.trim(),emoji,color});
  };

  const isIncome = tab==='income';
  const accentCol = isIncome ? C.income : C.expense;
  const accentBg  = isIncome ? C.incomeBg : C.expenseBg;
  const accentBdr = isIncome ? C.incomeBdr : C.expenseBdr;

  return(
    <div style={{...card({marginTop:14}),border:`1px solid ${accentBdr}`,background:accentBg}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
        <div style={{fontSize:15,fontWeight:700,color:C.text}}>
          {editCat ? `✏️ แก้ไข — ${editCat.name}` : `➕ หมวดหมู่${isIncome?'รายรับ':'รายจ่าย'}ใหม่`}
        </div>
        <button onClick={onClose} style={{background:'none',border:'none',color:C.textMuted,cursor:'pointer',fontSize:18}}>✕</button>
      </div>

      {/* Preview */}
      <div style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',background:C.card,borderRadius:12,marginBottom:18,border:`1px solid ${C.border}`}}>
        <div style={{width:44,height:44,borderRadius:12,background:`${color}22`,border:`1px solid ${color}55`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>{emoji}</div>
        <div>
          <div style={{fontSize:15,fontWeight:600,color:name?C.text:C.textMuted}}>{name||'ชื่อหมวดหมู่'}</div>
          <div style={{display:'flex',alignItems:'center',gap:6,marginTop:2}}><div style={{width:8,height:8,borderRadius:'50%',background:color}}/><span style={{fontSize:11,color:C.textMuted}}>ตัวอย่าง</span></div>
        </div>
      </div>

      {/* Name */}
      <div style={{marginBottom:16}}>
        <label style={{fontSize:12,color:C.textMuted,marginBottom:6,display:'block'}}>ชื่อหมวดหมู่ *</label>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder={`เช่น ${isIncome?'ค่าเช่าบ้าน':'เงินปันผล'}`} style={iBase} maxLength={20}/>
        <div style={{fontSize:11,color:C.textMuted,marginTop:4,textAlign:'right'}}>{name.length}/20</div>
      </div>

      {/* Emoji picker */}
      <div style={{marginBottom:16}}>
        <label style={{fontSize:12,color:C.textMuted,marginBottom:8,display:'block'}}>สัญลักษณ์</label>
        <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
          {emojiPool.map(e=>(
            <button key={e} onClick={()=>setEmoji(e)} className="emb" style={{
              width:36,height:36,borderRadius:8,border:`1.5px solid ${emoji===e?accentCol:C.border}`,
              background:emoji===e?accentBg:C.card,fontSize:18,cursor:'pointer',
              display:'flex',alignItems:'center',justifyContent:'center',transition:'transform 0.12s',
            }}>{e}</button>
          ))}
        </div>
      </div>

      {/* Color picker */}
      <div style={{marginBottom:20}}>
        <label style={{fontSize:12,color:C.textMuted,marginBottom:8,display:'block'}}>สี</label>
        <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
          {CAT_COLORS.map(col=>(
            <button key={col} onClick={()=>setColor(col)} style={{
              width:28,height:28,borderRadius:'50%',background:col,cursor:'pointer',
              border:`3px solid ${color===col?C.text:'transparent'}`,
              outline:`2px solid ${color===col?col:'transparent'}`,
              transition:'all 0.12s',flexShrink:0,
            }}/>
          ))}
        </div>
      </div>

      {/* Actions */}
      {onDelete&&editCat&&(
        <button onClick={()=>{if(confirm(`ลบหมวดหมู่ "${editCat.name}" ?`))onDelete(editCat.id);}} style={{width:'100%',padding:'10px',borderRadius:10,background:C.expenseBg,border:`1px solid ${C.expenseBdr}`,color:C.expense,fontWeight:600,fontSize:13,cursor:'pointer',marginBottom:10}}>
          🗑️ ลบหมวดหมู่นี้
        </button>
      )}
      {editCat?.builtIn&&(
        <div style={{fontSize:11,color:C.textMuted,textAlign:'center',marginBottom:10}}>⚠️ หมวดหมู่มาตรฐานไม่สามารถลบได้ แต่แก้ไขชื่อและสัญลักษณ์ได้</div>
      )}
      <div style={{display:'flex',gap:10}}>
        <button onClick={onClose}    style={{flex:1,padding:'11px',borderRadius:10,background:C.card,border:`1px solid ${C.border}`,color:C.textMuted,cursor:'pointer',fontSize:14}}>ยกเลิก</button>
        <button onClick={handleSave} style={{flex:2,padding:'11px',borderRadius:10,background:accentCol,border:'none',color:'#fff',fontWeight:700,fontSize:14,cursor:'pointer'}}>💾 บันทึก</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// AUTH SCREENS
// ══════════════════════════════════════════════════════════════════════════

function PinPad({pin,setPin,maxLen=4}) {
  const keys=['1','2','3','4','5','6','7','8','9','','0','⌫'];
  const press=(k)=>{
    if(k==='⌫') setPin(p=>p.slice(0,-1));
    else if(k&&pin.length<maxLen) setPin(p=>p+k);
  };
  return(
    <div>
      <div style={{display:'flex',justifyContent:'center',gap:18,marginBottom:32}}>
        {Array.from({length:maxLen},(_,i)=>(
          <div key={i} style={{width:18,height:18,borderRadius:'50%',background:i<pin.length?C.primary:'none',border:`2px solid ${i<pin.length?C.primary:'#2a442e'}`,transition:'all 0.15s',transform:i<pin.length?'scale(1.15)':'scale(1)'}}/>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,maxWidth:280,margin:'0 auto'}}>
        {keys.map((k,i)=>(
          <button key={i} onClick={()=>press(k)} disabled={!k} style={{height:66,borderRadius:14,fontSize:k==='⌫'?20:22,fontWeight:k==='⌫'?400:600,background:k?'#121f15':'transparent',border:`1px solid ${k?'#1a3020':'transparent'}`,color:k==='⌫'?'#4b7a5a':'#f0fdf4',cursor:k?'pointer':'default',fontFamily:"'Sarabun',sans-serif",transition:'transform 0.08s'}} onMouseDown={e=>{if(k)e.currentTarget.style.transform='scale(0.9)';}} onMouseUp={e=>{if(k)e.currentTarget.style.transform='scale(1)';}}>
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}

function LoginScreen({authData,onSuccess}) {
  const [pin,setPin]=useState('');
  const [error,setError]=useState('');
  const [shake,setShake]=useState(false);
  const [attempt,setAttempt]=useState(0);
  const LK='ml_locked_until';
  const lu=parseInt(localStorage.getItem(LK)||'0');
  const [locked,setLocked]=useState(Date.now()<lu);
  const [lockSec,setLockSec]=useState(Math.max(0,Math.ceil((lu-Date.now())/1000)));
  React.useEffect(()=>{
    if(!locked)return;
    const t=setInterval(()=>{const r=Math.max(0,Math.ceil((parseInt(localStorage.getItem(LK)||'0')-Date.now())/1000));setLockSec(r);if(r<=0){setLocked(false);clearInterval(t);}},1000);
    return()=>clearInterval(t);
  },[locked]);
  React.useEffect(()=>{
    if(pin.length!==4)return;
    if(hashPin(pin)===authData.pinHash){localStorage.removeItem(LK);onSuccess();}
    else{
      setShake(true);const na=attempt+1;setAttempt(na);
      setError(`PIN ไม่ถูกต้อง${na<5?` (เหลือ ${5-na} ครั้ง)`:''}`);
      if(na>=5){const u=Date.now()+30000;localStorage.setItem(LK,String(u));setLocked(true);setLockSec(30);setAttempt(0);}
      setTimeout(()=>{setPin('');setShake(false);setError('');},600);
    }
  },[pin]);
  return(
    <div style={{minHeight:'100vh',background:'#07100a',display:'flex',alignItems:'center',justifyContent:'center',padding:20,fontFamily:"'Sarabun',sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}.fu{animation:fadeUp 0.4s ease}.sk{animation:shake 0.4s ease}`}</style>
      <div className="fu" style={{width:'100%',maxWidth:340,textAlign:'center'}}>
        <div style={{width:84,height:84,borderRadius:24,background:'#052e16',border:'2px solid #14532d',display:'flex',alignItems:'center',justifyContent:'center',fontSize:44,margin:'0 auto 16px'}}>{authData.avatar}</div>
        <div style={{fontSize:22,fontWeight:700,color:'#f0fdf4',marginBottom:4}}>สวัสดี, {authData.name}!</div>
        <div style={{fontSize:13,color:'#4b7a5a',marginBottom:40}}>กรอก PIN 4 หลักเพื่อเข้าสู่ระบบ</div>
        {locked?(
          <div style={{background:'#3b0a0a',border:'1px solid #7f1d1d',borderRadius:14,padding:'24px',marginBottom:20}}>
            <div style={{fontSize:36,marginBottom:10}}>🔒</div>
            <div style={{fontSize:14,fontWeight:600,color:'#f87171'}}>ล็อกชั่วคราว</div>
            <div style={{fontSize:13,color:'#4b7a5a',marginTop:6}}>ลองใหม่ใน <span style={{color:'#fbbf24',fontWeight:700}}>{lockSec}</span> วินาที</div>
          </div>
        ):(
          <div className={shake?'sk':''}>
            {error&&<div style={{fontSize:13,color:'#f87171',marginBottom:14,fontWeight:500}}>{error}</div>}
            <PinPad pin={pin} setPin={setPin}/>
          </div>
        )}
      </div>
    </div>
  );
}

function SetupScreen({onDone}) {
  const [step,setStep]=useState(1);
  const [name,setName]=useState('');
  const [avatar,setAvatar]=useState('😊');
  const [pin,setPin]=useState('');
  const [cpin,setCpin]=useState('');
  const [perr,setPerr]=useState('');
  React.useEffect(()=>{if(step===2&&pin.length===4)setStep(3);},[pin,step]);
  React.useEffect(()=>{
    if(step===3&&cpin.length===4){
      if(cpin===pin)onDone({name:name.trim()||'ผู้ใช้',avatar,pinHash:hashPin(pin)});
      else{setPerr('PIN ไม่ตรงกัน');setTimeout(()=>{setCpin('');setPerr('');setStep(2);setPin('');},800);}
    }
  },[cpin,step]);
  const st={minHeight:'100vh',background:'#07100a',display:'flex',alignItems:'center',justifyContent:'center',padding:20,fontFamily:"'Sarabun',sans-serif"};
  return(
    <div style={st}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}.fu{animation:fadeUp 0.35s ease}.sk{animation:shake 0.4s ease}`}</style>
      <div className="fu" style={{width:'100%',maxWidth:380,textAlign:'center'}}>
        <div style={{width:72,height:72,borderRadius:20,background:'#052e16',border:'2px solid #14532d',display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,margin:'0 auto 12px'}}>💚</div>
        <div style={{fontSize:24,fontWeight:700,color:'#f0fdf4',marginBottom:4}}>Money Lover</div>
        <div style={{fontSize:13,color:'#4b7a5a',marginBottom:28}}>ยินดีต้อนรับ! ตั้งค่าบัญชีของคุณ</div>
        <div style={{display:'flex',justifyContent:'center',gap:8,marginBottom:32}}>
          {[1,2,3].map(s=><div key={s} style={{width:s===step?28:8,height:8,borderRadius:4,background:s<=step?'#22c55e':'#1a3020',transition:'all 0.3s'}}/>)}
        </div>
        {step===1&&(
          <div>
            <div style={{fontSize:15,fontWeight:600,color:'#86efac',marginBottom:20}}>เลือก Avatar และตั้งชื่อ</div>
            <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:10,marginBottom:22}}>
              {USER_AVATARS.map(a=>(
                <button key={a} onClick={()=>setAvatar(a)} style={{width:52,height:52,borderRadius:14,fontSize:26,cursor:'pointer',background:avatar===a?'#052e16':'#121f15',border:`2px solid ${avatar===a?'#22c55e':'#1a3020'}`,transition:'all 0.15s'}}>{a}</button>
              ))}
            </div>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="ชื่อของคุณ..." maxLength={20} onKeyDown={e=>e.key==='Enter'&&name.trim()&&setStep(2)}
              style={{width:'100%',background:'#121f15',border:'1px solid #1a3020',borderRadius:10,color:'#f0fdf4',padding:'12px 14px',fontSize:15,outline:'none',textAlign:'center',marginBottom:18,fontFamily:"'Sarabun',sans-serif"}}/>
            <button onClick={()=>name.trim()?setStep(2):alert('กรุณากรอกชื่อ')} style={{width:'100%',padding:'14px',borderRadius:12,background:'#22c55e',border:'none',color:'#fff',fontWeight:700,fontSize:15,cursor:'pointer',fontFamily:"'Sarabun',sans-serif"}}>ถัดไป →</button>
          </div>
        )}
        {step===2&&(
          <div>
            <div style={{fontSize:15,fontWeight:600,color:'#86efac',marginBottom:6}}>ตั้ง PIN 4 หลัก</div>
            <div style={{fontSize:13,color:'#4b7a5a',marginBottom:28}}>ใช้สำหรับเข้าสู่ระบบทุกครั้ง</div>
            <PinPad pin={pin} setPin={setPin}/>
            <button onClick={()=>{setStep(1);setPin('');}} style={{marginTop:20,background:'none',border:'none',color:'#4b7a5a',cursor:'pointer',fontSize:13,fontFamily:"'Sarabun',sans-serif"}}>← ย้อนกลับ</button>
          </div>
        )}
        {step===3&&(
          <div className={perr?'sk':''}>
            <div style={{fontSize:15,fontWeight:600,color:'#86efac',marginBottom:6}}>ยืนยัน PIN อีกครั้ง</div>
            <div style={{fontSize:13,color:perr?'#f87171':'#4b7a5a',marginBottom:28}}>{perr||'กรอก PIN ซ้ำเพื่อยืนยัน'}</div>
            <PinPad pin={cpin} setPin={setCpin}/>
            <button onClick={()=>{setStep(2);setPin('');setCpin('');setPerr('');}} style={{marginTop:20,background:'none',border:'none',color:'#4b7a5a',cursor:'pointer',fontSize:13,fontFamily:"'Sarabun',sans-serif"}}>← ย้อนกลับ</button>
          </div>
        )}
      </div>
    </div>
  );
}

function ChangePINModal({authData,onDone,onClose}) {
  const [step,setStep]=useState(1);
  const [op,setOp]=useState('');
  const [np,setNp]=useState('');
  const [cp,setCp]=useState('');
  const [err,setErr]=useState('');
  React.useEffect(()=>{if(step===1&&op.length===4){if(hashPin(op)===authData.pinHash)setStep(2);else{setErr('PIN เดิมไม่ถูกต้อง');setTimeout(()=>{setOp('');setErr('');},700);}}},[op,step]);
  React.useEffect(()=>{if(step===2&&np.length===4)setStep(3);},[np,step]);
  React.useEffect(()=>{if(step===3&&cp.length===4){if(cp===np)onDone({...authData,pinHash:hashPin(np)});else{setErr('PIN ไม่ตรงกัน');setTimeout(()=>{setCp('');setErr('');setStep(2);setNp('');},700);}}},[cp,step]);
  const labels=['ยืนยัน PIN เดิม','ตั้ง PIN ใหม่ 4 หลัก','ยืนยัน PIN ใหม่'];
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2000,padding:16}}>
      <div style={{background:'#121f15',border:'1px solid #1a3020',borderRadius:20,padding:'28px 24px',width:380,maxWidth:'100%',textAlign:'center',boxShadow:'0 24px 60px rgba(0,0,0,0.7)',fontFamily:"'Sarabun',sans-serif"}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:22}}>
          <span style={{fontSize:16,fontWeight:700,color:'#f0fdf4'}}>🔑 เปลี่ยน PIN</span>
          <button onClick={onClose} style={{background:'none',border:'none',color:'#4b7a5a',cursor:'pointer',fontSize:20,lineHeight:1}}>✕</button>
        </div>
        <div style={{display:'flex',justifyContent:'center',gap:6,marginBottom:20}}>
          {[1,2,3].map(s=><div key={s} style={{width:s===step?24:7,height:7,borderRadius:4,background:s<=step?'#22c55e':'#1a3020',transition:'all 0.3s'}}/>)}
        </div>
        <div style={{fontSize:14,fontWeight:600,color:'#86efac',marginBottom:6}}>{labels[step-1]}</div>
        {err&&<div style={{fontSize:12,color:'#f87171',marginBottom:10}}>{err}</div>}
        {step===1&&<PinPad pin={op} setPin={setOp}/>}
        {step===2&&<PinPad pin={np} setPin={setNp}/>}
        {step===3&&<PinPad pin={cp} setPin={setCp}/>}
      </div>
    </div>
  );
}
