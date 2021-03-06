
module.exports = function (grunt) {  
  grunt.initConfig({  
    ts:{
      options:{
        compile:true,
        comments:false,
        target:'es6',
        module:"cmd"
      },     
      dev:{
        src:[
            './core/types.ts',
            './core/nodom.ts',
            './core/util.ts',
            './core/application.ts',
            './core/factory.ts',
            './core/compiler.ts',
            './core/directive.ts',
            './core/directivetype.ts',
            './core/directivefactory.ts',
            './core/directivemanager.ts',
            './core/element.ts',
            './core/expression.ts',
            './core/expressionfactory.ts',
            './core/filter.ts',
            './core/filterfactory.ts',
            './core/filtermanager.ts',
            './core/resourcemanager.ts',
            './core/messagequeue.ts',
            './core/methodfactory.ts',
            './core/model.ts',
            './core/modelfactory.ts',
            './core/module.ts',
            './core/modulefactory.ts',
            './core/nodomerror.ts',
            './core/nodomevent.ts',
            './core/renderer.ts',
            './core/router.ts',
            './core/scheduler.ts',
            './core/serializer.ts',
            './core/extend/directiveinit.ts',
            './core/extend/filterinit.ts',
            './core/locales/tipmsg.ts',
            './core/locales/msg_zh.ts',
            './core/locales/msg_en.ts',
            './core/plugin.ts',
            './core/pluginmanager.ts'
        ],
        out:'bin/nodom.js',
        options:{
          module:'commonjs'
        }
      }
    },
    uglify: {  
        release: {
            options:{
                mangle:false
            },
            files: [{
              'bin/nodom.min.js':['bin/nodom.js']
            }] 
        } 
    }
  });  
  grunt.loadNpmTasks('grunt-ts');  
  grunt.loadNpmTasks('grunt-contrib-uglify');  
  grunt.registerTask('default', ['ts:dev']); 
  grunt.registerTask('min', ['uglify:release']); 
};  