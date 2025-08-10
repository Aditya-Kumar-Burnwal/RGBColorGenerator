const rSlider = document.getElementById('red');
const gSlider = document.getElementById('green');
const bSlider = document.getElementById('blue');
const rVal = document.getElementById('rVal');
const gVal = document.getElementById('gVal');
const bVal = document.getElementById('bVal');
const colorDisplay = document.getElementById('colorDisplay');
const hexDisplay = document.getElementById('hexDisplay');
const paletteContainer = document.getElementById('paletteContainer');
const themeToggle = document.getElementById('themeToggle');
const canvas = document.getElementById('paletteCanvas');
const ctx = canvas.getContext('2d');
const aSlider = document.getElementById('alpha');
const aVal = document.getElementById('aVal');
const nameDisplay = document.getElementById('nameDisplay');
let savedColors = JSON.parse(localStorage.getItem('palette')) || [];
function rgbToHex(r, g, b) {
  return (
    '#' +
    [r, g, b].map(x => {
      const hex = parseInt(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('')
  );
}
function updateColor() {
  const r = +rSlider.value;
  const g = +gSlider.value;
  const b = +bSlider.value;
  const a = +aSlider.value / 100;
  const rgb = `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
  const hex = rgbToHex(r, g, b);
  const name = getClosestColorName(r, g, b);
  rVal.textContent = r;
  gVal.textContent = g;
  bVal.textContent = b;
  aVal.textContent = a.toFixed(2);
  colorDisplay.textContent = rgb;
  hexDisplay.textContent = hex;
  nameDisplay.textContent = `Name: ${name}`;
  colorDisplay.style.backgroundColor = rgb;
  document.body.style.setProperty('--dynamic-bg', rgb);
}
rSlider.oninput = gSlider.oninput = bSlider.oninput = updateColor;
colorDisplay.onclick = () => {
  navigator.clipboard.writeText(colorDisplay.textContent);
  colorDisplay.textContent = "Copied RGB!";
  setTimeout(updateColor, 1000);
};
hexDisplay.onclick = () => {
  navigator.clipboard.writeText(hexDisplay.textContent);
  hexDisplay.textContent = "Copied Hex!";
  setTimeout(updateColor, 1000);
};
function getClosestColorName(r, g, b) {
  const names = {
    "Black": [0, 0, 0],
    "White": [255, 255, 255],
    "Red": [255, 0, 0],
    "Lime": [0, 255, 0],
    "Blue": [0, 0, 255],
    "Yellow": [255, 255, 0],
    "Cyan": [0, 255, 255],
    "Magenta": [255, 0, 255],
    "Silver": [192, 192, 192],
    "Gray": [128, 128, 128],
    "Maroon": [128, 0, 0],
    "Olive": [128, 128, 0],
    "Green": [0, 128, 0],
    "Purple": [128, 0, 128],
    "Teal": [0, 128, 128],
    "Navy": [0, 0, 128]
  };
  let closest = "N/A";
  let minDist = Infinity;
  for (let [name, [nr, ng, nb]] of Object.entries(names)) {
    const dist = Math.sqrt((r - nr) ** 2 + (g - ng) ** 2 + (b - nb) ** 2);
    if (dist < minDist) {
      minDist = dist;
      closest = name;
    }
  }
  return closest;
}
function saveColor() {
  const r = +rSlider.value;
  const g = +gSlider.value;
  const b = +bSlider.value;
  const a = +aSlider.value / 100;
  const rgba = `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
  savedColors.push(rgba);
  renderPalette();
  saveToLocalStorage();
}

function renderPalette() {
  paletteContainer.innerHTML = '';
  savedColors.forEach((color, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'swatch-wrapper';
    const swatch = document.createElement('div');
    swatch.className = 'swatch';
    swatch.style.backgroundColor = color;
    swatch.title = color;
    swatch.onclick = () => {
      const [r, g, b, a = 1] = color.match(/[\d.]+/g).map(Number);
      rSlider.value = r;
      gSlider.value = g;
      bSlider.value = b;
      aSlider.value = a * 100;
      updateColor();
    };
    const delBtn = document.createElement('button');
    delBtn.textContent = '✖';
    delBtn.onclick = (e) => {
      e.stopPropagation();
      savedColors.splice(index, 1);
      localStorage.setItem('palette', JSON.stringify(savedColors));
      renderPalette();
    };
    wrapper.appendChild(swatch);
    wrapper.appendChild(delBtn);
    paletteContainer.appendChild(wrapper);
  });
}
function exportPalette() {
  const width = 50;
  const height = 50;
  canvas.width = savedColors.length * width;
  canvas.height = height;
  savedColors.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.fillRect(i * width, 0, width, height);
  });
  const link = document.createElement('a');
  link.download = 'palette.png';
  link.href = canvas.toDataURL();
  link.click();
}
themeToggle.onclick = () => {
  const isDark = document.body.classList.contains('dark');
  document.body.classList.toggle('dark', !isDark);
  document.body.classList.toggle('light', isDark);
  themeToggle.textContent = isDark ? '🌙 Dark Mode' : '☀️ Light Mode';
  localStorage.setItem('theme', isDark ? 'light' : 'dark');
  updateColor();
};
window.onload = () => {
  setupAnimatedTitle('🎨 RGB & Hex Color Picker');
  animateTitleColors();
  setInterval(animateTitleColors, 3000); 
const savedTheme = localStorage.getItem('theme') || 'dark';
document.body.classList.add(savedTheme);
themeToggle.textContent = savedTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
};
function setupAnimatedTitle(text) {
  const titleEl = document.getElementById('animatedTitle');
  titleEl.innerHTML = '';
  [...text].forEach((char, i) => {
    const span = document.createElement('span');
    span.textContent = char;
    span.style.display = 'inline-block';
    span.style.transition = 'color 0.4s ease';
    span.dataset.index = i;
    titleEl.appendChild(span);
  });
}
function animateTitleColors() {
  const spans = document.querySelectorAll('#animatedTitle span');
  const randomColor = () => '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
  const colors = Array.from({ length: spans.length }, randomColor);
  for (let i = spans.length - 1; i >= 0; i--) {
    setTimeout(() => {
      spans[i].style.color = colors[i];
    }, (spans.length - i - 1) * 100);
  }
}
function exportPalette() {
  if (savedColors.length === 0) {
    alert("Palette is empty. Save at least one color.");
    return;
  }
  const width = 50;
  const height = 50;
  canvas.width = savedColors.length * width;
  canvas.height = height;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  savedColors.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.fillRect(i * width, 0, width, height);
  });
  setTimeout(() => {
    const link = document.createElement('a');
    link.download = 'palette.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, 100);
}
rSlider.addEventListener('input', updateColor);
gSlider.addEventListener('input', updateColor);
bSlider.addEventListener('input', updateColor);
aSlider.addEventListener('input', updateColor);
updateColor();