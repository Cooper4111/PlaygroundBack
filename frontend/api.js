class API {

    constructor(){
        this.baseURL = 'http://localhost:4000';
        this.loginEP = this.baseURL + '/api/login';
    }

    async login(email, password){
        var payload = {
            user : {
                email    :  email,
                password :  password
            }
        };
        const settings = {
            method: 'POST',
            headers: {
                'Accept'        : 'application/json',
                'Content-Type'  : 'application/json',
            },
            body: JSON.stringify(payload),
            credentials : 'include'
        };
        try {
            const resp = await fetch(this.loginEP, settings);
            return resp.json();
        }
        catch (e) {
            return { ok: 0, error: e };
        }
    }

}

