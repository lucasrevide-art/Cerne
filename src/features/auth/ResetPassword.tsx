import { useState, type FormEvent } from "react";
import { supabase } from "../../lib/supabase/client";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import "./AuthGate.css";

interface ResetPasswordProps {
  onDone: () => void;
}

/** Mostrada quando o link de "esqueci minha senha" do e-mail traz o usuário de volta ao app. */
export function ResetPassword({ onDone }: ResetPasswordProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar a nova senha.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="cerne-auth-gate">
      <form className="cerne-auth-gate__card" onSubmit={handleSubmit}>
        <span className="text-h2">Cerne</span>
        <p className="text-body-small">Defina sua nova senha.</p>

        <Input
          type="password"
          autoFocus
          placeholder="Nova senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-label="Nova senha"
          autoComplete="new-password"
        />

        {error && <p className="cerne-auth-gate__error">{error}</p>}

        <Button type="submit" variant="primary" disabled={busy}>
          Salvar nova senha
        </Button>
      </form>
    </div>
  );
}
