require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(cors());
app.use(express.json());

app.post('/api/generate', upload.single('image'), async (req, res) => {
  const prompt = req.body.prompt;
  const image = req.file;

  if (!prompt || !image) {
    return res.status(400).json({ error: 'Prompt et image sont requis.' });
  }

  try {
    // Ici, on pourrait utiliser l'image pour une future version (image to image)
    // Pour l'instant, on utilise seulement le prompt texte avec DALL-E 3
    const response = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        prompt: prompt,
        model: "dall-e-3",
        n: 1,
        size: "1024x1024",
        response_format: "url"
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Nettoie l'image uploadée (optionnel, mais propre)
    fs.unlinkSync(image.path);

    res.json({ imageUrl: response.data.data[0].url });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'Erreur lors de la génération de l’image.' });
  }
});

// Lancer le serveur
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Serveur IA DALL-E 3 démarré sur le port ${PORT}`);
});
