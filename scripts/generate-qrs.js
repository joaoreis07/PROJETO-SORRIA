// Small, offline QR encoder for version 8-L UTF-8 byte payloads.
// Generated SVGs contain only the WhatsApp links used by this site.
const fs = require('node:fs');
const path = require('node:path');
const out = path.join(__dirname, '..', 'assets');
const links = {
  'qr-voluntario.svg': 'https://wa.me/554396810919?text=Ol%C3%A1%2C%20Projeto%20Sorria!%20Quero%20saber%20como%20posso%20ser%20volunt%C3%A1rio(a).',
  'qr-padrinho.svg': 'https://wa.me/554396810919?text=Ol%C3%A1%2C%20Projeto%20Sorria!%20Tenho%20interesse%20em%20ser%20padrinho%2Fpatrocinador.%20Como%20funciona%3F',
  'qr-ajuda.svg': 'https://wa.me/554396810919?text=Ol%C3%A1%2C%20Projeto%20Sorria!%20Quero%20ajudar%20o%20projeto.%20Quais%20formas%20de%20contribuir%20est%C3%A3o%20dispon%C3%ADveis%3F',
};
const VERSION = 8, SIZE = 17 + VERSION * 4;
const DATA_CODEWORDS = 194, ECC_PER_BLOCK = 24, BLOCKS = 2;

function appendBits(bits, value, count) {
  for (let i = count - 1; i >= 0; i--) bits.push((value >>> i) & 1);
}
function makeData(text) {
  const bytes = [...Buffer.from(text, 'utf8')];
  if (bytes.length > 192) throw new Error(`Payload exceeds version 8-L capacity (${bytes.length} bytes)`);
  const bits = [];
  appendBits(bits, 0b0100, 4); appendBits(bits, bytes.length, 8);
  bytes.forEach(byte => appendBits(bits, byte, 8));
  const capacity = DATA_CODEWORDS * 8;
  for (let i = 0; i < Math.min(4, capacity - bits.length); i++) bits.push(0);
  while (bits.length % 8) bits.push(0);
  const data = [];
  for (let i = 0; i < bits.length; i += 8) data.push(bits.slice(i, i + 8).reduce((a, b) => (a << 1) | b, 0));
  for (let pad = 0xec; data.length < DATA_CODEWORDS; pad ^= 0xec ^ 0x11) data.push(pad);
  return data;
}
function gfMultiply(x, y) {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z;
}
function rsDivisor(degree) {
  const result = Array(degree).fill(0); result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < degree; j++) {
      result[j] = gfMultiply(result[j], root);
      if (j + 1 < degree) result[j] ^= result[j + 1];
    }
    root = gfMultiply(root, 2);
  }
  return result;
}
function rsRemainder(data, divisor) {
  const result = Array(divisor.length).fill(0);
  for (const byte of data) {
    const factor = byte ^ result.shift(); result.push(0);
    for (let i = 0; i < result.length; i++) result[i] ^= gfMultiply(divisor[i], factor);
  }
  return result;
}
function codewords(data) {
  const perBlock = DATA_CODEWORDS / BLOCKS;
  const divisor = rsDivisor(ECC_PER_BLOCK), dataBlocks = [], eccBlocks = [];
  for (let i = 0; i < BLOCKS; i++) {
    const block = data.slice(i * perBlock, (i + 1) * perBlock);
    dataBlocks.push(block); eccBlocks.push(rsRemainder(block, divisor));
  }
  const result = [];
  for (let i = 0; i < perBlock; i++) for (const block of dataBlocks) result.push(block[i]);
  for (let i = 0; i < ECC_PER_BLOCK; i++) for (const block of eccBlocks) result.push(block[i]);
  return result;
}
function bch(value, polynomial) {
  let rem = value;
  const degree = 31 - Math.clz32(polynomial);
  while (rem && 31 - Math.clz32(rem) >= degree) rem ^= polynomial << ((31 - Math.clz32(rem)) - degree);
  return rem;
}
function makeMatrix(words, mask) {
  const modules = Array.from({length: SIZE}, () => Array(SIZE).fill(false));
  const functionModule = Array.from({length: SIZE}, () => Array(SIZE).fill(false));
  function setFunction(x, y, value) {
    if (x >= 0 && y >= 0 && x < SIZE && y < SIZE) {
      modules[y][x] = Boolean(value); functionModule[y][x] = true;
    }
  }
  function finder(cx, cy) {
    for (let dy = -1; dy <= 7; dy++) for (let dx = -1; dx <= 7; dx++) {
      const x = cx + dx, y = cy + dy;
      const dark = dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6 &&
        (dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4));
      setFunction(x, y, dark);
    }
  }
  finder(0, 0); finder(SIZE - 7, 0); finder(0, SIZE - 7);
  for (let i = 8; i < SIZE - 8; i++) {
    setFunction(6, i, i % 2 === 0); setFunction(i, 6, i % 2 === 0);
  }
  for (const cy of [6, 24, 42]) for (const cx of [6, 24, 42]) {
    if (functionModule[cy][cx]) continue;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++)
      setFunction(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  }
  // Reserve the format information areas; their values are filled after masking.
  for (let i = 0; i <= 5; i++) setFunction(8, i, false);
  setFunction(8, 7, false); setFunction(8, 8, false); setFunction(7, 8, false);
  for (let i = 9; i < 15; i++) setFunction(14 - i, 8, false);
  for (let i = 0; i < 8; i++) setFunction(SIZE - 1 - i, 8, false);
  for (let i = 8; i < 15; i++) setFunction(8, SIZE - 15 + i, false);
  setFunction(8, SIZE - 8, true);
  const versionBits = (VERSION << 12) | bch(VERSION << 12, 0x1f25);
  for (let i = 0; i < 18; i++) {
    const bit = ((versionBits >>> i) & 1) !== 0, a = SIZE - 11 + i % 3, b = Math.floor(i / 3);
    setFunction(a, b, bit); setFunction(b, a, bit);
  }
  const dataBits = words.flatMap(byte => Array.from({length: 8}, (_, i) => (byte >>> (7 - i)) & 1));
  let bitIndex = 0, upward = true;
  for (let right = SIZE - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < SIZE; vert++) {
      const y = upward ? SIZE - 1 - vert : vert;
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        if (!functionModule[y][x]) modules[y][x] = bitIndex < dataBits.length ? Boolean(dataBits[bitIndex++]) : false;
      }
    }
    upward = !upward;
  }
  const maskFn = [
    (x,y)=>(x+y)%2===0, (x,y)=>y%2===0, (x,y)=>x%3===0,
    (x,y)=>(x+y)%3===0, (x,y)=>(Math.floor(y/2)+Math.floor(x/3))%2===0,
    (x,y)=>(x*y)%2+(x*y)%3===0, (x,y)=>((x*y)%2+(x*y)%3)%2===0,
    (x,y)=>((x+y)%2+(x*y)%3)%2===0,
  ][mask];
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) if (!functionModule[y][x] && maskFn(x,y)) modules[y][x] = !modules[y][x];
  const formatData = (1 << 3) | mask; // Error correction level L.
  const formatBits = ((formatData << 10) | bch(formatData << 10, 0x537)) ^ 0x5412;
  for (let i = 0; i < 15; i++) {
    const bit = ((formatBits >>> i) & 1) !== 0;
    let x1, y1, x2, y2;
    if (i < 6) { x1=8; y1=i; }
    else if (i < 8) { x1=8; y1=i+1; }
    else { x1=i===8?7:14-i; y1=8; }
    if (i < 8) { x2=SIZE-1-i; y2=8; }
    else { x2=8; y2=SIZE-15+i; }
    modules[y1][x1]=bit; modules[y2][x2]=bit;
  }
  return modules;
}
function penalty(m) {
  let score = 0;
  function linePenalty(line) {
    let p=0, runColor=line[0], run=1, history=[];
    const addHistory = count => { if (history.length===0) count += SIZE; history.push(count); if (history.length>5) history.shift(); };
    for (let i=1;i<line.length;i++) {
      if (line[i]===runColor) { run++; if (run===5) p+=3; else if (run>5) p++; }
      else { addHistory(run); if (runColor) {
        const h=history;
        if (h.length>=4 && h[h.length-1]===run && h[h.length-2]===run && h[h.length-3]===3*run && h[h.length-4]===run) p+=40;
      } runColor=line[i]; run=1; }
    }
    addHistory(run);
    const dark=m.flat().filter(Boolean).length, total=SIZE*SIZE;
    return p;
  }
  for (let y=0;y<SIZE;y++) score+=linePenalty(m[y]);
  for (let x=0;x<SIZE;x++) score+=linePenalty(m.map(row=>row[x]));
  for(let y=0;y<SIZE-1;y++) for(let x=0;x<SIZE-1;x++) if(m[y][x]===m[y][x+1]&&m[y][x]===m[y+1][x]&&m[y][x]===m[y+1][x+1]) score+=3;
  const dark=m.flat().filter(Boolean).length, percent=dark*100/(SIZE*SIZE);
  score+=Math.floor(Math.abs(percent-50)/5)*10;
  return score;
}
function makeSvg(text) {
  const words=codewords(makeData(text)); let best=null, bestScore=Infinity;
  for(let mask=0;mask<8;mask++){const m=makeMatrix(words,mask),p=penalty(m);if(p<bestScore){best=m;bestScore=p;}}
  const quiet=4, scale=8, dim=(SIZE+quiet*2)*scale;
  const cells=[];
  for(let y=0;y<SIZE;y++) for(let x=0;x<SIZE;x++) if(best[y][x]) cells.push(`M${(x+quiet)*scale} ${(y+quiet)*scale}h${scale}v${scale}h-${scale}z`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dim} ${dim}" shape-rendering="crispEdges" role="img"><title>QR code para contato do Projeto Sorria</title><rect width="100%" height="100%" fill="#fff"/><path fill="#11100d" d="${cells.join('')}"/></svg>\n`;
}
for (const [filename, url] of Object.entries(links)) fs.writeFileSync(path.join(out, filename), makeSvg(url), 'utf8');
