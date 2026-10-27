import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[I2S Business OS] Express Server listening on port ${PORT}`);
  console.log(`API Health: http://localhost:${PORT}/api/health`);
});
