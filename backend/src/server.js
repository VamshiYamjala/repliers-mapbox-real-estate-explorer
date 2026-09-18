import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
app.use(cors());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
