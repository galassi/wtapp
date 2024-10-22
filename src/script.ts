export let stringArray: string[] = new Array(8).fill("");
let currentIndex: number = 0;

// Function to update the display of the third table based on the array
function updateTableDisplay(): void {
  stringArray.forEach((value: string, index: number) => {
    const cell = document.querySelector(`#table3 tr:nth-child(${index + 1}) td`) as HTMLTableCellElement | null;
    if (cell) {
      cell.textContent = value;
    }
  });
}

// Get elements and ensure they are of the correct type
const submitButton = document.querySelector('#submit-button') as HTMLButtonElement | null;
const inputField = document.querySelector('#input-field') as HTMLInputElement | null;
const resetButton = document.querySelector('#reset-button') as HTMLButtonElement | null;

// Import fetchChatData and resetFilteredIds from chat.ts
import { fetchChatData, resetFilteredIds } from './chat';

// Function to handle form submission
function handleSubmit() {
  const inputValue: string = inputField?.value.trim() ?? "";

  if (inputValue !== "") {
    // Add input value to the array
    stringArray[currentIndex] = inputValue;

    // Update the display of the table
    updateTableDisplay();

    // Clear the input field
    if (inputField) inputField.value = "";

    // Move to the next index, wrapping around when needed
    currentIndex = (currentIndex + 1) % stringArray.length;

    // Update the button text to show the current position in the array
    if (submitButton) submitButton.textContent = `Submit (${currentIndex})`;

    // Optionally, fetch new chat data when all allies are entered
    if (currentIndex === 0) {
      fetchChatData().then((opponentData) => {
        console.log('Dati aggiornati dopo submit:', opponentData);
      }).catch(error => {
        console.error('Errore nel fetch della chat dopo submit:', error);
      });
    }
  }
}

// Add click event listener to the submit button
if (submitButton) {
  submitButton.addEventListener('click', handleSubmit);
} else {
  console.error("Submit button is missing from the DOM.");
}

// Add keydown event listener to the input field for "Enter" key
if (inputField) {
  inputField.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevents the form from submitting if it's inside a form tag
      handleSubmit();
    }
  });
} else {
  console.error("Input field is missing from the DOM.");
}

// Add event listener for reset button
if (resetButton) {
  resetButton.addEventListener('click', () => {
    // Step 1: Reset the array and current index
    stringArray.fill("");
    currentIndex = 0;

    // Reset filtered IDs
    resetFilteredIds();

    // Step 2: Reset the submit button text
    if (submitButton) {
      submitButton.textContent = `Submit (0)`;
    }

    // Step 3: Update the display of the table
    updateTableDisplay();

    // Step 4: Prompt user to re-enter allies' names
    for (let i = 0; i < 8; i++) {
      const allyName = prompt(`Inserisci il nome dell'alleato ${i + 1}:`);
      if (allyName) {
        stringArray[i] = allyName.trim();
      }
    }

    // Step 5: Check if all allies were entered
    if (stringArray.every(name => name !== "")) {
      // Call fetchChatData after allies are populated
      fetchChatData().then((opponentData) => {
        console.log('Dati della chat aggiornati dopo il reset:', opponentData);
      }).catch(error => {
        console.error('Errore nel fetch dei dati della chat dopo il reset:', error);
      });
    } else {
      console.error('Non sono stati inseriti tutti gli 8 alleati.');
    }
  });
} else {
  console.error("Reset button is missing from the DOM.");
}

// Initial display update
updateTableDisplay();
