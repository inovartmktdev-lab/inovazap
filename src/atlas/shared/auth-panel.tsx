import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import type { TemplateConfig } from "../types";
import { Brand, Button, Photo, useToast } from "./ui";

export function AuthPanel({
  config,
  onEnter,
  imageSrc,
}: {
  config: TemplateConfig;
  onEnter: () => void;
  imageSrc?: string;
}) {
  const [show, setShow] = useState(false);
  const [savePassword, setSavePassword] = useState(true);
  const [keepConnected, setKeepConnected] = useState(true);
  const toast = useToast();

  return (
    <main id="main" className="auth-layout">
      <section className="auth-visual">
        <Photo
          name={imageSrc || config.content.heroImage}
          alt={config.content.heroAlt || `Imagem de ${config.branding.name}`}
          loading="eager"
        />
        <div className="auth-visual-top">
          <Brand config={config} />
          <span>{config.branding.tagline}</span>
        </div>
        <div className="auth-visual-copy">
          <h1>{config.content.headline}</h1>
          <p>{config.content.visualDescription || config.content.description}</p>
          <div className="auth-visual-bottom">
            <span>{config.content.visualFooter || config.branding.tagline}</span>
          </div>
        </div>
      </section>
      <section className="auth-form-side">
        <div className="auth-mobile-brand">
          <Brand config={config} />
        </div>
        <div className="auth-box">
          <div className="auth-icon">
            <LockKeyhole size={24} />
          </div>
          <span className="eyebrow">{config.content.eyebrow}</span>
          <h2>{config.content.loginTitle || "Acesse sua conta"}</h2>
          <p>{config.content.description}</p>
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              toast("Entrada demonstrativa, sem autenticação real.");
              onEnter();
            }}
          >
            <label className="field">
              <span>Seu e-mail</span>
              <input
                type="email"
                autoComplete="email"
                placeholder="voce@exemplo.com"
                required
              />
            </label>
            <label className="field">
              <span>Senha</span>
              <div className="password-wrap">
                <input
                  type={show ? "text" : "password"}
                  aria-label="Senha"
                  autoComplete="current-password"
                  placeholder="Sua senha"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  aria-label={show ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
            <div className="auth-options">
              <label>
                <input
                  type="checkbox"
                  checked={savePassword}
                  onChange={(e) => setSavePassword(e.target.checked)}
                />
                Salvar senha
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={keepConnected}
                  onChange={(e) => setKeepConnected(e.target.checked)}
                />
                Continuar conectado
              </label>
            </div>
            <Button type="submit" className="full">
              Entrar
            </Button>
          </form>
          <div className="auth-demo">
            <ShieldCheck size={17} />
            <p>
              Ambiente de demonstração. Sem autenticação real ou
              armazenamento de senhas.
            </p>
          </div>
        </div>
        <div className="auth-bottom">
          <span>© {config.branding.name}</span>
          <span>{config.branding.tagline}</span>
        </div>
      </section>
    </main>
  );
}
