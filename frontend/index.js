const employeeDocLink = "https://docs.google.com/spreadsheets/d/1GpsBh2brKR8AcTFmVDhpJcQ4Z0Co03U4V51rLyvwa-s/edit#gid=1564357382"

async function main(){
    // alarma('Hello, KVCH!'); make it username
    const foo = ('; ' + document.cookie).split(`; CV_auth_JWT=`).pop().split(';')[0]
    console.log('COOOOOOOCKIe!');
    console.log(foo);
    console.log(document.cookie);
    const db = new DB();
    const tagArrRes = await db.getTagsAvaliable();
    if(!tagArrRes.ok){
        alert('Error requesting avaliable tags!');
        console.log('Ok? - ' + tagArrRes.ok)
    }
    const tagArr = tagArrRes.data;
    console.log('TagArr: ' + tagArr)
    const tagger  = new Tagger(tagArr);
    var bar = $('.suggestPanel').html()
    console.log('var bar: ' + bar);

    $('.tagInput').focus( (e) => {
        console.log('FOCUS ON TAG INP');
        setTimeout( () => {
                //console.log('TagInpFocIn');
                $('.suggestPanel').show();
                $('.searchBar').css('border-radius', 'var(--borderRadiusSmall) var(--borderRadiusSmall) 0px 0px');
            }, 100);
    });
    $('.tagInput').focusout( (e) => {
        setTimeout( () => {
                //console.log('TagInpFocOut');
                $('.suggestPanel').hide();
                $('.searchBar').css('border-radius', 'var(--borderRadiusSmall)');
            }, 200);
    });

    // add tags to suggestions 
    tagArr.forEach( (tag, i) => {
        const suggHTML = `<div class="suggestion" id="sugg-${i}">${tag}</div>`;
        $('.suggestPanel').append(suggHTML);
    });

    // add tag to search bar when click on suggestion
    // TODO: move to tagger
    $('.suggestion').click( (e) => {
        tagger.endBrowseSuggMode();
        var foo = $(e.target).html();
        console.log(foo);
        const tagInput = $('.tagInput');
        tagInput.val(foo);
        tagInput.focus();
        var e = $.Event("keydown");
        e.which = 13;
        tagInput.trigger(e);
    });
    tagger.initSuggestPanel();
    // DEBUG
    //const tags = encodeURIComponent(tagger.filter);
    //console.log('tags: ' + tags);

    $('.searchBtn').click( (e) => {
            const name = $('.nameInput').val();
            if(name == '' && tagger.filter.length == 0){
                alert('Please input skills required or surname of employee');
                return;
            }
            window.open("searchResult.html?tags=" + encodeURIComponent(tagger.filter) + "&name=" + encodeURIComponent(name), "_self");
        });
    $('.showEmployesBtn').click( (e) => {
            window.open("searchResult.html?tags=&name=", "_self");
        });
    $('.DBupdBtn').click( async (e) => {
        alarma('UPDATING DB');
            const res = await db.updDB();
            if(res.ok)
                alarma('DB updated');
            else{
                var error = res.error && res.error.desc ? res.error.desc : res.error;
                alarma('Failed to update DB: ' + error);
                console.error('>>> ERROR UPDATING DB:');
                console.log(res);
                if(res.error.meta.where)
                    console.log(res.error.meta.where);
            }
        });
    $('.gDocBtn').click( (e) => { window.open(employeeDocLink); });
}
main();