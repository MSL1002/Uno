import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { transformAsync } from '@babel/core'

const transformJsxInJs = () => ({
  name: 'transform-jsx-in-js',
  enforce: 'pre',
  async transform(code, id) {
    if (!id.endsWith(".js")) return null
    const result = await transformAsync(code, {
      filename: id,
      presets: ['@babel/preset-react'],
      sourceMaps: true,
      configFile: false,
    })
    return { code: result.code, map: result.map }
  },
})

export default defineConfig({
  plugins: [react(), transformJsxInJs()],
  resolve: { tsconfigPaths: true },
})
