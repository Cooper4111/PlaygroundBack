const api = new API();

async function main(){

    $('.searchBtn').click( (e) => {
        const email    = $('#emailInput').val();
        const password = $('#passwordInput').val();
        console.log(email + password);
        
        api.login(email, password).then( res => {
                alarma( res.ok ? 'Login successful!' : 'Login failed');
                // ...and redirrect to /people
            });
    });

}
main();

