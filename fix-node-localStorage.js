/**
 * Fix para Node.js v25 localStorage experimental quebrado
 * Este script remove o localStorage mal implementado do Node v25
 */

// Verificar se estamos no servidor (Node.js)
if (typeof window === "undefined") {
  // Verificar se localStorage existe mas está quebrado
  if (typeof globalThis.localStorage !== "undefined") {
    try {
      // Testar se getItem existe
      if (typeof globalThis.localStorage.getItem === "undefined") {
        console.log(
          "🔧 Removendo localStorage experimental quebrado do Node.js v25..."
        );
        delete globalThis.localStorage;
        console.log("✅ localStorage removido com sucesso");
      }
    } catch {
      // Se der erro ao acessar, também remover
      delete globalThis.localStorage;
    }
  }
}
