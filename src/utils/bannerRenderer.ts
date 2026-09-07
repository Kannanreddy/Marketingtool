import { Product, StoreSettings, BannerConfig } from '../types';
import { PALETTES } from '../data/initialData';

export function renderBannerToCanvas(
  canvas: HTMLCanvasElement,
  product: Product,
  settings: StoreSettings,
  config: BannerConfig,
  customOrderUrl?: string
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const pal = PALETTES[config.palette] || PALETTES.emerald;
  const ratio = config.aspectRatio;

  // Set resolution based on ratio
  let w = 1080;
  let h = 1080;
  if (ratio === '9:16') {
    w = 1080;
    h = 1920;
  } else if (ratio === '16:9') {
    w = 1200;
    h = 675;
  } else if (ratio === '4:5') {
    w = 1080;
    h = 1350;
  } else if (ratio === 'A4') {
    w = 1240;
    h = 1754;
  }

  canvas.width = w;
  canvas.height = h;

  // 1. Base Background with subtle depth
  const bgGrad = ctx.createLinearGradient(0, 0, w, h);
  bgGrad.addColorStop(0, pal.bg);
  bgGrad.addColorStop(1, adjustColor(pal.bg, -25));
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // 2. Render Pattern
  drawPattern(ctx, config.pattern, w, h, pal);

  // 3. Style Accents
  drawStyleAccents(ctx, config.style, w, h, pal);

  // 4. Header Section
  const topBarH = h * 0.1;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.fillRect(0, 0, w, topBarH);

  // Store Name / Brand
  ctx.fillStyle = pal.text;
  ctx.font = `bold ${Math.floor(w * 0.042)}px 'Space Grotesk', system-ui, sans-serif`;
  ctx.fillText(settings.StoreName || 'RACEOL LUBRICANTS', w * 0.05, topBarH * 0.65);

  // Verified / Theme Badge in Header
  const themeText = config.badgeText || '100% GENUINE CERTIFIED';
  const badgeW = Math.min(w * 0.45, ctx.measureText(themeText).width + w * 0.06);
  const badgeH = topBarH * 0.55;
  const badgeX = w - badgeW - w * 0.05;
  const badgeY = topBarH * 0.22;

  drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 6);
  ctx.fillStyle = pal.accent;
  ctx.fill();

  ctx.fillStyle = '#0F172A';
  ctx.font = `bold ${Math.floor(w * 0.022)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(themeText, badgeX + badgeW / 2, badgeY + badgeH / 2);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // 5. Product Showcase Container
  let cw = w * 0.88;
  let ch = h * (ratio === '16:9' ? 0.65 : ratio === '9:16' ? 0.42 : 0.44);
  let cx = (w - cw) / 2;
  let cy = topBarH + (h * 0.03);

  if (ratio === '16:9') {
    cw = w * 0.45;
    cx = w * 0.05;
    cy = topBarH + h * 0.05;
    ch = h * 0.70;
  }

  // Showcase Box Background
  drawRoundedRect(ctx, cx, cy, cw, ch, 16);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw product image or high-quality illustration
  const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.src = product.ImageDriveURL;

  const orderUrl = customOrderUrl || `${window.location.origin}/?p=${product.SKU}`;

  const renderContent = () => {
    // 6. Product Details
    let detailsX = ratio === '16:9' ? w * 0.54 : w * 0.06;
    let detailsY = ratio === '16:9' ? topBarH + h * 0.12 : cy + ch + (h * 0.04);

    // Product Title
    ctx.fillStyle = pal.text;
    ctx.font = `bold ${Math.floor(w * (ratio === '16:9' ? 0.042 : 0.045))}px system-ui, sans-serif`;
    wrapText(ctx, product.Name, detailsX, detailsY, w * (ratio === '16:9' ? 0.42 : 0.88), Math.floor(w * 0.055));

    // Viscosity / Tags / Specs Bar
    const specsY = detailsY + (ratio === '9:16' ? h * 0.07 : h * 0.055);
    ctx.fillStyle = pal.sub;
    ctx.font = `600 ${Math.floor(w * 0.026)}px system-ui, sans-serif`;
    const tagDisplay = product.viscosity ? `Viscosity: ${product.viscosity} | Size: ${product.size || '1L'}` : (product.Tags || 'High Performance');
    ctx.fillText(`SKU: ${product.SKU} • ${tagDisplay}`, detailsX, specsY);

    // Price section
    const priceY = specsY + (ratio === '9:16' ? h * 0.07 : h * 0.065);
    ctx.fillStyle = pal.accent;
    ctx.font = `bold ${Math.floor(w * 0.064)}px 'Space Grotesk', system-ui, sans-serif`;
    ctx.fillText(product.DiscountPrice, detailsX, priceY);

    // Strikethrough M.R.P.
    const priceWidth = ctx.measureText(product.DiscountPrice).width;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.font = `500 ${Math.floor(w * 0.034)}px system-ui, sans-serif`;
    const mrpX = detailsX + priceWidth + w * 0.03;
    ctx.fillText(product.Price, mrpX, priceY - 4);
    const mrpWidth = ctx.measureText(product.Price).width;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(mrpX - 2, priceY - 12);
    ctx.lineTo(mrpX + mrpWidth + 2, priceY - 12);
    ctx.stroke();

    // Discount percentage tag
    const discountText = calcDiscount(product.Price, product.DiscountPrice);
    if (discountText) {
      const discTagX = mrpX + mrpWidth + w * 0.03;
      const discTagW = ctx.measureText(discountText).width + 16;
      drawRoundedRect(ctx, discTagX, priceY - 26, discTagW, 26, 6);
      ctx.fillStyle = '#EF4444';
      ctx.fill();
      ctx.fillStyle = '#FFF';
      ctx.font = `bold ${Math.floor(w * 0.020)}px system-ui, sans-serif`;
      ctx.fillText(discountText, discTagX + 8, priceY - 8);
    }

    // Call to Action Button
    const btnY = priceY + (ratio === '9:16' ? h * 0.06 : h * 0.04);
    const btnW = Math.min(w * 0.46, 320);
    const btnH = Math.max(h * 0.065, 52);
    drawRoundedRect(ctx, detailsX, btnY, btnW, btnH, 8);
    ctx.fillStyle = pal.primary;
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${Math.floor(w * 0.028)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ORDER NOW ➔', detailsX + btnW / 2, btnY + btnH / 2);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    // 7. QR Code Box
    if (config.showQrCode && ratio !== '16:9') {
      const qrSize = Math.floor(w * 0.18);
      const qrX = w - qrSize - w * 0.06;
      const qrY = btnY - (qrSize - btnH);

      drawRoundedRect(ctx, qrX - 6, qrY - 6, qrSize + 12, qrSize + 12, 10);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      // Render stylized QR matrix
      drawQrCodeFallback(ctx, qrX, qrY, qrSize, orderUrl);

      ctx.fillStyle = pal.text;
      ctx.font = `600 ${Math.floor(w * 0.019)}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('SCAN TO ORDER', qrX + qrSize / 2, qrY + qrSize + 22);
      ctx.textAlign = 'left';
    }

    // 8. Footer Contact Bar
    if (config.showContactBar) {
      const footH = h * 0.09;
      const footY = h - footH;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, footY, w, footH);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `500 ${Math.floor(w * 0.023)}px system-ui, sans-serif`;
      const contactY1 = footY + footH * 0.42;
      const contactY2 = footY + footH * 0.78;

      ctx.fillText(`📞 WhatsApp: +${settings.WhatsAppNumber || '91 98765 43210'}`, w * 0.06, contactY1);
      ctx.fillText(`✉️ Email: ${settings.SellerEmail || 'sales@raceol.in'}`, w * 0.06, contactY2);

      ctx.textAlign = 'right';
      ctx.fillStyle = pal.accent;
      ctx.font = `bold ${Math.floor(w * 0.022)}px system-ui, sans-serif`;
      ctx.fillText('Fast Doorstep Dispatch Across India', w * 0.94, contactY1);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = `normal ${Math.floor(w * 0.019)}px system-ui, sans-serif`;
      ctx.fillText('Cash on Delivery & Secure UPI Available', w * 0.94, contactY2);
      ctx.textAlign = 'left';
    }
  };

  img.onload = () => {
    try {
      const pad = 24;
      ctx.drawImage(img, cx + pad, cy + pad, cw - (pad * 2), ch - (pad * 2));
    } catch {
      drawFallbackIllustration(ctx, cx, cy, cw, ch, product, pal);
    }
    renderContent();
  };

  img.onerror = () => {
    drawFallbackIllustration(ctx, cx, cy, cw, ch, product, pal);
    renderContent();
  };
}

function drawFallbackIllustration(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  product: Product,
  pal: { primary: string; accent: string; text: string }
) {
  // Draw sleek motor oil bottle vector on canvas
  const centerX = x + w / 2;
  const centerY = y + h / 2;
  const bottleW = Math.min(w * 0.45, 180);
  const bottleH = Math.min(h * 0.72, 280);

  const bx = centerX - bottleW / 2;
  const by = centerY - bottleH / 2 + 10;

  // Bottle Cap
  ctx.fillStyle = pal.accent;
  drawRoundedRect(ctx, centerX - 24, by, 48, 20, 4);
  ctx.fill();

  // Bottle Neck
  ctx.fillStyle = pal.primary;
  ctx.fillRect(centerX - 18, by + 20, 36, 25);

  // Bottle Body
  drawRoundedRect(ctx, bx, by + 45, bottleW, bottleH - 45, 12);
  ctx.fillStyle = '#1E293B';
  ctx.fill();
  ctx.strokeStyle = pal.primary;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Label on Bottle
  const labelW = bottleW * 0.8;
  const labelH = (bottleH - 45) * 0.6;
  const lx = bx + (bottleW - labelW) / 2;
  const ly = by + 55 + (bottleH - 45) * 0.15;

  drawRoundedRect(ctx, lx, ly, labelW, labelH, 8);
  ctx.fillStyle = pal.primary;
  ctx.fill();

  // Label text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold 18px 'Space Grotesk', sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('RACEOL', centerX, ly + 26);

  ctx.fillStyle = pal.accent;
  ctx.font = `bold 14px sans-serif`;
  ctx.fillText(product.viscosity || '4T ENGINE OIL', centerX, ly + 50);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold 12px sans-serif`;
  ctx.fillText(product.size || '1L', centerX, ly + 72);
  ctx.textAlign = 'left';
}

function drawPattern(
  ctx: CanvasRenderingContext2D,
  pattern: string,
  w: number,
  h: number,
  pal: { accent: string; primary: string }
) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1.5;

  switch (pattern) {
    case 'grid':
    default:
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      break;

    case 'dots':
      for (let x = 20; x < w; x += 36) {
        for (let y = 20; y < h; y += 36) {
          ctx.beginPath();
          ctx.arc(x, y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;

    case 'stripes':
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.lineWidth = 6;
      for (let x = -h; x < w + h; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + h, h);
        ctx.stroke();
      }
      break;

    case 'hexagons':
      const size = 32;
      for (let y = 0; y < h + size; y += size * 1.5) {
        for (let x = 0; x < w + size; x += size * 1.732) {
          drawHexagon(ctx, x, y, size * 0.8);
        }
      }
      break;

    case 'carbon':
      for (let x = 0; x < w; x += 16) {
        for (let y = 0; y < h; y += 16) {
          if ((x + y) % 32 === 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
            ctx.fillRect(x, y, 8, 8);
          }
        }
      }
      break;

    case 'chevrons':
      ctx.lineWidth = 3;
      for (let y = 40; y < h; y += 80) {
        for (let x = 20; x < w; x += 120) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + 30, y + 20);
          ctx.lineTo(x + 60, y);
          ctx.stroke();
        }
      }
      break;
  }
  ctx.restore();
}

function drawStyleAccents(
  ctx: CanvasRenderingContext2D,
  style: string,
  w: number,
  h: number,
  pal: { accent: string; primary: string }
) {
  ctx.save();
  if (style === 'cyberpunk') {
    ctx.strokeStyle = pal.accent;
    ctx.lineWidth = 3;
    ctx.shadowColor = pal.accent;
    ctx.shadowBlur = 15;
    ctx.strokeRect(10, 10, w - 20, h - 20);
  } else if (style === 'luxury') {
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, w - 32, h - 32);
    ctx.strokeRect(22, 22, w - 44, h - 44);
  } else if (style === 'automotive') {
    // Racing sport stripes along the side
    ctx.fillStyle = pal.accent;
    ctx.beginPath();
    ctx.moveTo(w - 60, 0);
    ctx.lineTo(w, 0);
    ctx.lineTo(w, h);
    ctx.lineTo(w - 120, h);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = pal.primary;
    ctx.beginPath();
    ctx.moveTo(w - 90, 0);
    ctx.lineTo(w - 65, 0);
    ctx.lineTo(w - 125, h);
    ctx.lineTo(w - 150, h);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawHexagon(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const hx = x + radius * Math.cos(angle);
    const hy = y + radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(hx, hy);
    else ctx.lineTo(hx, hy);
  }
  ctx.closePath();
  ctx.stroke();
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';
  let curY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, curY);
      line = words[n] + ' ';
      curY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, curY);
}

function calcDiscount(orig: string, disc: string): string {
  const o = parseFloat(orig.replace(/[^0-9.]/g, ''));
  const d = parseFloat(disc.replace(/[^0-9.]/g, ''));
  if (o && d && o > d) {
    const pct = Math.round(((o - d) / o) * 100);
    return `${pct}% OFF`;
  }
  return '';
}

function adjustColor(hex: string, lum: number): string {
  hex = String(hex).replace(/[^0-9a-f]/gi, '');
  if (hex.length < 6) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  let rgb = '#';
  for (let i = 0; i < 3; i++) {
    let c = parseInt(hex.substr(i * 2, 2), 16);
    c = Math.round(Math.min(Math.max(0, c + lum), 255));
    const cStr = c.toString(16);
    rgb += ('00' + cStr).substr(cStr.length);
  }
  return rgb;
}

function drawQrCodeFallback(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  dataUrl: string
) {
  // Render a clean, stylized QR grid that visually represents the link
  ctx.fillStyle = '#000000';
  const modules = 21;
  const cellSize = size / modules;

  // Simple deterministic hash based on url string to produce distinctive QR pattern
  let hash = 0;
  for (let i = 0; i < dataUrl.length; i++) {
    hash = (hash << 5) - hash + dataUrl.charCodeAt(i);
    hash |= 0;
  }

  // Draw Corner Target 1 (Top-Left)
  drawFinderPattern(ctx, x, y, cellSize);
  // Draw Corner Target 2 (Top-Right)
  drawFinderPattern(ctx, x + (modules - 7) * cellSize, y, cellSize);
  // Draw Corner Target 3 (Bottom-Left)
  drawFinderPattern(ctx, x, y + (modules - 7) * cellSize, cellSize);

  // Fill pseudo data matrix
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      // Skip finder zones
      if ((r < 8 && c < 8) || (r < 8 && c >= modules - 8) || (r >= modules - 8 && c < 8)) {
        continue;
      }
      // Timing tracks
      if (r === 6 || c === 6) {
        if ((r + c) % 2 === 0) ctx.fillRect(x + c * cellSize, y + r * cellSize, cellSize, cellSize);
        continue;
      }
      const val = (hash ^ (r * 31 + c * 17)) & 1;
      if (val === 1) {
        ctx.fillRect(x + c * cellSize, y + r * cellSize, cellSize, cellSize);
      }
    }
  }
}

function drawFinderPattern(ctx: CanvasRenderingContext2D, x: number, y: number, cell: number) {
  ctx.fillRect(x, y, 7 * cell, 7 * cell);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x + cell, y + cell, 5 * cell, 5 * cell);
  ctx.fillStyle = '#000000';
  ctx.fillRect(x + 2 * cell, y + 2 * cell, 3 * cell, 3 * cell);
}
