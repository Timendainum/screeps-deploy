# screeps-deploy

This simple node app deploys code for screeps.

You will need to create a config.js file that looks something like this:

```
{
  userName: "UserFoo",
  password: "passBar",
  path: "/Users/screepsplayer/projects/screeps",
}
```

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