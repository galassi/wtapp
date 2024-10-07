import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import axios from 'axios';

const app = express();
const port = 3000;

// Abilita CORS
app.use(cors());

// Serve i file statici dalla cartella 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint per scaricare e salvare i file della mappa e del JSON
app.get('/api/download-map', async (req, res) => {
  const mode = req.query.mode as string;
  console.log(`Received request for /api/download-map with mode: ${mode}`);

  if (mode !== 'sky' && mode !== 'ground') {
    res.status(400).send('Invalid mode');
    return;
  }

  try {
    // Gestisci separatamente il download per Cielo e Terra
    await handleMapAndJsonDownload(mode as 'sky' | 'ground');
    res.status(200).send('Files downloaded successfully');
  } catch (error) {
    console.error('Error downloading files:', error);
    res.status(500).send('Error downloading files');
  }
});

// Avvia il server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Funzioni per la gestione del download dei file
async function handleMapAndJsonDownload(mode: 'sky' | 'ground') {
  const isSkyMode = mode === 'sky';

  // URL e percorsi locali
  const mapImageUrl = 'http://localhost:8111/map.img';
  const mapImageFile = path.join(
    __dirname,
    'public',
    'image',
    isSkyMode ? 'map0.jpg' : 'map1.jpg'
  );

  const jsonMapSettingsUrl = 'http://localhost:8111/map_info.json';
  const jsonMapSettingsFile = path.join(
    __dirname,
    'public',
    'file',
    isSkyMode ? 'hud_type0.json' : 'hud_type1.json'
  );

  // Scarica e salva l'immagine della mappa
  await downloadAndSaveFile(mapImageUrl, mapImageFile);
  // Aggiungi un breve ritardo per evitare problemi di connessione
  await new Promise((resolve) => setTimeout(resolve,1500)); // 1500 ms
  // Scarica e salva il file JSON
  await downloadAndSaveFile(jsonMapSettingsUrl, jsonMapSettingsFile);
}

async function downloadAndSaveFile(url: string, filePath: string) {
  try {
    // Verifica se il file esiste già
    if (fs.existsSync(filePath)) {
      console.log(`File already exists: ${filePath}, skipping download.`);
      return; // Salta il download e il salvataggio
    }

    console.log(`Downloading file from ${url}`);

    const response = await axios.get<ArrayBuffer>(url, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': '*/*',
        'Connection': 'keep-alive',
      },
    });

    const buffer = Buffer.from(response.data);

    // Scrivi il file
    fs.writeFileSync(filePath, buffer);
    console.log(`File saved to ${filePath}`);
  } catch (err) {
    console.error(`Error downloading or saving file from ${url} to ${filePath}:`, err);
    throw err;
  }
}


// Endpoint per cancellare i file della mappa e del JSON
app.get('/api/delete-map', (req, res) => {
  console.log('Received request for /api/delete-map');

  try {
    deleteMapFiles();
    res.status(200).send('Files deleted successfully');
  } catch (error) {
    console.error('Error deleting files:', error);
    res.status(500).send('Error deleting files');
  }
});

// Funzione per cancellare i file
function deleteMapFiles() {
  const filesToDelete = [
    path.join(__dirname, 'public', 'image', 'map0.jpg'),
    path.join(__dirname, 'public', 'image', 'map1.jpg'),
    path.join(__dirname, 'public', 'file', 'hud_type0.json'),
    path.join(__dirname, 'public', 'file', 'hud_type1.json'),
  ];

  filesToDelete.forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted file: ${filePath}`);
    }
  });
}
