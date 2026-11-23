// Собирает dist четырёх приложений в site/<app>/ и кладёт индекс-страницу для GitHub Pages.
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';

const apps = [
  ['kiosk-m3', 'Фудкорт · M3 Expressive'],
  ['kiosk-hig', 'Фудкорт · Apple HIG'],
  ['yacht-m3', 'Яхта · M3 Expressive'],
  ['yacht-hig', 'Яхта · Apple HIG'],
];

rmSync('site', { recursive: true, force: true });
mkdirSync('site');
for (const [app] of apps) {
  const dist = `apps/${app}/dist`;
  if (!existsSync(dist)) throw new Error(`${dist} не найден — сначала соберите приложение`);
  cpSync(dist, `site/${app}`, { recursive: true });
}
const links = apps.map(([app, title]) => `<li><a href="./${app}/">${title}</a></li>`).join('\n      ');
writeFileSync(
  'site/index.html',
  `<!doctype html>
<html lang="ru">
  <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Прототипы</title></head>
  <body>
    <h1>Прототипы</h1>
    <ul>
      ${links}
    </ul>
  </body>
</html>
`,
);
writeFileSync('site/.nojekyll', '');
console.log('site/ готов');
