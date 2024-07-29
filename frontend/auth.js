const api = new API();

var formState = 'auth';
function switchToRegister(){
    formState = 'register';
    $(".register").show();
    $(".btnA").text('Register!');
    $(".btnB").text('login');
}
function switchToAuth(){
    formState = 'auth';
    $(".register").hide();
    $(".btnA").text('Login!');
    $(".btnB").text('register');
}

async function login(){
    return api.login({
        email       : $('#emailInput').val(),
        password    : $('#passwordInput').val()
    }).then( res => {
            alarma( res.ok ? 'Login successful!' :
                    res.error.code == 2 ? 'No user with these credentials' :
                    'Login failed');
            if(res.ok)
                window.open("account.html", "_self");
        });
}

async function register(){
    const userData = {
        email       : $('#emailInput').val(),
        fname       : $('#fnameInput').val(),
        lname       : $('#lnameInput').val(),
        sex         : $('input[name="sexInput"]:checked').val(),
        password    : $('#passwordInput').val(),
        dob         : $('#ageInput').val()
    }
    if($('#passwordConfirm').val() !== userData.password)
        return alert('Input passwords don\'t match!');
    console.log(userData);
    for(const field in userData)
        if(!userData[field])
            return alert('Please fill all necessary fields!');
    return api.register(userData).then( async res => {
        alarma( res.ok ? 'Registration successful!' : 'Registration failed');
        if(res.ok){
            console.log('auth login fire');
            const resLogin = await api.login({
                email       : $('#emailInput').val(),
                password    : $('#passwordInput').val()
            })
            console.log('auth login done');
            if(resLogin.ok){
                console.log('auth upload fire');
                const resUpl = await api.upload('avatar');
                console.log('auth upload done');
                console.log(resUpl);
            }
        }
    });
}

async function main(){
    const whoRes = await api.whoami();
    if(whoRes.ok){
        $(".menulabel").text(`Hello, ${whoRes.data.fname}!`);
        $(".menuOptionWrapper").show();
    }
    $('.btnA').click( (e) => 
        formState == 'auth' ? login() : register()
    );
    $('.btnB').click( (e) => 
        formState == 'auth' ? switchToRegister() : switchToAuth()
    );
    $("#uploadPhotoBtn").click( (e) => {
        console.log('upload');
    });
}
main();

