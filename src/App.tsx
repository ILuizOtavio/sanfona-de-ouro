// ═══════════════════════════════════════════════════════════════════════════
//  SANFONA DE OURO 🪗 — VERSÃO FINAL PREMIUM COMPLETA
//  Mapa OSM · Avatar · Álbum Panini · Conquistas · Patrimônios
//  Timeline · Favoritos · Busca · Filtros · Trilha Sonora · Ranking
// ═══════════════════════════════════════════════════════════════════════════

import {
  Album, BarChart3, Bell, Building2, CheckCircle, CheckSquare, ChevronLeft,
  ChevronRight, ClipboardList, Copy, Eye, EyeOff, Filter, Gift, Heart, Home,
  KeyRound, Landmark, Lock, LogOut, MapPin, Medal, Music,
  Music2, Navigation, QrCode, RefreshCw, ScanLine, Search, Shield, Sparkles,
  Star, Ticket, TrendingUp, Trophy, Users, Volume2, VolumeX, Zap, Crown,
  Camera, ArrowRight, LocateFixed,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { ranking }                from "./data/ranking";
import { rewards, type Reward }   from "./data/rewards";
import { stickers, type Sticker } from "./data/stickers";
import { stakeholders }           from "./data/stakeholders";
import {
  patrimonios, timeline,
  CATEGORIAS_MATERIAIS, CATEGORIAS_IMATERIAIS,
  type Patrimonio, type PatrimonioCategoria,
} from "./data/patrimonios";
import {
  type ClientRegistration, type MerchantRegistration,
  type CouponValidation, type FullUserRecord, type FullMerchantRecord,
  loadAllUsers, loadAllMerchants,
  saveClient, saveMerchant, saveValidation, loadValidations, generateCouponCode,
} from "./services/registrations";
import {
  initialProgress, loadProgress, saveProgress, redeemReward, simulateTrade,
  type LocalProgress, unlockRandomSticker,
} from "./storage/webProgress";
import { PackOpeningScreen } from "./components/PackOpeningScreen";
import { createPortal } from "react-dom";
import { supabase, isSupabaseConfigured } from "./lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────
type AppView =
  | "landing" | "login" | "register"
  | "merchant-login" | "merchant-register"
  | "admin-login"
  | "user-app" | "merchant-app" | "admin-app";

type UserTab  = "home" | "album" | "scanner" | "mapa" | "cultura" | "rewards";
type AdminTab = "dashboard" | "usuarios" | "lojistas" | "validacoes";

interface AuthUser {
  name: string; email: string; type: "user"|"merchant"|"admin";
  merchantData?: MerchantRegistration; avatar?: string;
}

// ─── Pontos no mapa ────────────────────────────────────────────────────────────
type MapaPonto = {
  id:string;name:string;lat:number;lng:number;emoji:string;tipo:string;
  qrs:number;cor:string;endereco:string;dist?:number;
};

const MAP_POINTS: MapaPonto[] = [
  // ─── Orla / Atalaia (Aracaju) ───
  { id:"orla",         name:"Orla de Atalaia",           lat:-10.9890, lng:-37.0454, emoji:"🌊", tipo:"Praia",          qrs:8,  cor:"#287A45", endereco:"Orla de Atalaia, Aracaju – SE" },
  { id:"caranguejo",   name:"Passarela do Caranguejo",   lat:-10.9742, lng:-37.0525, emoji:"🦀", tipo:"Gastronomia",    qrs:6,  cor:"#E85D2A", endereco:"Passarela do Caranguejo, Atalaia" },
  { id:"forro",        name:"Arena Forró Caju",          lat:-10.9810, lng:-37.0620, emoji:"🪗", tipo:"Show",           qrs:15, cor:"#F8C23A", endereco:"Orla de Atalaia, Aracaju – SE" },
  { id:"cajueiros",    name:"Parque dos Cajueiros",      lat:-10.9602, lng:-37.0539, emoji:"🌿", tipo:"Natureza",      qrs:5,  cor:"#287A45", endereco:"Parque dos Cajueiros, Aracaju – SE" },

  // ─── Centro (Aracaju) ───
  { id:"mercado",      name:"Mercado Antônio Franco",    lat:-10.9074, lng:-37.0488, emoji:"🏛️", tipo:"Mercado",       qrs:10, cor:"#F8C23A", endereco:"Aracaju – SE" },
  { id:"mercado-thales",name:"Mercado Thales Ferraz",    lat:-10.9066, lng:-37.0488, emoji:"🏪", tipo:"Mercado",       qrs:8,  cor:"#F8C23A", endereco:"Aracaju – SE" },
  { id:"museu",        name:"Museu da Gente Sergipana",  lat:-10.9174, lng:-37.0476, emoji:"🎭", tipo:"Museu",         qrs:7,  cor:"#B63822", endereco:"Aracaju – SE" },
  { id:"catedral",     name:"Catedral Metropolitana",    lat:-10.9125, lng:-37.0548, emoji:"⛪", tipo:"Igreja",         qrs:4,  cor:"#B63822", endereco:"Aracaju – SE" },
  { id:"cultura",      name:"Centro Cultural",            lat:-10.9098, lng:-37.0502, emoji:"🎨", tipo:"Centro Cultural",qrs:9,  cor:"#7A2E17", endereco:"Aracaju – SE" },
  { id:"sementeira",   name:"Parque da Sementeira",      lat:-10.9443, lng:-37.0533, emoji:"🌿", tipo:"Parque",        qrs:5,  cor:"#287A45", endereco:"Aracaju – SE" },
  { id:"mirante",      name:"Mirante 13 de Julho",       lat:-10.9322, lng:-37.0475, emoji:"🌅", tipo:"Mirante",       qrs:4,  cor:"#E85D2A", endereco:"Aracaju – SE" },
  { id:"mamulengo",    name:"Mamulengo de Cheiroso",     lat:-10.9870, lng:-37.0776, emoji:"🎭", tipo:"Teatro Popular",qrs:4,  cor:"#7A2E17", endereco:"Atalaia, Aracaju – SE" },

  // ─── Grande Aracaju ───
  { id:"saocristovao", name:"São Cristóvão",             lat:-11.0161, lng:-37.2100, emoji:"🏘️", tipo:"Cidade Histórica",qrs:12, cor:"#B63822", endereco:"São Cristóvão, SE" },

  // ─── Interior de Sergipe ───
  { id:"laranjeiras",  name:"Laranjeiras",               lat:-10.8064, lng:-37.1700, emoji:"🏛️", tipo:"Cidade Histórica",qrs:10, cor:"#E85D2A", endereco:"Laranjeiras, SE" },
  { id:"divina",       name:"Divina Pastora",            lat:-10.6782, lng:-37.1506, emoji:"🧵", tipo:"Artesanato",    qrs:4,  cor:"#7A2E17", endereco:"Divina Pastora, SE" },
  { id:"estancia",     name:"Estância",                  lat:-11.2683, lng:-37.4383, emoji:"🎆", tipo:"Festa Popular",  qrs:6,  cor:"#F8C23A", endereco:"Estância, SE" },
  { id:"lagarto",      name:"Lagarto",                   lat:-10.9172, lng:-37.6500, emoji:"🪗", tipo:"Cultura Popular",qrs:5,  cor:"#B63822", endereco:"Lagarto, SE" },
  { id:"brejo-grande", name:"Brejo Grande",              lat:-10.4302, lng:-36.4614, emoji:"👑", tipo:"Cultura Popular",qrs:3,  cor:"#B63822", endereco:"Brejo Grande, SE" },
  { id:"caninde",      name:"Canindé do São Francisco",  lat:-9.6492,  lng:-37.7926, emoji:"🏞️", tipo:"Patrimônio Natural",qrs:5, cor:"#287A45", endereco:"Canindé do São Francisco, SE" },
  { id:"porto-folha",  name:"Porto da Folha",            lat:-9.9172,  lng:-37.2783, emoji:"🌿", tipo:"Cultura Indígena",qrs:3, cor:"#287A45", endereco:"Porto da Folha, SE" },
  { id:"gloria",       name:"Nossa Senhora da Glória",   lat:-10.2178, lng:-37.4200, emoji:"🪵", tipo:"Artesanato",    qrs:4,  cor:"#7A2E17", endereco:"Nossa Senhora da Glória, SE" },
  { id:"santana-sf",   name:"Santana do São Francisco",  lat:-10.2889, lng:-36.6418, emoji:"🏺", tipo:"Cerâmica",      qrs:4,  cor:"#F8C23A", endereco:"Santana do São Francisco, SE" },
  { id:"cedro-sj",     name:"Cedro de São João",         lat:-10.2517, lng:-36.8844, emoji:"🥩", tipo:"Gastronomia",   qrs:3,  cor:"#E85D2A", endereco:"Cedro de São João, SE" },
  { id:"miguel",       name:"São Miguel do Aleixo",      lat:-10.3881, lng:-37.3811, emoji:"🐑", tipo:"Gastronomia",   qrs:3,  cor:"#E85D2A", endereco:"São Miguel do Aleixo, SE" },
];

// ─── Conquistas ────────────────────────────────────────────────────────────────
const ACHIEVEMENTS = [
  { id:"first",    icon:"🌟", title:"Primeira Figurinha", desc:"Desbloqueou sua 1ª figurinha",    pts:50,  cond:(p:LocalProgress)=>p.unlockedStickerIds.length>=1 },
  { id:"explorer", icon:"🗺️", title:"Explorador",         desc:"Visitou 3 pontos culturais",      pts:100, cond:(p:LocalProgress)=>p.pointsVisited>=3 },
  { id:"collector",icon:"🎴", title:"Colecionador",        desc:"Coletou 5 figurinhas",            pts:150, cond:(p:LocalProgress)=>p.unlockedStickerIds.length>=5 },
  { id:"master",   icon:"👑", title:"Mestre da Sanfona",  desc:"Coletou todas as figurinhas",     pts:500, cond:(p:LocalProgress)=>p.unlockedStickerIds.length>=stickers.length },
  { id:"rich",     icon:"💰", title:"Rico de Pontos",      desc:"Acumulou 1000 pontos",            pts:200, cond:(p:LocalProgress)=>p.score>=1000 },
  { id:"cultural", icon:"🏛️", title:"Guardião Cultural",  desc:"Explorou 3 patrimônios",          pts:120, cond:(_p:LocalProgress)=>true },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function cx(...c:(string|false|null|undefined)[]) { return c.filter(Boolean).join(" "); }
const AUTH_KEY="sanfona-auth"; const USERS_KEY="sanfona-users"; const MERCHANTS_KEY="sanfona-merchant-users";
function saveAuth(u:AuthUser) { localStorage.setItem(AUTH_KEY,JSON.stringify(u)); }
function loadAuth():AuthUser|null { const r=localStorage.getItem(AUTH_KEY); return r?JSON.parse(r):null; }
function clearAuth() { localStorage.removeItem(AUTH_KEY); }
function readLS<T>(k:string):T[] { try{return JSON.parse(localStorage.getItem(k)||"[]");}catch{return [];} }
function getPhoto(email:string) { return localStorage.getItem(`sanfona-photo-${email}`); }
function getFavorites():string[] { try{return JSON.parse(localStorage.getItem("sanfona-favorites")||"[]");}catch{return [];} }
function toggleFavorite(id:string) {
  const favs=getFavorites();
  const next=favs.includes(id)?favs.filter(f=>f!==id):[...favs,id];
  localStorage.setItem("sanfona-favorites",JSON.stringify(next));
  return next;
}
function getAvatarColor(name:string) {
  const colors=["#F8C23A","#E85D2A","#287A45","#B63822","#7A2E17","#49A7A1"];
  return colors[(name.charCodeAt(0)||0)%colors.length];
}
async function signInWithGoogle() {
  if (!supabase || !isSupabaseConfigured) { console.warn("⚠️ Supabase não configurado"); return; }
  await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
}

// ─── Carousel ──────────────────────────────────────────────────────────────────
const SLIDES=[
  {url:"/imagens/orla.JPG",fb:"/imagens/orla.JPG",title:"Orla de Atalaia",sub:"6 km de mar, luz e forró à beira-d'água",tag:"Praia & Lazer",emoji:"🌊",cor:"#287A45"},
  {url:"/imagens/passarela_do_carangueijo.jpeg",fb:"/imagens/passarela_do_carangueijo.jpeg",title:"Passarela do Caranguejo",sub:"Símbolo gastronômico mais amado de Sergipe",tag:"Gastronomia",emoji:"🦀",cor:"#E85D2A"},
  {url:"/imagens/mercado_antonio_franco.jpeg",fb:"/imagens/mercado_antonio_franco.jpeg",title:"Mercado Antônio Franco",sub:"Coração do comércio sergipano desde 1926",tag:"Mercado Central",emoji:"🏛️",cor:"#F8C23A"},
  {url:"/imagens/museu_da_gente_sergipana.jpeg",fb:"/imagens/museu_da_gente_sergipana.jpeg",title:"Museu da Gente Sergipana",sub:"A memória viva do povo nordestino",tag:"Cultura & História",emoji:"🎭",cor:"#B63822"},
  {url:"/imagens/por_do_sol.jpeg",fb:"/imagens/por_do_sol.jpeg",title:"Pôr do Sol Sergipano",sub:"Rio Sergipe tingido de ouro todas as noites",tag:"Natureza",emoji:"🌅",cor:"#7A2E17"},
  {url:"/imagens/sao_critovam.jpeg",fb:"/imagens/sao_critovam.jpeg",title:"São Cristóvão",sub:"4ª cidade mais antiga do Brasil — Patrimônio UNESCO",tag:"Patrimônio Mundial",emoji:"🏰",cor:"#F8C23A"},
];

function Carousel() {
  const [cur,setCur]=useState(0);const [key,setKey]=useState(0);const [errs,setErrs]=useState<Record<number,boolean>>({});
  const timer=useRef<ReturnType<typeof setInterval>|null>(null);
  const go=useCallback((i:number)=>{setCur(i);setKey(k=>k+1);},[]);
  const next=useCallback(()=>go((cur+1)%SLIDES.length),[cur,go]);
  const prev=useCallback(()=>go((cur-1+SLIDES.length)%SLIDES.length),[cur,go]);
  useEffect(()=>{timer.current=setInterval(next,5000);return()=>{if(timer.current)clearInterval(timer.current);};},[next]);
  const s=SLIDES[cur];
  return (
    <div className="relative w-full overflow-hidden rounded-[2rem] shadow-2xl" style={{height:"440px"}}>
      {SLIDES.map((sl,i)=>(<div key={i} className="absolute inset-0 transition-opacity duration-700" style={{opacity:i===cur?1:0,zIndex:i===cur?1:0}}><img src={errs[i]?sl.fb:sl.url} alt={sl.title} onError={()=>setErrs(e=>({...e,[i]:true}))} className="h-full w-full object-cover" loading={i===0?"eager":"lazy"} style={{filter:"brightness(.78)"}}/><div className="absolute inset-0 bg-gradient-to-t from-[#241512]/95 via-[#241512]/20 to-transparent"/><div className="absolute inset-0 bg-gradient-to-r from-[#241512]/65 to-transparent"/></div>))}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] z-20 transition-colors duration-700" style={{backgroundColor:s.cor}}/>
      <div className="absolute inset-0 z-10 flex flex-col justify-end p-8 md:p-10"><div key={key} className="carousel-enter"><span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-black mb-3" style={{background:`${s.cor}25`,borderColor:`${s.cor}50`,color:s.cor==="#F8C23A"?"#F8C23A":"#FFF1C7"}}>{s.emoji} {s.tag}</span><h3 className="text-4xl md:text-5xl font-black text-white leading-tight drop-shadow-lg">{s.title}</h3><p className="mt-2 text-sm font-semibold text-white/65 max-w-sm">{s.sub}</p></div></div>
      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-11 w-11 flex items-center justify-center rounded-full bg-black/40 text-white backdrop-blur border border-white/20 transition hover:bg-milho hover:text-madeira"><ChevronLeft size={20}/></button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-11 w-11 flex items-center justify-center rounded-full bg-black/40 text-white backdrop-blur border border-white/20 transition hover:bg-milho hover:text-madeira"><ChevronRight size={20}/></button>
      <div className="absolute bottom-5 right-6 z-20 flex gap-1.5">{SLIDES.map((_,i)=>(<button key={i} onClick={()=>go(i)} className="transition-all duration-300 rounded-full" style={{height:"8px",width:i===cur?"26px":"8px",backgroundColor:i===cur?s.cor:"rgba(255,255,255,.3)"}}/>))}</div>
      <div className="absolute top-4 right-4 z-20 rounded-full bg-black/40 backdrop-blur px-3 py-1 text-xs font-black text-white/60 border border-white/10">{cur+1}/{SLIDES.length}</div>
    </div>
  );
}

// ─── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({name,email,size=40,onClick}:{name:string;email:string;size?:number;onClick?:()=>void}) {
  const photo=getPhoto(email);
  const color=getAvatarColor(name);
  const ini=(name||"?")[0].toUpperCase();
  return (
    <button onClick={onClick} className="relative flex-shrink-0 transition hover:scale-105" style={{width:size,height:size}}>
      {photo?<img src={photo} alt={name} className="rounded-full object-cover w-full h-full border-2 border-milho/50"/>
        :<div className="rounded-full w-full h-full flex items-center justify-center font-black text-white border-2 border-white/20" style={{backgroundColor:color,fontSize:size*0.38}}>{ini}</div>}
      {onClick&&<div className="absolute -bottom-1 -right-1 w-5 h-5 bg-milho rounded-full flex items-center justify-center border-2 border-noite"><Camera size={9} className="text-madeira"/></div>}
    </button>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({msg,type,onClose}:{msg:string;type:"success"|"error"|"info";onClose:()=>void}) {
  useEffect(()=>{const t=setTimeout(onClose,3500);return()=>clearTimeout(t);},[onClose]);
  const cls={success:"border-folha/40 bg-folha/20 text-folha",error:"border-fogueira/40 bg-fogueira/20 text-fogueira",info:"border-milho/40 bg-milho/20 text-milho"};
  return (<div className={cx("fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 rounded-2xl border px-5 py-3 backdrop-blur shadow-soft fade-up max-w-xs",cls[type])}><p className="text-sm font-black">{msg}</p></div>);
}

// ─── Photo Modal ───────────────────────────────────────────────────────────────
function PhotoModal({user,onClose,onSave}:{user:AuthUser;onClose:()=>void;onSave:(url:string)=>void}) {
  const [preview,setPreview]=useState<string|null>(getPhoto(user.email));
  function handleFile(e:React.ChangeEvent<HTMLInputElement>){const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=ev=>{setPreview(ev.target?.result as string);};r.readAsDataURL(f);}
  function salvar(){if(preview){localStorage.setItem(`sanfona-photo-${user.email}`,preview);onSave(preview);}onClose();}
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-noite/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-[2rem] bg-noite border border-white/15 p-6 fade-up">
        <h2 className="text-2xl font-black text-palha mb-5">📷 Foto de perfil</h2>
        <div className="flex flex-col items-center gap-5">
          {preview?<img src={preview} alt="preview" className="h-28 w-28 rounded-full object-cover border-4 border-milho shadow-glow"/>:<div className="h-28 w-28 rounded-full bg-white/10 border-2 border-dashed border-white/20 flex items-center justify-center"><Camera size={36} className="text-palha/30"/></div>}
          <label className="w-full cursor-pointer"><div className="w-full rounded-2xl border-2 border-dashed border-milho/40 bg-milho/10 py-3 text-center text-sm font-black text-milho hover:bg-milho/15 transition">Escolher da galeria</div><input type="file" accept="image/*" className="hidden" onChange={handleFile}/></label>
        </div>
        <div className="mt-5 flex gap-3"><button onClick={onClose} className="flex-1 rounded-2xl bg-white/10 py-3 font-black text-palha hover:bg-white/15 transition">Cancelar</button><button onClick={salvar} className="flex-1 rounded-2xl bg-milho py-3 font-black text-madeira hover:bg-ouro transition">Salvar</button></div>
      </div>
    </div>
  );
}

// ─── Auth UI Helpers ───────────────────────────────────────────────────────────
function AuthInput({label,type="text",value,onChange,placeholder}:{label:string;type?:string;value:string;onChange:(v:string)=>void;placeholder?:string}) {
  const [show,setShow]=useState(false);const ip=type==="password";
  return (<label className="block"><span className="text-[11px] font-black uppercase tracking-widest text-palha/40">{label}</span><div className="relative mt-1.5"><input type={ip&&show?"text":type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-palha placeholder:text-palha/25 outline-none transition focus:border-milho/40"/>{ip&&(<button type="button" onClick={()=>setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-palha/40 hover:text-palha">{show?<EyeOff size={15}/>:<Eye size={15}/>}</button>)}</div></label>);
}
function FormCard({children,back,title,sub,iconBg,icon:Icon}:{children:React.ReactNode;back:()=>void;title:string;sub:string;iconBg:string;icon:React.ElementType}) {
  return (<div className="min-h-screen bg-noite flex items-center justify-center p-4 py-10"><div className="absolute inset-0 overflow-hidden pointer-events-none"><div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-fogueira/10 blur-[100px]"/><div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-folha/10 blur-[100px]"/></div><div className="relative w-full max-w-md"><button onClick={back} className="mb-6 flex items-center gap-2 text-sm font-black text-palha/40 hover:text-palha transition"><ChevronLeft size={16}/> Voltar</button><div className="rounded-[2rem] border border-white/10 bg-white/[.04] p-8 backdrop-blur"><div className={cx("mb-5 flex h-12 w-12 items-center justify-center rounded-full",iconBg)}><Icon size={22}/></div><h2 className="text-3xl font-black text-palha">{title}</h2><p className="mt-1 text-sm font-semibold text-palha/45">{sub}</p><div className="mt-6 space-y-4">{children}</div></div></div></div>);
}
function ErrBox({msg}:{msg:string}) { return msg?<p className="rounded-2xl bg-fogueira/15 border border-fogueira/30 px-4 py-3 text-sm font-bold text-fogueira">{msg}</p>:<></>; }
function OkScreen({title,sub}:{title:string;sub:string}) { return (<div className="min-h-screen bg-noite flex flex-col items-center justify-center gap-4"><div className="text-7xl animate-bounce">🎉</div><h2 className="text-3xl font-black text-palha">{title}</h2><p className="text-palha/50 font-semibold">{sub}</p></div>); }

// ─── LANDING ───────────────────────────────────────────────────────────────────
function Landing({sv}:{sv:(v:AppView)=>void}) {
  return (
    <div className="min-h-screen bg-noite overflow-x-hidden">
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-14">
        <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-milho shadow-glow"><Music size={20} className="text-madeira"/></div><span className="text-lg font-black text-palha">Sanfona de Ouro</span></div>
        <div className="flex items-center gap-2"><button onClick={()=>sv("login")} className="rounded-full px-5 py-2 text-sm font-black text-palha/70 hover:text-milho transition">Entrar</button><button onClick={()=>sv("register")} className="rounded-full bg-milho px-5 py-2 text-sm font-black text-madeira hover:bg-ouro transition">Cadastrar</button></div>
      </nav>
      <section className="relative overflow-hidden px-6 pt-10 pb-16 md:px-14 md:pt-16">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-fogueira/15 blur-[140px] pointer-events-none"/>
        <div className="absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-folha/15 blur-[100px] pointer-events-none"/>
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-milho/30 bg-milho/10 px-4 py-2 text-sm font-black text-milho float"><Star size={14} className="fill-milho"/> Gincana Cultural do Forró Caju 2025</div>
          <h1 className="text-5xl font-black leading-[1.04] text-palha md:text-7xl">Aracaju virou<br/><span className="bg-gradient-to-r from-milho via-fogueira to-zabumba bg-clip-text text-transparent">um álbum vivo</span></h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg font-semibold leading-8 text-palha/65 md:text-xl">Explore, colecione figurinhas, conheça os patrimônios históricos e ganhe recompensas reais. A cultura sergipana nunca foi tão interativa.</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button onClick={()=>sv("register")} className="pulse-ring group flex items-center gap-2 rounded-full bg-milho px-8 py-4 text-lg font-black text-madeira shadow-glow hover:bg-ouro transition">Começar agora <ArrowRight size={18} className="group-hover:translate-x-1 transition"/></button>
            <button onClick={()=>sv("merchant-login")} className="flex items-center gap-2 rounded-full border border-palha/20 bg-white/5 px-8 py-4 text-lg font-black text-palha hover:bg-white/10 transition"><Building2 size={18}/> Área do Lojista</button>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[{v:"12+",l:"Artistas"},{v:"50+",l:"Pontos no mapa"},{v:"26",l:"Patrimônios"},{v:"4.8×",l:"ROI lojistas"}].map(s=>(<div key={s.l} className="rounded-2xl border border-white/10 bg-white/[.04] p-4 backdrop-blur"><p className="text-3xl font-black text-milho">{s.v}</p><p className="mt-1 text-xs font-semibold text-palha/50">{s.l}</p></div>))}
          </div>
        </div>
      </section>
      <section className="px-6 pb-12 md:px-14"><div className="mx-auto max-w-5xl"><div className="mb-5"><span className="text-xs font-black uppercase tracking-widest text-fogueira">📍 Explore a Cidade</span><h2 className="mt-1 text-3xl font-black text-palha md:text-4xl">Os Pontos da Gincana</h2></div><Carousel/><div className="mt-3 grid gap-2" style={{gridTemplateColumns:`repeat(${SLIDES.length},1fr)`}}>{SLIDES.map((sl,i)=>(<div key={i} className="relative overflow-hidden rounded-xl" style={{height:"58px"}}><img src={sl.fb} alt={sl.title} className="h-full w-full object-cover"/><div className="absolute inset-0 bg-noite/50"/><p className="absolute bottom-0 left-0 right-0 text-center text-[8px] font-black text-white/70 py-0.5 truncate px-1">{sl.emoji} {sl.title}</p></div>))}</div></div></section>
      <section className="px-6 py-10 md:px-14"><div className="mx-auto max-w-5xl"><h2 className="text-center text-3xl font-black text-palha md:text-4xl">O que você vai encontrar</h2><div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[{icon:QrCode,title:"QR Codes por Aracaju",desc:"Escaneie totens e desbloqueie figurinhas da cultura nordestina.",color:"#F8C23A"},{icon:Landmark,title:"Patrimônios Históricos",desc:"26 patrimônios materiais e imateriais de Sergipe com descrições ricas.",color:"#E85D2A"},{icon:MapPin,title:"Mapa Interativo",desc:"Mapa real de Aracaju com todos os pontos culturais da gincana.",color:"#287A45"},{icon:Gift,title:"Recompensas",desc:"Acumule pontos e troque por cupons e brindes nos comércios parceiros.",color:"#B63822"}].map((f,i)=>(<div key={i} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[.04] p-6 hover:border-white/20 transition cursor-default"><div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition" style={{background:`radial-gradient(circle at 30% 20%,${f.color}20,transparent 70%)`}}/><div className="relative flex h-12 w-12 items-center justify-center rounded-2xl mb-4" style={{backgroundColor:`${f.color}20`,color:f.color}}><f.icon size={22}/></div><h3 className="relative text-base font-black text-palha">{f.title}</h3><p className="relative mt-2 text-sm font-semibold leading-6 text-palha/55">{f.desc}</p></div>))}
      </div></div></section>
      <section className="px-6 py-8 md:px-14"><div className="mx-auto max-w-5xl"><div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-milho via-fogueira to-zabumba p-10 text-center shadow-glow"><div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,.12)_0%,transparent_60%)]"/><div className="relative"><p className="text-5xl mb-4">🪗</p><h2 className="text-3xl font-black text-madeira md:text-4xl">Pronto pra curtir o Forró Caju?</h2><p className="mt-3 font-semibold text-madeira/65 max-w-md mx-auto">Crie sua conta grátis e explore Sergipe de um jeito novo.</p><button onClick={()=>sv("register")} className="mt-8 inline-flex items-center gap-2 rounded-full bg-madeira px-10 py-4 text-lg font-black text-milho shadow-soft hover:bg-noite transition">Entrar na Gincana <ArrowRight size={18}/></button></div></div></div></section>
      <section className="px-6 pb-16 md:px-14"><div className="mx-auto max-w-5xl"><div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-madeira via-zabumba to-noite p-8 md:p-10"><div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-black text-palha mb-3"><Shield size={12}/> Área Restrita</div><h3 className="text-2xl font-black text-palha md:text-3xl">Painel Administrativo</h3><p className="mt-2 text-palha/55 font-semibold text-sm">Dashboard executivo com dados completos.</p></div><button onClick={()=>sv("admin-login")} className="flex w-fit items-center gap-2 rounded-full bg-milho px-6 py-3 font-black text-madeira hover:bg-ouro transition"><BarChart3 size={16}/> Acessar painel</button></div></div></div></section>
      <footer className="border-t border-white/10 px-6 py-8 text-center"><div className="flex items-center justify-center gap-2 mb-1"><Music size={15} className="text-milho"/><span className="font-black text-palha text-sm">Sanfona de Ouro</span></div><p className="text-xs text-palha/30">Gincana cultural — Aracaju, Sergipe 🪗</p></footer>
    </div>
  );
}

// ─── Auth Screens ──────────────────────────────────────────────────────────────
function LoginScreen({sv,onLogin}:{sv:(v:AppView)=>void;onLogin:(u:AuthUser)=>void}) {
  const [email,setEmail]=useState("");const [pass,setPass]=useState("");const [err,setErr]=useState("");
  function submit(e:React.FormEvent){e.preventDefault();setErr("");const users=readLS<FullUserRecord>(USERS_KEY);const found=users.find(u=>u.email===email&&u.password===pass);if(!found){setErr("Email ou senha inválidos.");return;}const user:AuthUser={name:found.name,email,type:"user"};saveAuth(user);onLogin(user);}
  return (<FormCard back={()=>sv("landing")} title="Entrar" sub="Continue sua jornada cultural." iconBg="bg-milho/20" icon={Music}>
    <button onClick={signInWithGoogle} className="w-full flex items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/10 py-3 font-black text-palha hover:bg-white/15 transition"><svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>Entrar com Google</button>
    <div className="flex items-center gap-3"><div className="flex-1 h-px bg-white/10"/><span className="text-xs font-semibold text-palha/30 uppercase">ou</span><div className="flex-1 h-px bg-white/10"/></div>
    <AuthInput label="Email" type="email" value={email} onChange={setEmail} placeholder="seu@email.com"/><AuthInput label="Senha" type="password" value={pass} onChange={setPass} placeholder="••••••••"/><ErrBox msg={err}/><button type="button" onClick={submit} className="w-full rounded-2xl bg-milho py-3 font-black text-madeira hover:bg-ouro transition">Entrar</button><p className="text-center text-sm font-semibold text-palha/45">Sem conta? <button onClick={()=>sv("register")} className="font-black text-milho hover:text-ouro">Cadastre-se</button></p></FormCard>);
}
function RegisterScreen({sv,onLogin}:{sv:(v:AppView)=>void;onLogin:(u:AuthUser)=>void}) {
  const [f,setF]=useState({name:"",email:"",pass:"",confirm:"",phone:"",city:"Aracaju",audience:"Turista de experiência"});
  const [err,setErr]=useState("");const [ok,setOk]=useState(false);
  async function submit(e:React.FormEvent){e.preventDefault();setErr("");if(!f.name||!f.email||!f.pass){setErr("Preencha nome, email e senha.");return;}if(f.pass.length<6){setErr("Senha mínima: 6 caracteres.");return;}if(f.pass!==f.confirm){setErr("Senhas não coincidem.");return;}const users=readLS<FullUserRecord>(USERS_KEY);if(users.find(u=>u.email===f.email)){setErr("Email já cadastrado.");return;}const record:FullUserRecord={name:f.name,email:f.email,password:f.pass,phone:f.phone,city:f.city,audience:f.audience,created_at:new Date().toISOString()};localStorage.setItem(USERS_KEY,JSON.stringify([record,...users]));await saveClient({name:f.name,email:f.email,phone:f.phone,city:f.city,audience:f.audience});const user:AuthUser={name:f.name,email:f.email,type:"user"};saveAuth(user);setOk(true);setTimeout(()=>onLogin(user),900);}
  if(ok) return <OkScreen title="Bem-vindo ao Forró!" sub="Carregando sua jornada cultural..."/>;
  return (<FormCard back={()=>sv("landing")} title="Criar conta" sub="Junte-se à gincana cultural." iconBg="bg-milho/20" icon={Users}>
    <button onClick={signInWithGoogle} className="w-full flex items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/10 py-3 font-black text-palha hover:bg-white/15 transition"><svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>Criar conta com Google</button>
    <div className="flex items-center gap-3"><div className="flex-1 h-px bg-white/10"/><span className="text-xs font-semibold text-palha/30 uppercase">ou</span><div className="flex-1 h-px bg-white/10"/></div>
    <AuthInput label="Nome completo" value={f.name} onChange={v=>setF({...f,name:v})} placeholder="Seu nome"/><AuthInput label="Email" type="email" value={f.email} onChange={v=>setF({...f,email:v})} placeholder="seu@email.com"/><div className="grid grid-cols-2 gap-3"><AuthInput label="Senha" type="password" value={f.pass} onChange={v=>setF({...f,pass:v})} placeholder="••••••••"/><AuthInput label="Confirmar" type="password" value={f.confirm} onChange={v=>setF({...f,confirm:v})} placeholder="••••••••"/></div><AuthInput label="WhatsApp" value={f.phone} onChange={v=>setF({...f,phone:v})} placeholder="(79) 99999-9999"/><label className="block"><span className="text-[11px] font-black uppercase tracking-widest text-palha/40">Perfil</span><select value={f.audience} onChange={e=>setF({...f,audience:e.target.value})} className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-palha outline-none"><option>Turista de experiência</option><option>Jovem aracajuano</option><option>Família</option><option>Idoso</option></select></label><ErrBox msg={err}/><button type="button" onClick={submit} className="w-full rounded-2xl bg-milho py-3 font-black text-madeira hover:bg-ouro transition">Criar conta</button><p className="text-center text-sm font-semibold text-palha/45">Já tem conta? <button onClick={()=>sv("login")} className="font-black text-milho">Entrar</button></p></FormCard>);
}
function MerchantLogin({sv,onLogin}:{sv:(v:AppView)=>void;onLogin:(u:AuthUser)=>void}) {
  const [email,setEmail]=useState("");const [pass,setPass]=useState("");const [err,setErr]=useState("");
  function submit(e:React.FormEvent){e.preventDefault();setErr("");const ms=readLS<FullMerchantRecord>(MERCHANTS_KEY);const found=ms.find(m=>m.email===email&&m.password===pass);if(!found){setErr("Email ou senha inválidos.");return;}const user:AuthUser={name:found.business_name,email,type:"merchant",merchantData:found.merchantData};saveAuth(user);onLogin(user);}
  return (<FormCard back={()=>sv("landing")} title="Área do Lojista" sub="Acesse seu painel de parceiro." iconBg="bg-folha/20" icon={Building2}><AuthInput label="Email" type="email" value={email} onChange={setEmail} placeholder="comercio@email.com"/><AuthInput label="Senha" type="password" value={pass} onChange={setPass} placeholder="••••••••"/><ErrBox msg={err}/><button type="button" onClick={submit} className="w-full rounded-2xl bg-folha py-3 font-black text-white hover:bg-[#1f6337] transition">Entrar</button><p className="text-center text-sm font-semibold text-palha/45">Novo parceiro? <button onClick={()=>sv("merchant-register")} className="font-black text-folha">Cadastre seu comércio</button></p></FormCard>);
}
function MerchantRegister({sv,onLogin}:{sv:(v:AppView)=>void;onLogin:(u:AuthUser)=>void}) {
  const [f,setF]=useState({bn:"",owner:"",email:"",pass:"",confirm:"",phone:"",cat:"Comida típica",loc:"Forró Caju",reward:"Cupom de boas-vindas"});
  const [err,setErr]=useState("");const [ok,setOk]=useState(false);
  async function submit(e:React.FormEvent){e.preventDefault();setErr("");if(!f.bn||!f.email||!f.pass){setErr("Preencha os campos obrigatórios.");return;}if(f.pass.length<6){setErr("Senha mínima: 6 caracteres.");return;}if(f.pass!==f.confirm){setErr("Senhas não coincidem.");return;}const ms=readLS<{email:string}>(MERCHANTS_KEY);if(ms.find(m=>m.email===f.email)){setErr("Email já cadastrado.");return;}const md:MerchantRegistration={business_name:f.bn,owner_name:f.owner,category:f.cat,phone:f.phone,location:f.loc,reward:f.reward};await saveMerchant(md);const record:FullMerchantRecord={email:f.email,password:f.pass,business_name:f.bn,owner_name:f.owner,phone:f.phone,category:f.cat,location:f.loc,reward:f.reward,merchantData:md,created_at:new Date().toISOString()};localStorage.setItem(MERCHANTS_KEY,JSON.stringify([record,...readLS(MERCHANTS_KEY)]));const user:AuthUser={name:f.bn,email:f.email,type:"merchant",merchantData:md};saveAuth(user);setOk(true);setTimeout(()=>onLogin(user),900);}
  if(ok) return <OkScreen title="Comércio cadastrado!" sub="Acessando seu painel..."/>;
  return (<FormCard back={()=>sv("merchant-login")} title="Cadastrar comércio" sub="Torne-se um ponto de resgate." iconBg="bg-folha/20" icon={Building2}><AuthInput label="Nome do comércio *" value={f.bn} onChange={v=>setF({...f,bn:v})} placeholder="Ex: Barraca Dona Nena"/><AuthInput label="Responsável" value={f.owner} onChange={v=>setF({...f,owner:v})} placeholder="Seu nome"/><AuthInput label="Email *" type="email" value={f.email} onChange={v=>setF({...f,email:v})} placeholder="comercio@email.com"/><div className="grid grid-cols-2 gap-3"><AuthInput label="Senha *" type="password" value={f.pass} onChange={v=>setF({...f,pass:v})} placeholder="••••••••"/><AuthInput label="Confirmar" type="password" value={f.confirm} onChange={v=>setF({...f,confirm:v})} placeholder="••••••••"/></div><AuthInput label="WhatsApp" value={f.phone} onChange={v=>setF({...f,phone:v})} placeholder="(79) 99999-9999"/><AuthInput label="Localização / Barraca" value={f.loc} onChange={v=>setF({...f,loc:v})} placeholder="Ex: Barraca 47"/><label className="block"><span className="text-[11px] font-black uppercase tracking-widest text-palha/40">Categoria</span><select value={f.cat} onChange={e=>setF({...f,cat:e.target.value})} className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-palha outline-none"><option>Comida típica</option><option>Artesanato</option><option>Bebidas</option><option>Transporte turístico</option><option>Experiência cultural</option></select></label><AuthInput label="Recompensa ofertada" value={f.reward} onChange={v=>setF({...f,reward:v})} placeholder="Ex: 10% no caranguejo"/><ErrBox msg={err}/><button type="button" onClick={submit} className="w-full rounded-2xl bg-folha py-3 font-black text-white hover:bg-[#1f6337] transition">Cadastrar comércio</button></FormCard>);
}
function AdminLogin({sv,onLogin}:{sv:(v:AppView)=>void;onLogin:(u:AuthUser)=>void}) {
  const [pass,setPass]=useState("");const [err,setErr]=useState("");
  function submit(e:React.FormEvent){e.preventDefault();if(pass!=="admin2025"){setErr("Senha incorreta. (dica: admin2025)");return;}const user:AuthUser={name:"Administrador",email:"admin@sanfona.com.br",type:"admin"};saveAuth(user);onLogin(user);}
  return (<FormCard back={()=>sv("landing")} title="Painel Admin" sub="Acesso restrito." iconBg="bg-fogueira/20" icon={Shield}><AuthInput label="Senha de acesso" type="password" value={pass} onChange={setPass} placeholder="••••••••"/><ErrBox msg={err}/><button type="button" onClick={submit} className="w-full rounded-2xl bg-gradient-to-r from-fogueira to-zabumba py-3 font-black text-white hover:opacity-90 transition">Acessar dashboard</button></FormCard>);
}

// ─── MERCHANT APP ──────────────────────────────────────────────────────────────
function MerchantApp({user,onLogout}:{user:AuthUser;onLogout:()=>void}) {
  const m=user.merchantData;
  const [codes,setCodes]=useState<string[]>([]);
  const [validations,setValidations]=useState<CouponValidation[]>([]);
  const [copied,setCopied]=useState<string|null>(null);
  const [toast,setToast]=useState<{msg:string;type:"success"|"info"|"error"}|null>(null);
  useEffect(()=>{loadValidations().then(vs=>setValidations(vs.filter(v=>v.merchant_name===user.name)));},[user.name]);
  function gerarCodigo(){const code=generateCouponCode(user.name);setCodes(prev=>[code,...prev]);setToast({msg:"Código gerado com sucesso!",type:"success"});}
  function copiar(code:string){navigator.clipboard.writeText(code).catch(()=>{});setCopied(code);setTimeout(()=>setCopied(null),2000);}
  function MiniQR({code}:{code:string}){const size=14;const cells=Array.from({length:size*size},(_,i)=>{const c=code.charCodeAt(i%code.length);return(i+c+Math.floor(i/size))%3===0;});return(<div className="grid border-4 border-palha bg-palha rounded-lg overflow-hidden flex-shrink-0" style={{gridTemplateColumns:`repeat(${size},1fr)`,width:112,height:112}}>{cells.map((b,i)=><div key={i} className={b?"bg-noite":"bg-palha"} style={{width:"100%",height:"100%"}}/>)}</div>);}
  const mapUrl=`https://www.openstreetmap.org/export/embed.html?bbox=-37.1331,-10.9772,-37.0131,-10.9172&layer=mapnik`;
  return (
    <div className="min-h-screen bg-noite">
      {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
      <header className="border-b border-white/10 px-6 py-4 sticky top-0 z-40 bg-noite/95 backdrop-blur"><div className="mx-auto max-w-4xl flex items-center justify-between"><div className="flex items-center gap-3"><div className="h-11 w-11 flex items-center justify-center rounded-full bg-folha/20 text-2xl">🏪</div><div><p className="text-[10px] font-black uppercase tracking-widest text-folha">Painel do Lojista</p><p className="font-black text-palha text-sm">{user.name}</p></div></div><button onClick={onLogout} className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs font-black text-palha/50 hover:text-palha transition"><LogOut size={13}/> Sair</button></div></header>
      <main className="mx-auto max-w-4xl px-6 py-8 space-y-5">
        <div className="rounded-[2rem] bg-gradient-to-br from-folha via-[#1a5c32] to-noite p-6 text-palha shadow-soft"><div className="flex items-start justify-between"><div><div className="flex items-center gap-2 mb-3"><CheckCircle size={15} className="text-milho"/><span className="text-[10px] font-black uppercase tracking-widest text-milho">Comércio ativo</span></div><h2 className="text-3xl font-black">{m?.business_name||user.name}</h2><p className="mt-1 text-sm font-semibold text-palha/55">{m?.category} • {m?.location}</p></div><div className="text-5xl">🏆</div></div><div className="mt-4 rounded-2xl bg-white/10 px-4 py-3"><p className="text-[10px] font-black uppercase text-palha/40 mb-1">Recompensa ofertada</p><p className="font-black text-milho text-lg">🎁 {m?.reward||"Cupom de boas-vindas"}</p></div></div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{[{icon:Users,l:"Visitantes",v:"42",c:"text-milho"},{icon:Ticket,l:"Validações",v:`${validations.length}`,c:"text-fogueira"},{icon:TrendingUp,l:"Conversão",v:"43%",c:"text-folha"},{icon:Star,l:"Avaliação",v:"4.8★",c:"text-ouro"}].map(({icon:I,l,v,c})=>(<div key={l} className="rounded-2xl border border-white/10 bg-white/5 p-4"><I size={17} className={c}/><p className={`mt-2 text-2xl font-black ${c}`}>{v}</p><p className="text-xs font-semibold text-palha/40">{l}</p></div>))}</div>
        <div><div className="flex items-center gap-2 mb-3"><MapPin size={16} className="text-folha"/><h3 className="text-lg font-black text-palha">Localização no Mapa</h3></div><div className="relative overflow-hidden rounded-[2rem] border border-folha/20" style={{height:"240px"}}><iframe src={mapUrl} className="w-full h-full" title="Mapa" style={{border:"none",filter:"hue-rotate(180deg) invert(0.85) sepia(0.3) saturate(1.5)"}} loading="lazy"/><div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="flex flex-col items-center"><div className="w-12 h-12 flex items-center justify-center rounded-full bg-folha border-4 border-white shadow-xl text-2xl">🏪</div><div className="mt-2 rounded-full bg-noite/90 backdrop-blur border border-folha/40 px-3 py-1 text-xs font-black text-folha">{m?.business_name||"Seu Comércio"}</div></div></div><div className="absolute bottom-2 left-2 rounded-full bg-noite/70 backdrop-blur px-2 py-0.5 text-[9px] text-palha/40">© OpenStreetMap</div></div></div>
        <div className="rounded-[2rem] border border-milho/25 bg-milho/8 p-6"><div className="flex items-center gap-3 mb-5"><div className="h-10 w-10 flex items-center justify-center rounded-full bg-milho/20"><QrCode size={20} className="text-milho"/></div><div><h3 className="text-xl font-black text-palha">Gerar Código de Cupom</h3><p className="text-xs font-semibold text-palha/45">Cliente digita no Scanner do app para validar</p></div></div>
          <button onClick={gerarCodigo} className="pulse-ring flex items-center gap-2 rounded-2xl bg-milho px-6 py-3 font-black text-madeira hover:bg-ouro transition"><QrCode size={16}/> Gerar Novo Código</button>
          {codes.length>0&&(<div className="mt-5 space-y-3">{codes.map((code,i)=>(<div key={code} className={cx("rounded-2xl border p-4 flex flex-col sm:flex-row items-center gap-4",i===0?"border-milho/40 bg-milho/10":"border-white/10 bg-white/5")}><MiniQR code={code}/><div className="flex-1 text-center sm:text-left">{i===0&&<span className="inline-flex rounded-full bg-folha/20 px-2 py-0.5 text-[10px] font-black uppercase text-folha mb-2">✨ Mais recente</span>}<p className="text-2xl font-black text-palha font-mono tracking-widest">{code}</p><p className="mt-1 text-xs font-semibold text-palha/40">Válido por 24h • {m?.reward}</p></div><button onClick={()=>copiar(code)} className={cx("flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition flex-shrink-0",copied===code?"bg-folha text-white":"bg-white/10 text-palha hover:bg-white/15")}>{copied===code?<><CheckSquare size={14}/> Copiado!</>:<><Copy size={14}/> Copiar</>}</button></div>))}</div>)}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5"><div className="flex items-center gap-2 mb-4"><ClipboardList size={16} className="text-fogueira"/><h3 className="font-black text-palha">Validações Recebidas</h3><button onClick={()=>loadValidations().then(vs=>setValidations(vs.filter(v=>v.merchant_name===user.name)))} className="ml-auto text-palha/30 hover:text-palha transition"><RefreshCw size={14}/></button></div>{validations.length===0?(<p className="text-sm font-semibold text-palha/30 text-center py-6">Nenhum cupom validado ainda. Gere um código acima! 👆</p>):(<div className="space-y-2">{validations.map((v,i)=>(<div key={i} className="flex items-center gap-3 rounded-xl bg-white/5 p-3"><CheckCircle size={16} className="text-folha flex-shrink-0"/><div className="flex-1 min-w-0"><p className="text-sm font-black text-palha font-mono">{v.code}</p><p className="text-xs font-semibold text-palha/40">{v.client_email}</p></div><span className="text-xs font-black text-folha bg-folha/15 rounded-full px-2 py-0.5">✓ Validado</span></div>))}</div>)}</div>
      </main>
    </div>
  );
}

// ─── USER APP TABS ─────────────────────────────────────────────────────────────
function UserTopbar({user,onLogout,onAvatarClick,notifs}:{user:AuthUser;onLogout:()=>void;onAvatarClick:()=>void;notifs:number}) {
  const [muted,setMuted]=useState(false);
  return (<header className="relative overflow-hidden px-5 py-4 shadow-soft sticky top-0 z-40"><div className="absolute inset-0 bg-[linear-gradient(120deg,#7A2E17,#241512_48%,#123e27)]"/><div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-milho via-fogueira to-folha"/><div className="relative mx-auto flex max-w-2xl items-center justify-between"><div className="flex items-center gap-3"><Avatar name={user.name} email={user.email} size={40} onClick={onAvatarClick}/><div><p className="text-[10px] font-black uppercase tracking-widest text-milho">Sanfona de Ouro</p><p className="text-sm font-bold text-palha/65">Olá, {user.name.split(" ")[0]}! 🪗</p></div></div><div className="flex items-center gap-2">{notifs>0&&<div className="relative"><Bell size={19} className="text-palha/50"/><span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-fogueira text-[9px] font-black text-white">{notifs}</span></div>}<button onClick={()=>setMuted(!muted)} className="text-palha/40 hover:text-palha transition">{muted?<VolumeX size={17}/>:<Volume2 size={17}/>}</button><button onClick={onLogout} className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-2 text-xs font-black text-palha/50 hover:text-palha transition"><LogOut size={13}/> Sair</button></div></div></header>);
}

function BottomTabs({active,set}:{active:UserTab;set:(t:UserTab)=>void}) {
  const tabs:[UserTab,string,React.ElementType,string?][]=[["home","Início",Home],["album","Álbum",Album],["scanner","Scanner",ScanLine],["mapa","Mapa",MapPin],["cultura","Cultura",Landmark],["rewards","Cupons",Ticket]];
  return (<nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-noite/95 px-2 py-2 backdrop-blur"><div className="mx-auto grid max-w-lg gap-0.5" style={{gridTemplateColumns:`repeat(${tabs.length},1fr)`}}>{tabs.map(([id,label,Icon])=>(<button key={id} onClick={()=>set(id)} className={cx("flex flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[9px] font-black transition",active===id?"bg-milho text-madeira shadow-glow":"text-palha/45 hover:text-palha hover:bg-white/5")}><Icon size={17}/>{label}</button>))}</div></nav>);
}

// HOME TAB
function HomeTab({p,set,user,onAvatarClick}:{p:LocalProgress;set:(t:UserTab)=>void;user:AuthUser;onAvatarClick:()=>void}) {
  const level=Math.floor(p.score/200)+1;
  const levelPct=((p.score%200)/200)*100;
  const unlocked=ACHIEVEMENTS.filter(a=>a.cond(p));
  return (<div className="space-y-4">
    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-madeira via-zabumba to-noite p-6 text-palha shadow-soft">
      <div className="absolute top-0 right-0 h-44 w-44 rounded-bl-[3rem] bg-milho/10"/><div className="absolute bottom-0 left-0 h-28 w-28 rounded-tr-[3rem] bg-folha/10"/>
      <div className="relative flex items-start gap-4"><Avatar name={user.name} email={user.email} size={64} onClick={onAvatarClick}/><div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1"><p className="font-black text-palha truncate">{user.name}</p><span className="flex-shrink-0 inline-flex items-center gap-1 rounded-full bg-milho/20 border border-milho/30 px-2 py-0.5 text-[10px] font-black text-milho"><Crown size={9}/> Nível {level}</span></div><p className="text-xs font-semibold text-palha/45 mb-3">{p.score} pontos • {p.unlockedStickerIds.length} figurinhas</p><div className="h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-gradient-to-r from-milho to-fogueira" style={{width:`${levelPct}%`}}/></div><p className="mt-1 text-[10px] text-palha/30">{Math.max(0,200-(p.score%200))}pts para nível {level+1}</p></div></div>
      <div className="relative mt-5 flex flex-wrap gap-2"><button onClick={()=>set("scanner")} className="flex items-center gap-2 rounded-2xl bg-milho px-4 py-2.5 text-sm font-black text-madeira hover:bg-ouro transition"><ScanLine size={14}/> Escanear</button><button onClick={()=>set("mapa")} className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-black hover:bg-white/15 transition"><MapPin size={14}/> Mapa</button><button onClick={()=>set("cultura")} className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-black hover:bg-white/15 transition"><Landmark size={14}/> Patrimônios</button></div>
    </div>

    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[{icon:Album,l:"Figurinhas",v:`${p.unlockedStickerIds.length}/${stickers.length}`,c:"text-fogueira"},{icon:MapPin,l:"QR Codes",v:`${p.pointsVisited}`,c:"text-folha"},{icon:Zap,l:"Score",v:`${p.score}`,c:"text-milho"},{icon:Crown,l:"Nível",v:`${level}`,c:"text-ouro"}].map(({icon:I,l,v,c})=>(<div key={l} className="rounded-2xl border border-white/10 bg-white/5 p-4"><I className={c} size={19}/><p className={`mt-2 text-xl font-black ${c}`}>{v}</p><p className="text-xs font-bold text-palha/45">{l}</p></div>))}</div>
    <div className="rounded-2xl border border-white/10 bg-white/[.04] p-5"><div className="flex items-center gap-2 mb-4"><Trophy size={16} className="text-milho"/><h3 className="font-black text-palha">Conquistas</h3><span className="ml-auto text-xs font-black text-milho">{unlocked.length}/{ACHIEVEMENTS.length}</span></div><div className="grid grid-cols-3 gap-2">{ACHIEVEMENTS.map(a=>{const done=a.cond(p);return(<div key={a.id} className={cx("rounded-2xl p-3 flex flex-col items-center gap-2 text-center transition",done?"border border-milho/30 bg-milho/10":"border border-white/5 bg-white/[.02] opacity-50")}><span className="text-2xl">{done?a.icon:"🔒"}</span><div><p className="text-[10px] font-black text-palha leading-tight">{a.title}</p>{done&&<span className="text-[9px] font-black text-milho">+{a.pts}pts</span>}</div></div>);})}</div></div>
    <div className="rounded-2xl border border-white/10 bg-white/[.04] p-5"><div className="flex items-center gap-2 mb-4"><BarChart3 size={16} className="text-fogueira"/><h3 className="font-black text-palha">Ranking Cultural</h3></div><div className="space-y-2">{[...ranking,{id:"voce",name:`${user.name.split(" ")[0]} (você)`,score:p.score,badge:"Explorador do Forró" as const,medal:""}].sort((a,b)=>b.score-a.score).slice(0,4).map((e,i)=>(<div key={e.id} className={cx("flex items-center gap-3 rounded-xl p-3",e.id==="voce"?"bg-milho/10 border border-milho/30":"bg-white/5")}><span className="text-base w-6 text-center">{["🥇","🥈","🥉","4️⃣"][i]||`${i+1}`}</span><p className="flex-1 text-sm font-black text-palha truncate">{e.name}</p><p className="text-sm font-black text-milho">{e.score}pts</p></div>))}</div></div>
  </div>);
}

// ALBUM TAB — Estilo Álbum
function AlbumTab({p,refresh}:{p:LocalProgress;refresh:()=>void}) {
  const [sel,setSel]=useState<Sticker|null>(null);
  const [showQr,setShowQr]=useState(false);
  const dups=p.duplicateStickerIds.map(id=>stickers.find(s=>s.id===id)).filter(Boolean) as Sticker[];
  const EMOJIS:Record<string,string>={  "luiz-gonzaga":"🎸","gonzaguinha":"🎵","clemilda":"🎤","gerson-filho":"🪗","forro-caju":"🎪","mercado-municipal":"🏛️","rua-sao-joao":"🎉","orla-atalaia":"🌊","quadrilhas-juninas":"💃","forro-pe-de-serra":"🎶"};
  return (<div className="space-y-5">
    {/* Header do álbum */}
    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-madeira via-zabumba to-noite p-6 text-palha shadow-soft">
      <div className="absolute top-0 right-0 h-32 w-32 rounded-bl-[3rem] bg-milho/10"/>
      <div className="relative">
        <div className="inline-flex items-center gap-2 rounded-full border border-milho/30 bg-milho/15 px-3 py-1.5 text-xs font-black text-milho mb-3">🎴 Álbum de Figurinhas</div>
        <h2 className="text-3xl font-black tracking-tight">Álbum Sanfona de Ouro</h2>
        <p className="mt-1 text-sm font-semibold text-palha/50">{p.unlockedStickerIds.length} de {stickers.length} figurinhas coletadas</p>
      </div>
    </div>
    {/* Grid de figurinhas */}
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
      {stickers.map(sticker=>{
        const ul=p.unlockedStickerIds.includes(sticker.id);const gold=sticker.rarity==="brilhante";const rare=sticker.rarity==="rara";
        return (<button key={sticker.id} onClick={()=>setSel(sticker)} className={cx("relative group overflow-hidden rounded-[1.5rem] text-left transition duration-300",ul?"hover:-translate-y-2 hover:shadow-2xl":"opacity-50 hover:opacity-70",ul&&gold?"shadow-glow":"")} style={{minHeight:200,background:ul?`linear-gradient(145deg,${sticker.palette[0]},${sticker.palette[1]},${sticker.palette[2]||sticker.palette[0]})`:"rgba(255,255,255,.04)",border:ul?`2px solid ${sticker.palette[0]}60`:"2px dashed rgba(255,255,255,.1)"}}>
          {ul&&gold&&<div className="absolute inset-0 gold-shine"/>}
          {ul&&<div className="absolute top-0 left-0 right-0 h-1 rounded-t-[1.4rem]" style={{backgroundColor:gold?"#F8C23A":rare?"#E85D2A":"#287A45"}}/>}
          <div className="relative z-10 p-4 flex flex-col" style={{minHeight:200}}>
            {ul?(<><div className="flex-1 flex items-center justify-center"><div className={cx("flex items-center justify-center rounded-full border-4",gold?"border-milho/50 bg-milho/20":rare?"border-fogueira/50 bg-fogueira/20":"border-white/30 bg-white/15")} style={{width:72,height:72,fontSize:36}}>{EMOJIS[sticker.id]||"🎵"}</div></div><div className="mt-3"><span className="inline-flex items-center gap-1 rounded-full bg-noite/30 backdrop-blur px-2 py-0.5 text-[9px] font-black uppercase text-white/80 mb-1">{gold?"✨ Brilhante":rare?"⭐ Rara":"• Comum"}</span><p className="text-base font-black text-white leading-tight">{sticker.name}</p><p className="text-[10px] font-semibold text-white/60 mt-0.5">{sticker.category}</p></div></>):(<div className="flex h-full flex-col items-center justify-center gap-3 text-center" style={{minHeight:200}}><div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5 border-2 border-dashed border-white/15"><Lock size={22} className="text-palha/30"/></div><div><p className="text-sm font-black text-palha/50">{sticker.name}</p><p className="text-[10px] text-palha/25">{sticker.category}</p></div></div>)}
          </div>
        </button>);
      })}
    </div>
    {/* Troca de figurinhas */}
    <div className="rounded-[2rem] bg-gradient-to-br from-folha to-noite p-6 text-palha"><h3 className="text-xl font-black">🔄 Troca de Figurinhas</h3><div className="mt-3 flex flex-wrap gap-2">{dups.length?dups.map((d,i)=><span key={`${d.id}-${i}`} className="rounded-full bg-white/15 px-3 py-1 text-sm font-black">{d.name}</span>):<span className="text-sm text-palha/35 font-semibold">Nenhuma repetida ainda.</span>}</div><button onClick={()=>setShowQr(!showQr)} className="mt-4 rounded-2xl bg-milho px-4 py-2.5 text-sm font-black text-madeira">{showQr?"Fechar":"Gerar QR de troca"}</button>{showQr&&(<div className="mt-4 rounded-2xl bg-noite/50 p-4 flex flex-col md:flex-row gap-4 items-center"><div className="grid h-36 w-36 grid-cols-8 border-4 border-palha/25 bg-palha/8 flex-shrink-0">{Array.from({length:64}).map((_,i)=><span key={i} className={i%3===0||i%7===0?"bg-palha":"bg-transparent"}/>)}</div><div><p className="text-sm font-semibold text-palha/65 leading-6">Outro participante escaneia para trocar.</p><button onClick={()=>{simulateTrade();refresh();setShowQr(false);}} className="mt-3 rounded-xl bg-fogueira px-4 py-2 text-sm font-black text-white">Simular recebimento</button></div></div>)}</div>
    {/* Modal de detalhes */}
    {sel&&(<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-noite/85 backdrop-blur-md p-4" onClick={()=>setSel(null)}><div className="w-full max-w-sm rounded-[2rem] bg-noite border border-white/15 p-6 fade-up" onClick={e=>e.stopPropagation()}><div className="flex items-center gap-3 mb-4"><div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 text-4xl" style={{backgroundColor:`${sel.palette[0]}30`,borderColor:`${sel.palette[0]}60`}}>{EMOJIS[sel.id]||"🎵"}</div><div><h2 className="text-2xl font-black text-palha">{sel.name}</h2><div className="flex items-center gap-2 mt-1"><span className="text-xs font-black uppercase text-fogueira">{sel.rarity}</span><span className="text-palha/30">•</span><span className="text-xs font-semibold text-palha/50">{sel.category}</span></div></div></div><p className="text-sm font-semibold leading-7 text-palha/65">{sel.story}</p><div className="mt-4 rounded-xl bg-white/5 px-4 py-3"><p className="text-[10px] font-black uppercase text-palha/30">Status</p><p className={cx("text-sm font-black mt-0.5",p.unlockedStickerIds.includes(sel.id)?"text-folha":"text-fogueira")}>{p.unlockedStickerIds.includes(sel.id)?"✅ Coletada":"🔒 Não coletada"}</p></div><button onClick={()=>setSel(null)} className="mt-5 w-full rounded-2xl bg-white/10 py-3 font-black text-palha hover:bg-white/15 transition">Fechar</button></div></div>)}
  </div>);
}

// SCANNER TAB
function ScannerTab({refresh,user,onOpenPack}:{refresh:()=>void;user:AuthUser;onOpenPack:()=>void}) {
  const [code,setCode]=useState("");const [validating,setValidating]=useState(false);const [validResult,setValidResult]=useState<{ok:boolean;msg:string;reward?:string}|null>(null);
  async function validarCodigo(){if(!code.trim()){setValidResult({ok:false,msg:"Digite o código do lojista."});return;}setValidating(true);setValidResult(null);const allM=loadAllMerchants();const parts=code.toUpperCase().trim().split("-");if(parts.length!==2||parts[0].length<2||parts[1].length<2){setValidating(false);setValidResult({ok:false,msg:"Código inválido. Peça um novo ao lojista."});return;}const prefix=parts[0];const merchant=allM.find(m=>m.business_name.replace(/\s+/g,"").toUpperCase().startsWith(prefix));if(!merchant){setValidating(false);setValidResult({ok:false,msg:"Código não reconhecido."});return;}await saveValidation({code:code.toUpperCase().trim(),merchant_name:merchant.business_name,client_email:user.email,reward:merchant.reward||"Recompensa"});setValidating(false);setValidResult({ok:true,msg:"Cupom validado! 🎉",reward:merchant.reward||"Recompensa"});setCode("");}
  return (<div className="space-y-5">
    <h2 className="text-3xl font-black text-palha">Pacote de Figurinhas</h2>
    <div className="relative min-h-[320px] overflow-hidden rounded-[2rem] border border-milho/20 bg-noite/60 p-8 flex flex-col items-center justify-center text-center backdrop-blur shadow-soft"><div className="pointer-events-none absolute inset-8 rounded-[1.5rem] border border-milho/15"/><div className="pointer-events-none scan-line"/><div className="gold-shine flex h-28 w-28 items-center justify-center rounded-[1.5rem] border-4 border-palha/20 bg-gradient-to-br from-[#fff3a0] via-ouro to-[#b87913] text-madeira mb-5"><Gift size={48}/></div><h3 className="text-xl font-black text-palha">Abra seu Pacote</h3><p className="mt-2 text-sm font-semibold text-palha/45 max-w-xs">Cada pacote contém 3 figurinhas aleatórias do Álbum Sanfona de Ouro</p><button onClick={onOpenPack} className="mt-5 rounded-2xl bg-milho px-8 py-3.5 font-black text-madeira hover:bg-ouro transition">🎁 Abrir Pacote</button></div>
    <div className="rounded-[2rem] border border-folha/30 bg-folha/8 p-6"><div className="flex items-center gap-3 mb-5"><div className="h-10 w-10 flex items-center justify-center rounded-full bg-folha/20"><Ticket size={20} className="text-folha"/></div><div><h3 className="text-xl font-black text-palha">Validar Código do Lojista</h3><p className="text-xs font-semibold text-palha/45">Digite o código recebido do lojista</p></div></div><div className="flex gap-2"><input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="Ex: BARR-A7K2X" onKeyDown={e=>e.key==="Enter"&&validarCodigo()} className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-black text-palha placeholder:text-palha/25 outline-none focus:border-folha/40 font-mono tracking-widest text-lg"/><button onClick={validarCodigo} disabled={validating} className="rounded-2xl bg-folha px-5 py-3 font-black text-white hover:bg-[#1f6337] disabled:opacity-50 transition flex items-center gap-2">{validating?<RefreshCw size={16} className="animate-spin"/>:<Search size={16}/>} Validar</button></div>{validResult&&(<div className={cx("mt-4 rounded-2xl border p-4",validResult.ok?"border-folha/40 bg-folha/15":"border-fogueira/40 bg-fogueira/15")}><div className="flex items-center gap-2">{validResult.ok?<CheckCircle size={20} className="text-folha"/>:<Shield size={20} className="text-fogueira"/>}<p className={cx("font-black",validResult.ok?"text-folha":"text-fogueira")}>{validResult.msg}</p></div>{validResult.ok&&validResult.reward&&(<div className="mt-3 rounded-xl bg-white/10 px-4 py-3"><p className="text-[10px] font-black uppercase text-palha/40 mb-1">Sua recompensa</p><p className="font-black text-milho text-lg">🎁 {validResult.reward}</p><p className="mt-1 text-xs text-palha/40">Apresente esta tela ao lojista.</p></div>)}</div>)}</div>
  </div>);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function haversineKm(lat1:number,lng1:number,lat2:number,lng2:number):number {
  const R=6371;const dLat=(lat2-lat1)*Math.PI/180;const dLng=(lng2-lng1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
function mkIcon(emoji:string,cor:string,sel:boolean,nea:boolean):L.DivIcon{
  const selClr=sel||nea?'#F8C23A':'rgba(255,255,255,.95)';
  return L.divIcon({className:'',html:`<div style="width:34px;height:34px;border-radius:50%;background:${cor};border:2.5px solid ${selClr};box-shadow:${nea?'0 0 18px 4px rgba(40,122,69,.7)':sel?'0 0 12px 3px rgba(248,194,58,.6)':'0 2px 10px rgba(0,0,0,.5)'};display:flex;align-items:center;justify-content:center;font-size:17px;cursor:pointer">${emoji}</div>`,iconSize:[34,34],iconAnchor:[17,17],popupAnchor:[0,-20]});
}
function getNearestPoint(lat:number,lng:number):MapaPonto&{dist:number}{
  return MAP_POINTS.map(p=>({...p,dist:haversineKm(lat,lng,p.lat,p.lng)})).sort((a,b)=>a.dist-b.dist)[0] as MapaPonto&{dist:number};
}

// MAPA TAB
function MapaTab() {
  const [sel,setSel]=useState<string|null>(null);
  const [userLoc,setUserLoc]=useState<{lat:number;lng:number}|null>(null);
  const [locErr,setLocErr]=useState<string|null>(null);
  const [locating,setLocating]=useState(false);
  const [zoomState,setZoomState]=useState<"se"|"aju">("se");
  const selPt=MAP_POINTS.find(p=>p.id===sel);
  const mapRef=useRef<HTMLDivElement>(null);
  const mapInst=useRef<L.Map|null>(null);
  const markers=useRef<Map<string,L.Marker>>(new Map);
  const userMrk=useRef<L.CircleMarker|null>(null);

  const pts=useMemo(()=>{
    if(!userLoc) return MAP_POINTS.map(p=>({...p,dist:null}));
    return [...MAP_POINTS].map(p=>({...p,dist:haversineKm(userLoc.lat,userLoc.lng,p.lat,p.lng)})).sort((a,b)=>(a.dist??Infinity)-(b.dist??Infinity));
  },[userLoc]);
  const nearestId=userLoc?pts[0]?.id:null;

  function locateMe(){
    if(!navigator.geolocation){setLocErr("Geolocalização não suportada");return;}
    setLocating(true);setLocErr(null);
    navigator.geolocation.getCurrentPosition(
      p=>{setUserLoc({lat:p.coords.latitude,lng:p.coords.longitude});setLocating(false);mapInst.current?.flyTo([p.coords.latitude,p.coords.longitude],15);},
      ()=>{setLocErr("Não foi possível obter sua localização");setLocating(false);},
      {enableHighAccuracy:true,timeout:10000}
    );
  }
  function goAju(){mapInst.current?.setView([-10.93,-37.05],12);setZoomState("aju");}
  function goSe(){mapInst.current?.setView([-10.5,-37.1],8);setZoomState("se");setSel(null);}

  // Init map once
  useEffect(()=>{
    if(!mapRef.current||mapInst.current)return;
    const m=L.map(mapRef.current,{zoomControl:false,attributionControl:false}).setView([-10.5,-37.1],8);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{maxZoom:19,subdomains:'abcd'}).addTo(m);
    L.control.zoom({position:'bottomright'}).addTo(m);
    // Create markers
    MAP_POINTS.forEach(pt=>{
      const mk=L.marker([pt.lat,pt.lng],{icon:mkIcon(pt.emoji,pt.cor,false,false)}).addTo(m);
      mk.bindPopup(`<div style="font-family:Sora,sans-serif;text-align:center;min-width:120px"><div style="font-size:28px">${pt.emoji}</div><b style="font-size:13px">${pt.name}</b><br/><span style="color:#888;font-size:11px">${pt.tipo}</span><br/><span style="color:#aaa;font-size:10px">${pt.qrs} QR Codes</span></div>`);
      mk.on('click',()=>setSel(prev=>prev===pt.id?null:pt.id));
      markers.current.set(pt.id,mk);
    });
    // Deselect on map click
    m.on('click',()=>setSel(null));
    mapInst.current=m;
    return()=>{m.remove();mapInst.current=null;markers.current.clear();};
  },[]);

  // Update marker icons when sel/nearestId changes
  useEffect(()=>{
    markers.current.forEach((mk,id)=>{
      const pt=MAP_POINTS.find(p=>p.id===id);if(!pt)return;
      mk.setIcon(mkIcon(pt.emoji,pt.cor,id===sel,id===nearestId));
    });
  },[sel,nearestId]);

  // Update user location circle
  useEffect(()=>{
    if(userMrk.current){userMrk.current.remove();userMrk.current=null;}
    if(!userLoc||!mapInst.current)return;
    const c=L.circleMarker([userLoc.lat,userLoc.lng],{radius:8,color:'#287A45',fillColor:'#287A45',fillOpacity:.4,weight:3}).addTo(mapInst.current);
    userMrk.current=c;
  },[userLoc]);

  // Auto-locate on mount
  useEffect(()=>{
    if(!navigator.geolocation)return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      p=>{setUserLoc({lat:p.coords.latitude,lng:p.coords.longitude});setLocating(false);mapInst.current?.flyTo([p.coords.latitude,p.coords.longitude],15);},
      ()=>{setLocating(false);},
      {enableHighAccuracy:true,timeout:10000}
    );
  },[]);

  return (<div className="space-y-5">
    <div className="flex items-end justify-between"><div><h2 className="text-3xl font-black text-palha">Mapa de Sergipe</h2><p className="mt-1 text-sm font-semibold text-palha/45">Clique nos marcadores para ver detalhes</p></div>
      <div className="flex gap-2">
        <button onClick={locateMe} disabled={locating} className={cx("flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-black transition shrink-0",userLoc?"border-folha/40 bg-folha/15 text-folha":"border-white/10 text-palha/50 hover:text-palha hover:bg-white/5")}>{locating?<RefreshCw size={14} className="animate-spin"/>:<LocateFixed size={14}/>}{userLoc?"📍":locErr?"⚠️":"Localizar"}</button>
        <button onClick={zoomState==="aju"?goSe:goAju} className="flex items-center gap-1.5 rounded-2xl border px-4 py-2.5 text-xs font-black transition shrink-0 border-milho/30 bg-milho/10 text-milho hover:bg-milho/20">{zoomState==="aju"?<>🗺️ Sergipe</>:<>📍 Aracaju</>}</button>
      </div>
    </div>
    {locErr&&<p className="rounded-2xl bg-fogueira/10 border border-fogueira/30 px-4 py-2 text-xs font-bold text-fogueira">{locErr}</p>}
    <div ref={mapRef} className="rounded-[2rem] border border-white/10 overflow-hidden" style={{height:"400px",zIndex:1}}/>

    <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
      {pts.map(pt=>{const isNearest=pt.id===nearestId;return(<button key={pt.id} onClick={()=>setSel(prev=>prev===pt.id?null:pt.id)} className={cx("flex items-center gap-3 rounded-2xl border p-3 text-left transition",sel===pt.id?"border-milho/50 bg-milho/10":isNearest?"border-folha/30 bg-folha/8":"border-white/10 bg-white/[.03] hover:border-white/20")}>
        <div className={cx("h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full border-2 text-xl relative",isNearest?"border-folha":"")} style={{backgroundColor:`${pt.cor}30`,borderColor:isNearest?"#287A45":pt.cor}}>
          {pt.emoji}{isNearest&&<span className="absolute -top-1 -right-1 text-[8px]">📍</span>}
        </div>
        <div className="flex-1 min-w-0"><p className="text-sm font-black text-palha truncate">{pt.name}{isNearest&&<span className="text-folha text-[10px] ml-1">🏆 Mais próximo</span>}</p>
          <p className="text-xs font-semibold text-palha/40">{pt.tipo} • {pt.qrs} QR Codes{pt.dist!=null&&<span className="ml-1 text-folha">• {pt.dist<1?`${Math.round(pt.dist*1000)}m`: `${pt.dist.toFixed(1)}km`}</span>}</p>
        </div>
        <Navigation size={12} className={cx("flex-shrink-0",isNearest?"text-folha":"text-palha/25")}/>
      </button>);})}
    </div>
    {selPt&&(<div className="rounded-[2rem] border p-5 fade-up" style={{borderColor:`${selPt.cor}40`,background:`${selPt.cor}10`}}><div className="flex items-center gap-3 mb-3"><div className="h-12 w-12 flex items-center justify-center rounded-full border-2 text-2xl flex-shrink-0" style={{backgroundColor:`${selPt.cor}30`,borderColor:selPt.cor}}>{selPt.emoji}</div><div><h3 className="text-xl font-black text-palha">{selPt.name}</h3><p className="text-xs font-semibold text-palha/45">{selPt.endereco}</p></div></div>
      <div className="flex gap-2">{selPt.dist!=null&&<div className="flex-1 rounded-2xl bg-white/10 px-4 py-3 text-center"><p className="text-[9px] font-black uppercase text-palha/40">Distância</p><p className="text-xl font-black text-folha">{selPt.dist<1?`${Math.round(selPt.dist*1000)}m`: `${selPt.dist.toFixed(1)}km`}</p></div>}
      <div className="flex-1 rounded-2xl bg-white/10 px-4 py-3 text-center"><p className="text-[9px] font-black uppercase text-palha/40">QR Codes</p><p className="text-xl font-black text-milho">{selPt.qrs}</p></div></div>
      <a href={`https://www.google.com/maps/search/${encodeURIComponent(selPt.name+' Sergipe')}`} target="_blank" rel="noopener noreferrer" className="mt-3 w-full flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black text-white transition" style={{backgroundColor:selPt.cor}}><Navigation size={14}/> Abrir no Google Maps</a></div>)}
  </div>);
}

// CULTURA TAB — Patrimônios Históricos
function CulturaTab() {
  const [busca,setBusca]=useState("");
  const [tipo,setTipo]=useState<"todos"|"material"|"imaterial">("todos");
  const [cat,setCat]=useState<PatrimonioCategoria|"todas">("todas");
  const [sel,setSel]=useState<Patrimonio|null>(null);
  const [favs,setFavs]=useState<string[]>(getFavorites);
  const [mostrarTimeline,setMostrarTimeline]=useState(false);

  const todosCats=useMemo(()=>{
    if(tipo==="material") return CATEGORIAS_MATERIAIS;
    if(tipo==="imaterial") return CATEGORIAS_IMATERIAIS;
    return [...CATEGORIAS_MATERIAIS,...CATEGORIAS_IMATERIAIS];
  },[tipo]);

  const filtrados=useMemo(()=>patrimonios.filter(p=>{
    if(tipo!=="todos"&&p.tipo!==tipo) return false;
    if(cat!=="todas"&&p.categoria!==cat) return false;
    if(busca&&!p.nome.toLowerCase().includes(busca.toLowerCase())&&!p.descricao.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  }),[tipo,cat,busca]);

  const destaques=useMemo(()=>patrimonios.filter(p=>p.destaque),[]);

  function toggleFav(id:string){const next=toggleFavorite(id);setFavs([...next]);}

  return (<div className="space-y-5">
    {/* Hero */}
    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-madeira via-zabumba to-noite p-6 text-palha shadow-soft">
      <div className="absolute top-0 right-0 h-40 w-40 rounded-bl-[3rem] bg-milho/10"/>
      <div className="relative"><div className="inline-flex items-center gap-2 rounded-full border border-milho/30 bg-milho/15 px-3 py-1.5 text-xs font-black text-milho mb-3"><Landmark size={12}/> Descubra Sergipe</div><h2 className="text-3xl font-black">Patrimônios Históricos<br/>e Culturais</h2><p className="mt-2 text-sm font-semibold text-palha/60 leading-6">26 patrimônios materiais e imateriais que contam a história do povo sergipano</p></div>
    </div>

    {/* Destaques — estilo Netflix */}
    <div>
      <h3 className="text-lg font-black text-palha mb-3">⭐ Destaques</h3>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{scrollbarWidth:"none"}}>
        {destaques.map(p=>(<button key={p.id} onClick={()=>setSel(p)} className="flex-shrink-0 relative overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:shadow-xl" style={{width:200,height:130}}><img src={p.imagemFallback} alt={p.nome} className="w-full h-full object-cover" style={{filter:"brightness(.65)"}}/><div className="absolute inset-0 bg-gradient-to-t from-noite/90 to-transparent"/><div className="absolute inset-0 p-3 flex flex-col justify-end"><span className="text-[9px] font-black uppercase rounded-full px-2 py-0.5 w-fit mb-1" style={{backgroundColor:`${p.cor}40`,color:p.cor}}>{p.tipo==="material"?"Material":"Imaterial"}</span><p className="text-sm font-black text-white leading-tight">{p.nome}</p></div></button>))}
      </div>
    </div>

    {/* Timeline */}
    <button onClick={()=>setMostrarTimeline(!mostrarTimeline)} className="w-full flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/8 transition">
      <div className="h-9 w-9 flex items-center justify-center rounded-full bg-milho/20 flex-shrink-0"><TrendingUp size={17} className="text-milho"/></div>
      <div className="flex-1 text-left"><p className="font-black text-palha">Timeline Histórica de Sergipe</p><p className="text-xs font-semibold text-palha/40">De 1575 até 2025 — {timeline.length} marcos históricos</p></div>
      <ChevronRight size={16} className={cx("text-palha/30 transition",mostrarTimeline?"rotate-90":"")}/>
    </button>
    {mostrarTimeline&&(<div className="space-y-0 fade-up">
      {timeline.map((ev,i)=>(<div key={ev.ano} className="flex gap-4">
        <div className="flex flex-col items-center"><div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 text-lg font-black" style={{backgroundColor:`${ev.cor}25`,borderColor:ev.cor}}>{ev.emoji}</div>{i<timeline.length-1&&<div className="w-0.5 flex-1 my-1 bg-white/10"/>}</div>
        <div className="pb-4 pt-1 flex-1"><div className="flex items-center gap-2 mb-0.5"><span className="text-xs font-black" style={{color:ev.cor}}>{ev.ano}</span></div><h4 className="text-sm font-black text-palha">{ev.titulo}</h4><p className="text-xs font-semibold text-palha/50 leading-5 mt-0.5">{ev.descricao}</p></div>
      </div>))}
    </div>)}

    {/* Busca + filtros */}
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"><Search size={16} className="text-palha/30 flex-shrink-0"/><input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar patrimônio..." className="flex-1 bg-transparent text-sm font-semibold text-palha placeholder:text-palha/25 outline-none"/></div>
      <div className="flex gap-2">
        {(["todos","material","imaterial"] as const).map(t=>(<button key={t} onClick={()=>{setTipo(t);setCat("todas");}} className={cx("rounded-full px-4 py-2 text-xs font-black transition capitalize",tipo===t?"bg-milho text-madeira":"border border-white/10 text-palha/50 hover:text-palha")}>{t==="todos"?"Todos":t==="material"?"Materiais":"Imateriais"}</button>))}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1" style={{scrollbarWidth:"none"}}>
        <button onClick={()=>setCat("todas")} className={cx("flex-shrink-0 rounded-full px-3 py-1.5 text-[11px] font-black transition",cat==="todas"?"bg-folha/20 text-folha border border-folha/30":"border border-white/10 text-palha/40 hover:text-palha")}>Todas</button>
        {todosCats.map(c=>(<button key={c} onClick={()=>setCat(c)} className={cx("flex-shrink-0 rounded-full px-3 py-1.5 text-[11px] font-black transition",cat===c?"bg-folha/20 text-folha border border-folha/30":"border border-white/10 text-palha/40 hover:text-palha")}>{c}</button>))}
      </div>
    </div>

    {/* Grid de patrimônios */}
    <div className="grid gap-4 md:grid-cols-2">
      {filtrados.map((p,idx)=>(<div key={p.id} className="group relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[.04] hover:border-white/20 transition cursor-pointer fade-up" style={{animationDelay:`${idx*0.04}s`}} onClick={()=>setSel(p)}>
        <div className="relative overflow-hidden" style={{height:160}}>
          <img src={p.imagemFallback} alt={p.nome} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" style={{filter:"brightness(.7)"}}/>
          <div className="absolute inset-0 bg-gradient-to-t from-noite/80 to-transparent"/>
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="rounded-full px-2 py-0.5 text-[10px] font-black" style={{backgroundColor:`${p.cor}35`,color:p.cor,border:`1px solid ${p.cor}50`}}>{p.tipo==="material"?"🏛️ Material":"✨ Imaterial"}</span>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-black bg-noite/60 backdrop-blur text-palha/70 border border-white/10">{p.emoji} {p.categoria}</span>
          </div>
          <button onClick={e=>{e.stopPropagation();toggleFav(p.id);}} className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-noite/60 backdrop-blur border border-white/20 transition hover:scale-110">
            <Heart size={14} className={cx("transition",favs.includes(p.id)?"fill-fogueira text-fogueira":"text-palha/60")}/>
          </button>
        </div>
        <div className="p-4">
          <h3 className="font-black text-palha text-base leading-tight">{p.nome}</h3>
          <p className="mt-1 text-xs font-semibold text-palha/45 flex items-center gap-1"><MapPin size={9}/>{p.localizacao}</p>
          <p className="mt-2 text-xs font-semibold text-palha/60 leading-5 line-clamp-2">{p.descricao}</p>
        </div>
      </div>))}
    </div>
    {filtrados.length===0&&(<div className="text-center py-10"><p className="text-4xl mb-3">🔍</p><p className="font-black text-palha">Nenhum patrimônio encontrado</p><p className="text-palha/40 text-sm mt-1">Tente outro filtro ou termo de busca</p></div>)}

    {/* Modal patrimônio */}
    {sel&&(<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-noite/85 backdrop-blur-md p-4" onClick={()=>setSel(null)}>
      <div className="w-full max-w-md rounded-[2rem] bg-noite border border-white/15 overflow-hidden fade-up max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
        <div className="relative" style={{height:200}}><img src={sel.imagemFallback} alt={sel.nome} className="w-full h-full object-cover" style={{filter:"brightness(.65)"}}/><div className="absolute inset-0 bg-gradient-to-t from-noite to-transparent"/><div className="absolute bottom-4 left-5"><span className="text-3xl">{sel.emoji}</span><h2 className="text-2xl font-black text-white mt-1">{sel.nome}</h2><p className="text-xs font-semibold text-palha/60">{sel.categoria} • {sel.tipo==="material"?"Material":"Imaterial"}</p></div></div>
        <div className="p-5 space-y-4">
          <div><p className="text-[10px] font-black uppercase text-palha/30 mb-1">📍 Localização</p><p className="font-semibold text-palha text-sm">{sel.localizacao}</p></div>
          <div><p className="text-[10px] font-black uppercase text-palha/30 mb-1">📖 Descrição</p><p className="text-sm font-semibold text-palha/70 leading-6">{sel.descricao}</p></div>
          <div className="rounded-2xl border p-4" style={{borderColor:`${sel.cor}40`,background:`${sel.cor}12`}}><p className="text-[10px] font-black uppercase mb-1" style={{color:sel.cor}}>💡 Curiosidade Histórica</p><p className="text-sm font-semibold text-palha/70 leading-6">{sel.curiosidade}</p></div>
          <div className="flex gap-3">
            <button onClick={()=>{toggleFav(sel.id);setFavs(getFavorites());}} className={cx("flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black transition",favs.includes(sel.id)?"bg-fogueira/20 text-fogueira border border-fogueira/30":"bg-white/10 text-palha hover:bg-white/15")}><Heart size={15} className={favs.includes(sel.id)?"fill-fogueira":""}/>{favs.includes(sel.id)?"Favoritado":"Favoritar"}</button>
            <button onClick={()=>setSel(null)} className="flex-1 rounded-2xl bg-milho py-3 font-black text-madeira hover:bg-ouro transition">Fechar</button>
          </div>
        </div>
      </div>
    </div>)}
  </div>);
}

// REWARDS TAB
function RewardsTab({p,refresh}:{p:LocalProgress;refresh:()=>void}) {
  function status(r:Reward):"disponível"|"usado"|"bloqueado"{if(p.usedRewardIds.includes(r.id))return"usado";if(p.score<r.requiredPoints)return"bloqueado";return"disponível";}
  return (<div className="space-y-5"><div><h2 className="text-3xl font-black text-palha">Cupons & Recompensas</h2><p className="mt-1 text-sm font-semibold text-palha/45">Seus pontos: <span className="text-milho font-black">{p.score} pts</span></p></div><div className="grid gap-3 md:grid-cols-2">{rewards.map(r=>{const st=status(r);const disabled=st!=="disponível";return(<div key={r.id} className={cx("rounded-2xl border p-5 transition",disabled?"border-white/5 bg-white/[.02] opacity-60":"border-milho/20 bg-milho/[.06] hover:bg-milho/10")}><div className="flex items-start justify-between"><div><p className="text-[10px] font-black uppercase tracking-wider text-fogueira/65">{r.merchant}</p><h3 className="mt-1 text-lg font-black text-palha">{r.description}</h3><p className={cx("mt-1 text-xs font-black uppercase",st==="disponível"?"text-folha":st==="usado"?"text-palha/35":"text-fogueira/55")}>{st} • {r.requiredPoints} pts</p></div><div className="h-10 w-10 flex items-center justify-center rounded-full bg-fogueira/20"><Ticket size={16} className="text-fogueira"/></div></div><button disabled={disabled} onClick={()=>{redeemReward(r.id);refresh();}} className={cx("mt-4 w-full rounded-xl py-2.5 text-sm font-black transition",disabled?"bg-white/5 text-palha/25":"bg-folha text-white hover:bg-[#1f6337]")}>{st==="usado"?"✓ Já resgatado":st==="bloqueado"?`Faltam ${r.requiredPoints-p.score} pts`:"🎁 Resgatar cupom"}</button></div>);})}</div></div>);
}

// USER APP SHELL
function UserApp({user:initialUser,onLogout}:{user:AuthUser;onLogout:()=>void}) {
  const [tab,setTab]=useState<UserTab>("album");
  const [user,setUser]=useState(initialUser);
  const [p,setP]=useState<LocalProgress>(()=>{try{return loadProgress();}catch{return initialProgress;}});
  const [showPhoto,setShowPhoto]=useState(false);
  const [showPackOpening,setShowPackOpening]=useState(false);
  const [toast,setToast]=useState<{msg:string;type:"success"|"info"|"error"}|null>(null);
  const [notifs]=useState(2);
  function refresh(){setP(loadProgress());}
  function onSavePhoto(url:string){const u={...user,avatar:url};setUser(u);saveAuth(u);setToast({msg:"Foto atualizada!",type:"success"});}
  function openPack(){setShowPackOpening(true);}
  function closePack(){setShowPackOpening(false);refresh();setTab("album");}
  useEffect(()=>{const t=setTimeout(()=>{setToast({msg:"📍 Bônus de Proximidade ativo! Vá até um ponto QR no mapa, escaneie e ganhe +50pts extras!",type:"info"});},1800);return()=>clearTimeout(t);},[]);
  return (<div className="min-h-screen bg-noite pb-28">
    {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    {showPhoto&&<PhotoModal user={user} onClose={()=>setShowPhoto(false)} onSave={onSavePhoto}/>}
    {showPackOpening&&<PackOpeningScreen onComplete={closePack} onOpenAnother={()=>{setShowPackOpening(false);setTimeout(()=>setShowPackOpening(true),400);}} hasEnergy={true}/>}
    <UserTopbar user={user} onLogout={onLogout} onAvatarClick={()=>setShowPhoto(true)} notifs={notifs}/>
    <main className="mx-auto max-w-2xl px-4 py-5">
      {tab==="home"    &&<HomeTab p={p} set={setTab} user={user} onAvatarClick={()=>setShowPhoto(true)}/>}
      {tab==="album"   &&<AlbumTab p={p} refresh={refresh}/>}
      {tab==="scanner" &&<ScannerTab refresh={refresh} user={user} onOpenPack={openPack}/>}
      {tab==="mapa"    &&<MapaTab/>}
      {tab==="cultura" &&<CulturaTab/>}
      {tab==="rewards" &&<RewardsTab p={p} refresh={refresh}/>}
    </main>
    <BottomTabs active={tab} set={t=>{setTab(t);}}/>
  </div>);
}

// ─── ADMIN APP ─────────────────────────────────────────────────────────────────
function AdminApp({onLogout}:{onLogout:()=>void}) {
  const [tab,setTab]=useState<AdminTab>("dashboard");
  const [users,setUsers]=useState<FullUserRecord[]>([]);
  const [merchants,setMerchants]=useState<FullMerchantRecord[]>([]);
  const [validations,setValidations]=useState<CouponValidation[]>([]);
  const [progress]=useState<LocalProgress>(()=>{try{return loadProgress();}catch{return initialProgress;}});
  const [showPwd,setShowPwd]=useState<Record<number,boolean>>({});
  const [showMPwd,setShowMPwd]=useState<Record<number,boolean>>({});
  const [search,setSearch]=useState("");const [searchM,setSearchM]=useState("");
  function recarregar(){setUsers(loadAllUsers());setMerchants(loadAllMerchants());loadValidations().then(setValidations);}
  useEffect(()=>{recarregar();},[]);
  const flowData=[{n:"Seg",s:120,c:22},{n:"Ter",s:180,c:34},{n:"Qua",s:260,c:51},{n:"Qui",s:310,c:63},{n:"Sex",s:480,c:94},{n:"Sáb",s:690,c:142},{n:"Dom",s:540,c:116}];
  const maxS=Math.max(...flowData.map(d=>d.s));
  const adminTabs:[AdminTab,string,React.ElementType][]=[["dashboard","Dashboard",BarChart3],["usuarios","Usuários",Users],["lojistas","Lojistas",Building2],["validacoes","Validações",ClipboardList]];
  const filtU=users.filter(u=>u.name?.toLowerCase().includes(search.toLowerCase())||u.email?.toLowerCase().includes(search.toLowerCase()));
  const filtM=merchants.filter(m=>m.business_name?.toLowerCase().includes(searchM.toLowerCase())||m.email?.toLowerCase().includes(searchM.toLowerCase()));
  function Bdg({label,color}:{label:string;color:string}){return <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-black uppercase" style={{backgroundColor:`${color}25`,color}}>{label}</span>;}
  return (<div className="min-h-screen bg-noite">
    <header className="border-b border-white/10 bg-noite/95 backdrop-blur px-6 py-4 sticky top-0 z-40"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4"><div className="flex items-center gap-3"><div className="h-9 w-9 flex items-center justify-center rounded-full bg-fogueira/20"><Shield size={16} className="text-fogueira"/></div><div><p className="text-[10px] font-black uppercase tracking-widest text-fogueira">Admin</p><p className="text-sm font-bold text-palha/55">Sanfona de Ouro</p></div></div><div className="flex items-center gap-1 overflow-x-auto">{adminTabs.map(([id,label,Icon])=>(<button key={id} onClick={()=>setTab(id)} className={cx("flex-shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black transition",tab===id?"bg-fogueira/20 text-fogueira":"text-palha/45 hover:text-palha hover:bg-white/5")}><Icon size={13}/>{label}</button>))}<button onClick={recarregar} className="ml-1 p-2 text-palha/30 hover:text-palha transition"><RefreshCw size={14}/></button><button onClick={onLogout} className="ml-1 flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black text-palha/40 hover:text-palha border border-white/10 transition"><LogOut size={13}/></button></div></div></header>
    <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">
      {tab==="dashboard"&&(<div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">{[{icon:Users,l:"Usuários",v:`${users.length}`,c:"text-milho"},{icon:Building2,l:"Lojistas",v:`${merchants.length}`,c:"text-folha"},{icon:ScanLine,l:"QR Escaneados",v:`${progress.pointsVisited}`,c:"text-fogueira"},{icon:Album,l:"Figurinhas",v:`${progress.unlockedStickerIds.length}/${stickers.length}`,c:"text-ouro"},{icon:ClipboardList,l:"Validações",v:`${validations.length}`,c:"text-milho"}].map(({icon:I,l,v,c})=>(<div key={l} className="rounded-2xl border border-white/10 bg-white/[.04] p-4"><I size={17} className={c}/><p className={`mt-2 text-2xl font-black ${c}`}>{v}</p><p className="text-xs font-semibold text-palha/40">{l}</p></div>))}</div>
        <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[.04] p-6"><h3 className="text-xl font-black text-palha">Fluxo Semanal</h3><div className="mt-5 flex h-52 items-end gap-2">{flowData.map(d=>(<div key={d.n} className="flex flex-1 flex-col items-center gap-1"><div className="flex w-full items-end justify-center gap-0.5 h-44"><div className="w-full rounded-t-lg bg-fogueira/70 hover:bg-fogueira transition" style={{height:`${(d.s/maxS)*100}%`}}/><div className="w-full rounded-t-lg bg-folha/70 hover:bg-folha transition" style={{height:`${(d.c/maxS)*100}%`}}/></div><span className="text-[9px] font-black text-palha/35">{d.n}</span></div>))}</div><div className="mt-3 flex gap-4 text-xs font-black text-palha/40"><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded bg-fogueira"/>QR Codes</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded bg-folha"/>Cupons</span></div></div>
          <div className="rounded-[2rem] border border-white/10 bg-white/[.04] p-6 space-y-3"><h3 className="text-xl font-black text-palha">Impacto</h3>{[{l:"ROI médio lojistas",v:"4.8×",c:"#F8C23A"},{l:"Engajamento",v:"68%",c:"#287A45"},{l:"NPS",v:"87",c:"#E85D2A"},{l:"Impacto econômico",v:"R$2.4M",c:"#B63822"}].map(({l,v,c})=>(<div key={l} className="rounded-2xl bg-white/5 px-4 py-3 flex items-center justify-between"><p className="text-xs font-semibold text-palha/55">{l}</p><p className="text-xl font-black" style={{color:c}}>{v}</p></div>))}</div>
        </div>
        <div><h3 className="text-xl font-black text-palha mb-3">Stakeholders</h3><div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">{stakeholders.map(sk=>(<div key={sk.id} className="rounded-2xl border border-white/10 bg-white/[.04] p-5"><div className="h-1 w-10 rounded-full mb-3" style={{backgroundColor:sk.accent}}/><h4 className="text-sm font-black text-palha mb-2">{sk.title}</h4><ul className="space-y-1">{sk.points.map((pt,i)=>(<li key={i} className="text-xs font-semibold text-palha/50 flex gap-2"><span style={{color:sk.accent}}>▸</span>{pt}</li>))}</ul></div>))}</div></div>
      </div>)}
      {tab==="usuarios"&&(<div className="space-y-4"><div className="flex items-center justify-between flex-wrap gap-3"><h2 className="text-2xl font-black text-palha">Usuários <span className="text-palha/30">({users.length})</span></h2><div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5"><Search size={14} className="text-palha/30"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar..." className="bg-transparent text-sm font-semibold text-palha placeholder:text-palha/25 outline-none w-40"/></div></div><div className="flex items-center gap-2 rounded-full border border-milho/20 bg-milho/10 px-4 py-2 text-xs font-black text-milho w-fit"><KeyRound size={13}/> Modo Admin — inclui senhas</div>{filtU.length===0?(<div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center"><Users size={40} className="mx-auto text-palha/20 mb-3"/><p className="text-palha/35 font-semibold">{search?"Nenhum resultado.":"Nenhum usuário cadastrado."}</p></div>):(<div className="space-y-2">{filtU.map((u,i)=>(<div key={i} className="rounded-2xl border border-white/10 bg-white/[.04] p-4 hover:border-milho/15 transition"><div className="flex items-center gap-3 mb-3"><div className="h-10 w-10 flex items-center justify-center rounded-full bg-milho/20 font-black text-milho text-sm flex-shrink-0">{(u.name||"?")[0].toUpperCase()}</div><div className="flex-1 min-w-0"><p className="font-black text-palha truncate">{u.name}</p><p className="text-xs font-semibold text-palha/40 truncate">{u.email}</p></div><Bdg label="Usuário" color="#F8C23A"/></div><div className="grid grid-cols-2 gap-2 md:grid-cols-4 text-xs"><div className="rounded-xl bg-white/5 px-3 py-2"><p className="text-palha/35 font-black uppercase text-[9px] mb-0.5">Senha</p><div className="flex items-center gap-1.5"><p className="font-black text-fogueira font-mono">{showPwd[i]?u.password:"••••••"}</p><button onClick={()=>setShowPwd(p=>({...p,[i]:!p[i]}))} className="text-palha/30 hover:text-palha">{showPwd[i]?<EyeOff size={11}/>:<Eye size={11}/>}</button></div></div><div className="rounded-xl bg-white/5 px-3 py-2"><p className="text-palha/35 font-black uppercase text-[9px] mb-0.5">WhatsApp</p><p className="font-black text-palha">{u.phone||"—"}</p></div><div className="rounded-xl bg-white/5 px-3 py-2"><p className="text-palha/35 font-black uppercase text-[9px] mb-0.5">Cidade</p><p className="font-black text-palha">{u.city||"—"}</p></div><div className="rounded-xl bg-white/5 px-3 py-2"><p className="text-palha/35 font-black uppercase text-[9px] mb-0.5">Perfil</p><p className="font-black text-palha truncate">{u.audience||"—"}</p></div></div>{u.created_at&&<p className="mt-2 text-[10px] text-palha/25">Cadastro: {new Date(u.created_at).toLocaleString("pt-BR")}</p>}</div>))}</div>)}</div>)}
      {tab==="lojistas"&&(<div className="space-y-4"><div className="flex items-center justify-between flex-wrap gap-3"><h2 className="text-2xl font-black text-palha">Lojistas <span className="text-palha/30">({merchants.length})</span></h2><div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5"><Search size={14} className="text-palha/30"/><input value={searchM} onChange={e=>setSearchM(e.target.value)} placeholder="Buscar..." className="bg-transparent text-sm font-semibold text-palha placeholder:text-palha/25 outline-none w-40"/></div></div><div className="flex items-center gap-2 rounded-full border border-folha/20 bg-folha/10 px-4 py-2 text-xs font-black text-folha w-fit"><KeyRound size={13}/> Inclui senhas e dados completos</div>{filtM.length===0?(<div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center"><Building2 size={40} className="mx-auto text-palha/20 mb-3"/><p className="text-palha/35 font-semibold">{searchM?"Nenhum resultado.":"Nenhum lojista cadastrado."}</p></div>):(<div className="space-y-2">{filtM.map((m,i)=>(<div key={i} className="rounded-2xl border border-white/10 bg-white/[.04] p-4 hover:border-folha/15 transition"><div className="flex items-center gap-3 mb-3"><div className="h-10 w-10 flex items-center justify-center rounded-full bg-folha/20 font-black text-folha text-sm flex-shrink-0">{(m.business_name||"?")[0].toUpperCase()}</div><div className="flex-1 min-w-0"><p className="font-black text-palha truncate">{m.business_name}</p><p className="text-xs font-semibold text-palha/40 truncate">{m.email}</p></div><Bdg label={m.category||"Lojista"} color="#287A45"/></div><div className="grid grid-cols-2 gap-2 md:grid-cols-4 text-xs"><div className="rounded-xl bg-white/5 px-3 py-2"><p className="text-palha/35 font-black uppercase text-[9px] mb-0.5">Senha</p><div className="flex items-center gap-1.5"><p className="font-black text-fogueira font-mono">{showMPwd[i]?m.password:"••••••"}</p><button onClick={()=>setShowMPwd(p=>({...p,[i]:!p[i]}))} className="text-palha/30 hover:text-palha">{showMPwd[i]?<EyeOff size={11}/>:<Eye size={11}/>}</button></div></div><div className="rounded-xl bg-white/5 px-3 py-2"><p className="text-palha/35 font-black uppercase text-[9px] mb-0.5">Responsável</p><p className="font-black text-palha truncate">{m.owner_name||"—"}</p></div><div className="rounded-xl bg-white/5 px-3 py-2"><p className="text-palha/35 font-black uppercase text-[9px] mb-0.5">WhatsApp</p><p className="font-black text-palha">{m.phone||"—"}</p></div><div className="rounded-xl bg-white/5 px-3 py-2"><p className="text-palha/35 font-black uppercase text-[9px] mb-0.5">Localização</p><p className="font-black text-palha truncate">{m.location||"—"}</p></div></div><div className="mt-2 rounded-xl bg-milho/10 border border-milho/20 px-3 py-2 text-xs"><span className="text-palha/40 font-black uppercase text-[9px]">Recompensa: </span><span className="font-black text-milho">{m.reward||"—"}</span></div>{m.created_at&&<p className="mt-1.5 text-[10px] text-palha/25">Cadastro: {new Date(m.created_at).toLocaleString("pt-BR")}</p>}</div>))}</div>)}</div>)}
      {tab==="validacoes"&&(<div className="space-y-4"><div className="flex items-center justify-between"><h2 className="text-2xl font-black text-palha">Validações <span className="text-palha/30">({validations.length})</span></h2><button onClick={()=>loadValidations().then(setValidations)} className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-black text-palha/50 hover:text-palha transition"><RefreshCw size={13}/> Atualizar</button></div>{validations.length===0?(<div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center"><ClipboardList size={40} className="mx-auto text-palha/20 mb-3"/><p className="text-palha/35 font-semibold">Nenhuma validação ainda.</p></div>):(<div className="rounded-2xl border border-white/10 overflow-hidden"><table className="w-full text-sm"><thead className="bg-white/5 border-b border-white/10"><tr>{["Código","Lojista","Cliente","Recompensa","Data"].map(h=>(<th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-palha/40">{h}</th>))}</tr></thead><tbody>{validations.map((v,i)=>(<tr key={i} className="border-b border-white/5 hover:bg-white/[.02]"><td className="px-4 py-3 font-black text-milho font-mono text-xs">{v.code}</td><td className="px-4 py-3 font-semibold text-palha">{v.merchant_name}</td><td className="px-4 py-3 text-palha/50 text-xs">{v.client_email}</td><td className="px-4 py-3"><span className="rounded-full bg-folha/20 px-2 py-0.5 text-xs font-black text-folha">{v.reward}</span></td><td className="px-4 py-3 text-palha/35 text-xs">{v.validated_at?new Date(v.validated_at).toLocaleString("pt-BR"):"—"}</td></tr>))}</tbody></table></div>)}</div>)}
    </main>
  </div>);
}

// ─── ROOT ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [view,setView]=useState<AppView>("landing");
  const [user,setUser]=useState<AuthUser|null>(()=>loadAuth());
  useEffect(()=>{if(user){if(user.type==="admin")setView("admin-app");else if(user.type==="merchant")setView("merchant-app");else setView("user-app");}},[]);
  // Handles Supabase OAuth redirect (Google login)
  useEffect(()=>{
    if (!supabase || !isSupabaseConfigured) return;
    const params=new URLSearchParams(window.location.search);
    const code=params.get("code");
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({data:{session}})=>{
        if (session?.user) {
          const supa=session.user;
          const name=supa.user_metadata?.full_name||supa.email?.split("@")[0]||"Usuário";
          const email=supa.email||"";
          const authUser:AuthUser={name,email,type:"user"};
          saveAuth(authUser);setUser(authUser);setView("user-app");
          window.history.replaceState({},document.title,window.location.pathname);
        }
      });
      return;
    }
    supabase.auth.getSession().then(({data:{session}})=>{
      if (session?.user) {
        const supa=session.user;
        const name=supa.user_metadata?.full_name||supa.email?.split("@")[0]||"Usuário";
        const email=supa.email||"";
        const authUser:AuthUser={name,email,type:"user"};
        saveAuth(authUser);setUser(authUser);setView("user-app");
      }
    });
    const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{
      if (event==="SIGNED_IN"&&session?.user) {
        const supa=session.user;
        const name=supa.user_metadata?.full_name||supa.email?.split("@")[0]||"Usuário";
        const email=supa.email||"";
        const authUser:AuthUser={name,email,type:"user"};
        saveAuth(authUser);setUser(authUser);setView("user-app");
      }
    });
    return ()=>{subscription.unsubscribe();};
  },[]);
  function onLogin(u:AuthUser){setUser(u);if(u.type==="admin")setView("admin-app");else if(u.type==="merchant")setView("merchant-app");else setView("user-app");}
  function onLogout(){clearAuth();setUser(null);setView("landing");supabase?.auth.signOut().catch(()=>{});}
  if(view==="landing")           return <Landing sv={setView}/>;
  if(view==="login")             return <LoginScreen sv={setView} onLogin={onLogin}/>;
  if(view==="register")          return <RegisterScreen sv={setView} onLogin={onLogin}/>;
  if(view==="merchant-login")    return <MerchantLogin sv={setView} onLogin={onLogin}/>;
  if(view==="merchant-register") return <MerchantRegister sv={setView} onLogin={onLogin}/>;
  if(view==="admin-login")       return <AdminLogin sv={setView} onLogin={onLogin}/>;
  if(view==="user-app"&&user)    return <UserApp user={user} onLogout={onLogout}/>;
  if(view==="merchant-app"&&user)return <MerchantApp user={user} onLogout={onLogout}/>;
  if(view==="admin-app"&&user)   return <AdminApp onLogout={onLogout}/>;
  return <Landing sv={setView}/>;
}
