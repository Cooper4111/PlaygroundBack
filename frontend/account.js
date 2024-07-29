const api = new API();

async function main() {
    const whoRes = await api.whoami();
    if(whoRes.ok){
        $(".menulabel").text(`Hello, ${whoRes.data.fname}!`);
        $(".menuOptionWrapper").show();
    }
    else
        window.open("auth.html", "_self");
    $('.btnA').click( (e) => 
        formState == 'view' ? switchToEdit() : submit()
    );
    $('.btnB').click( (e) => switchToView() );
    console.log(whoRes.data);
    console.log(`${whoRes.data.dob} -> ${dob2age(whoRes.data.dob)}`);
    $('.cvFrameWrapper').prepend(genProfile(whoRes.data));
}
main();

var formState = 'view';
function switchToEdit(){
    formState = 'edit';
    $(".mainForm").show();
    $(".cvFrameWrapper").hide();
    $(".btnA").text('Submit!');
}
function switchToView(){
    formState = 'view';
    $(".cvFrameWrapper").show();
    $(".mainForm").hide();
    $(".btnA").text('Edit!');
}
async function submit(){
    const userData = {
        fname       : $('#fnameInput').val(),
        lname       : $('#lnameInput').val(),
        password    : $('#passwordInput').val()
    }
    if($('#passwordConfirm').val() !== userData.password)
        return alert('Input passwords don\'t match!');
    return api.update(userData).then( async res => {
            if(!res.ok)
                return alarma('Edit failed');
            alarma('Edit successful!');
            // TODO: refresh JWT since it's the source of user data
            // await api.logout();
            // await api.login();
        });
}
function genProfile(user){
    return `
    <div class="cvFrame">
        <img src="/media/img/avatar/${user.avatarID}.jpg" width="150px" height="auto">
        <div class="cvFrameInner">
            <div class="cvSkillRecord" style="background-color: var(--tableCellColor)" "="">
                <div class="cvSkillRecordName">Имя</div>
                <div class="cvSkillRecordVal">${user.fname}</div>
            </div> 
            <div class="cvSkillRecord" "="">
                <div class="cvSkillRecordName">Фамилия</div>
                <div class="cvSkillRecordVal">${user.lname}</div>
            </div>
            <div class="cvSkillRecord" style="background-color: var(--tableCellColor)" "="">
                <div class="cvSkillRecordName">Возраст</div>
                <div class="cvSkillRecordVal">${dob2age(user.dob)}</div>
            </div>
            <div class="cvSkillRecord" "="">
                <div class="cvSkillRecordName">Пол</div>
                <div class="cvSkillRecordVal">${user.sex}</div>
            </div>
        </div>
    </div>
    `;
}