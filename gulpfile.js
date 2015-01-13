//-------------------------------------------------
//  define variables and load gulp plugins ↓
//-------------------------------------------------
var gulp            = require('gulp'),
    del             = require('del'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    plugins         = gulpLoadPlugins({
                        pattern: ['gulp-*', 'gulp.*'],
                        replaceString: /\bgulp[\-.]/,
                        lazy: false
                      });


//-------------------------------------------------
//  dev tasks ↓
//-------------------------------------------------

// compile sass files
gulp.task('sass', function () {
  return gulp.src('scss/main.scss')

    // globbing CSS @import
    .pipe(plugins.cssGlobbing({
      extensions: '.scss'
    }))

    .pipe(plugins.sass({
      outputStyle: 'nested',
      imagePath: '../img',
      sourceComments: true,
      onError: function(error) {
        console.log(error);
        plugins.util.beep();
      }
    }))

    .pipe(gulp.dest('css/'))
    .pipe(plugins.livereload({silent: true}));
});

// sorting css properties
gulp.task('csscomb', function () {
  return gulp.src([
      'scss/**/*.scss',
      '!scss/main.scss',
      '!scss/global/_helpers.scss',
      '!scss/sprites/**.scss',
      '!scss/global/_variables.scss'
    ])
    .pipe(plugins.csscomb())
    .pipe(gulp.dest('scss'));
});

// W3C html validation
gulp.task('validate-html', function () {
  gulp.src('*.html')
    .pipe(plugins.w3cjs({
      doctype: 'HTML5',
      charset: 'utf-8'
    }));
});

// HTMLHint validation
gulp.task('html-hint', function () {
  gulp.src('*.html')
    .pipe(plugins.htmlhint())
    .pipe(plugins.htmlhint.reporter());
});

// clean html files
gulp.task('clean-html', function() {
  del('*.html');
});

// include html files and replace variables
gulp.task('fileinclude', function() {
  return gulp.src(['html/*.html', '!html/_*.html'])
    .pipe(plugins.changed('./', {
      hasChanged: plugins.changed.compareSha1Digest,
      extension: '.html'
    }))
    .pipe(plugins.fileInclude({
      prefix: '@@'
    }))
    .pipe(gulp.dest('./'));
});

// reload browser after html 'fileinclude' task
gulp.task('reload', ['fileinclude'], function() {
  gulp.src(['html/*.html', '!html/_*.html'])
    .pipe(plugins.livereload({silent: true}));
});

// image sprite generator
gulp.task('sprite', function () {
  var spriteData = gulp.src('img/icons/*.png').pipe(plugins.spritesmith({
    imgName: '../img/sprite.png',
    cssName: '_sprite.scss'
  }));
  spriteData.img.pipe(gulp.dest('img/'));
  return spriteData.css.pipe(gulp.dest('scss/sprites/'));

  // retina sprite
  var spriteRetinaData = gulp.src('img/icons-2x/*.png').pipe(plugins.spritesmith({
    imgName: '../img/sprite-2x.png',
    cssName: '_sprite-2x.scss',
    cssVarMap: function (sprite) {
      sprite.name = sprite.name + '-2x';
    }
  }));
  spriteRetinaData.img.pipe(gulp.dest('img/'));
  spriteRetinaData.css.pipe(gulp.dest('scss/sprites/'));
});

// watch files for changes
gulp.task('watch', function () {
  plugins.livereload.listen();
  gulp.watch('html/*.html', ['reload']);
  gulp.watch('scss/**/*.scss', ['sass']);
  gulp.watch('img/icons/*.png', ['sprite']);
  gulp.watch('img/icons-2x/*.png', ['sprite']);
});


//-------------------------------------------------
//  deploy tasks ↓
//-------------------------------------------------

// clean files and folders
gulp.task('clean-deploy', function() {
  del('_deploy/**/*');
});

// migrating over all HTML files for deployment
gulp.task('html-deploy', function() {
  return gulp.src(['html/*.html', '!html/_*.html'])
    .pipe(plugins.fileInclude({
      prefix: '@@'
    }))

    // replace build blocks in HTML (e.g. <!-- build:js -->)
    .pipe(plugins.htmlReplace({
      'js': ''
    }))
    .pipe(gulp.dest('_deploy'));
});

// copy fonts
gulp.task('fonts-deploy', function() {
  return gulp.src('css/fonts/**/*')
    .pipe(gulp.dest('_deploy/css/fonts'));
});

// compiling our SCSS files for deployment
gulp.task('styles-deploy', function() {
  return gulp.src('scss/main.scss')
    // globbing CSS @import
    .pipe(plugins.cssGlobbing({
      extensions: '.scss'
    }))

    .pipe(plugins.sass({
      outputStyle: 'nested',
      imagePath: '../img'
    }))

    // autoprefixer
    .pipe(plugins.autoprefixer({
      browsers: ['> 1%', 'last 7 versions', 'Firefox ESR', 'Opera 12.1'],
      cascade: false
    }))

    // combine matching media queries
    .pipe(plugins.combineMediaQueries())

    // sorting css properties
    .pipe(plugins.csscomb())

    // minify css
    .pipe(plugins.minifyCss({
      keepBreaks: true,
      noRebase: true
    }))
    .pipe(gulp.dest('_deploy/css'));
});

// compiling our javascripts for deployment
gulp.task('scripts-deploy', function() {
  gulp.src('js/vendor/*.js')
    .pipe(plugins.uglify())
    .pipe(gulp.dest('_deploy/js/vendor'));

  return gulp.src('js/*.js')
    .pipe(gulp.dest('_deploy/js'));
});

// compressing images
gulp.task('images-deploy', function() {
  gulp.src(['img/**/*', '!img/icons/', '!img/icons-2x/', '!img/icons/*', '!img/icons-2x/*'])
    .pipe(plugins.imagemin({progressive: true, interlaced: true}))
    .pipe(gulp.dest('_deploy/img'));
});


//-------------------------------------------------
//  define gulp tasks ↓
//-------------------------------------------------

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['sprite', 'clean-html'], function() {
  gulp.start('reload');
  gulp.start('sass', 'watch');
});

// deployment task
gulp.task('deploy', ['clean-deploy', 'sprite'], function() {
  gulp.start('html-deploy', 'fonts-deploy', 'styles-deploy', 'scripts-deploy', 'images-deploy');
});
