var path = require('canonical-path');
var Package = require('dgeni').Package;

module.exports = new Package('ngdoc', [require('../jsdoc'), require('../nunjucks')])

.factory(require('./file-readers/ngdoc'))
.factory(require('./inline-tag-defs/link'))
.factory(require('./services/getLinkInfo'))
.factory(require('./services/getPartialNames'))
.factory(require('./services/parseCodeName'))
.factory(require('./services/partialNameMap'))

.processor(require('./processors/apiDocs'))
.processor(require('./processors/generateComponentGroups'))
.processor(require('./processors/compute-path')) // Override the current computePathProcessor with our own
.processor(require('./processors/compute-id'))
.processor(require('./processors/filter-ngdocs'))
.processor(require('./processors/collectPartialNames'))


.config(function(readFilesProcessor, ngdocFileReader) {
  readFilesProcessor.fileReaders.push(ngdocFileReader);
})


.config(function(parseTagsProcessor, getInjectables) {
  parseTagsProcessorprocessing.tagDefinitions =
      parseTagsProcessorprocessing.tagDefinitions.concat(getInjectables(require('./tag-defs')));
})


.config(function(inlineTagProcessor, linkInlineTagDef) {
  inlineTagProcessor.inlineTagDefinitions.push(linkInlineTagDef);
})


.config(function(templateEngine, getInjectables) {

  templateEngine.config.tags = {
    variableStart: '{$',
    variableEnd: '$}'
  };

  templateEngine.templateFolders.shift(path.resolve(packagePath, 'templates'));

  templateEngine.templatePatterns = [
    '${ doc.template }',
    '${doc.area}/${ doc.id }.${ doc.docType }.template.html',
    '${doc.area}/${ doc.id }.template.html',
    '${doc.area}/${ doc.docType }.template.html',
    '${ doc.id }.${ doc.docType }.template.html',
    '${ doc.id }.template.html',
    '${ doc.docType }.template.html'
  ].concat(templateEngine.templatePatterns);

  templateEngine.filters = templateEngine.filters.concat(getInjectables([
    require('./rendering/filters/code'),
    require('./rendering/filters/link'),
    require('./rendering/filters/type-class')
  ]));

  templateEngine.tags.concat(getInjectables([require('./rendering/tags/code')]));
});
