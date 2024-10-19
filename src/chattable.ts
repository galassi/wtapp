// Helper function per pulire il contenuto di una tabella
export function clearTableContent(table: HTMLTableElement): void {
  for (let row of table.rows) {
    row.cells[0].textContent = ""; // Reset colonna sinistra (alleati)
    row.cells[1].textContent = ""; // Reset colonna destra (nemici)
  }
}

// Helper function per popolare una tabella specifica
export function populateTable(tableId: string, allies: string[], enemies: string[]): void {
  const table = document.querySelector(`#${tableId}`) as HTMLTableElement | null;

  if (!table) {
    console.error(`Tabella con ID ${tableId} non trovata.`);
    return;
  }

  // Reset del contenuto della tabella
  clearTableContent(table);

  // Controlla se ci sono righe sufficienti nella tabella
  const rows = table.rows.length;

  // Popola la colonna di sinistra con gli alleati
  allies.forEach((ally, index) => {
      if (index < rows) {
          table.rows[index].cells[0].textContent = ally; // Popola la colonna sinistra (alleati)
      }
  });

  // Popola la colonna di destra con i nemici
  enemies.forEach((enemy, index) => {
      if (index < rows) {
          table.rows[index].cells[1].textContent = enemy; // Popola la colonna destra (nemici)
      }
  });
}
