const ipBtn = document.getElementById('ipBtn');
const whoisBtn = document.getElementById('whoisBtn');
const metaBtn = document.getElementById('metaBtn');

ipBtn.addEventListener('click', async () => {
  const ip = document.getElementById('ipInput').value;
  if (!ip) return alert('Введите IP');
  const res = await fetch(`/api/ip?ip=${encodeURIComponent(ip)}`);
  const data = await res.json();
  document.getElementById('ipResult').textContent = JSON.stringify(data, null, 2);
});

whoisBtn.addEventListener('click', async () => {
  const domain = document.getElementById('whoisInput').value;
  if (!domain) return alert('Введите домен');
  const res = await fetch(`/api/whois?domain=${encodeURIComponent(domain)}`);
  const text = await res.text();
  document.getElementById('whoisResult').textContent = text;
});

metaBtn.addEventListener('click', async () => {
  const url = document.getElementById('metaInput').value;
  if (!url) return alert('Введите URL');
  const res = await fetch(`/api/meta?url=${encodeURIComponent(url)}`);
  const data = await res.json();
  document.getElementById('metaResult').textContent = JSON.stringify(data, null, 2);
});