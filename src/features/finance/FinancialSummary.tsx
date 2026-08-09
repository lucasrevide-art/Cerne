import { useMemo } from "react";
import type { Task } from "../../types";
import "./FinancialSummary.css";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

interface FinancialSummaryProps {
  tasks: Task[];
}

/**
 * Resumo sobre o mesmo dado — não é uma entidade contábil separada
 * (seção 8 do documento de produto). Só aparece quando a área/projeto
 * tem pelo menos uma tarefa do tipo financeiro.
 */
export function FinancialSummary({ tasks }: FinancialSummaryProps) {
  const financialTasks = useMemo(
    () => tasks.filter((t) => t.type === "financial" && t.status === "open"),
    [tasks],
  );

  const total = financialTasks.reduce((sum, t) => sum + (t.amount ?? 0), 0);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const task of financialTasks) {
      const key = task.category || "Sem categoria";
      map.set(key, (map.get(key) ?? 0) + (task.amount ?? 0));
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [financialTasks]);

  if (financialTasks.length === 0) return null;

  return (
    <div className="cerne-financial-summary">
      <div className="cerne-financial-summary__total">
        <span className="text-caption">Total pendente</span>
        <span className="cerne-financial-summary__total-value">
          {currencyFormatter.format(total)}
        </span>
      </div>
      {byCategory.length > 0 && (
        <div className="cerne-financial-summary__categories">
          {byCategory.map(([category, amount]) => (
            <div key={category} className="cerne-financial-summary__category">
              <span>{category}</span>
              <span>{currencyFormatter.format(amount)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
