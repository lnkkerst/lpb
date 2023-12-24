import {
  defineConfig,
  presetUno,
  presetIcons,
  presetTagify,
  presetWebFonts,
  presetTypography,
  presetAttributify,
  transformerAttributifyJsx,
  transformerDirectives
} from 'unocss';

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons(),
    presetTagify(),
    presetWebFonts({
      fonts: {
        provider: 'google',
        mono: ['JetBrains Mono', 'monospace']
      }
    }),
    presetTypography(),
    presetAttributify()
  ],
  transformers: [transformerDirectives(), transformerAttributifyJsx()]
});
