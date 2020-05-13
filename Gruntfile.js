module.exports = function (grunt) {  
  grunt.initConfig({  
    ts:{
      options:{
        compile:true,
        comments:false,
        target:'es2015',
        module:'cmd',
      },     
      dev:{
        src:[
          './core/nodom.ts',
            './core/util.ts',
            './core/application.ts',
            './core/factory.ts',
            './core/compiler.ts',
            './core/directive.ts',
            './core/directivefactory.ts',
            './core/directivemanager.ts',
            './core/element.ts',
            './core/expression.ts',
            './core/expressionfactory.ts',
            './core/filter.ts',
            './core/filterfactory.ts',
            './core/filtermanager.ts',
            './core/linker.ts',
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
            './core/extend/exposemethods.ts',
            './core/extend/filterinit.ts',
            './core/locales/msg_zh.ts'
        ],
        out:'bin/nodom.js',
        options:{
          module:'commonjs'
        }
      }
      
    }
  });  
  grunt.loadNpmTasks('grunt-ts');  
  grunt.registerTask('default', ['ts:dev']); 
};  