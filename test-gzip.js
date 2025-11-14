import https from 'https';
import zlib from 'zlib';

const options = {
  hostname: 'kick.com',
  path: '/api/v2/channels/xqc',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0',
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip, deflate',
  }
};

https.get(options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Encoding:', res.headers['content-encoding']);
  
  let stream = res;
  if (res.headers['content-encoding'] === 'gzip') {
    console.log('Decompressing gzip...');
    stream = res.pipe(zlib.createGunzip());
  }
  
  let data = '';
  stream.on('data', (chunk) => { data += chunk; });
  stream.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('✅ Success! Got channel:', json.username);
    } catch (e) {
      console.log('❌ Parse error:', e.message.slice(0, 50));
    }
  });
}).on('error', e => console.log('Error:', e.message));
