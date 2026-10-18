import { build } from 'esbuild';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const cases = [
  { name: 'production stays on the serving origin', dev: false, override: '', expected: '/api/health' },
  { name: 'development keeps its local backend', dev: true, override: '', expected: 'http://localhost:3001/api/health' },
  { name: 'an explicit API endpoint takes precedence', dev: false, override: 'https://example.invalid', expected: 'https://example.invalid/api/health' },
];
for (const item of cases) {
  const output = await build({
    entryPoints: ['src/lib/api.ts'], bundle: true, write: false, format: 'cjs',
    define: { 'import.meta.env.DEV': JSON.stringify(item.dev), 'import.meta.env.VITE_API_BASE_URL': JSON.stringify(item.override) },
    plugins: [{ name: 'synthetic-session', setup(builder) {
      builder.onResolve({filter: /^\.\/insforge$/}, () => ({path:'session', namespace:'test'}));
      builder.onLoad({filter: /.*/, namespace:'test'}, () => ({contents:'export const insforge={auth:{getCurrentSession:async()=>({data:{session:null}})}};'}));
    }}],
  });
  const calls=[];
  const ctx=vm.createContext({module:{exports:{}},fetch:async url=>{calls.push(url);return {status:200};}});
  vm.runInContext(output.outputFiles[0].text,ctx);
  await ctx.module.exports.api.fetch('/api/health');
  assert.deepEqual(calls,[item.expected],item.name);
  console.log(`PASS ${item.name}`);
}
