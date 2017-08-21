const gulp = require("gulp"),
      pug = require("gulp-pug"),
      stylus = require("gulp-stylus"),
      cmq = require("gulp-combine-mq"),
      autoprefixer = require("gulp-autoprefixer"),
      babel = require("gulp-babel"),
      concat = require("gulp-concat"),
      imagemin = require('gulp-imagemin'),
      rename = require("gulp-rename"),
      gutil = require("gulp-util"),
      plumber = require("gulp-plumber"),
      runSequence = require("run-sequence"),
      browserSync = require('browser-sync').create();

var onError = (err) => {
    gutil.log(gutil.colors.yellow("❌  Error in dependency ❌"));
    gutil.beep();
    console.log(err);
};

gulp.task("templates", () =>
    gulp.src("./*.pug")
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(pug())
        .pipe(gulp.dest("./dist/"))
);

gulp.task("styles", () =>
    gulp.src("./assets/styles/main.styl")
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(stylus())
        .pipe(rename("styles.css"))
        .pipe(gulp.dest("./dist/css/"))
);

gulp.task("clear-styles", () =>
    gulp.src("./dist/css/styles.css")
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(cmq())
        .pipe(autoprefixer({
            browsers: ["last 2 versions"],
            cascade: false
        }))
        .pipe(gulp.dest("./dist/css/"))
);

gulp.task("build-styles", () => {
    runSequence("styles", "clear-styles");
});

gulp.task("convert-es6", () =>
    gulp.src("./assets/js/**/*.js")
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(babel({
            presets: ["env"]
        }))
        .pipe(gulp.dest("./assets/js-es5/"))
);

gulp.task("concat", () =>
    gulp.src("./assets/js-es5/**/*.js")
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(concat("app.js"))
        .pipe(gulp.dest("./dist/js/"))
);

gulp.task("build-scripts", () => {
    runSequence("convert-es6", "concat");
});

gulp.task('compress-images', () =>
    gulp.src('./assets/images/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('./dist/images/'))
);

gulp.task('server', () => {

    browserSync.init({
        server: "./dist/"
    });

    gulp.watch(["./*.pug", "./assets/modules/**/*.pug"], ["templates"]).on("change", browserSync.reload);
    gulp.watch("./assets/styles/**/*.styl", ["build-styles"]).on("change", browserSync.reload);
    gulp.watch("./assets/js/**/*.js", ["build-scripts"]).on("change", browserSync.reload);
});

gulp.task('default', () => {
    runSequence(["templates", "build-styles", "build-scripts"], "server");
});
