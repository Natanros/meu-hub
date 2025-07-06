// Script de teste para transações parceladas
const testInstallments = async () => {
  try {
    console.log("🧪 Testando criação de transação parcelada via IA...");

    const response = await fetch("http://localhost:3001/api/ia-transacao", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: "200 reais no mercado em três vezes",
        metas: [],
      }),
    });

    const result = await response.json();
    console.log("📊 Resposta da API IA:", JSON.stringify(result, null, 2));

    if (result.isInstallment && result.needsMultipleTransactions) {
      console.log("✅ Parcelas detectadas! Simulando criação pelo frontend...");

      const installments = result.transaction.installments;
      const today = new Date();
      let successCount = 0;

      // Simular o que o VoiceTextInput faz
      for (let i = 0; i < installments; i++) {
        const installmentDate = new Date(today);
        // Primeira parcela no próximo mês, demais nos meses seguintes
        installmentDate.setMonth(installmentDate.getMonth() + i + 1);
        installmentDate.setDate(1); // Primeiro dia do mês

        const installmentTransaction = {
          ...result.transaction,
          description: `${result.transaction.description} - Parcela ${
            i + 1
          }/${installments}`,
          date: installmentDate.toISOString().split("T")[0],
          installments: installments,
          recurrence: "monthly",
        };

        // Remove campos desnecessários
        delete installmentTransaction.needsMultipleTransactions;
        delete installmentTransaction.isInstallment;

        console.log(
          `� Criando parcela ${i + 1}: ${
            installmentTransaction.description
          } - R$ ${installmentTransaction.amount} em ${
            installmentTransaction.date
          }`
        );

        const transactionResponse = await fetch(
          "http://localhost:3001/api/transactions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(installmentTransaction),
          }
        );

        if (transactionResponse.ok) {
          successCount++;
          console.log(`  ✅ Parcela ${i + 1} criada com sucesso`);
        } else {
          console.error(
            `  ❌ Erro ao criar parcela ${i + 1}:`,
            await transactionResponse.text()
          );
        }
      }

      console.log(
        `\n🎉 ${successCount}/${installments} parcelas criadas com sucesso!`
      );
    } else {
      console.log("❌ Parcelas não foram detectadas");
    }

    // Aguardar um pouco e buscar transações
    setTimeout(async () => {
      console.log("\n🔍 Buscando todas as transações após criação...");
      const transactionsResponse = await fetch(
        "http://localhost:3001/api/transactions"
      );
      const transactions = await transactionsResponse.json();
      console.log(`� Total de transações: ${transactions.length}`);

      // Transações futuras (próximos pagamentos)
      const futureTransactions = transactions.filter((t) => {
        const txDate = new Date(t.date);
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Zerar horas para comparação correta
        return txDate >= now && t.type === "expense";
      });
      console.log(`🔮 Próximos pagamentos: ${futureTransactions.length}`);

      if (futureTransactions.length > 0) {
        console.log("📋 Próximos pagamentos:");
        futureTransactions
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .forEach((tx) => {
            console.log(`  - ${tx.description}: R$ ${tx.amount} em ${tx.date}`);
          });
      }
    }, 1000);
  } catch (error) {
    console.error("❌ Erro no teste:", error);
  }
};

testInstallments();
