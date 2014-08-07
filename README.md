Bookmarklet seed
================

Seed to easily start and develop a draggable and resizable bookmarklet. Using gulp to help the workflow.
Check out the [demo page](http://kuus.github.io/bookmarklet-seed/)

Strucure
-------
A bookmark skeleton will "host" your app contained in `src/app/`.
Gulp will put in the `dist` folder the complete bookmarklet. The file named `packagename.url.js` is ready to be copy pasted in your bookmark bar.

Get started
-------

```
git clone https://github.com/kuus/bookmarklet-seed.git project-name
cd project-name
npm install
gulp
```

*a tab in your browser is automaticall opened at http://localhost:3000/*


First steps
-------

Before actually starting a project you should edit the package.json file with your info (the package name will be use as the name of the js files which will be generated in the dist folder)/

After this you should change the `UNIQUEID` variable in the begininng of the `gulpfile.js`. Remember that is has to be a valid javasript 
variable name.

Now browse to `src/app` and build your app.

Author
-------
| ![kuus](https://raw.githubusercontent.com/kuus/kuus.github.io/master/src/images/k6-avatar-50x50.png) |
|---|
| [kuus](http://github.com/kuus) |

License
-------
MIT