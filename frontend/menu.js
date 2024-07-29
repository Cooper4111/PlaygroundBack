$('.menubtn').click( async e => {
    const text = $(e.target).text();
    console.log(text);
    switch(text){
        case 'My Account':
            window.open("account.html", "_self");
            break;
        case 'People':
            window.open("people.html", "_self");
            break;
        case 'Logout':
            await api.logout();
            window.location.reload();
            break;
    }
});