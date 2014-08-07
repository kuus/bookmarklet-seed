Bookmarklet seed
================

Seed to easily start and develop a draggable and resizable bookmarklet. Using gulp to help the workflow.
Check out the [demo page](http://kuus.github.io/bookmarklet-seed/)

What and how
-------
Your app is contained in `src/app/`. It will be inside a sourceless iframe inside a bookmarklet skeleton.
The skeleton provides a draggable and resizable container with a small header where you see the name of your app (took from the `<title>` tag of your app, a toggle and close control). Everytime a file changes gulp will output in the `dist` folder the complete bookmarklet. The file named `packagename.url.js` is ready to be copy pasted in your bookmark bar.
You can work on your app or on the bookmarklet skeleton through normal html, scss and js files. Gulp will take care of assembling all together in one js file.
By default the bookmarklet skeleton requires jquery and jquery ui.

Get started
-------

```
git clone https://github.com/kuus/bookmarklet-seed.git <project-name>
cd <project-name>
npm install
gulp
```

*a tab in your browser is automatically opened at http://localhost:3000/*


First steps
-------

Before actually starting a project you should edit the package.json file with your info (the package name will be use as the name of the js files which will be generated in the dist folder). Therefore you need to change also the script included in the `index.html`: `<script src="./dist/bookmarklet-seed.js"></script>`.

After this you should change the `UNIQUEID` variable in the begininng of the `gulpfile.js`. Remember that is has to be a valid javascript variable name.

Now browse to `src/app` and do what you want.

Author
-------
| ![kuus](https://raw.githubusercontent.com/kuus/kuus.github.io/master/src/images/k6-avatar-50x50.png) |
|---|
| [kuus](http://github.com/kuus) |

License
-------
MIT
