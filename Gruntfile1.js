module.exports = function (grunt) {  
    grunt.initConfig({  
      concat: {  //合并
        options: {  
        },  
        dist: {  
          src: [
            './dist/types/nodom.d.ts',
            './dist/types/util.d.ts',
            './dist/types/application.d.ts',
            './dist/types/factory.d.ts',
            './dist/types/compiler.d.ts',
            './dist/types/directive.d.ts',
            './dist/types/directivefactory.d.ts',
            './dist/types/directivemanager.d.ts',
            './dist/types/element.d.ts',
            './dist/types/expression.d.ts',
            './dist/types/expressionfactory.d.ts',
            './dist/types/filter.d.ts',
            './dist/types/filterfactory.d.ts',
            './dist/types/filtermanager.d.ts',
            './dist/types/linker.d.ts',
            './dist/types/messagequeue.d.ts',
            './dist/types/methodfactory.d.ts',
            './dist/types/model.d.ts',
            './dist/types/modelfactory.d.ts',
            './dist/types/module.d.ts',
            './dist/types/modulefactory.d.ts',
            './dist/types/nodomerror.d.ts',
            './dist/types/nodomevent.d.ts',
            './dist/types/renderer.d.ts',
            './dist/types/router.d.ts',
            './dist/types/scheduler.d.ts',
            './dist/types/serializer.d.ts',
            './dist/types/extend/directiveinit.d.ts',
            './dist/types/extend/filterinit.d.ts',
            './dist/types/locales/msg_zh.d.ts'
            
          ],
          dest: 'bin/nodom.d.ts' 
        }
      }  
    });  
    //grunt.loadNpmTasks('grunt-contrib-uglify');  
    grunt.loadNpmTasks('grunt-contrib-concat');  
      
    grunt.registerTask('default', ['concat']); 
  }  