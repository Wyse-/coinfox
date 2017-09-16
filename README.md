# Coinfox fork with a focus on local hosting
*If this is your first time hearing about Coinfox please take a look at the [original repository](https://github.com/vinniejames/coinfox)*
___
Keep in mind that both this fork and original can be hosted locally without any issues, this version doesn't differ from the original in that regard.

The only changes I made are the following:
* Google Analytics implementation has been removed
* All css files and fonts are now hosted locally

That's all, everything else is untouched.

# Local hosting instructions
1. Download and install [Nodejs](https://nodejs.org/en/) for your OS. I'm using the "Current" version, but I believe both will do.
2. Run `npm install react-scripts` on your terminal: this is a needed dependency for Coinfox.
3. Clone or download this repository as zip and extract it somewhere.
4. From your terminal cd to where you cloned or extracted this repository (e.g. `cd C:\coinfox-master`).
5. Run the `npm run start` command to start the app. This window needs to stay open for Coinfox to work.
6. A Coinfox window should pop up in your browser with `http://localhost:3000/` as the url. If it doesn't you can enter that url manually.
7. That's it, you can now use Coinfox locally. You can close down npm if you don't need it anymore without worrying about losing data: your holdings are stored as cookies in your browser.
