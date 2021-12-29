const { src, dest, watch, series, parallel } = require("gulp");
const del = require("del");
const options = require("./config");
const browserSync = require("browser-sync").create();

const sass = require("gulp-sass")(require("sass"));
const postcss = require("gulp-postcss");
const concat = require("gulp-concat");
const uglify = require("gulp-terser");
const imagemin = require("gulp-imagemin");
const cleanCSS = require("gulp-clean-css");
const purgecss = require("gulp-purgecss");

const gulpData = require("gulp-data");
const nunjucksRender = require("gulp-nunjucks-render");

const logSymbols = require("log-symbols");

function livePreview(done) {
  browserSync.init({
    server: {
      baseDir: options.paths.dist.html,
    },
    port: options.config.port || 8080,
  });
  done();
}

function previewReload(done) {
  console.log("\n\t" + "Reloading Browser Preview.\n");
  browserSync.reload();
  done();
}

function runHTML() {
  return src([
    `${options.paths.src.html}/**/*.+(html|njk|nunjucks)`,
    `!${options.paths.src.html}/layouts/**/*.+(html|njk|nunjucks)`,
    `!${options.paths.src.html}/partials/**/*.+(html|njk|nunjucks)`,
    `!${options.paths.src.html}/macros/**/*.+(html|njk|nunjucks)`,
  ])
    .pipe(
      gulpData(function () {
        return require(options.data);
      })
    )
    .pipe(
      nunjucksRender({
        path: [options.paths.src.html],
      })
    );
}

function devHTML() {
  return runHTML().pipe(dest(options.paths.dist.html));
}

function devStyles() {
  const tailwindcss = require("tailwindcss");
  return src(`${options.paths.src.css}/**/*.scss`)
    .pipe(sass().on("error", sass.logError))
    .pipe(dest(options.paths.src.css))
    .pipe(
      postcss([tailwindcss(options.config.tailwindjs), require("autoprefixer")])
    )
    .pipe(concat({ path: "style.css" }))
    .pipe(dest(options.paths.dist.css));
}

function devScripts() {
  return src([
    `${options.paths.src.js}/library/**/*.js`,
    `${options.paths.src.js}/**/*.js`,
    `!${options.paths.src.js}/**/external/*`,
  ])
    .pipe(concat({ path: "scripts.js" }))
    .pipe(dest(options.paths.dist.js));
}

function devImages() {
  return src(`${options.paths.src.img}/**/*`).pipe(
    dest(options.paths.dist.img)
  );
}

function watchFiles() {
  watch(
    `${options.paths.src.html}/**/*.+(html|njk|nunjucks)`,
    series(devHTML, devStyles, previewReload)
  );
  watch(
    [options.config.tailwindjs, `${options.paths.src.css}/**/*.scss`],
    series(devStyles, previewReload)
  );
  watch(`${options.paths.src.js}/**/*.js`, series(devScripts, previewReload));
  watch(`${options.paths.src.img}/**/*`, series(devImages, previewReload));
  console.log("\n\t" + logSymbols.info, "Watching for Changes..\n");
}

function devClean() {
  console.log(
    "\n\t" + logSymbols.info,
    "Cleaning dist folder for fresh start.\n"
  );
  return del([options.paths.dist.html]);
}

function prodHTML() {
  return runHTML().pipe(dest(options.paths.build.html));
}

function prodStyles() {
  return src(`${options.paths.dist.css}/**/*`)
    .pipe(
      purgecss({
        content: ["src/**/*.{html,njk,nunjucks}"],
        defaultExtractor: (content) => {
          const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [];
          const innerMatches =
            content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || [];
          return broadMatches.concat(innerMatches);
        },
      })
    )
    .pipe(cleanCSS({ compatibility: "ie8" }))
    .pipe(dest(options.paths.build.css));
}

function prodScripts() {
  return src([
    `${options.paths.src.js}/library/**/*.js`,
    `${options.paths.src.js}/**/*.js`,
  ])
    .pipe(concat({ path: "scripts.js" }))
    .pipe(uglify())
    .pipe(dest(options.paths.build.js));
}

function prodImages() {
  return src(options.paths.src.img + "/**/*")
    .pipe(imagemin())
    .pipe(dest(options.paths.build.img));
}

function prodClean() {
  console.log(
    "\n\t" + logSymbols.info,
    "Cleaning build folder for fresh start.\n"
  );
  return del([options.paths.build.html]);
}

function buildFinish(done) {
  console.log(
    "\n\t" + logSymbols.info,
    `Production build is complete. Files are located at ${options.paths.build.html}\n`
  );
  done();
}

exports.default = series(
  devClean,
  parallel(devStyles, devScripts, devImages, devHTML),
  livePreview,
  watchFiles
);

exports.prod = series(
  prodClean,
  parallel(prodStyles, prodScripts, prodImages, prodHTML),
  buildFinish
);
