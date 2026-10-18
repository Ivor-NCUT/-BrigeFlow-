import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {rm} from 'node:fs/promises';
import {join} from 'node:path';
import {client} from '../backend/src/db/index';
import {hashPassword} from '../backend/src/local-auth';
const base='http://127.0.0.1:3001',a=randomUUID(),b=randomUUID(),password=randomUUID()+'X',email=a+'@example.invalid';
let contact:any, avatar='';
async function req(path:string,token='',method='GET',body?:any){return fetch(base+path,{method,headers:{...(token?{Authorization:'Bearer '+token}:{}),...(body instanceof FormData?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:body instanceof FormData?body:JSON.stringify(body)});}
try{
 await client`INSERT INTO bridgeflow_users(id,email,password_hash) VALUES(${a},${email},${hashPassword(password)}),(${b},${b+'@example.invalid'},${hashPassword(password)})`;
 assert.equal((await req('/api/contacts')).status,401);
 assert.equal((await req('/api/contacts','eyJhbGciOiJub25lIn0.eyJzdWIiOiJhZG1pbiJ9.')).status,401);
 assert.equal((await req('/api/auth/login','','POST',{email,password:'wrong'})).status,401);
 const login=await req('/api/auth/login','','POST',{email,password});assert.equal(login.status,200);const {accessToken:token}=await login.json();
 const other=await req('/api/auth/login','','POST',{email:b+'@example.invalid',password});const {accessToken:tokenB}=await other.json();
 assert.equal((await req('/api/auth/session',token)).status,200);
 const created=await req('/api/contacts',token,'POST',{name:'INSTA_SYNTHETIC_ONLY',createdAt:new Date().toISOString(),lastContactedAt:new Date().toISOString()});assert.equal(created.status,200);contact=await created.json();
 const list=await (await req('/api/contacts',token)).json();assert(list.some((x:any)=>x.id===contact.id));
 const otherList=await (await req('/api/contacts',tokenB)).json();assert(!otherList.some((x:any)=>x.id===contact.id));
 assert.equal((await req('/api/contacts/'+contact.id,tokenB,'PUT',{name:'forbidden'})).status,404);
 await req('/api/contacts/'+contact.id,token,'PUT',{userId:b,name:'updated'});
 const [row]=await client`SELECT user_id FROM contacts WHERE id=${contact.id}`;assert.equal(row.user_id,a);
 const profile=await req('/api/auth/profile',token,'PUT',{name:'Synthetic',avatar_url:''});assert.equal(profile.status,200);
 let form=new FormData();form.set('file',new Blob(['<svg/>'],{type:'image/svg+xml'}),'x.svg');assert.equal((await req('/api/auth/avatar',token,'POST',form)).status,400);
 form=new FormData();const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jhAAAAABJRU5ErkJggg==','base64');form.set('file',new Blob([png],{type:'image/png'}),'x.png');const upload=await req('/api/auth/avatar',token,'POST',form);assert.equal(upload.status,200);avatar=(await upload.json()).url;
 const img=await req(avatar);assert.equal(img.status,200);assert.deepEqual(Buffer.from(await img.arrayBuffer()),png);
 assert.equal((await req('/api/auth/profile',token,'PUT',{avatar_url:avatar})).status,200);
 await req('/api/auth/logout',token,'POST');assert.equal((await req('/api/contacts',token)).status,401);
 console.log(JSON.stringify({auth:true,forged_jwt_rejected:true,account_isolation:true,ownership_immutable:true,profile:true,avatar_roundtrip:true,svg_rejected:true,logout_revocation:true}));
}finally{
 if(contact)await client`DELETE FROM contacts WHERE id=${contact.id}`;
 await client`DELETE FROM bridgeflow_users WHERE id IN (${a},${b})`;
 await rm(join(process.env.MEDIA_DIR||'/data/avatars',a),{recursive:true,force:true});
 await client.end();
}
