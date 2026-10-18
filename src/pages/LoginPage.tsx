import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { localBackend } from '../lib/localBackend';
export default function LoginPage(){
 const navigate=useNavigate(); const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState(''),[loading,setLoading]=useState(false);
 async function submit(e:React.FormEvent){e.preventDefault();setLoading(true);setError('');try{const result=await localBackend.auth.signInWithPassword({email,password});if(result.error)throw result.error;navigate('/');}catch(e){setError(e instanceof Error?e.message:'登录失败');}finally{setLoading(false);}}
 return <main className="min-h-screen flex items-center justify-center bg-surface-bg p-4"><form onSubmit={submit} className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-4"><h1 className="text-2xl font-bold">缘脉 BridgeFlow</h1><p>登录以管理您的关系资产</p><label className="block">邮箱<input className="block w-full border p-2" type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label className="block">密码<input className="block w-full border p-2" type="password" autoComplete="current-password" required maxLength={256} value={password} onChange={e=>setPassword(e.target.value)}/></label>{error&&<p role="alert">{error}</p>}<button type="submit" disabled={loading} className="w-full rounded bg-black text-white p-2">{loading?'登录中…':'登录'}</button><p className="text-sm">账号开通或密码重置请联系管理员。</p></form></main>;
}
