const { exec } = require('child_process');

class AuthenticationInfo {
    accessToken;
    sfUrl;

    constructor(accessToken, sfUrl) {
        this.accessToken = accessToken;
        this.sfUrl = sfUrl;
    }
}

const sfdxAuthenticate = async (username) => new Promise((resolve, reject) => {
    exec(`sfdx force:org:display --targetusername ${username} --json`, (error, stdout, stderror) => {
        if (error) {
            console.warn(error);
        }

        if (!stdout) {
            reject(stderror);
        }

        const out = JSON.parse(stdout);

        resolve(new AuthenticationInfo(out.result.accessToken, out.result.instanceUrl));
    });
});

const noAuth = async (token, url) => new Promise((resolve, reject) => {
    resolve(new AuthenticationInfo(token, url));
});

module.exports = { sfdxAuthenticate, noAuth };