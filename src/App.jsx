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
function SellTab({ profile, onPublished, goToKyc }) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [location, setLocation] = useState("Lobito");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  if (!profile) {
    return <Screen><div style={{ padding: 40, textAlign: "center", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 12 }}><Lock size={32} color="#9A9384" /><div style={{ fontWeight: 700 }}>Inicia sessão para vender</div><div style={{ fontSize: 13, color: "#8A8474" }}>Cria conta ou entra no separador Perfil.</div></div></Screen>;
  }
  if (profile.kyc_status !== "approved") {
    return (
      <Screen>
        <div style={{ padding: 30, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 14, textAlign: "center" }}>
          <ShieldCheck size={36} color={COPPER} />
          <div style={{ fontWeight: 800, fontSize: 17 }}>Verificação obrigatória</div>
          <div style={{ fontSize: 13, color: "#8A8474", maxWidth: 260 }}>
            {profile.kyc_status === "pending_review" ? "Os teus documentos estão em análise pelo administrador." : "Para publicar anúncios no Bazar, precisas de completar a verificação de identidade (KYC)."}
          </div>
          {profile.kyc_status !== "pending_review" && (
            <button onClick={goToKyc} style={{ background: EMERALD, color: "white", border: "none", borderRadius: 10, padding: "12px 22px", fontWeight: 700, fontSize: 14, cursor: "pointer", marginTop: 6 }}>Verificar identidade</button>
          )}
        </div>
      </Screen>
    );
  }

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!title || !price) return;
    setSaving(true);
    setError("");
    try {
      let photo_url = null;
      if (file) photo_url = await uploadPhoto(file, "listings");
      const { error: insertError } = await supabase.from("listings").insert({
        seller_id: profile.id, title, price: Number(price), category, location, description: desc, photo_url
      });
      if (insertError) throw insertError;
      setTitle(""); setPrice(""); setDesc(""); setFile(null); setPreview(null);
      onPublished();
    } catch (e) {
      setError(e.message || "Erro ao publicar anúncio.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <TopBar title="Novo anúncio" />
      <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
        <div onClick={() => fileRef.current.click()} style={{ height: 140, borderRadius: 12, border: "2px dashed #CBC2AD", background: preview ? `url(${preview}) center/cover` : "white", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", color: "#9A9384", cursor: "pointer", gap: 6 }}>
          {!preview && <><Upload size={22} /><span style={{ fontSize: 12 }}>Adicionar foto</span></>}
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
        <Field label="Título"><input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Toyota Hilux 2018" style={inputStyle} /></Field>
        <Field label="Preço (Kz)"><input value={price} onChange={e => setPrice(e.target.value.replace(/\D/g, ""))} placeholder="0" style={inputStyle} /></Field>
        <Field label="Categoria"><select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></Field>
        <Field label="Localização"><select value={location} onChange={e => setLocation(e.target.value)} style={inputStyle}><option>Lobito</option><option>Benguela</option><option>Catumbela</option></select></Field>
        <Field label="Descrição"><textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} placeholder="Detalhes do produto..." style={{ ...inputStyle, resize: "none" }} /></Field>
        {error && <div style={{ color: "#C0392B", fontSize: 12, display: "flex", gap: 5, alignItems: "center" }}><AlertCircle size={13} />{error}</div>}
        <button onClick={submit} disabled={!title || !price || saving} style={{ background: title && price ? COPPER : "#DCD5C6", color: "white", border: "none", borderRadius: 10, padding: 13, fontWeight: 700, fontSize: 14, cursor: title && price ? "pointer" : "not-allowed", marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {saving && <Loader2 size={16} className="spin" />} {saving ? "A publicar..." : "Publicar anúncio"}
        </button>
      </div>
    </Screen>
  );
}

function UploadBox({ onClick, image, label, round }) {
  return (
    <div onClick={onClick} style={{ height: round ? 160 : 130, width: round ? 160 : "100%", margin: round ? "0 auto" : 0, borderRadius: round ? "50%" : 12, border: "2px dashed #CBC2AD", background: image ? `url(${image}) center/cover` : "white", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", color: "#9A9384", cursor: "pointer", gap: 6 }}>
      {!image && <><Camera size={22} /><span style={{ fontSize: 11 }}>{label}</span></>}
    </div>
  );
}
function KycFlow({ onBack, profile, onSubmitted }) {
  const [step, setStep] = useState(0);
  const [biFile, setBiFile] = useState(null);
  const [biPreview, setBiPreview] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef1 = useRef(), fileRef2 = useRef();

  const handle = (setFile, setPreview) => (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const finish = async () => {
    setSaving(true);
    setError("");
    try {
      const bi_photo_url = await uploadPhoto(biFile, "kyc");
      const selfie_photo_url = await uploadPhoto(selfieFile, "kyc");
      const { error: updateError } = await supabase.from("profiles")
        .update({ kyc_status: "pending_review", bi_photo_url, selfie_photo_url })
        .eq("id", profile.id);
      if (updateError) throw updateError;
      onSubmitted();
    } catch (e) {
      setError(e.message || "Erro ao submeter verificação.");
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { title: "Documento de identidade", canNext: !!biFile, body: (
      <><p style={{ fontSize: 13, color: "#8A8474", marginBottom: 14 }}>Carrega uma foto clara do teu Bilhete de Identidade (frente).</p>
        <UploadBox onClick={() => fileRef1.current.click()} image={biPreview} label="Foto do BI" />
        <input ref={fileRef1} type="file" accept="image/*" onChange={handle(setBiFile, setBiPreview)} style={{ display: "none" }} /></>
    )},
    { title: "Selfie de verificação", canNext: !!selfieFile, body: (
      <><p style={{ fontSize: 13, color: "#8A8474", marginBottom: 14 }}>Tira uma selfie para confirmarmos que és tu.</p>
        <UploadBox onClick={() => fileRef2.current.click()} image={selfiePreview} label="Selfie" round />
        <input ref={fileRef2} type="file" accept="image/*" capture="user" onChange={handle(setSelfieFile, setSelfiePreview)} style={{ display: "none" }} /></>
    )},
    { title: "Confirmar", canNext: false, body: (
      <div style={{ textAlign: "center" }}>
        <ShieldCheck size={36} color={COPPER} />
        <p style={{ fontSize: 13, color: "#8A8474", margin: "12px 0 18px" }}>Os teus documentos serão enviados para um administrador rever antes de aprovar a tua conta.</p>
        {error && <div style={{ color: "#C0392B", fontSize: 12, marginBottom: 12 }}>{error}</div>}
        <button onClick={finish} disabled={saving} style={{ background: EMERALD, color: "white", border: "none", borderRadius: 10, padding: "12px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "inline-flex", gap: 8, alignItems: "center" }}>
          {saving && <Loader2 size={16} className="spin" />} {saving ? "A enviar..." : "Submeter verificação"}
        </button>
      </div>
    )}
  ];
  const cur = steps[step];

  return (
    <Screen>
      <TopBar title="Verificação de identidade" onBack={onBack} />
      <div style={{ padding: "8px 18px 0" }}>
        <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>{steps.map((_, i) => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? COPPER : "#EAE3D6" }} />)}</div>
        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 14 }}>{cur.title}</div>
        {cur.body}
      </div>
      {step < 2 && <div style={{ marginTop: "auto", padding: 18 }}><button onClick={() => setStep(step + 1)} disabled={!cur.canNext} style={{ width: "100%", background: cur.canNext ? EMERALD : "#DCD5C6", color: "white", border: "none", borderRadius: 10, padding: 13, fontWeight: 700, fontSize: 14, cursor: cur.canNext ? "pointer" : "not-allowed" }}>Continuar</button></div>}
    </Screen>
  );
}
function ProfileTab({ session, profile, onAuthChange, goToKyc, goToAdmin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (session && profile) {
    return (
      <Screen>
        <TopBar title="Perfil" />
        <div style={{ padding: 22, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: EMERALD, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20 }}>{profile.name?.[0]?.toUpperCase()}</div>
            <div><div style={{ fontWeight: 800, fontSize: 16 }}>{profile.name}</div><div style={{ fontSize: 12, color: "#8A8474" }}>{profile.email}</div></div>
          </div>
          <div style={{ background: "white", borderRadius: 12, border: "1px solid #EAE3D6", padding: 14, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: 13 }}>Verificação KYC</span>
              {profile.kyc_status === "approved" ? <VerifiedBadge /> : <span style={{ fontSize: 11, color: COPPER, fontWeight: 700 }}>{profile.kyc_status === "pending_review" ? "Em análise" : "Pendente"}</span>}
            </div>
            {profile.kyc_status === "pending" && <button onClick={goToKyc} style={{ marginTop: 10, width: "100%", background: SAND, border: `1px solid ${COPPER}`, color: COPPER, borderRadius: 8, padding: 9, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Completar verificação</button>}
          </div>
          {profile.is_admin && <button onClick={goToAdmin} style={{ width: "100%", background: "white", border: "1px solid #EAE3D6", borderRadius: 10, padding: 12, fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 10, color: INK }}><Settings size={16} /> Painel administrativo</button>}
          <button onClick={() => supabase.auth.signOut().then(onAuthChange)} style={{ width: "100%", background: "white", border: "1px solid #EAE3D6", borderRadius: 10, padding: 12, fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: "#C0392B" }}><LogOut size={16} /> Terminar sessão</button>
        </div>
      </Screen>
    );
  }

  const submit = async () => {
    setError(""); setBusy(true);
    try {
      if (mode === "register") {
        if (!name || !email || !password) { setError("Preenche todos os campos."); setBusy(false); return; }
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        if (data.user) {
          const { error: profileError } = await supabase.from("profiles").insert({ id: data.user.id, name, email });
          if (profileError) throw profileError;
        }
      } else {
        if (!email || !password) { setError("Preenche todos os campos."); setBusy(false); return; }
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
      onAuthChange();
    } catch (e) {
      setError(e.message === "Invalid login credentials" ? "E-mail ou palavra-passe incorretos." : (e.message || "Erro inesperado."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <TopBar title={mode === "login" ? "Entrar" : "Criar conta"} />
      <div style={{ padding: 22, flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
        {mode === "register" && <Field label="Nome"><input value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="O teu nome" /></Field>}
        <Field label="E-mail"><input value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} placeholder="nome@email.com" /></Field>
        <Field label="Palavra-passe"><input type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} placeholder="mínimo 6 caracteres" /></Field>
        {error && <div style={{ color: "#C0392B", fontSize: 12, display: "flex", gap: 5, alignItems: "center" }}><AlertCircle size={13} />{error}</div>}
        <button onClick={submit} disabled={busy} style={{ background: EMERALD, color: "white", border: "none", borderRadius: 10, padding: 13, fontWeight: 700, fontSize: 14, cursor: "pointer", marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {busy && <Loader2 size={16} className="spin" />} {mode === "login" ? "Entrar" : "Criar conta"}
        </button>
        <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }} style={{ background: "none", border: "none", color: EMERALD, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          {mode === "login" ? "Não tens conta? Regista-te" : "Já tens conta? Entra"}
        </button>
      </div>
    </Screen>
  );
}
function AdminPanel({ onBack, listings, refresh, pendingProfiles }) {
  const removeListing = async (id) => { await supabase.from("listings").delete().eq("id", id); refresh(); };
  const setKyc = async (id, status) => { await supabase.from("profiles").update({ kyc_status: status }).eq("id", id); refresh(); };

  return (
    <Screen>
      <TopBar title="Painel administrativo" onBack={onBack} />
      <div style={{ padding: 16, flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Verificações pendentes ({pendingProfiles.length})</div>
        {pendingProfiles.map(p => (
          <div key={p.id} style={{ background: "white", border: "1px solid #EAE3D6", borderRadius: 10, padding: 10, marginBottom: 8 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{p.name} · {p.email}</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              {p.bi_photo_url && <img src={p.bi_photo_url} alt="BI" style={{ width: 70, height: 50, objectFit: "cover", borderRadius: 6 }} />}
              {p.selfie_photo_url && <img src={p.selfie_photo_url} alt="Selfie" style={{ width: 50, height: 50, objectFit: "cover", borderRadius: "50%" }} />}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setKyc(p.id, "approved")} style={{ flex: 1, background: EMERALD, color: "white", border: "none", borderRadius: 7, padding: "7px 0", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Aprovar</button>
              <button onClick={() => setKyc(p.id, "rejected")} style={{ flex: 1, background: "#FBE9E7", color: "#C0392B", border: "none", borderRadius: 7, padding: "7px 0", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Rejeitar</button>
            </div>
          </div>
        ))}
        {pendingProfiles.length === 0 && <div style={{ fontSize: 12, color: "#9A9384", marginBottom: 20 }}>Nenhuma verificação pendente.</div>}

        <div style={{ fontWeight: 700, fontSize: 13, margin: "20px 0 10px" }}>Anúncios publicados ({listings.length})</div>
        {listings.map(l => (
          <div key={l.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "white", border: "1px solid #EAE3D6", borderRadius: 10, padding: 10, marginBottom: 8 }}>
            <div><div style={{ fontWeight: 600, fontSize: 13 }}>{l.title}</div><div style={{ fontSize: 11, color: "#8A8474" }}>{formatKz(l.price)}</div></div>
            <button onClick={() => removeListing(l.id)} style={{ background: "#FBE9E7", color: "#C0392B", border: "none", borderRadius: 7, padding: "6px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Remover</button>
          </div>
        ))}
      </div>
    </Screen>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [pendingProfiles, setPendingProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("bazar");
  const [view, setView] = useState(null);

  const loadProfile = useCallback(async (userId) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    setProfile(data);
    return data;
  }, []);

  const loadListings = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("listings").select("*, profiles(name, kyc_status)").eq("status", "active").order("created_at", { ascending: false });
    setListings(data || []);
    setLoading(false);
  }, []);

  const loadPending = useCallback(async () => {
    const { data } = await supabase.from("profiles").select("*").eq("kyc_status", "pending_review");
    setPendingProfiles(data || []);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadProfile(session.user.id);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadProfile(session.user.id); else setProfile(null);
    });
    loadListings();
    return () => listener.subscription.unsubscribe();
  }, [loadProfile, loadListings]);

  useEffect(() => { if (profile?.is_admin) loadPending(); }, [profile, loadPending]);

  const refreshAll = () => { loadListings(); if (session) loadProfile(session.user.id); if (profile?.is_admin) loadPending(); };

  if (view?.type === "detail") return <ListingDetail item={view.item} onBack={() => setView(null)} />;
  if (view?.type === "kyc") return <KycFlow profile={profile} onBack={() => setView(null)} onSubmitted={() => { setView(null); loadProfile(session.user.id); }} />;
  if (view?.type === "admin") return <AdminPanel onBack={() => setView(null)} listings={listings} pendingProfiles={pendingProfiles} refresh={refreshAll} />;

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", height: "100vh", display: "flex", flexDirection: "column", background: SAND, boxShadow: "0 0 40px rgba(0,0,0,0.08)" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {tab === "bazar" && <BazarTab listings={listings} loading={loading} openListing={(item) => setView({ type: "detail", item })} />}
        {tab === "search" && <BazarTab listings={listings} loading={loading} openListing={(item) => setView({ type: "detail", item })} />}
        {tab === "sell" && <SellTab profile={profile} onPublished={() => { setTab("bazar"); loadListings(); }} goToKyc={() => setView({ type: "kyc" })} />}
        {tab === "chat" && <Screen><TopBar title="Mensagens" /><div style={{ padding: 40, textAlign: "center", color: "#9A9384", fontSize: 13 }}>Ainda não tens conversas.</div></Screen>}
        {tab === "profile" && <ProfileTab session={session} profile={profile} onAuthChange={() => session && loadProfile(session.user.id)} goToKyc={() => setView({ type: "kyc" })} goToAdmin={() => setView({ type: "admin" })} />}
      </div>
      <BottomNav tab={tab} setTab={setTab} />
    </div>
  );
}
