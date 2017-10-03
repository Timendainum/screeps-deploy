# screeps-deploy

This simple node app deploys code for screeps.

Install globally from NPM using:
`npm install -g screeps-deploy`


You will need to create a config.js file that looks something like this:

```
{
  userName: "UserFoo",
  password: "passBar",
  path: "/Users/screepsplayer/projects/screeps",
  branch: "default",
}
```

branch refers to which Screeps branch you want to deploy to.

Output looks something like this:

```
Updating code on screeps...
Path: /Users/screepsplayer/projects/screeps
Done reading 86 files.
Updating code on screeps for screepsplayer
Response started...
Status: 200
Response ended.
Response: {"ok":1,"timestamp":1505676329309}

```

You can set the ENV variable to a fully qualified path and file to specify a configuration location.

For example, you could add this to your .bashRC:
```
export SCREEPSDEPLOY_CONFIG_PATH="${HOME}/.screeps-deploy/config.js"
```