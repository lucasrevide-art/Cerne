import { useState, type FormEvent } from "react";
import { supabase, supabaseConfigured } from "../../lib/supabase/client";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import "./AuthGate.css";

type Mode = "signIn" | "signUp" | "forgotPassword";

function friendlyError(err: unknown): string {
  const message = err instanceof Error ? err.message : "";
  if (message.includes("fetch")) {
    return "Sem conexão com o servidor. Confira sua internet e tente de novo.";
  }
  return message || "Algo deu errado.";
}

export function AuthGate() {
  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setInfo(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      if (mode === "signIn") {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      } else if (mode === "signUp") {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setInfo("Conta criada. Confira seu e-mail para confirmar antes de entrar.");
        }
      } else {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (resetError) throw resetError;
        setInfo("Enviamos um link de redefinição para o seu e-mail.");
      }
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  const title =
    mode === "signIn" ? "Entre para sincronizar seus dados." : mode === "signUp" ? "Crie sua conta." : "Digite seu e-mail para redefinir a senha.";

  return (
    <div className="cerne-auth-gate">
      <form className="cerne-auth-gate__card" onSubmit={handleSubmit}>
        <span className="text-h2">Cerne</span>
        <p className="text-body-small">{title}</p>

        {!supabaseConfigured && (
          <p className="cerne-auth-gate__error">
            Supabase não está configurado (faltam as variáveis de ambiente).
          </p>
        )}

        <Input
          type="email"
          autoFocus
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="E-mail"
          autoComplete="email"
        />
        {mode !== "forgotPassword" && (
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-label="Senha"
            autoComplete={mode === "signIn" ? "current-password" : "new-password"}
          />
        )}

        {error && <p className="cerne-auth-gate__error">{error}</p>}
        {info && <p className="cerne-auth-gate__info">{info}</p>}

        <Button type="submit" variant="primary" disabled={busy}>
          {mode === "signIn" ? "Entrar" : mode === "signUp" ? "Criar conta" : "Enviar link"}
        </Button>

        {mode === "signIn" && (
          <button type="button" className="cerne-auth-gate__toggle" onClick={() => switchMode("forgotPassword")}>
            Esqueci minha senha
          </button>
        )}

        <button
          type="button"
          className="cerne-auth-gate__toggle"
          onClick={() => switchMode(mode === "signIn" ? "signUp" : "signIn")}
        >
          {mode === "signUp" ? "Já tem conta? Entrar" : "Não tem conta? Criar conta"}
        </button>
      </form>
    </div>
  );
}
