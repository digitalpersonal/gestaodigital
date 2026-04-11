
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Client, PaymentLog, ExternalSystem, PaymentStatus, Expense } from "../types";

export const generateMonthlyReport = (
  clients: Client[],
  payments: PaymentLog[],
  systems: ExternalSystem[],
  expenses: Expense[] = []
) => {
  const doc = new jsPDF();
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  // 1. Filtragem de dados do mês corrente
  const monthlyPayments = payments.filter(p => {
    const d = new Date(p.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  // 2. Agregação de Totais de Receita
  const totalPaid = monthlyPayments
    .filter(p => p.status === PaymentStatus.PAID)
    .reduce((acc, p) => acc + p.amount, 0);

  const totalPending = monthlyPayments
    .filter(p => p.status === PaymentStatus.PENDING)
    .reduce((acc, p) => acc + p.amount, 0);

  const totalFailed = monthlyPayments
    .filter(p => p.status === PaymentStatus.FAILED)
    .reduce((acc, p) => acc + p.amount, 0);

  // 3. Design do Cabeçalho
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.rect(0, 0, 210, 45, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Digital Freeshop", 15, 22);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Relatório Detalhado de Receitas e Cobranças", 15, 32);
  doc.text(`Período: ${monthNames[currentMonth]} de ${currentYear}`, 15, 38);
  doc.text(`Emitido em: ${now.toLocaleDateString("pt-BR")}`, 145, 38);

  // 4. Seção: Resumo Financeiro
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Resumo do Mês", 15, 60);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  doc.text(`Total Recebido (Confirmado):`, 15, 70);
  doc.setFont("helvetica", "bold");
  doc.text(`R$ ${totalPaid.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, 75, 70);
  
  doc.setFont("helvetica", "normal");
  doc.text(`Total Pendente (Previsto):`, 15, 77);
  doc.setTextColor(180, 83, 9); // Amber 700
  doc.text(`R$ ${totalPending.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, 75, 77);
  
  doc.setTextColor(30, 41, 59);
  doc.text(`Total Falho (Inadimplência):`, 15, 84);
  doc.setTextColor(220, 38, 38); // Red 600
  doc.text(`R$ ${totalFailed.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, 75, 84);

  // 5. Tabela: Totais por Sistema
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Receitas por Sistema", 15, 100);

  const systemsData = systems.map(sys => {
    const sysPayments = monthlyPayments.filter(p => p.systemId === sys.id);
    const paid = sysPayments.filter(p => p.status === PaymentStatus.PAID).reduce((acc, p) => acc + p.amount, 0);
    const pending = sysPayments.filter(p => p.status === PaymentStatus.PENDING || p.status === PaymentStatus.FAILED).reduce((acc, p) => acc + p.amount, 0);
    return [
      sys.name,
      `R$ ${paid.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      `R$ ${pending.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      `${sysPayments.length} Transações`
    ];
  });

  (doc as any).autoTable({
    startY: 105,
    head: [["Sistema", "Valor Pago", "Valor Em Aberto", "Volume"]],
    body: systemsData,
    theme: "striped",
    headStyles: { fillColor: [79, 70, 229], fontSize: 10 },
    styles: { fontSize: 9 }
  });

  // 6. Seção: Inadimplência
  const nextY = (doc as any).lastAutoTable.cursor.y + 20;
  doc.setTextColor(220, 38, 38);
  doc.setFontSize(14);
  doc.text("Gestão de Inadimplência (Pendentes/Falhos)", 15, nextY);

  const issuePayments = monthlyPayments
    .filter(p => p.status === PaymentStatus.PENDING || p.status === PaymentStatus.FAILED)
    .map(p => {
      const client = clients.find(c => c.id === p.clientId);
      const system = systems.find(s => s.id === p.systemId);
      return [
        client?.name || "Desconhecido",
        system?.name || "N/A",
        `R$ ${p.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
        p.status === PaymentStatus.FAILED ? "FALHOU" : "PENDENTE",
        new Date(p.date).toLocaleDateString("pt-BR")
      ];
    });

  if (issuePayments.length > 0) {
    (doc as any).autoTable({
      startY: nextY + 5,
      head: [["Cliente", "Sistema", "Valor", "Status", "Vencimento"]],
      body: issuePayments,
      theme: "grid",
      headStyles: { fillColor: [220, 38, 38], fontSize: 10 },
      styles: { fontSize: 8 },
      columnStyles: {
        3: { fontStyle: 'bold' }
      }
    });
  } else {
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(10);
    doc.text("Parabéns! Não há pagamentos pendentes ou falhos para este período.", 15, nextY + 12);
  }

  // 7. Rodapé
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Página ${i} de ${pageCount} - Desenvolvido por Multiplus (Silvio T. de Sá Filho)`,
      105,
      285,
      { align: "center" }
    );
  }

  const fileName = `Relatorio_Financeiro_${monthNames[currentMonth]}_${currentYear}.pdf`;
  doc.save(fileName);
};
