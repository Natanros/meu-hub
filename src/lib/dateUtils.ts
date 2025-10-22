/**
 * Retorna a data atual no formato YYYY-MM-DD considerando o fuso horário local
 * Evita o problema de new Date().toISOString() que usa UTC
 */
export function getCurrentDateLocal(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Formata uma data para o formato YYYY-MM-DD considerando o fuso horário local
 */
export function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Adiciona dias a uma data mantendo o fuso horário local
 */
export function addDaysLocal(date: Date, days: number): string {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return formatDateLocal(newDate);
}

/**
 * Retorna o primeiro e último dia do mês atual no formato YYYY-MM-DD
 */
export function getCurrentMonthRange(): { start: string; end: string } {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  return {
    start: formatDateLocal(firstDay),
    end: formatDateLocal(lastDay),
  };
}

/**
 * Retorna o primeiro e último dia do próximo mês no formato YYYY-MM-DD
 */
export function getNextMonthRange(): { start: string; end: string } {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 2, 0);

  return {
    start: formatDateLocal(firstDay),
    end: formatDateLocal(lastDay),
  };
}

/**
 * Retorna o primeiro e último dia do ano atual no formato YYYY-MM-DD
 */
export function getCurrentYearRange(): { start: string; end: string } {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), 0, 1);
  const lastDay = new Date(today.getFullYear(), 11, 31);

  return {
    start: formatDateLocal(firstDay),
    end: formatDateLocal(lastDay),
  };
}
