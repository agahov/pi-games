import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = resolve(fileURLToPath(import.meta.url), '..')
const root = resolve(__dirname, '../..')

describe('scaffold', () => {
    describe('directory structure', () => {
        const expectedDirs = [
            'src/kernel',
            'src/ecs/systems',
            'src/pixi',
            'src/ui/components',
            'src/__tests__',
        ]

        it.each(expectedDirs)('contains %s', (dir) => {
            expect(existsSync(resolve(root, dir))).toBe(true)
        })
    })

    describe('config files exist', () => {
        const expectedFiles = [
            'package.json',
            'vite.config.ts',
            'tsconfig.json',
            'index.html',
            'src/main.ts',
        ]

        it.each(expectedFiles)('contains %s', (file) => {
            expect(existsSync(resolve(root, file))).toBe(true)
        })
    })

    describe('index.html structure', () => {
        const html = readFileSync(resolve(root, 'index.html'), 'utf-8')

        it('has #canvas-layer', () => {
            expect(html).toContain('id="canvas-layer"')
        })

        it('has #ui-layer with pointer-events: none', () => {
            expect(html).toContain('id="ui-layer"')
            expect(html).toContain('pointer-events: none')
        })
    })
})
