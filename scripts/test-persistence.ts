import assert from 'node:assert/strict';
import {createHash,randomUUID} from 'node:crypto';
import {writeFile,readFile,unlink} from 'node:fs/promises';
import {client} from '../backend/src/db/index';
const file='/data/avatars/.migration-persistence-check';
if(process.argv[2]==='stage'){
 const value=randomUUID();await writeFile(file,value,{flag:'wx'});
 await client`CREATE TABLE IF NOT EXISTS migration_archive.persistence_probe (id text PRIMARY KEY)`;
 await client`INSERT INTO migration_archive.persistence_probe VALUES(${createHash('sha256').update(value).digest('hex')})`;
 console.log('persistence marker staged');
}else{
 const value=await readFile(file,'utf8');const rows=await client`SELECT id FROM migration_archive.persistence_probe`;
 assert.equal(rows.length,1);assert.equal(rows[0].id,createHash('sha256').update(value).digest('hex'));
 await client`DELETE FROM migration_archive.persistence_probe`;await unlink(file);console.log('volume and database persistence passed; marker removed');
}
await client.end();
