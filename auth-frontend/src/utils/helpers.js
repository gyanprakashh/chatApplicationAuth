import cookie from 'js-cookie';

export const setCookie=(key,value)=>{
    if(window!=='undefined'){
       cookie.set(key,value,{
           expires:1
       });
    }
};

export const removeCookie=(key)=>{
    if(window!=='undefined'){
        cookie.remove(key,{
            expires:1
        })
    }
};

export const getCookie=(key)=>{
    if(window!=='undefined'){
        return cookie.get(key);
    }
}

export const setLocalStorage=(key,value)=>{
    if(window!=='undefined'){
       localStorage.setItem(key,JSON.stringify(value));
    }
};

export const removeLocalStorage=(key)=>{
    if(window!=='undefined'){
        localStorage.removeItem(key);
    }
};

export const authenticate=(response,next)=>{
   console.log('Authenticate helper in sign in response', response);
   setCookie("token",response.data.token);
   setLocalStorage('user',response.data.user);
   next();
};

export const isAuth=()=>{
    if(window!=='undefined'){
        const cookieChecked=getCookie('token');
        if(cookieChecked){
            if(localStorage.getItem('user')){
                return JSON.parse(localStorage.getItem('user'));
            }
            return false;
        }
    }
};

export const signout=(next)=>{
    removeCookie('token');
    removeLocalStorage('user');
    window.location.reload();
    next();
}

export const updateUser=(response,next)=>{
    console.log('update user in local storage helper', response);
    if(typeof window !=='undefined'){
        let auth=JSON.parse(localStorage.getItem('user'));
        auth=response.data;
        localStorage.setItem('user',JSON.stringify(auth));
    }
    next();
}