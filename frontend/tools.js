function alarma(alarmText, alarmID = "alarmFrame"){
    const el = document.getElementById(alarmID);
    el.innerHTML = `<p>${alarmText}</p>`;
    el.style.animation = 'none';
    el.offsetHeight; // trigger reflow
    el.style.animation = null;
}