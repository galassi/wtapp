// Helper function per pulire il contenuto di una tabella
export function clearTableContent(table: HTMLTableElement): void {
  for (let row of table.rows) {
    if (row.cells.length > 0) {
      row.cells[0].textContent = ""; // Reset colonna sinistra (alleati o nemici)
    }
    if (row.cells.length > 1) {
      row.cells[1].textContent = ""; // Reset colonna destra (opzionale, se ci sono due colonne)
    }
  }
}

// Helper function per popolare una tabella specifica
export function populateTable(tableId: string, allies: string[], enemies: string[]): void {
  const table = document.querySelector(`#${tableId}`) as HTMLTableElement | null;

  if (!table) {
    console.error(`Tabella con ID ${tableId} non trovata.`);
    return;
  }

  // Pulisce la tabella prima di aggiornarla
  clearTableContent(table);

  console.log(`Popolazione della tabella con ID: ${tableId}`);
  console.log("Alleati:", allies);
  console.log("Nemici:", enemies);

  const rows = table.rows.length;

  // Logica specifica per la tabella "table3"
  if (tableId === 'table3') {
    // Popola solo con i nemici nella colonna sinistra
    enemies.forEach((enemy, index) => {
      if (index < rows && table.rows[index].cells.length > 0) {
        table.rows[index].cells[0].textContent = enemy; // Popola la colonna sinistra con i nemici
      }
    });
  } else {
    // Popola la colonna di sinistra con gli alleati, se esistono
    allies.forEach((ally, index) => {
      if (index < rows && table.rows[index].cells.length > 0) {
        table.rows[index].cells[0].textContent = ally; // Popola la colonna sinistra (alleati)
      }
    });

    // Popola la colonna di destra con i nemici
    enemies.forEach((enemy, index) => {
      if (index < rows && table.rows[index].cells.length > 1) {
        table.rows[index].cells[1].textContent = enemy; // Popola la colonna destra (nemici)
      }
    });
  }
}

