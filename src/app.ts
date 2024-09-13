
import express, { json } from 'express';
import { SETTINGS } from './settings';
import { initAPIendpoints, initUIendpoints } from './endpoints';
import { playground } from './playground';

async function init(){
    const UIapp  = express();
    const APIapp = express(); 
    initAPIendpoints(APIapp);
    initUIendpoints(UIapp);
    APIapp.listen( 4000, () => { console.log(`API is listening @ 127.0.0.1:${SETTINGS.API_PORT}`); });
    UIapp.listen(  3000, () => { console.log(`UI  is listening @ 127.0.0.1:${SETTINGS.UI_PORT}`);  });
}
//init();

playground();

const isPalindrome = (str : string) => str === str.split('').reverse().join();