// drawTableImage.js
import { createCanvas, registerFont } from 'canvas';
import { promises as fs } from 'fs';


/**
 * Render a 2D array of strings to a PNG buffer using node-canvas.
 * Assumes opts.cellWidth (number) and opts.cellHeight (number) are provided and
 * used for every column/row.
 *
 * @param {string[][]} data
 * @param {object} [opts]
 *   opts = {
 *     font: '16px sans-serif',
 *     textColor: '#000',
 *     cellPadding: 6,
 *     borderColor: '#666',
 *     borderWidth: 1,
 *     cellWidth: required (px),
 *     cellHeight: required (px),
 *     align: 'left'|'center'|'right',
 *     valign: 'middle'|'top'|'bottom',
 *     wrap: true,
 *     backgroundColor: '#fff'
 *   }
 * @returns {Promise<Buffer>} PNG buffer
 */
export async function renderTableImage(data, opts = {}) {
  const defaults = {
    font: '16px sans-serif',
    textColor: '#000',
    cellPadding: 6,
    borderColor: '#666',
    borderWidth: 1,
    align: 'left',
    valign: 'middle',
    wrap: true,
    backgroundColor: '#fff'
  };
  const o = Object.assign({}, defaults, opts);

  if (typeof o.cellWidth !== 'number' || o.cellWidth <= 0) throw new Error('opts.cellWidth (positive number) is required');
  if (typeof o.cellHeight !== 'number' || o.cellHeight <= 0) throw new Error('opts.cellHeight (positive number) is required');

  const rows = data.length;
  const cols = rows ? Math.max(...data.map(r => r.length)) : 0;

  const canvasWidth = Math.max(1, cols * o.cellWidth + o.borderWidth);
  const canvasHeight = Math.max(1, rows * o.cellHeight + o.borderWidth);

  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext('2d');

  // background
  ctx.fillStyle = o.backgroundColor;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.font = o.font;
  ctx.fillStyle = o.textColor;
  ctx.strokeStyle = o.borderColor;
  ctx.lineWidth = o.borderWidth;
  ctx.textBaseline = 'alphabetic';

  function getFontSizePx(font) {
    const m = String(font).match(/(\d+(?:\.\d+)?)px/);
    return m ? parseFloat(m[1]) : 16;
  }
  const fontSize = getFontSizePx(o.font);
  const lineHeight = Math.ceil(fontSize * 1.2);

  // preserve existing newlines, wrap paragraphs to maxW
  function wrapTextLines(text, maxW) {
    const wrap = !!o.wrap;
    const str = String(text ?? '');
    const paragraphs = str.split(/\r\n|\r|\n/);
    const lines = [];

    for (const para of paragraphs) {
      if (!wrap) {
        lines.push(para);
        continue;
      }
      if (para === '') {
        lines.push('');
        continue;
      }
      const words = para.split(/\s+/);
      let current = '';
      for (let w of words) {
        const test = current ? current + ' ' + w : w;
        const tw = ctx.measureText(test).width;
        if (tw + 1 <= maxW || !current) current = test;
        else {
          lines.push(current);
          current = w;
        }
      }
      if (current) lines.push(current);
    }
    return lines.length ? lines : [''];
  }

  // precompute positions
  function colX(c) { return c * o.cellWidth + o.borderWidth / 2; }
  function rowY(r) { return r * o.cellHeight + o.borderWidth / 2; }

  // draw cells
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = colX(c);
      const y = rowY(r);
      const w = o.cellWidth;
      const h = o.cellHeight;

      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.stroke();

      const txt = String((data[r] && data[r][c]) ?? '');
      const innerW = Math.max(1, w - 2 * o.cellPadding);
      const lines = wrapTextLines(txt, innerW);

      const textBlockHeight = lines.length * lineHeight;
      let startY;
      // if (o.valign === 'top') startY = y + o.cellPadding; // + fontSize * 0.0 + (lineHeight - fontSize);
      if (o.valign === 'top') startY = y + o.cellPadding + lineHeight;
      else if (o.valign === 'bottom') startY = y + h - o.cellPadding - textBlockHeight + fontSize;
      else startY = y + (h - textBlockHeight) / 2 + fontSize * 0.4;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const measured = ctx.measureText(line).width;
        let tx;
        if (o.align === 'center') tx = x + (w - measured) / 2;
        else if (o.align === 'right') tx = x + w - o.cellPadding - measured;
        else tx = x + o.cellPadding;
        const ty = startY + i * lineHeight;
        ctx.fillText(line, tx, ty);
      }
    }
  }

  return canvas.toBuffer('image/png');
}