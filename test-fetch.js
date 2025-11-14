import https from 'https';
import zlib from 'zlib';

function doFetch(channel){
  return new Promise((resolve)=>{
    const options={
      hostname:'kick.com',
      path:`/api/v2/channels/${channel}`,
      method:'GET',
      headers:{
        'User-Agent':'Mozilla/5.0',
        'Accept':'*/*',
        'Accept-Encoding':'gzip, deflate, br',
        'Referer':'https://kick.com/'
      }
    };
    https.get(options,(res)=>{
      const status=res.statusCode||0;
      const enc=(res.headers['content-encoding']||'').toString();
      const chunks=[];
      res.on('data',c=>chunks.push(Buffer.from(c)));
      res.on('end',()=>{
        const buffer=Buffer.concat(chunks);
        console.log(`channel=${channel} status=${status} encoding=${enc} len=${buffer.length}`);
        try{
          let decoded=buffer;
          if(enc.includes('br')) decoded=zlib.brotliDecompressSync(buffer);
          else if(enc.includes('gzip')) decoded=zlib.gunzipSync(buffer);
          else if(enc.includes('deflate')) decoded=zlib.inflateSync(buffer);
          const text=decoded.toString('utf8');
          console.log('text sample:',text.slice(0,200).replace(/\n/g,' '));
        }catch(e){
          console.log('decode error:',e.message);
          console.log('hex sample:',buffer.slice(0,120).toString('hex'));
        }
        resolve();
      });
    }).on('error',e=>{console.log('fetch err',e.message); resolve();});
  });
}

(async()=>{
  await doFetch('xqc');
  await doFetch('spreen');
  await doFetch('ggsantome');
})();
