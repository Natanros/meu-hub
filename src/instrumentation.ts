/**
 * Instrumentação do Next.js
 * Fix para Node.js v25 que tem localStorage experimental quebrado
 */

export async function register() {
  if (typeof window === "undefined") {
    // Deletar o localStorage quebrado do Node v25
    if (
      typeof localStorage !== "undefined" &&
      typeof localStorage.getItem === "undefined"
    ) {
      console.log(
        "🔧 Removendo localStorage experimental quebrado do Node.js v25"
      );
      // @ts-expect-error - Deletando localStorage experimental do Node v25
      delete globalThis.localStorage;
    }
  }
}
