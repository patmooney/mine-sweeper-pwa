import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    base: '',
    plugins: [tailwindcss(), solid(), VitePWA({
        registerType: 'prompt',
        injectRegister: false,

        pwaAssets: {
            disabled: false,
            config: true,
        },

        manifest: {
            name: 'free-sweep',
            short_name: 'free-sweep',
            description: 'free-sweep',
            theme_color: '#8c8c8c',
        },

        workbox: {
            globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
            cleanupOutdatedCaches: true,
            clientsClaim: true,
        },

        devOptions: {
            enabled: false,
            navigateFallback: 'index.html',
            suppressWarnings: true,
            type: 'module',
        },
    })],
    resolve: {
        conditions: [ ...(mode === "development" ? ["development"] : []) ]
    }
}));
