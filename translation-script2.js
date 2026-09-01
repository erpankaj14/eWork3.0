const fs = require('fs');
const path = require('path');

const i18nPath = path.join(__dirname, 'public', 'i18n');
const defaultJson = JSON.parse(fs.readFileSync(path.join(i18nPath, 'default.json'), 'utf8'));
const enJson = JSON.parse(fs.readFileSync(path.join(i18nPath, 'en.json'), 'utf8'));
const hiJson = JSON.parse(fs.readFileSync(path.join(i18nPath, 'hi.json'), 'utf8'));

const replacements = [
  {
    orig: 'Quick Link Hub',
    key: 'HOME.QUICK_LINK_HUB',
    def: 'Quick Link Hub',
    en: 'Quick Link Hub',
    hi: 'क्विक लिंक हब'
  },
  {
    orig: 'Detailed Report Matrix',
    key: 'HOME.DETAILED_REPORT_MATRIX',
    def: 'Detailed Report Matrix',
    en: 'Detailed Report Matrix',
    hi: 'विस्तृत रिपोर्ट मैट्रिक्स'
  },
  {
    orig: 'Matrix 1',
    key: 'HOME.MATRIX_1',
    def: 'Matrix 1',
    en: 'Matrix 1',
    hi: 'मैट्रिक्स 1'
  },
  {
    orig: 'District-wise tabular report metrics.',
    key: 'HOME.DISTRICT_WISE_TABULAR',
    def: 'District-wise tabular report metrics.',
    en: 'District-wise tabular report metrics.',
    hi: 'जिलावार सारणीबद्ध रिपोर्ट मेट्रिक्स।'
  },
  {
    orig: 'Graphical Analytics',
    key: 'HOME.GRAPHICAL_ANALYTICS',
    def: 'Graphical Analytics',
    en: 'Graphical Analytics',
    hi: 'ग्राफिकल एनालिटिक्स'
  },
  {
    orig: 'Live 2',
    key: 'HOME.LIVE_2',
    def: 'Live 2',
    en: 'Live 2',
    hi: 'लाइव 2'
  },
  {
    orig: 'Interactive graphical telemetry & pie/donut charts.',
    key: 'HOME.INTERACTIVE_GRAPHICAL',
    def: 'Interactive graphical telemetry & pie/donut charts.',
    en: 'Interactive graphical telemetry & pie/donut charts.',
    hi: 'इंटरएक्टिव ग्राफिकल टेलीमेट्री और पाई/डोनट चार्ट।'
  }
];

let homeHtml = fs.readFileSync(path.join(__dirname, 'src/app/features/home/home.component.html'), 'utf8');

replacements.forEach(rep => {
  const shortKey = rep.key.split('.')[1];
  defaultJson.HOME[shortKey] = rep.def;
  enJson.HOME[shortKey] = rep.en;
  hiJson.HOME[shortKey] = rep.hi;
  
  homeHtml = homeHtml.split(`>${rep.orig}<`).join(`>{{ '${rep.key}' | translate }}<`);
});

fs.writeFileSync(path.join(__dirname, 'src/app/features/home/home.component.html'), homeHtml);

fs.writeFileSync(path.join(i18nPath, 'default.json'), JSON.stringify(defaultJson, null, 2));
fs.writeFileSync(path.join(i18nPath, 'en.json'), JSON.stringify(enJson, null, 2));
fs.writeFileSync(path.join(i18nPath, 'hi.json'), JSON.stringify(hiJson, null, 2));

console.log('Successfully updated Quick Link Hub translations.');
