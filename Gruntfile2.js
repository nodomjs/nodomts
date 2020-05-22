
module.exports = function (grunt) {  
    grunt.initConfig({  
      concat: {  //合并
        options: {  
        },  
        dist: {  
          src: [     
          //'core/**/*.js',
          './dist/core/nodom.js',
            './dist/core/util.js',
            './dist/core/application.js',
            './dist/core/factory.js',
            './dist/core/compiler.js',
            './dist/core/directive.js',
            './dist/core/directivefactory.js',
            './dist/core/directivemanager.js',
            './dist/core/element.js',
            './dist/core/expression.js',
            './dist/core/expressionfactory.js',
            './dist/core/filter.js',
            './dist/core/filterfactory.js',
            './dist/core/filtermanager.js',
            './dist/core/linker.js',
            './dist/core/messagequeue.js',
            './dist/core/methodfactory.js',
            './dist/core/model.js',
            './dist/core/modelfactory.js',
            './dist/core/module.js',
            './dist/core/modulefactory.js',
            './dist/core/nodomerror.js',
            './dist/core/nodomevent.js',
            './dist/core/renderer.js',
            './dist/core/router.js',
            './dist/core/scheduler.js',
            './dist/core/serializer.js',
            './dist/core/extend/directiveinit.js',
            './dist/core/extend/filterinit.js',
            './dist/core/locales/msg_zh.js',
            './dist/core/defineelement.js',
            './dist/core/defineelementmanager.js'
        ],
        dest: 'bin/nodom.js' 
      }
    }  
  });  
  //grunt.loadNpmTasks('grunt-contrib-uglify');  
  grunt.loadNpmTasks('grunt-contrib-concat');  
  grunt.registerTask('default', ['concat']); 
};  