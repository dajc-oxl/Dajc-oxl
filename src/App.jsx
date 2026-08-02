import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search, PlusCircle, MessageCircle, User, ShieldCheck,
  Camera, ChevronLeft, MapPin, Lock, Check, AlertCircle,
  Settings, LogOut, Upload, Loader2, BadgeCheck, Store
} from "lucide-react";
import { supabase } from "./supabaseClient";

const EMERALD = "#0F5C42";
const EMERALD_DARK = "#0A3E2D";
const COPPER = "#B8703D";
const COPPER_LIGHT = "#D9915C";
const SAND = "#F7F3EC";
const INK = "#1C1B19";

const CATEGORIES = ["Veículos", "Imóveis", "Eletrónica", "Casa & Jardim", "Moda", "Emprego", "Serviços", "Outros"];

function formatKz(n) {
  return new Intl.NumberFormat("pt-AO").format(n) + " Kz";
}
function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "há minutos";
  if (h < 24) return `há ${h}h`;
  return `há ${Math.floor(h / 24)}d`;
}

async function uploadPhoto(file, folder) {
  const ext = file.name.split(".").pop();
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("dajc-oxl-photos").upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("dajc-oxl-photos").getPublicUrl(path);
  return data.publicUrl;
}

function Logo({ size = 28 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{
        width: size, height: size, borderRadius: 8,
        background: `linear-gradient(135deg, ${EMERALD}, ${EMERALD_DARK})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: COPPER_LIGHT, fontWeight: 800, fontSize: size * 0.5,
        fontFamily: "Georgia, serif", flexShrink: 0
      }}>D</div>
      <span style={{ fontWeight: 800, fontSize: size * 0.62, color: EMERALD_DARK, letterSpacing: -0.5 }}>
        DAJC <span style={{ color: COPPER }}>OXL</span>
      </span>
    </div>
  );
}

function VerifiedBadge({ small }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      background: "#FFF4EA", color: COPPER, border: `1px solid ${COPPER_LIGHT}`,
      borderRadius: 20, padding: small ? "1px 6px" : "2px 8px", fontSize: small ? 10 : 11, fontWeight: 700
    }}><BadgeCheck size={small ? 11 : 13} /> Verificado</span>
  );
}

function Screen({ children }) {
  return <div style={{ background: SAND, minHeight: "100%", display: "flex", flexDirection: "column", fontFamily: "system-ui, -apple-system, sans-serif", color: INK }}>{children}</div>;
}

function TopBar({ title, onBack, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "white", borderBottom: "1px solid #EAE3D6", position: "sticky", top: 0, zIndex: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 40 }}>
        {onBack && <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><ChevronLeft size={22} color={INK} /></button>}
      </div>
      <div style={{ fontWeight: 700, fontSize: 16, flex: 1, textAlign: onBack ? "center" : "left" }}>{title}</div>
      <div style={{ minWidth: 40, display: "flex", justifyContent: "flex-end" }}>{right}</div>
    </div>
  );
}

function BottomNav({ tab, setTab }) {
  const items = [
    { id: "bazar", icon: Store, label: "Bazar" },
    { id: "search", icon: Search, label: "Procurar" },
    { id: "sell", icon: PlusCircle, label: "Vender" },
    { id: "chat", icon: MessageCircle, label: "Mensagens" },
    { id: "profile", icon: User, label: "Perfil" },
  ];
  return (
    <div style={{ display: "flex", background: "white", borderTop: "1px solid #EAE3D6", padding: "8px 4px 10px", position: "sticky", bottom: 0 }}>
      {items.map(({ id, icon: Icon, label }) => {
        const active = tab === id;
        return (
          <button key={id} onClick={() => setTab(id)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: active ? EMERALD : "#9A9384", padding: "4px 0" }}>
            <Icon size={22} />
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

function ListingCard({ item, onClick }) {
  return (
    <div onClick={onClick} style={{ background: "white", borderRadius: 14, overflow: "hidden", border: "1px solid #EAE3D6", cursor: "pointer" }}>
      <div style={{ height: 120, background: item.photo_url ? `url(${item.photo_url}) center/cover` : "linear-gradient(135deg,#DDD5C4,#EAE3D6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B5AC98" }}>
        {!item.photo_url && <Camera size={28} />}
      </div>
      <div style={{ padding: "10px 12px" }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: EMERALD_DARK }}>{formatKz(item.price)}</div>
        <div style={{ fontSize: 13, fontWeight: 600, margin: "3px 0", lineHeight: 1.3 }}>{item.title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#8A8474" }}><MapPin size={11} /> {item.location} · {timeAgo(item.created_at)}</div>
      </div>
    </div>
  );
}

function BazarTab({ listings, loading, openListing }) {
  const [cat, setCat] = useState("Todos");
  const filtered = cat === "Todos" ? listings : listings.filter(l => l.category === cat);
  return (
    <Screen>
      <div style={{ padding: "16px 16px 8px", background: "white", borderBottom: "1px solid #EAE3D6" }}>
        <Logo />
        <div style={{ display: "flex", gap: 8, overflowX: "auto", marginTop: 14, paddingBottom: 4 }}>
          {["Todos", ...CATEGORIES].map(c => (
            <button key={c} onClick={() => setCat(c)} style={{ flexShrink: 0, padding: "6px 13px", borderRadius: 20, fontSize: 12, fontWeight: 600, border: `1px solid ${cat === c ? EMERALD : "#DCD5C6"}`, background: cat === c ? EMERALD : "white", color: cat === c ? "white" : "#5B5646", cursor: "pointer" }}>{c}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, flex: 1 }}>
        {loading && <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: "#9A9384" }}><Loader2 className="spin" size={22} /></div>}
        {!loading && filtered.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#9A9384", padding: 40, fontSize: 13 }}>Ainda não há anúncios nesta categoria.</div>}
        {filtered.map(item => <ListingCard key={item.id} item={item} onClick={() => openListing(item)} />)}
      </div>
    </Screen>
  );
}

function ListingDetail({ item, onBack }) {
  if (!item) return null;
  return (
    <Screen>
      <TopBar title="Anúncio" onBack={onBack} />
      <div style={{ height: 220, background: item.photo_url ? `url(${item.photo_url}) center/cover` : "linear-gradient(135deg,#DDD5C4,#EAE3D6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B5AC98" }}>
        {!item.photo_url && <Camera size={40} />}
      </div>
      <div style={{ padding: 18, flex: 1 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: EMERALD_DARK }}>{formatKz(item.price)}</div>
        <div style={{ fontSize: 17, fontWeight: 700, margin: "6px 0" }}>{item.title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#8A8474", marginBottom: 12 }}><MapPin size={12} /> {item.location} · {timeAgo(item.created_at)}</div>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: "#3A362E" }}>{item.description}</p>
        <div style={{ marginTop: 20, padding: 14, background: "white", borderRadius: 12, border: "1px solid #EAE3D6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{item.profiles?.name || "Vendedor"}</div>
            {item.profiles?.kyc_status === "approved" ? <VerifiedBadge /> : <span style={{ fontSize: 11, color: "#9A9384" }}>Não verificado</span>}
          </div>
          <button style={{ background: COPPER, color: "white", border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Contactar</button>
        </div>
      </div>
    </Screen>
  );
}

const inputStyle = { width: "100%", padding: "11px 12px", borderRadius: 9, border: "1px solid #DCD5C6", fontSize: 14, background: "white", boxSizing: "border-box", fontFamily: "inherit" };

function Field({ label, children }) {
  return <div><div style={{ fontSize: 12, fontWeight: 700, color: "#5B5646", marginBottom: 5 }}>{label}</div>{children}</div>;
}
