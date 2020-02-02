module.exports = function (grunt) {  
    grunt.initConfig({  
      concat: {  //合并
        options: {  
        },  
        dist: {  
          src: [
            './dist/nodom.js',
            './dist/util.js',
            './dist/application.js',
            './dist/factory.js',
            './dist/compiler.js',
            './dist/directive.js',
            './dist/directivefactory.js',
            './dist/directivemanager.js',
            './dist/element.js',
            './dist/expression.js',
            './dist/expressionfactory.js',
            './dist/filter.js',
            './dist/filterfactory.js',
            './dist/filtermanager.js',
            './dist/linker.js',
            './dist/messagequeue.js',
            './dist/methodfactory.js',
            './dist/model.js',
            './dist/modelfactory.js',
            './dist/module.js',
            './dist/modulefactory.js',
            './dist/nodomerror.js',
            './dist/nodomevent.js',
            './dist/renderer.js',
            './dist/router.js',
            './dist/scheduler.js',
            './dist/serializer.js',
            './dist/extend/directiveinit.js',
            './dist/extend/exposemethods.js',
            './dist/filterinit.js',
            './dist/locales/msg_zh.js'
            
          ],
          dest: 'bin/nodom.js' 
        }
      },
      uglify: {   //压缩
        options:{
          mangle:false
        },
        build: {  
          src: 'bin/nodom.js',
          dest: 'bin/nodom.min.js'
        }
      }  
    });  
    grunt.loadNpmTasks('grunt-contrib-uglify');  
    grunt.loadNpmTasks('grunt-contrib-concat');  
      
    grunt.registerTask('default', ['concat','uglify']); 
  }  