/**
 * env.d.ts — Module declaration shims for TypeScript.
 */

/// <reference types="vite/client" />

declare module '*.vue' {
   import { DefineComponent } from 'vue';
    const comp: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
     export default comp;
}

declare module '*.css';
