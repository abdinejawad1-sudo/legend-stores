const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.join(__dirname, 'public', 'images');

const extensions = new Set([
  '.png',
  '.jpg',
  '.jpeg'
]);

async function getImages(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files = files.concat(await getImages(fullPath));
    } else if (extensions.has(path.extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }

  return files;
}

async function convert() {
  const files = await getImages(root);

  console.log(`Found ${files.length} images.\n`);

  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of files) {
    const output = file.replace(/\.(png|jpg|jpeg)$/i, '.webp');

    try {
      const before = fs.statSync(file).size;

      await sharp(file)
        .webp({
          quality: 82,
          effort: 5
        })
        .toFile(output);

      const after = fs.statSync(output).size;

      totalBefore += before;
      totalAfter += after;

      console.log(
        `${path.relative(root, file)}\n` +
        `  ${(before / 1024 / 1024).toFixed(2)} MB → ` +
        `${(after / 1024 / 1024).toFixed(2)} MB`
      );
    } catch (error) {
      console.error(`ERROR: ${file}`);
      console.error(error.message);
    }
  }

  console.log('\n==============================');
  console.log(
    `Original: ${(totalBefore / 1024 / 1024).toFixed(2)} MB`
  );
  console.log(
    `WebP:     ${(totalAfter / 1024 / 1024).toFixed(2)} MB`
  );
  console.log(
    `Saved:    ${((1 - totalAfter / totalBefore) * 100).toFixed(1)}%`
  );
  console.log('==============================');
}

convert();