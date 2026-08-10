import { useState, type FormEvent } from "react";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import "./PasswordGate.css";

/**
 * Tela de senha simples — não é autenticação de verdade (o valor fica no
 * bundle público, então dá pra descobrir inspecionando o código). Serve só
 * pra afastar quem chega no link por acaso, não pra proteger dado sensível.
 */
const APP_PASSWORD = import.meta.env.VITE_CERNE_PASSWORD ?? "cerne123";
const UNLOCK_KEY = "cerne-unlocked";

export function isUnlocked(): boolean {
  return localStorage.getItem(UNLOCK_KEY) === "true";
}

interface PasswordGateProps {
  onUnlock: () => void;
}

export function PasswordGate({ onUnlock }: PasswordGateProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (value === APP_PASSWORD) {
      localStorage.setItem(UNLOCK_KEY, "true");
      onUnlock();
    } else {
      setError(true);
    }
  }

  return (
    <div className="cerne-password-gate">
      <form className="cerne-password-gate__card" onSubmit={handleSubmit}>
        <span className="text-h2">Cerne</span>
        <p className="text-body-small">Digite a senha para entrar.</p>
        <Input
          type="password"
          autoFocus
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(false);
          }}
          aria-label="Senha"
          aria-invalid={error}
          error={error}
        />
        {error && <p className="cerne-password-gate__error">Senha incorreta.</p>}
        <Button type="submit" variant="primary">
          Entrar
        </Button>
      </form>
    </div>
  );
}
