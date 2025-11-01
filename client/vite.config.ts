import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8080',
      '/socket.io': {
        target: 'http://localhost:8080',
        ws: true
      }
    }
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three'],
          'three-loaders': [
            'three/examples/jsm/loaders/GLTFLoader',
            'three/examples/jsm/loaders/OBJLoader',
            'three/examples/jsm/loaders/FBXLoader'
          ],
          'three-postprocessing': [
            'three/examples/jsm/postprocessing/EffectComposer',
            'three/examples/jsm/postprocessing/RenderPass',
            'three/examples/jsm/postprocessing/UnrealBloomPass',
            'three/examples/jsm/postprocessing/SSAOPass'
          ],
          'react-vendor': ['react', 'react-dom'],
          'game-core': [
            './src/core/Engine',
            './src/core/GameEngine',
            './src/core/PlayerController'
          ],
          'game-world': [
            './src/world/ChunkManager',
            './src/world/TerrainGenerator',
            './src/world/BiomeSystem',
            './src/world/VegetationManager'
          ],
          'game-systems': [
            './src/systems/CharacterSystem',
            './src/systems/CombatSystem',
            './src/systems/InventorySystem'
          ]
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug']
      }
    }
  },
  optimizeDeps: {
    include: ['three', 'react', 'react-dom']
  }
});
