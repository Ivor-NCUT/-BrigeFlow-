import { randomBytes, createHash, scryptSync, timingSafeEqual } from 'node:crypto';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { client } from './db/index';

const digest = (v: string) => createHash('sha256').update(v).digest('hex');
export function hashPassword(password: string) {
  if (password.length < 12 || password.length > 256) throw new Error('Password must be 12–256 characters');
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}
function passwordMatches(password: string, stored: string) {
  const [salt, hash] = stored.split(':');
  if (!salt || !/^[a-f0-9]{128}$/.test(hash || '')) return false;
  return timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(hash, 'hex'));
}
const dummyHash = hashPassword(randomBytes(24).toString('hex'));
export async function initializeAuth() {
  await client`CREATE TABLE IF NOT EXISTS bridgeflow_users (id text PRIMARY KEY, email text NOT NULL UNIQUE, password_hash text NOT NULL, profile jsonb NOT NULL DEFAULT '{}', disabled boolean NOT NULL DEFAULT false)`;
  await client`CREATE TABLE IF NOT EXISTS bridgeflow_sessions (token_hash text PRIMARY KEY, user_id text NOT NULL REFERENCES bridgeflow_users(id) ON DELETE CASCADE, expires_at timestamptz NOT NULL)`;
  await client`CREATE TABLE IF NOT EXISTS bridgeflow_login_attempts (email_hash text PRIMARY KEY, attempts integer NOT NULL, started_at timestamptz NOT NULL)`;
}
const publicUser = (u: any) => ({ id: u.id, email: u.email, profile: u.profile });
export async function sessionUser(header: string | undefined) {
  if (!header?.match(/^Bearer [a-f0-9]{64}$/)) return null;
  const [u] = await client`SELECT u.id,u.email,u.profile FROM bridgeflow_sessions s JOIN bridgeflow_users u ON u.id=s.user_id WHERE s.token_hash=${digest(header.slice(7))} AND s.expires_at>now() AND NOT u.disabled`;
  return u || null;
}
export async function authMiddleware(c: any, next: any) {
  const u = await sessionUser(c.req.header('Authorization'));
  if (!u) return c.json({ error: 'Unauthorized' }, 401);
  c.set('user', u);
  return next();
}
export function localAuthRoutes() {
  const app = new Hono();
  app.use('*', bodyLimit({ maxSize: 5 * 1024 * 1024 + 8192 }));
  app.post('/login', async c => {
    const { email, password } = await c.req.json();
    if (typeof email !== 'string' || email.length > 254 || typeof password !== 'string' || password.length > 256) return c.json({error:'Invalid credentials'},400);
    const normalized = email.trim().toLowerCase(), key = digest(normalized);
    const [attempt] = await client`INSERT INTO bridgeflow_login_attempts(email_hash,attempts,started_at) VALUES(${key},1,now()) ON CONFLICT(email_hash) DO UPDATE SET attempts=CASE WHEN bridgeflow_login_attempts.started_at<now()-interval '15 minutes' THEN 1 ELSE bridgeflow_login_attempts.attempts+1 END,started_at=CASE WHEN bridgeflow_login_attempts.started_at<now()-interval '15 minutes' THEN now() ELSE bridgeflow_login_attempts.started_at END RETURNING attempts`;
    if (attempt.attempts > 10) return c.json({error:'Too many attempts. Try later.'},429);
    const [u] = await client`SELECT * FROM bridgeflow_users WHERE email=${normalized}`;
    const valid = passwordMatches(password, u?.password_hash || dummyHash);
    if (!u || u.disabled || !valid) return c.json({error:'Invalid credentials'},401);
    await client`DELETE FROM bridgeflow_login_attempts WHERE email_hash=${key}`;
    await client`DELETE FROM bridgeflow_sessions WHERE expires_at<now()`;
    const token=randomBytes(32).toString('hex');
    await client`INSERT INTO bridgeflow_sessions VALUES(${digest(token)},${u.id},now()+interval '7 days')`;
    c.header('Cache-Control','no-store');
    return c.json({accessToken:token,user:publicUser(u)});
  });
  app.use('*', authMiddleware);
  app.get('/session', c => { c.header('Cache-Control','no-store'); return c.json({user:c.get('user' as never)}); });
  app.post('/logout', async c => {
    await client`DELETE FROM bridgeflow_sessions WHERE token_hash=${digest(c.req.header('Authorization')!.slice(7))}`;
    return c.json({success:true});
  });
  app.put('/profile', async c => {
    const u:any=c.get('user' as never), v=await c.req.json();
    const patch:any={};
    if (v.name!==undefined) { if(typeof v.name!=='string'||v.name.length>200)return c.json({error:'Invalid name'},400);patch.name=v.name; }
    if(v.avatar_url!==undefined) { if(typeof v.avatar_url!=='string'||(v.avatar_url!==''&&!new RegExp('^/media/avatars/'+u.id.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'/[a-f0-9]{32}\\.(png|jpg|webp)$').test(v.avatar_url)))return c.json({error:'Invalid avatar'},400);patch.avatar_url=v.avatar_url; }
    const [r]=await client`UPDATE bridgeflow_users SET profile=profile||${JSON.stringify(patch)}::jsonb WHERE id=${u.id} RETURNING profile`;
    return c.json(r.profile);
  });
  app.post('/avatar',async c=>{
    const u:any=c.get('user' as never), form=await c.req.formData(), f=form.get('file');
    if(!(f instanceof File)||f.size===0||f.size>5*1024*1024)return c.json({error:'Image must be 1 byte to 5 MiB'},400);
    const b=Buffer.from(await f.arrayBuffer());
    const ext=b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))?'png':b[0]===255&&b[1]===216&&b[2]===255?'jpg':b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP'?'webp':null;
    if(!ext)return c.json({error:'Only PNG, JPEG, WebP allowed'},400);
    if(!/^[a-zA-Z0-9_-]+$/.test(u.id))return c.json({error:'Unsupported user identifier'},400);
    const name=randomBytes(16).toString('hex')+'.'+ext;
    const dir=join(process.env.MEDIA_DIR||'/data/avatars',u.id);await mkdir(dir,{recursive:true});await writeFile(join(dir,name),b,{flag:'wx',mode:0o600});
    return c.json({url:'/media/avatars/'+u.id+'/'+name});
  });
  return app;
}
export async function serveAvatar(c:any) {
  const user=c.req.param('user'),file=c.req.param('file');
  if(!/^[a-zA-Z0-9_-]+$/.test(user)||! /^[a-f0-9]{32}\.(png|jpg|webp)$/.test(file))return c.notFound();
  try { const b=await readFile(join(process.env.MEDIA_DIR||'/data/avatars',user,file));c.header('Content-Type',file.endsWith('.png')?'image/png':file.endsWith('.jpg')?'image/jpeg':'image/webp');c.header('X-Content-Type-Options','nosniff');return c.body(b); } catch{return c.notFound();}
}
