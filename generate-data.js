// generate-data.js
// Utility script that (re)creates a demo catalogue in data/*.json.
// Run with `npm run seed`. WARNING: this overwrites categories.json,
// types.json and products.json — back them up first if you've customised them.
const fs = require('fs');
const path = require('path');

const categories = [
  { id: 'sweaters', name: 'الكنزات', nameEn: 'Sweaters', image: '/images/kanzet.png', order: 1 },
  { id: 'pants',    name: 'البناطيل', nameEn: 'Pants',    image: 'https://picsum.photos/seed/legend-cat-pants/900/700',    order: 2 },
  { id: 'shoes',    name: 'الأحذية',  nameEn: 'Shoes',    image: 'https://picsum.photos/seed/legend-cat-shoes/900/700',   order: 3 },
  {
  id: 'shorts',
  name: 'الشورتات',
  nameEn: 'Shorts',
  image: 'https://picsum.photos/seed/legend-cat-shorts/900/700',
  order: 4
},
];

const types = [
  { id: 'sweaters-oversized', categoryId: 'sweaters', name: 'أوفر سايز', image: 'https://picsum.photos/seed/legend-type-sw-oversized/700/900' },
  { id: 'sweaters-polo',      categoryId: 'sweaters', name: 'بولو',       image: 'https://picsum.photos/seed/legend-type-sw-polo/700/900' },
  { id: 'sweaters-hoodie',    categoryId: 'sweaters', name: 'تيشيرت',       image: 'https://picsum.photos/seed/legend-type-sw-hoodie/700/900' },

  { id: 'pants-sport',   categoryId: 'pants', name: 'رياضي',  image: 'https://picsum.photos/seed/legend-type-pt-sport/700/900' },
  { id: 'pants-jeans',   categoryId: 'pants', name: 'جينز',   image: 'https://picsum.photos/seed/legend-type-pt-jeans/700/900' },
  { id: 'pants-classic', categoryId: 'pants', name: 'كلاسيك', image: 'https://picsum.photos/seed/legend-type-pt-classic/700/900' },

  { id: 'shoes-sport',   categoryId: 'shoes', name: 'رياضي',  image: 'https://picsum.photos/seed/legend-type-sh-sport/700/900' },
  { id: 'shoes-classic', categoryId: 'shoes', name: 'كلاسيك', image: 'https://picsum.photos/seed/legend-type-sh-classic/700/900' },
  { id: 'shoes-boots',   categoryId: 'shoes', name: 'بوت',    image: 'https://picsum.photos/seed/legend-type-sh-boots/700/900' },
  
{ id: 'shorts-sport', categoryId: 'shorts', name: 'سكليس', image: 'https://picsum.photos/seed/legend-type-shorts-sport/700/900' },
{ id: 'shorts-jeans', categoryId: 'shorts', name: 'جينز', image: 'https://picsum.photos/seed/legend-type-shorts-jeans/700/900' },
{ id: 'shorts-casual', categoryId: 'shorts', name: 'كاجوال', image: 'https://picsum.photos/seed/legend-type-shorts-casual/700/900' },
{ id: 'offer-1', categoryId: 'offer1', name: 'كاج', image: 'https://picsum.photos/seed/legend-type-shorts-casual/700/900' },
  
  
];

const colorPalette = [
  { name: 'أسود',   hex: '#111111' },
  { name: 'أبيض',   hex: '#F5F5F0' },
  { name: 'ذهبي',   hex: '#C9A227' },
  { name: 'رمادي',  hex: '#8C8C8C' },
  { name: 'كحلي',   hex: '#1B2A4A' },
  { name: 'بيج',    hex: '#D8C9A3' },
  { name: 'بني',    hex: '#5B3A29' },
  { name: 'عنابي',  hex: '#6E0F1A' },
];

const clothingSizes = ['S', 'M', 'L', 'XL', 'XXL'];
const shoeSizes = ['39', '40', '41', '42', '43', '44'];

function pick(arr, n) {
  const copy = [...arr];
  const out = [];
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

const nameBank = {
  'sweaters-oversized': ['كنزة أوفر سايز فاخرة', 'كنزة أوفر سايز كاجوال', 'كنزة أوفر سايز شتوية', 'كنزة أوفر سايز صوف', 'كنزة أوفر سايز قطن', 'كنزة أوفر سايز مطرزة'],
  'sweaters-polo':      ['كنزة بولو كلاسيك', 'كنزة بولو قطنية', 'كنزة بولو رياضية', 'كنزة بولو أنيقة', 'كنزة بولو مخططة', 'كنزة بولو سادة'],
  'sweaters-hoodie':    ['هودي فاخر', 'هودي رياضي', 'هودي كاجوال', 'هودي بقلنسوة مبطنة', 'هودي بطبعة Legend', 'هودي شتوي دافئ'],
  'pants-sport':        ['بنطال رياضي مطاطي', 'بنطال رياضي كارجو', 'بنطال رياضي خفيف', 'بنطال رياضي مبطن', 'بنطال رياضي بخطوط جانبية', 'بنطال رياضي بجيوب'],
  'pants-jeans':        ['بنطال جينز سليم فيت', 'بنطال جينز ريلاكس', 'بنطال جينز كلاسيك', 'بنطال جينز ممزق', 'بنطال جينز داكن', 'بنطال جينز فاتح'],
  'pants-classic':      ['بنطال كلاسيك قماش', 'بنطال كلاسيك رسمي', 'بنطال كلاسيك مكوي', 'بنطال كلاسيك بخصر مرن', 'بنطال كلاسيك أنيق', 'بنطال كلاسيك مستقيم'],
  'shoes-sport':        ['حذاء رياضي خفيف', 'حذاء رياضي جري', 'حذاء رياضي شبك', 'حذاء رياضي يومي', 'حذاء رياضي بنعل سميك', 'حذاء رياضي عصري'],
  'shoes-classic':      ['حذاء كلاسيك جلد', 'حذاء كلاسيك رسمي', 'حذاء كلاسيك أنيق', 'حذاء كلاسيك أوكسفورد', 'حذاء كلاسيك بني', 'حذاء كلاسيك أسود لامع'],
  'shoes-boots':        ['بوت جلد فاخر', 'بوت شتوي مبطن', 'بوت كاجوال', 'بوت عسكري ستايل', 'بوت جلد داكن', 'بوت مقاوم للماء'],
  'shorts-sport':       [ 'شورت سكليس', 'سكليس اديدس','سكليس مموه',],
  'accessories-belts': [
  'حزام جلد فاخر',
  'حزام كلاسيك',
  'حزام كاجوال',
  'حزام بني',
  'حزام أسود',
  'حزام معدني'
],

'shorts-sport': [
  'شورت رياضي',
  'شورت جري',
  'شورت تدريب',
  'شورت كرة قدم',
  'شورت قطن',
  'شورت خفيف'
],

'shorts-jeans': [
  'شورت جينز فاتح',
  'شورت جينز داكن',
  'شورت جينز ممزق',
  'شورت جينز كلاسيك',
  'شورت جينز كاجوال',
  'شورت جينز عصري'
],

'shorts-casual': [
  'شورت كاجوال',
  'شورت صيفي',
  'شورت يومي',
  'شورت مريح',
  'شورت قطن ناعم',
  'شورت أنيق'
],
'offer-1': [
  'شورت كاجوال',
  'شورت صيفي',
  'شورت يومي',
  'شورت مريح',
  'شورت قطن ناعم',
  'شورت أنيق'
],
};

const descBank = {
  sweaters: 'قطعة مريحة بخامة عالية الجودة تمنحك إطلالة أنيقة في كل المناسبات.',
  pants: 'قصة عصرية وخامة متينة توفر راحة كاملة طوال اليوم.',
  shoes: 'تصميم متين وخامة فاخرة تجمع بين الراحة والأناقة في كل خطوة.',
  shorts: 'شورتات مريحة وعصرية مناسبة للصيف والأنشطة اليومية.',
};

let products = [];
let pid = 1;

types.forEach((type) => {
  const names = nameBank[type.id];
  const isShoe = type.categoryId === 'shoes';
  const basePrice = isShoe ? 45 : (type.categoryId === 'pants' ? 35 : 30);

  names.forEach((name, i) => {
    const colors = pick(colorPalette, 2 + Math.floor(Math.random() * 2)); // 2-3 colors
    const sizes = isShoe ? shoeSizes : clothingSizes;
    const price = basePrice + (i * 5) + Math.floor(Math.random() * 10);
    const id = `p${String(pid).padStart(3, '0')}`;

    products.push({
      id,
      typeId: type.id,
      categoryId: type.categoryId,
      name,
      description: descBank[type.categoryId],
      price,
      currency: 'USD',
      sizes,
      colors: colors.map((c, idx) => ({
        name: c.name,
        hex: c.hex,
        image: `https://picsum.photos/seed/legend-${id}-${idx}/800/1000`,
      })),
      featured: i === 0,
    });
    pid++;
  });
});

fs.writeFileSync(path.join(__dirname, 'data', 'categories.json'), JSON.stringify(categories, null, 2), 'utf-8');
fs.writeFileSync(path.join(__dirname, 'data', 'types.json'), JSON.stringify(types, null, 2), 'utf-8');
fs.writeFileSync(path.join(__dirname, 'data', 'products.json'), JSON.stringify(products, null, 2), 'utf-8');

console.log(`Generated ${categories.length} categories, ${types.length} types, ${products.length} products.`);
