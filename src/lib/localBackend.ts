const TOKEN_KEY='bridgeflow-session';
async function request(path:string, method='GET', body?:unknown) {
  const token=sessionStorage.getItem(TOKEN_KEY);
  const res=await fetch('/api/auth'+path,{method,headers:{...(token?{Authorization:`Bearer ${token}`}:{ }),...(body instanceof FormData?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:body instanceof FormData?body:JSON.stringify(body)});
  const data=await res.json();
  if(!res.ok)throw new Error(data.error||'Request failed');
  return data;
}
export const localBackend={auth:{
  async getCurrentSession(){
    const token=sessionStorage.getItem(TOKEN_KEY);
    if(!token)return {data:{session:null}};
    try{const data=await request('/session');return {data:{session:{user:data.user,accessToken:token}}};}
    catch{return {data:{session:null}};}
  },
  async signInWithPassword(credentials:{email:string;password:string}){
    try{const data=await request('/login','POST',credentials);sessionStorage.setItem(TOKEN_KEY,data.accessToken);return {data,error:null};}catch(error){return {data:null,error};}
  },
  async setProfile(profile:unknown){try{return {data:await request('/profile','PUT',profile),error:null};}catch(error){return {data:null,error};}},
  async signOut(){try{await request('/logout','POST');}finally{sessionStorage.removeItem(TOKEN_KEY);}},
},async uploadAvatar(file:File){const body=new FormData();body.set('file',file);return (await request('/avatar','POST',body)).url as string;}};
