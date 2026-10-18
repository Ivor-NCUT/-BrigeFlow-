// Operator-only: JSON on stdin, never put passwords in argv or logs. Existing IDs are not reassigned.
import {client} from '../backend/src/db/index';
import {hashPassword,initializeAuth} from '../backend/src/local-auth';
import {randomUUID} from 'node:crypto';
const chunks=[];for await(const c of process.stdin)chunks.push(c);
const {email,password}=JSON.parse(Buffer.concat(chunks).toString());
if(typeof email!=='string'||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)throw Error('Valid email required');
await initializeAuth();
await client`INSERT INTO bridgeflow_users(id,email,password_hash) VALUES(${randomUUID()},${email.trim().toLowerCase()},${hashPassword(password)})`;
console.log('Account provisioned');await client.end();
