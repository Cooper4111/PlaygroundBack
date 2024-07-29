class API {

    constructor(){
        this.baseURL    = 'http://localhost:4000';
        this.loginEP    = this.baseURL + '/api/login';
        this.logoutEP   = this.baseURL + '/api/logout';
        this.listEP     = this.baseURL + '/api/user/list';
        this.whoamiEP   = this.baseURL + '/api/whoami';
        this.createEP   = this.baseURL + '/api/user/create';
        this.updateEP   = this.baseURL + '/api/user/update';
    }

    logout    = async () => fetchwrap(this.logoutEP);
    whoami    = async () => fetchwrap(this.whoamiEP);
    listUsers = async () => fetchwrap(this.listEP);
    
    register  = async (userData) => fetchwrap(this.createEP, 'POST', { user : userData });
    login     = async (userData) => fetchwrap(this.loginEP,  'POST', { user : userData });
    update    = async (userData) => fetchwrap(this.updateEP, 'POST', { user : userData });

    upload    = async (formID)   => {
        const formData = new FormData();
        const avatar = document.getElementById(formID).files[0];
        formData.append(formID, avatar);
        console.log('api upload fire');
        try {
            const response = await fetch('http://localhost:4000/api/upload', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            const data = await response.json();
            
            document.getElementById('message').textContent = data.message;
        } catch (error) {
            document.getElementById('message').textContent = 'Error uploading file';
        }
    };

}

const fetchwrap = async (EP, method = 'GET', payload) => {
    const settings = {
        method: method,
        headers: {
            'Accept'        : 'application/json',
            'Content-Type'  : 'application/json',
        },
        credentials : 'include'
    };
    if(payload)
        settings.body = JSON.stringify(payload);
    try {
        const resp = await fetch(EP, settings);
        return resp.json();
    }
    catch (e) {
        return { ok: 0, error: e };
    }
}