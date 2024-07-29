function alarma(alarmText, alarmID = "alarmFrame"){
    const el = document.getElementById(alarmID);
    el.innerHTML = `<p>${alarmText}</p>`;
    el.style.animation = 'none';
    el.offsetHeight; // trigger reflow
    el.style.animation = null;
}

function dob2age(dateOfBirth, delimiter = '.') {
    try {
        const delimiters = ['.', '/', '-'];
        let detectedDelimiter = delimiter;
        
        if (!delimiters.includes(delimiter) || !dateOfBirth.includes(delimiter))
            for (let char of delimiters)
                if (dateOfBirth.includes(char)) {
                    detectedDelimiter = char;
                    break;
                }
        let day, month, year;
        const parts = dateOfBirth.split(detectedDelimiter);
        if(parts.length === 3){
            if (parts[0].length === 4)
                [year, month, day] = parts.map(Number); // Assuming format is "year-month-day"
            else if (parts[2].length === 4)
                [day, month, year] = parts.map(Number); // Assuming format is "day.month.year"
            else
                throw new Error('Invalid date format');
        }
        else
            throw new Error('Invalid date format');
        const dob = new Date(year, month - 1, day);
        const now = new Date();
        let age = now.getFullYear() - dob.getFullYear();
        const monthDiff = now.getMonth() - dob.getMonth();
        const dayDiff = now.getDate() - dob.getDate();
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0))
            age--;
        return age.toString();
    }
    catch (e){
        console.log(e);
        console.log(dateOfBirth);
        console.log(typeof(dateOfBirth));
        return 'N/A';
    }
}
