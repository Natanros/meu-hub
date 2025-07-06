const fs = require("fs");
const path = require("path");

// Simple SVG to PNG converter usando data URIs
function createIconSVG(size, iconType = "main") {
  let iconContent = "";

  if (iconType === "main") {
    // Ícone principal - símbolo financeiro
    iconContent = `
      <circle cx="${size / 2}" cy="${size / 2}" r="${
      size / 3
    }" fill="white" opacity="0.9"/>
      <text x="${size / 2}" y="${
      size / 2 + size / 12
    }" font-family="Arial, sans-serif" font-size="${size / 3}" 
            text-anchor="middle" fill="#3b82f6" font-weight="bold">$</text>
    `;
  } else if (iconType === "add") {
    // Ícone de adicionar
    const thickness = size / 12;
    const lineLength = size / 3;
    iconContent = `
      <rect x="${size / 2 - thickness / 2}" y="${
      size / 2 - lineLength / 2
    }" width="${thickness}" height="${lineLength}" fill="white"/>
      <rect x="${size / 2 - lineLength / 2}" y="${
      size / 2 - thickness / 2
    }" width="${lineLength}" height="${thickness}" fill="white"/>
    `;
  } else if (iconType === "report") {
    // Ícone de relatório - gráfico de barras
    const barWidth = size / 12;
    const spacing = size / 16;
    iconContent = `
      <rect x="${size / 2 - barWidth * 2 - spacing * 1.5}" y="${
      size / 2
    }" width="${barWidth}" height="${size / 4}" fill="white"/>
      <rect x="${size / 2 - barWidth / 2}" y="${
      size / 2 - size / 8
    }" width="${barWidth}" height="${size / 4 + size / 8}" fill="white"/>
      <rect x="${size / 2 + barWidth / 2 + spacing}" y="${
      size / 2 - size / 6
    }" width="${barWidth}" height="${size / 4 + size / 6}" fill="white"/>
    `;
  }

  return `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
        </linearGradient>
      </defs>
      <!-- Fundo com bordas arredondadas -->
      <rect width="${size}" height="${size}" rx="${size * 0.18}" ry="${
    size * 0.18
  }" fill="url(#grad${size})"/>
      <!-- Ícone -->
      ${iconContent}
    </svg>
  `;
}

// Criar diretório se não existir
const iconsDir = path.join(__dirname, "public", "icons");
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Gerar ícones SVG melhorados
const icons = [
  { size: 72, name: "icon-72x72.svg", type: "main" },
  { size: 152, name: "icon-152x152.svg", type: "main" },
  { size: 192, name: "icon-192x192.svg", type: "main" },
  { size: 512, name: "icon-512x512.svg", type: "main" },
  { size: 96, name: "shortcut-add.svg", type: "add" },
  { size: 96, name: "shortcut-report.svg", type: "report" },
];

icons.forEach((icon) => {
  const svgContent = createIconSVG(icon.size, icon.type);
  const filePath = path.join(iconsDir, icon.name);
  fs.writeFileSync(filePath, svgContent);
  console.log(`✅ Criado: ${icon.name}`);
});

console.log("🎉 Todos os ícones SVG foram atualizados com sucesso!");
console.log(
  "📱 Estes ícones funcionam bem em PWAs e são suportados pela maioria dos browsers."
);
