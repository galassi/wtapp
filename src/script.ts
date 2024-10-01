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

if (submitButton && inputField) {
  submitButton.addEventListener('click', () => {
    const inputValue: string = inputField.value.trim();

    if (inputValue !== "") {
      // Add input value to the array
      stringArray[currentIndex] = inputValue;

      // Update the display of the table
      updateTableDisplay();

      // Clear the input field
      inputField.value = "";

      // Move to the next index, wrapping around when needed
      currentIndex = (currentIndex + 1) % stringArray.length;

      // Update the button text to show the current position in the array
      submitButton.textContent = `Submit (${currentIndex})`;
    }
  });
} else {
  console.error("Submit button or input field is missing from the DOM.");
}

// Initial display update
updateTableDisplay();
