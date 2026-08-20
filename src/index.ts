// ============================================
// ENTRY POINT — Orquesta todo el flujo
// ============================================

import { readCampaigns } from './reader.js';
import { filterByChannel, calculateSummary } from './processor.js';
import { writeReport } from './writer.js';
import type { Report } from './types.js';

async function main(): Promise<void> {
  try {
    // 1. Parsear el argumento --channel desde process.argv
    const args = process.argv.slice(2);
    const channelIndex = args.indexOf('--channel');
    const channelFilter: string | null =
      channelIndex !== -1 ? args[channelIndex + 1] : null;

    // 2. Leer los datos
    const allCampaigns = await readCampaigns();

    // 3. Filtrar por canal (lanza error si el canal no existe)
    const campaigns = filterByChannel(allCampaigns, channelFilter);

    // 4. Calcular el resumen
    const summary = calculateSummary(campaigns);

    // 5. Construir el reporte
    const report: Report = {
      generatedAt: new Date().toISOString(),
      appliedFilter: channelFilter,
      summary,
      campaigns,
    };

    // 6. Imprimir resumen en consola
    console.log('=== Reporte de Campañas ===');
    if (channelFilter) {
      console.log(`Filtro aplicado: channel = "${channelFilter}"`);
    }
    console.log(`Total campañas:        ${summary.total}`);
    console.log(`Activas / Inactivas:   ${summary.active} / ${summary.inactive}`);
    console.log(`Presupuesto promedio:  $${summary.averageBudget.toFixed(2)}`);
    console.log(`Canales:               ${summary.channels.join(', ')}`);
    console.log(`\n💰 Mayor presupuesto:   ${summary.mostExpensive.name} ($${summary.mostExpensive.budget.toFixed(2)})`);
    console.log(`💸 Menor presupuesto:   ${summary.cheapest.name} ($${summary.cheapest.budget.toFixed(2)})`);

    // 7. Escribir el reporte en disco
    await writeReport(report);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();