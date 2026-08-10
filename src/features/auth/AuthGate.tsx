import { useState, type FormEvent } from "react";
import { supabase, supabaseConfigured } from "../../lib/supabase/client";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import "./AuthGate.css";

type Mode = "signIn" | "signUp";

export function AuthGate() {
  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      if (mode === "signIn") {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setInfo("Conta criada. Confira seu e-mail para confirmar antes de entrar.");
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      setError(
        message.includes("fetch")
          ? "Sem conexão com o servidor. Confira sua internet e tente de novo."
          : message || "Não foi possível entrar.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="cerne-auth-gate">
      <form className="cerne-auth-gate__card" onSubmit={handleSubmit}>
        <span className="text-h2">Cerne</span>
        <p className="text-body-small">
          {mode === "signIn" ? "Entre para sincronizar seus dados." : "Crie sua conta."}
        </p>

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
        <Input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-label="Senha"
          autoComplete={mode === "signIn" ? "current-password" : "new-password"}
        />

        {error && <p className="cerne-auth-gate__error">{error}</p>}
        {info && <p className="cerne-auth-gate__info">{info}</p>}

        <Button type="submit" variant="primary" disabled={busy}>
          {mode === "signIn" ? "Entrar" : "Criar conta"}
        </Button>

        <button
          type="button"
          className="cerne-auth-gate__toggle"
          onClick={() => {
            setMode((m) => (m === "signIn" ? "signUp" : "signIn"));
            setError(null);
            setInfo(null);
          }}
        >
          {mode === "signIn" ? "Não tem conta? Criar conta" : "Já tem conta? Entrar"}
        </button>
      </form>
    </div>
  );
}
