const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const { minify: minifyHtml } = require('html-minifier-terser');
const terser = require('terser');
const csso = require('csso');

const SRC = 'public';
const OUT = 'dist';
const REPO = 'fairylightspentagramcalculator';

// function addBaseTag(htmlContent, basePath) {
//   return htmlContent.replace(/<head>/i, `<head>\n  <base href="${basePath}">`);
// }

function isIgnored(p) {
  return p.split(path.sep).some(part => ['.git','node_modules','.github'].includes(part));
}
// Функция для замены ./ на / в путях
function fixPaths(content) {
  // HTML: src="..." и href="..."
  content = content.replace(/(src|href)=["']\.\/([^"']+)["']/g, '$1="/$2"');
  // CSS: url(...)
  content = content.replace(/url\(\.\/([^)\s]+)\)/g, 'url(/$1)');
  return content;
}

async function minifyFile(srcPath, destPath) {
  const ext = path.extname(srcPath).toLowerCase();
  let content = await fs.readFile(srcPath, 'utf8');

  // Заменяем ./ на / перед минимизацией
  content = fixPaths(content);
  if (ext === '.html' || ext === '.htm') {
    // content = addBaseTag(content, '/'+ REPO + '/');
    const min = await minifyHtml(content, {
      collapseWhitespace: true,
      removeComments: true,
      minifyJS: true,
      minifyCSS: true,
      removeRedundantAttributes: true
    });
    await fs.outputFile(destPath, min, 'utf8');
  } else if (ext === '.js') {
    const res = await terser.minify(content, { compress: true, mangle: true });
    if (res.error) throw res.error;
    await fs.outputFile(destPath, res.code, 'utf8');
  } else if (ext === '.css') {
    const res = csso.minify(content);
    await fs.outputFile(destPath, res.css, 'utf8');
  } else {
    await fs.copy(srcPath, destPath);
  }
}

async function build() {
  await fs.remove(OUT);
  await fs.ensureDir(OUT);
  const files = glob.sync('**/*', { cwd: SRC, nodir: true, dot: true, follow: true });

  for (const f of files) {
    if (isIgnored(f)) continue;
    const srcPath = path.join(SRC, f);
    const destPath = path.join(OUT, f);
    await minifyFile(srcPath, destPath);
  }

  console.log('Built ->', OUT);
}

build().catch(err => { console.error(err); process.exit(1); });