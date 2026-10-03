import React, {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  Activity,
  ArrowUpRight,
  Check,
  ChevronDown,
  Menu,
  Pause,
  Play,
  Search as SearchIcon,
  Settings,
  X,
  Bell,
  LayoutDashboard,
  LogOut,
  Plus,
  Download,
  Mail,
  CheckCircle2,
  Command,
  UploadCloud,
  FileText,
  FileSpreadsheet,
  Brain,
  Trash2,
  Link2,
  Unlink,
  Megaphone,
  Target as TargetIcon,
} from "lucide-react";
import { createPortal } from "react-dom";
import type { TemplateConfig, NavItem, CSSVars, Entity } from "../types";
import { asset, money, makeId } from "../types";
const ToastContext = createContext<(text: string) => void>(() => {});
export const useToast = () => useContext(ToastContext);
export function TemplateRoot({
  config,
  children,
}: {
  config: TemplateConfig;
  children: React.ReactNode;
}) {
  const [toast, setToast] = useState(""),
    [paused, setPaused] = useState(false);
  const [toastTarget, setToastTarget] = useState<HTMLDialogElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    const elements = root.current?.querySelectorAll("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("revealed");
            observer.unobserve(e.target);
          }
        }),
      { threshold: 0.08 },
    );
    elements?.forEach((e) => observer.observe(e));
    // Filtered cards mount after the first render; observe them as they arrive.
    const mutations = new MutationObserver(records => {
      for (const record of records) for (const node of record.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches('[data-reveal]')) observer.observe(node);
        node.querySelectorAll('[data-reveal]').forEach(e => observer.observe(e));
      }
    });
    if (root.current) mutations.observe(root.current, {childList:true,subtree:true});
    return () => {observer.disconnect();mutations.disconnect()};
  }, [config.templateId]);
  useEffect(() => {
    // Native dialogs occupy the top layer. Keep their validation feedback inside it.
    setToastTarget(toast ? root.current?.querySelector<HTMLDialogElement>('dialog[open]') || null : null);
  }, [toast]);
  const notify = (message: string) => {
    clearTimeout(timer.current);
    setToast(message);
    timer.current = setTimeout(() => setToast(""), 5500);
  };
  const t = config.theme;
  const vars: CSSVars = {
    "--bg": t.background,
    "--surface": t.surface,
    "--ink": t.text,
    "--muted": t.muted,
    "--line": t.line,
    "--accent": t.accent,
    "--on-accent": t.accentText,
    "--radius": `${t.radius ?? 14}px`,
    "--display": t.serif ? "Georgia, serif" : "Manrope, sans-serif",
  };
  const feedback = <div className={`toast ${toast ? "visible" : ""}`} role="status" aria-live="polite"><CheckCircle2 size={19}/>{toast}</div>;
  return (
    <ToastContext.Provider value={notify}>
      <div
        ref={root}
        className={`template-root ${t.mode} tpl-${config.templateId} ${paused ? "motion-paused" : ""}`}
        style={vars}
      >
        <a className="skip-link" href="#main">
          Pular para o conteúdo
        </a>
        {children}
        <button
          className="motion-toggle"
          aria-label={paused ? "Ativar animações" : "Pausar animações"}
          title={paused ? "Ativar animações" : "Pausar animações"}
          onClick={() => setPaused(!paused)}
        >
          {paused ? <Play size={14} /> : <Pause size={14} />}
        </button>
        {toastTarget ? createPortal(feedback, toastTarget) : feedback}
      </div>
    </ToastContext.Provider>
  );
}
export function Brand({
  config,
  small = false,
}: {
  config: TemplateConfig;
  small?: boolean;
}) {
  return (
    <div className={`brand ${small ? "small" : ""}`}>
      <span className="brand-mark">
        <Command size={small ? 17 : 21} />
      </span>
      <span>{config.branding.name}</span>
    </div>
  );
}
export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  return (
    <button className={`btn ${variant} ${className}`} {...props}>
      {children}
    </button>
  );
}
export function IconButton({
  label,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button className="icon-button" aria-label={label} title={label} {...props}>
      {children}
    </button>
  );
}
export const Badge = ({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: string;
}) => <span className={`badge ${tone}`}>{children}</span>;
export function Status({ value = "" }: { value?: string }) {
  return (
    <Badge
      tone={
        /ativo|confirmado|publicado|concluído|resolvido|ganho|pago|disponível|saudável/i.test(
          value,
        )
          ? "success"
          : /pendente|atenção|baixo|proposta|aguardando|andamento/i.test(value)
            ? "warning"
            : /cancelado|inativo|crítico/i.test(value)
              ? "danger"
              : "neutral"
      }
    >
      {value}
    </Badge>
  );
}
export function Avatar({
  name = "Pessoa",
  size = 34,
}: {
  name?: string;
  size?: number;
}) {
  return (
    <span
      className="avatar"
      style={{ width: size, height: size }}
      aria-label={name}
    >
      {name
        .split(" ")
        .slice(0, 2)
        .map((x) => x[0])
        .join("")}
    </span>
  );
}
export function Search({
  value,
  onChange,
  placeholder = "Buscar…",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="search">
      <SearchIcon size={17} />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </label>
  );
}
export function Tabs({
  items,
  value,
  onChange,
}: {
  items: (string | { id: string; label: string })[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="tabs" aria-label="Filtros">
      {items.map((item) => {
        const id = typeof item === "string" ? item : item.id,
          label = typeof item === "string" ? item : item.label;
        return (
          <button
            key={id}
            className={value === id ? "active" : ""}
            aria-pressed={value === id}
            onClick={() => onChange(id)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
export function AppFrame({
  config,
  nav,
  active,
  onNav,
  children,
  actions,
  title,
}: {
  config: TemplateConfig;
  nav: NavItem[];
  active: string;
  onNav: (v: string) => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
  title?: string;
}) {
  const [open, setOpen] = useState(false),
    [notifications, setNotifications] = useState(false);
  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-brand">
          <Brand config={config} />
          <IconButton
            label="Fechar menu"
            className="mobile-only"
            onClick={() => setOpen(false)}
          >
            <X size={18} />
          </IconButton>
        </div>
        <div className="workspace">
          <span className="workspace-icon">{config.branding.shortName}</span>
          <span>
            Workspace principal<small>Plano de demonstração</small>
          </span>
        </div>
        <div className="sidebar-label">ESPAÇO DE TRABALHO</div>
        <nav aria-label="Navegação principal">
          {nav.map((n) => (
            <button
              key={n.id}
              aria-current={active === n.id ? "page" : undefined}
              className={`nav-item ${active === n.id ? "active" : ""}`}
              onClick={() => {
                onNav(n.id);
                setOpen(false);
              }}
            >
              {n.icon}
              <span>{n.label}</span>
              {n.count !== undefined && <small>{n.count}</small>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="demo-note">
            <span className="live-dot" /> Ambiente de demonstração
            <small>Dados fictícios · alterações locais</small>
          </div>
          <div className="profile">
            <Avatar name="Marina Costa" />
            <div>
              Marina Costa<small>Seu espaço pessoal</small>
            </div>
          </div>
        </div>
      </aside>
      {open && (
        <button
          className="sidebar-overlay"
          aria-label="Fechar navegação"
          onClick={() => setOpen(false)}
        />
      )}
      <div className="app-area">
        <header className="app-topbar">
          <div className="inline">
            <IconButton label="Abrir menu" onClick={() => setOpen(true)}>
              <Menu size={19} />
            </IconButton>
            <span className="crumb">
              Workspace <span>/</span>{" "}
              <b>{title || nav.find((n) => n.id === active)?.label}</b>
            </span>
          </div>
          <div className="inline">
            {actions}
            <IconButton
              label="Notificações"
              onClick={() => setNotifications(true)}
            >
              <Bell size={18} />
            </IconButton>
            <Avatar name="Marina Costa" size={31} />
          </div>
        </header>
        <main className="app-main" id="main">
          {children}
        </main>
      </div>
      <Modal
        open={notifications}
        onClose={() => setNotifications(false)}
        title="Você está em dia"
      >
        <div className="empty">
          <CheckCircle2 size={38} />
          <h3>Nenhuma notificação nova</h3>
          <p>As próximas atualizações da sua operação aparecerão aqui.</p>
          <Badge>Demonstração local</Badge>
        </div>
      </Modal>
    </div>
  );
}
export function PageHead({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-head">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      <div className="head-actions">{children}</div>
    </div>
  );
}
export function Stat({
  label,
  value,
  change,
  icon,
  accent = false,
}: {
  label: string;
  value: string | number;
  change?: string;
  icon?: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <article className={`stat ${accent ? "accent-stat" : ""}`}>
      <div className="stat-label">
        {label}
        {icon && <span>{icon}</span>}
      </div>
      <strong>{value}</strong>
      {change && <small>{change}</small>}
    </article>
  );
}
export function Panel({
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      {title && (
        <div className="panel-head">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
export function Empty({
  title = "Nenhum resultado",
  text = "Tente outra busca ou adicione um novo item.",
  children,
}: {
  title?: string;
  text?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="empty">
      <SearchIcon size={32} />
      <h3>{title}</h3>
      <p>{text}</p>
      {children}
    </div>
  );
}
export function Progress({ value, label }: { value: number; label?: string }) {
  return (
    <div className="progress-wrap">
      {label && (
        <div className="between">
          <span>{label}</span>
          <b>{Math.round(value)}%</b>
        </div>
      )}
      <div
        className="progress"
        role="progressbar"
        aria-label={label || "Progresso"}
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <i style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}
export function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open) {
      d.showModal();
      const old = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        d.close();
        document.body.style.overflow = old;
      };
    } else d.close();
  }, [open]);
  return (
    <dialog
      className={`modal ${wide ? "wide" : ""}`}
      ref={ref}
      aria-labelledby={id}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) {
          const r = ref.current!.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose();
        }
      }}
    >
      <div className="modal-head">
        <h2 id={id}>{title}</h2>
        <IconButton label="Fechar" onClick={onClose}>
          <X size={20} />
        </IconButton>
      </div>
      <div className="modal-body">{open && children}</div>
    </dialog>
  );
}
export type Field = {
  name: string;
  label: string;
  type?:
    | "text"
    | "email"
    | "number"
    | "date"
    | "time"
    | "textarea"
    | "select"
    | "tel";
  options?: string[];
  value?: string | number;
  required?: boolean;
  min?: number;
  max?: number;
  placeholder?: string;
};
export function FormModal({
  open,
  onClose,
  title,
  fields,
  onSubmit,
  submit = "Salvar",
  description = "Alterações nesta demonstração ficam apenas na sessão.",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  fields: Field[];
  onSubmit: (data: Record<string, string>) => void | boolean;
  submit?: string;
  description?: string;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="muted form-intro">{description}</p>
      <form
        className="form-stack"
        onSubmit={(e) => {
          e.preventDefault();
          const data = Object.fromEntries(
            new FormData(e.currentTarget).entries(),
          ) as Record<string, string>;
          if (onSubmit(data) !== false) onClose();
        }}
      >
        {fields.map((f) => (
          <label className="field" key={f.name}>
            <span>
              {f.label}
              {f.required !== false && <small> *</small>}
            </span>
            {f.type === "textarea" ? (
              <textarea
                name={f.name}
                defaultValue={f.value}
                placeholder={f.placeholder}
                required={f.required !== false}
                rows={4}
              />
            ) : f.type === "select" ? (
              <select
                name={f.name}
                defaultValue={f.value}
                required={f.required !== false}
              >
                {f.options?.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input
                name={f.name}
                type={f.type || "text"}
                defaultValue={f.value}
                min={f.min}
                max={f.max}
                step={f.type === "number" ? "any" : undefined}
                placeholder={f.placeholder}
                required={f.required !== false}
              />
            )}
          </label>
        ))}
        <Button type="submit" className="full">
          {submit}
        </Button>
      </form>
    </Modal>
  );
}
export function ContactModal({
  config,
  open,
  onClose,
  title = "Vamos conversar",
  subject = "Novo projeto",
}: {
  config: TemplateConfig;
  open: boolean;
  onClose: () => void;
  title?: string;
  subject?: string;
}) {
  const toast = useToast();
  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={title}
      description={`Conte um pouco sobre o que você procura. Formulário demonstrativo de ${config.branding.name}; nenhum dado será enviado.`}
      fields={[
        { name: "name", label: "Seu nome" },
        { name: "email", label: "E-mail", type: "email" },
        { name: "subject", label: "Interesse", value: subject },
        { name: "message", label: "Sua mensagem", type: "textarea" },
      ]}
      submit="Simular solicitação"
      onSubmit={(d) =>
        toast(`Solicitação de ${d.name} registrada nesta demonstração.`)
      }
    />
  );
}
export function LineChart({
  values,
  labels,
  color,
  title = "Evolução no período",
}: {
  values: number[];
  labels: string[];
  color?: string;
  title?: string;
}) {
  const id = useId().replaceAll(":", "");
  const min = Math.min(0, ...values);
  const range = (Math.max(...values, 1) - min) * 1.15;
  const points = values
    .map(
      (v, i) =>
        `${32 + i * (736 / Math.max(values.length - 1, 1))},${204 - ((v - min) / range) * 170}`,
    )
    .join(" ");
  return (
    <div className="chart">
      <svg
        viewBox="0 0 800 248"
        role="img"
        aria-label={`${title}. ${values.map((v, i) => `${labels[i]}: ${v.toLocaleString("pt-BR")}`).join("; ")}`}
      >
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor={color || "var(--accent)"} stopOpacity=".24" />
            <stop
              offset="1"
              stopColor={color || "var(--accent)"}
              stopOpacity="0"
            />
          </linearGradient>
        </defs>
        {[36, 92, 148, 204].map((y) => (
          <line
            key={y}
            x1="32"
            x2="768"
            y1={y}
            y2={y}
            stroke="var(--line)"
            strokeDasharray="4 5"
          />
        ))}
        <polygon points={`32,204 ${points} 768,204`} fill={`url(#${id})`} />
        <polyline
          className="chart-line"
          fill="none"
          stroke={color || "var(--accent)"}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        {values.map((v, i) => (
          <g key={i}>
            <circle
              cx={32 + i * (736 / Math.max(values.length - 1, 1))}
              cy={204 - ((v - min) / range) * 170}
              r="4"
              fill={color || "var(--accent)"}
            >
              <title>
                {labels[i]}: {v.toLocaleString("pt-BR")}
              </title>
            </circle>
            <text
              x={32 + i * (736 / Math.max(values.length - 1, 1))}
              y="239"
              textAnchor="middle"
              fontSize="12"
              fill="var(--muted)"
            >
              {labels[i]}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
export function Bars({ items }: { items: { label: string; value: number }[] }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="bar-chart">
      {items.map((i, n) => (
        <div key={i.label} className="bar-column">
          <span>{i.value.toLocaleString("pt-BR")}</span>
          <i
            style={{
              height: `${20 + (i.value / max) * 120}px`,
              opacity: 1 - n * 0.12,
            }}
          />
          <small>{i.label}</small>
        </div>
      ))}
    </div>
  );
}
export function downloadText(
  name: string,
  content: string,
  type = "text/plain;charset=utf-8",
) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function exportCSV(
  name: string,
  headers: string[],
  rows: (string | number | undefined)[][],
) {
  const esc = (s: string | number | undefined) => {
    let v = String(s ?? "");
    if (/^[=+\-@\t\r]/.test(v)) v = "'" + v;
    return '"' + v.replaceAll('"', '""') + '"';
  };
  downloadText(
    name,
    "\uFEFF" + [headers, ...rows].map((r) => r.map(esc).join(";")).join("\r\n"),
    "text/csv;charset=utf-8",
  );
}
export function WebsiteNav({
  config,
  links,
  cta = "Entrar",
  loginHref = "/login",
  onAction,
}: {
  config: TemplateConfig;
  links: { label: string; href: string }[];
  cta?: string;
  loginHref?: string;
  onAction?: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <header className="web-header">
      <a href="#main" aria-label={`${config.branding.name}, início`}>
        <Brand config={config} />
      </a>
      <nav className={open ? "open" : ""} aria-label="Navegação">
        {links.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
            {l.label}
          </a>
        ))}
      </nav>
      <div className="web-header-actions">
        <a
          className="btn secondary web-nav-login"
          href={loginHref}
          onClick={() => {
            setOpen(false);
            onAction?.();
          }}
        >
          {cta}
        </a>
        <IconButton
          label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </IconButton>
      </div>
    </header>
  );
}
export function Footer({
  config,
  onContact,
}: {
  config: TemplateConfig;
  onContact?: () => void;
}) {
  return (
    <footer className="web-footer">
      <div>
        <Brand config={config} />
        <p>{config.branding.tagline}</p>
      </div>
      <div>
        {onContact && (
          <button className="text-button" onClick={onContact}>
            Fale com a gente
          </button>
        )}
        <small>
          Template demonstrativo · {config.branding.name}
          <br />
          Imagens ilustrativas e dados fictícios.
        </small>
      </div>
    </footer>
  );
}
export function SectionHead({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="section-head" data-reveal>
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {children}
    </div>
  );
}
export function Photo({
  name,
  alt,
  className = "",
  loading = "lazy",
}: {
  name: string;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
}) {
  return (
    <img
      src={asset(name)}
      alt={alt}
      className={`photo ${className}`}
      loading={loading}
      decoding="async"
    />
  );
}
export function FAQ({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="faq">
      {items.map((x, i) => (
        <details key={i}>
          <summary>
            {x.q}
            <Plus size={18} />
          </summary>
          <p>{x.a}</p>
        </details>
      ))}
    </div>
  );
}
export function SettingPanel({
  title = "Preferências do workspace",
}: {
  title?: string;
}) {
  const toast = useToast();
  const [email, setEmail] = useState(true),
    [digest, setDigest] = useState(false);
  return (
    <Panel title={title} subtitle="Ajuste a experiência desta sessão.">
      <form
        className="form-stack settings-form"
        onSubmit={(e) => {
          e.preventDefault();
          toast("Preferências atualizadas nesta sessão.");
        }}
      >
        <label className="field">
          <span>Nome do workspace</span>
          <input defaultValue="Workspace principal" required />
        </label>
        <label className="switch-row">
          <span>
            <b>Notificações de atividade</b>
            <small>Receber avisos dentro do painel</small>
          </span>
          <input
            type="checkbox"
            checked={email}
            onChange={(e) => setEmail(e.target.checked)}
          />
        </label>
        <label className="switch-row">
          <span>
            <b>Resumo semanal</b>
            <small>Preferência demonstrativa, sem envio de e-mails</small>
          </span>
          <input
            type="checkbox"
            checked={digest}
            onChange={(e) => setDigest(e.target.checked)}
          />
        </label>
        <Button type="submit">Salvar preferências</Button>
      </form>
    </Panel>
  );
}
export const commonNav = (
  primary: string,
  icon: React.ReactNode = <LayoutDashboard size={18} />,
): NavItem[] => [
  { id: "overview", label: primary, icon },
  { id: "settings", label: "Preferências", icon: <Settings size={18} /> },
];
export type AIFile = { id: string; name: string; kind: "pdf" | "excel"; size: string };
export function AIInstructionsPanel() {
  const toast = useToast();
  const [files, setFiles] = useState<AIFile[]>([
    { id: "f1", name: "Catálogo de serviços.pdf", kind: "pdf", size: "842 KB" },
    { id: "f2", name: "Base de preços.xlsx", kind: "excel", size: "113 KB" },
  ]);
  const [instructions, setInstructions] = useState(
    "Responda sempre em português, com tom cordial e objetivo. Priorize qualificar o contato (nome, necessidade e prazo) antes de falar de preço. Nunca prometa prazos que não constam no catálogo anexado.",
  );
  const [learning, setLearning] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    const added: AIFile[] = Array.from(list).map((f) => ({
      id: makeId(),
      name: f.name,
      kind: /xls|sheet|csv/i.test(f.type) || /\.(xlsx?|csv)$/i.test(f.name) ? "excel" : "pdf",
      size: `${Math.max(1, Math.round(f.size / 1024))} KB`,
    }));
    setFiles((prev) => [...added, ...prev]);
    toast(`${added.length} arquivo(s) enviado(s) para a IA aprender.`);
  };
  return (
    <div className="stack" style={{ gap: 22 }}>
      <Panel
        title="Instruções da IA"
        subtitle="Ensine a IA sobre o seu negócio: envie materiais e escreva instruções detalhadas de como ela deve responder."
      >
        <div className="settings-form" style={{ maxWidth: 760 }}>
          <label
            className="ai-dropzone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFiles(e.dataTransfer.files);
            }}
          >
            <UploadCloud size={28} />
            <b>Envie PDF ou Excel</b>
            <span>Arraste os arquivos aqui ou clique para selecionar (catálogos, tabelas de preço, scripts de atendimento)</span>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.xls,.xlsx,.csv"
              multiple
              hidden
              onChange={(e) => handleFiles(e.target.files)}
            />
            <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
              Selecionar arquivos
            </Button>
          </label>
          {files.length > 0 && (
            <div className="ai-file-list">
              {files.map((f) => (
                <div className="ai-file-row" key={f.id}>
                  <span className={`ai-file-icon ${f.kind}`}>
                    {f.kind === "pdf" ? <FileText size={17} /> : <FileSpreadsheet size={17} />}
                  </span>
                  <div>
                    <b>{f.name}</b>
                    <small>{f.size}</small>
                  </div>
                  <IconButton
                    label="Remover arquivo"
                    onClick={() => {
                      setFiles((prev) => prev.filter((x) => x.id !== f.id));
                      toast("Arquivo removido da base de aprendizado.");
                    }}
                  >
                    <Trash2 size={15} />
                  </IconButton>
                </div>
              ))}
            </div>
          )}
          <label className="field">
            <span>Instruções detalhadas</span>
            <textarea
              rows={6}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Explique como a IA deve se comportar, o que pode e não pode dizer, tom de voz, regras de preço, etc."
            />
          </label>
          <label className="switch-row">
            <span>
              <Brain size={16} style={{ marginRight: 8, verticalAlign: "-3px", color: "var(--accent)" }} />
              <b>Modo aprendizado</b>
              <small>
                A IA fica ativa e lê tudo que chega (mensagens e arquivos) só para aprender, mas não responde aos
                contatos enquanto este modo estiver ligado.
              </small>
            </span>
            <input
              type="checkbox"
              checked={learning}
              onChange={(e) => {
                setLearning(e.target.checked);
                toast(
                  e.target.checked
                    ? "Modo aprendizado ativado: a IA só vai estudar o conteúdo."
                    : "Modo aprendizado desativado.",
                );
              }}
            />
          </label>
          <label className="switch-row">
            <span>
              <b>Habilitar IA nas conversas</b>
              <small>
                {learning
                  ? "Desligue o modo aprendizado para poder habilitar as respostas automáticas."
                  : "Quando ativado, a IA passa a responder os contatos usando o que aprendeu."}
              </small>
            </span>
            <input
              type="checkbox"
              checked={enabled}
              disabled={learning}
              onChange={(e) => {
                setEnabled(e.target.checked);
                toast(
                  e.target.checked
                    ? "IA habilitada: agora ela responde nas conversas."
                    : "IA desabilitada nas conversas.",
                );
              }}
            />
          </label>
          <div className="inline">
            <Badge tone={learning ? "warning" : enabled ? "success" : "neutral"}>
              {learning ? "Somente aprendendo" : enabled ? "Ativa nas conversas" : "Pausada"}
            </Badge>
            <Button
              type="button"
              onClick={() => toast("Instruções e arquivos salvos para a IA.")}
            >
              Salvar instruções
            </Button>
          </div>
        </div>
      </Panel>
    </div>
  );
}
export type Connection = {
  id: "meta" | "google";
  name: string;
  description: string;
  connected: boolean;
  account?: string;
};
export function IntegrationsPanel() {
  const toast = useToast();
  const [connections, setConnections] = useState<Connection[]>([
    {
      id: "meta",
      name: "Meta Ads",
      description: "Instagram e Facebook Ads — importe leads e acompanhe campanhas direto no painel.",
      connected: false,
    },
    {
      id: "google",
      name: "Google Ads",
      description: "Conecte sua conta para acompanhar custo por lead e origem das conversas.",
      connected: false,
    },
  ]);
  const [connectingId, setConnectingId] = useState<Connection["id"] | null>(null);
  const connecting = connections.find((c) => c.id === connectingId) || null;
  const disconnect = (id: Connection["id"]) => {
    const target = connections.find((c) => c.id === id);
    setConnections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, connected: false, account: undefined } : c)),
    );
    toast(`${target?.name} desconectado.`);
  };
  return (
    <>
      <Panel
        title="Conexões de anúncios"
        subtitle="Conecte suas contas de mídia paga para a IA considerar a origem dos contatos."
      >
        <div className="settings-form" style={{ maxWidth: 760 }}>
          {connections.map((c) => (
            <div className="connection-row" key={c.id}>
              <span className={`connection-icon ${c.id}`}>
                {c.id === "meta" ? <Megaphone size={19} /> : <TargetIcon size={19} />}
              </span>
              <div>
                <div className="inline">
                  <b>{c.name}</b>
                  <Status value={c.connected ? "Conectado" : "Não conectado"} />
                </div>
                <p>{c.description}</p>
                {c.connected && c.account && <small>Conta conectada: {c.account}</small>}
              </div>
              {c.connected ? (
                <Button type="button" variant="ghost" onClick={() => disconnect(c.id)}>
                  <Unlink size={15} /> Desconectar
                </Button>
              ) : (
                <Button type="button" variant="secondary" onClick={() => setConnectingId(c.id)}>
                  <Link2 size={15} /> Conectar
                </Button>
              )}
            </div>
          ))}
        </div>
      </Panel>
      <FormModal
        open={!!connecting}
        onClose={() => setConnectingId(null)}
        title={connecting ? `Conectar ${connecting.name}` : "Conectar conta"}
        description={
          connecting?.id === "meta"
            ? "Informe os dados da sua conta de anúncios do Meta (Facebook/Instagram) para liberar a integração."
            : "Informe os dados da sua conta Google Ads para liberar a integração."
        }
        submit="Conectar conta"
        fields={
          connecting?.id === "meta"
            ? [
                { name: "appId", label: "ID do aplicativo (App ID)" },
                { name: "accessToken", label: "Token de acesso" },
                { name: "adAccountId", label: "ID da conta de anúncios" },
              ]
            : [
                { name: "customerId", label: "ID do cliente (Customer ID)" },
                { name: "developerToken", label: "Token de desenvolvedor" },
                { name: "email", label: "E-mail da conta Google Ads", type: "email" },
              ]
        }
        onSubmit={(d) => {
          const id = connecting?.id;
          if (!id) return;
          const label = id === "meta" ? d.adAccountId || d.appId : d.email || d.customerId;
          setConnections((prev) =>
            prev.map((c) => (c.id === id ? { ...c, connected: true, account: label } : c)),
          );
          toast(`${connecting?.name} conectado com sucesso.`);
          setConnectingId(null);
        }}
      />
    </>
  );
}
