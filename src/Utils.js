// Utils.js
'use strict';
import MersenneTwister from 'mersenne-twister';
import NodeCrypto from 'crypto-browserify';

const mersenneTwister = new MersenneTwister();
export const random = () => mersenneTwister.random_long();

const DEFAULT_CIPHER_SALT = 'pcgbros_backstage';

export const newUuid = () => {
    var regexp = new RegExp('[xy]', 'g');
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(regexp, function(c) {
        var r = random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

export const pad = (num, size) => {
    var s = num + "";
    s = s.slice(-size);
    while(s.length < size) { s = "0" + s; }
    return s;
}

export const getDateStringWithFormat = ({ timestamp, format }) => {
    var dayStringList = ['日', '一', '二', '三', '四', '五', '六'];
    var dateObject = undefined;
    if(1000000000000 > timestamp) { dateObject = new Date(timestamp*1000); }
    else { dateObject = new Date(timestamp); }
    var matchYear = format.match(/Y/g);
    if(matchYear) { format = format.replace(/[Y]+/, pad(dateObject.getFullYear(), matchYear.length)); }
    var matchMonth = format.match(/M/g);
    if(matchMonth) { format = format.replace(/[M]+/, pad(dateObject.getMonth() + 1, matchMonth.length)); }
    var matchDate = format.match(/D/g);
    if(matchDate) { format = format.replace(/[D]+/, pad(dateObject.getDate(), matchDate.length)); }
    if(!!format.match(/d/g)) { format = format.replace(/[d]+/, dayStringList[dateObject.getDay()]); }
    var matchHours = format.match(/h/g);
    if(matchHours) { format = format.replace(/[h]+/, pad(dateObject.getHours(), matchHours.length)); }
    var matchMinutes = format.match(/m/g);
    if(matchMinutes) { format = format.replace(/[m]+/, pad(dateObject.getMinutes(), matchMinutes.length)); }
    var matchSeconds = format.match(/s/g);
    if(matchSeconds) { format = format.replace(/[s]+/, pad(dateObject.getSeconds(), matchSeconds.length)); }
    return format;
}

export const getUrlHashes = () => {
    const result = {};
    const searches = window.location.hash.slice(1).split('&').filter(search => search);
    searches.forEach(search => {
        const pair = search.split('=');
        result[pair[0]] = pair[1];
    });
    return result;
}

export const getUrlSearches = () => {
    const result = {};
    const searches = window.location.search.slice(1).split('&').filter(search => search);
    searches.forEach(search => {
        const pair = search.split('=');
        result[pair[0]] = pair[1];
    });
    return result;
}

export const makeSearchString = (search) => {
    const searchKeys = Object.keys(search);
    if(0 === searchKeys.length) { return ''; }
    return searchKeys.map(key => `${key}=${search[key]}`).join('&');
}

export const encryptString = ({ string, salt = DEFAULT_CIPHER_SALT}) => {
    const cipher = NodeCrypto.createCipher('aes192', salt);
    let encrypted = cipher.update(string, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

export const decryptString = ({ string, salt = DEFAULT_CIPHER_SALT }) => {
    let result = undefined;
    try {
        const decipher = NodeCrypto.createDecipher('aes192', salt);
        let decrypted = decipher.update(string, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        result = decrypted;
    } catch(e) { }
    return result;
}

export const saveCookieByName = ({ name, data, expireDate, maxAge, domain, path }) => {
    var dataString = JSON.stringify(data);
    var cookie = name + '=' + encryptString({string: dataString});
    if(expireDate) { cookie += "; expires=" + expireDate.toUTCString(); }
    if(maxAge) { cookie += "; Max-Age=" + maxAge; }
    if(domain) { cookie += "; domain=" + domain; }
    if(path) { cookie += "; path=" + path; }
    document.cookie = cookie;
}

export const getCookieByName = ({ name }) => {
	let cookieValue = null;
	if(document.cookie && document.cookie != '') {
        const cookies = document.cookie.split(';').map(cookie => cookie.trim());
        cookies.forEach(cookie => {
			// Does this cookie string begin with the name we want?
			if(cookie.substring(0, name.length + 1) == (name + '=')) {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
			}
        });
	}
	return JSON.parse(decryptString({string: cookieValue}) || null);
}
