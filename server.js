const express = require('express');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const whois = require('whois');
const cors = require('cors');
const morgan = require('morgan');
const { URL } = require('url');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static('public'));

function whoisAsync(domain) {
  return new Promise((resolve, reject) => {
    whois.lookup(domain, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

app.get('/api/ip', async (req, res) => {
  const ip = req.query.ip;
  if (!ip) return res.status(400).json({ error: 'ip query param required' });
  try {
    const r = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,country,regionName,city,isp,org,query,lat,lon,timezone,as`);
    const json = await r.json();
    res.json(json);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/whois', async (req, res) => {
  const domain = req.query.domain;
  if (!domain) return res.status(400).json({ error: 'domain query param required' });
  try {
    const data = await whoisAsync(domain);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/meta', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'url query param required' });
  let parsed;
  try {
    parsed = new URL(url);
  } catch (e) {
    return res.status(400).json({ error: 'invalid url' });
  }

  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'OSINT-Starter/1.0' }, redirect: 'follow', timeout: 10000 });
    const text = await r.text();
    const $ = cheerio.load(text);

    const title = $('title').first().text() || null;
    const description = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || null;
    const h1 = $('h1').first().text() || null;

    const links = [];
    $('a[href]').each((i, el) => {
      if (links.length >= 100) return;
      let href = $(el).attr('href');
      try {
        const abs = new URL(href, parsed.origin).href;
        links.push(abs);
      } catch (e) {}
    });

    res.json({ url: parsed.href, title, description, h1, links });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`OSINT starter running on http://localhost:${PORT}`));