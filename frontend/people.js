const api = new API();

function inhabit(peopleArray, excludeEmail){
    peopleArray.forEach( person =>{
        if(person.email != excludeEmail)
            $('.mainframe').append( genRecord(
                    person.avatarID,
                    person.fname,
                    person.lname,
                    person.dob
                )
            );
        }
    );
}

function genRecord(avatarID, fname, lname, dateOfBirth){
    return `
    <div class="cvFrame">
        <img src="/media/img/avatar/${avatarID}.jpg" width="150px" height="auto">
        <div class="cvFrameInner">
            <div class="cvSkillRecord" style="background-color: var(--tableCellColor)" "="">
                <div class="cvSkillRecordName">Имя</div>
                <div class="cvSkillRecordVal">${fname}</div>
            </div> 
            <div class="cvSkillRecord" "="">
                <div class="cvSkillRecordName">Фамилия</div>
                <div class="cvSkillRecordVal">${lname}</div>
            </div>
            <div class="cvSkillRecord" style="background-color: var(--tableCellColor)" "="">
                <div class="cvSkillRecordName">Возраст</div>
                <div class="cvSkillRecordVal">${dob2age(dateOfBirth)}</div>
            </div> 
        </div>
    </div>
    `;
}

async function main(){
    const whoRes = await api.whoami();
    if(whoRes.ok){
        $(".menulabel").text(`Hello, ${whoRes.data.fname}!`);
        $(".menuOptionWrapper").show();
    }
    const resList = await api.listUsers();
    if(!resList.ok){
        if(resList.error.code == 8){
            alert('You have logged out, please login in order to view this page')
            window.open("auth.html", "_self");
            return;
        }
        alert('Error getting user list, see console')
        console.log(resList.error);
        return;
    }
    inhabit(resList.data, whoRes.data.email);
}
main();



