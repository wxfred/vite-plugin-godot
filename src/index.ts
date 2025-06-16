import fs from 'fs';
import path from 'path';

import type { Connect, PluginOption } from 'vite';
import ViteRestart from 'vite-plugin-restart';

const GODOT_CONST_PREFIX = 'const GODOT_';

export interface VitePluginGodotConfig {
  /**
   * The exported project name (eg. example2d)
   */
  projectName: string;
  /**
   * The token to search for $GODOT_CONFIG in the exported js file (you may need to set this if you use a Custom HTML Shell)
   * 
   * @default const GODOT_CONFIG = 
   */
  configToken?: string;
  /**
   * Array of files to watch, changes to those file will trigger a server restart
   */
  restart?: string[];
  /**
   * Array of files to watch, changes to those file will trigger a client full page reload
   */
  reload?: string[];
}

const tokenReplacePlugin = (token: string, replacement: string) => ({
  name: 'token-replace',
  transformIndexHtml(html: string) {
    return html.replace(token, replacement);
  },
});

const godotPlugin = (config: VitePluginGodotConfig): PluginOption[] => {
  const htmlFile = `${config.projectName}.html`;
  const jsFile = `${config.projectName}.js`;

  const godotHtml = fs.readFileSync(`public/${htmlFile}`, { encoding: 'utf8' });
  const godotConst: Record<string, any> = {};
  godotHtml.split(/\r?\n/).forEach((line) => {
    if (!line.startsWith(GODOT_CONST_PREFIX)) return;
    const splits = line.split('=');
    const key = splits[0].replace('const', '').trim();
    let val = splits[1].replace(';', '').trim();
    if (key === 'GODOT_CONFIG') {
      const obj = JSON.parse(val);
      obj.executable = config.projectName;
      val = JSON.stringify(obj, null, 2);
    }
    godotConst[key] = new Function(`return ${val}`)();
  });

  const setHeaders: Connect.NextHandleFunction = (_req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    next();
  };

  return [
    ViteRestart({
      restart: config.restart ?? ['index.html'],
      reload: config.reload ?? [],
    }),
    tokenReplacePlugin('$GODOT_CONST', JSON.stringify(godotConst)),
    tokenReplacePlugin('$GODOT_JS_FILE', jsFile),
    {
      name: 'remove-godot-html',
      generateBundle(outputOptions) {
        const distDir = outputOptions.dir ?? path.dirname(outputOptions.file ?? '');
        const testHtmlPath = path.join(distDir, htmlFile);

        if (fs.existsSync(testHtmlPath)) {
          fs.unlinkSync(testHtmlPath);
        }
      },
    },
    {
      name: 'configure-server',
      configureServer(server) {
        server.middlewares.use(setHeaders);
      },
    },
    {
      name: 'configure-preview-server',
      configurePreviewServer(server) {
        server.middlewares.use(setHeaders);
      },
    },
    {
      name: 'virtual-godot-const',
      resolveId(id: string) {
        if (id === 'virtual:godot-const') {
          return id;
        }
        return null;
      },
      load(id: string) {
        if (id === 'virtual:godot-const') {
          return `export default ${JSON.stringify(godotConst)}`;
        }
        return null;
      },
    },
  ];
};

export default godotPlugin;

