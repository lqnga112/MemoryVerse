const fs = require('fs');
const https = require('https');

const id = '1pAA00hX1wjFPjeohxfs5TL0GAKl0CcRl';
const dest = 'demo_video.mp4';
const url = `https://drive.google.com/uc?export=download&id=${id}`;

https.get(url, (res) => {
  if (res.statusCode === 303 || res.statusCode === 302) {
    const redirectUrl = res.headers.location;
    https.get(redirectUrl, (res2) => {
      let confirmToken = '';
      res2.headers['set-cookie']?.forEach(cookie => {
        if (cookie.includes('download_warning')) {
          confirmToken = cookie.split(';')[0].split('=')[1];
        }
      });
      
      const finalUrl = `${url}&confirm=${confirmToken}`;
      https.get(finalUrl, (res3) => {
        const file = fs.createWriteStream(dest);
        res3.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log('Download complete');
        });
      });
    });
  } else {
    const file = fs.createWriteStream(dest);
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('Download complete');
    });
  }
});
