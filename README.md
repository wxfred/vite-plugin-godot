# vite-plugin-godot

Embed and bundle [Godot](https://godotengine.org/) 4.x games using [Vite](https://vitejs.dev/).

[![npm][badge-version]][npm]
[![license][badge-license]][license]

The plugin allows you to export your Godot game directly to the `public` folder or its subfolder. The dev server will automatically include the appropriate headers that will make the page cross-origin isolated (required for `SharedArrayBuffer`).

See example in [`examples/vanilla`][examples-vanilla].

## Usage

Install the package:

```bash
npm install vite-plugin-godot -D
```

Add the plugin to `vite.config.js`:

```ts
import { defineConfig } from 'vite';
import godotPlugin from 'vite-plugin-godot';

export default defineConfig({
  plugins: [
    godotPlugin({
      // Set this to your exported name with base url
      projectName: 'godot/example2d',
      // Reload the page when detected changes in main.js
      reload: ['src/main.js'],
    }),
  ],
});
```

Make sure you have a `canvas` element somewhere in your DOM, then add the following to your `index.html`:

```html
<div id="app"></div>
<script src="$GODOT_JS_FILE"></script>
<script>
  const GODOT_CONST = $GODOT_CONST;
  window.engine = new Engine(GODOT_CONST.GODOT_CONFIG);
</script>
<script type="module" src="/src/main.js"></script>
```

Now you can start the game in your script:

```js
window.engine.startGame();
```

## Vue Usage

```js
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import godotPlugin from 'vite-plugin-godot'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    godotPlugin({
      projectName: 'godot/index',
    }),
  ],
})
```

```html
<!-- index.html -->
<div id="app"></div>
<script src="$GODOT_JS_FILE"></script>
<script type="module" src="/src/main.js"></script>
```

```vue
// App.vue
<script setup>
import HelloWorld from './components/HelloWorld.vue'
import GodotConst from 'virtual:godot-const'
console.log(GodotConst)
const missing = window.Engine.getMissingFeatures({
	threads: GodotConst.GODOT_THREADS_ENABLED,
})
console.log(missing)
const engine = new window.Engine(GodotConst.GODOT_CONFIG)
engine.startGame()
</script>
```

## Export

Export the game using `Web` preset and set the directory to the `public` folder.

You can read more about exporting HTML in [Godot docs](https://docs.godotengine.org/en/latest/tutorials/platform/web/customizing_html5_shell.html).

## License

This project is licensed under the [MIT License][license].

[badge-version]: https://img.shields.io/npm/v/vite-plugin-godot.svg
[badge-license]: https://img.shields.io/npm/l/vite-plugin-godot.svg

[npm]: https://www.npmjs.com/package/vite-plugin-godot
[license]: https://github.com/itsKaynine/vite-plugin-godot/blob/main/LICENSE

[examples-vanilla]: https://github.com/itsKaynine/vite-plugin-godot/tree/main/examples/vanilla
