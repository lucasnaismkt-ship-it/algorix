import { useStore } from './store';

export const fmtUSD = (usd: number) =>
  `$${usd.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const fmtBRL = (usd: number): string | null => {
  const rate = useStore.getState().conversionRate;
  if (rate === null) return null;
  return `R$\u00a0${(usd * rate).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const fmtBRLRaw = (brl: number): string | null => {
  const rate = useStore.getState().conversionRate;
  if (rate === null) return null;
  return `R$\u00a0${brl.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
