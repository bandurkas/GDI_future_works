const https = require('https');
const fs = require('fs');
const path = require('path');

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      // Handle redirects
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (${res.statusCode})`));
        return;
      }
      
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
};

const dir = path.join(__dirname, 'public', 'team');

Promise.all([
    download('https://lh3.googleusercontent.com/a-/ALV-UjVj1L4gTqWfXnE15v-v35K0T2lZpU5zYmO9_9tJ6Kk7Dk_UvHkX=s982', path.join(dir, 'feonna.png')),
    download('https://lh3.googleusercontent.com/a-/ALV-UjVQZ4-Q5XG1Xv30dZ1K6lY5Xz8JpM1kZ5X_4xY-X0L8P2I5X_4J=s982', path.join(dir, 'sergei.png'))
]).then(() => console.log('Downloaded successfully!'))
  .catch(err => console.error(err));
