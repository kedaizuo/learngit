let user_sign_in=false;

chrome.browserAction.onClicked.addListener(function(){
    if(!user_sign_in){
        
        chrome.windows.create({
            url:'./popup-sign-in.html',
            width:300,
            height:600,
            focused:true
        },function(){
            console.log("get clicked");
        });
        
    }
    else {
        chrome.windows.create({
            url:'./popup-sign-out.html',
            width:300,
            height:600,
            focused:true
        })
    }
})




function flipUserStatus(signIn,user_info) {
    
   
    
        if (signIn) {
            return fetch('http://localhost:3000/login', {
                method: 'GET',
                headers: {
                    'Authorization': 'Basic ' + btoa(`${user_info.email}:${user_info.pass}`)
                }
            })
                .then(res => {
                    return new Promise(resolve => {
                        if (res.status !== 200) resolve('fail')
    
                        chrome.storage.local.set({ userStatus: signIn, user_info }, function (response) {
                            if (chrome.runtime.lastError) resolve('fail');
    
                            user_signed_in = signIn;
                            resolve('success');
                        });
                    })
                })
                .catch(err => console.log(err));
        } 
        else if (!signIn) {
            // fetch the localhost:3000/logout route
            return new Promise(resolve => {
                chrome.storage.local.get(['userStatus', 'user_info'], function (response) {
                    console.log(response);
                    if (chrome.runtime.lastError) resolve('fail');
        
                    if (response.userStatus === undefined) resolve('fail');
        
                    fetch('http://localhost:3000/logout', {
                        method: 'GET',
                        headers: {
                            'Authorization': 'Basic ' + btoa(`${response.user_info.email}:${response.user_info.pass}`)
                        }
                    })
                        .then(res => {
                            console.log(res);
                            if (res.status !== 200) resolve('fail');
        
                            chrome.storage.local.set({ userStatus: signIn, user_info: {} }, function (response) {
                                if (chrome.runtime.lastError) resolve('fail');
        
                                user_signed_in = signIn;
                                resolve('success');
                            });
                        })
                        .catch(err => console.log(err));
                });
            });
        }

}
/*
chrome.runtime.onMessage.addListener((request,sender,sendResponse)=>{
    console.log(request.message);
    if (request.message == 'login'){
        console.log('5');
        flipUserStatus(true,request.payload)
            .then(res=>sendResponse(res))
            .catch(err => console.log(err));
            return true;
    }

    else if (request.message=='logout'){

    }
    else if (request.message == 'userStatus'){

    }
});*/
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'login') {
        
        flipUserStatus(true, request.payload)
            .then(res => sendResponse(res))
            .catch(err => console.log(err));

        return true;
    } else if (request.message === 'logout') {
        flipUserStatus(false, null)
            .then(res => sendResponse(res))
            .catch(err => console.log(err));

        return true;
    } 
});
