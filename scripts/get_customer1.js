(async () => {
  try {
    const res = await fetch('http://localhost:5000/api/customers/1');
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Body:', text);
  } catch (err) {
    console.error('Request error:', err);
    process.exit(2);
  }
})();
