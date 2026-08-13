import { useState, type FormEvent } from "react";
import { useChangePasswordPanelStore } from "../../store/changePasswordPanelStore";
import { supabase } from "../../lib/supabase/client";
import { Overlay } from "../../components/Overlay";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import "./ChangePasswordPanel.css";

/**
 * Define/troca a senha com o usuário já logado — sem depender de e-mail ou
 * link de recuperação. Útil sobretudo pra quem entrou via magic link e
 * nunca chegou a ter uma senha de verdade.
 */
export function ChangePasswordPanel() {
  const isOpen = useChangePasswordPanelStore((s) => s.isOpen);
  const close = useChangePasswordPanelStore((s) => s.close);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus(null);
    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As duas senhas não são iguais.");
      return;
    }
    setBusy(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setStatus("Senha definida com sucesso. Use ela pra entrar em qualquer navegador/dispositivo.");
      setPassword("");
      setConfirm("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar a senha.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Overlay onClose={close} label="Trocar senha">
      <form className="cerne-change-password" onSubmit={handleSubmit}>
        <h2 className="text-h2">Trocar senha</h2>
        <p className="text-body-small">
          Define uma senha nova pra essa conta — passa a valer em qualquer navegador ou
          dispositivo onde você entrar com o mesmo e-mail.
        </p>

        <Input
          type="password"
          autoFocus
          placeholder="Nova senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-label="Nova senha"
          autoComplete="new-password"
        />
        <Input
          type="password"
          placeholder="Confirmar nova senha"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          aria-label="Confirmar nova senha"
          autoComplete="new-password"
        />

        {error && <p className="cerne-change-password__error">{error}</p>}
        {status && <p className="cerne-change-password__status">{status}</p>}

        <Button type="submit" variant="primary" disabled={busy}>
          Salvar nova senha
        </Button>
      </form>
    </Overlay>
  );
}
