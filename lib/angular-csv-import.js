'use strict';

var csvImport = angular.module('ngCsvImport', []);

csvImport.directive('ngCsvImport', function() {
  return {
    restrict: 'E',
    transclude: true,
    replace: true,
    scope: {
      content: '=?',
      header: '=?',
      headerVisible: '=?',
      separator: '=?',
      separatorVisible: '=?',
      result: '=?',
      encoding: '=?',
      encodingVisible: '=?',
      accept: '=?',
      onUpload: '=?'
    },
    template:
      '<div class="row">' +
      '<div class="col-xs-12">' +
      '<label for="file-upload" class="btn btn-default" style="width: 100%;">Upload CSV file</label>' +
      '<input id="file-upload" type="file" multiple accept="{{accept}}" class="hidden"/>' +
      '</div>' +
      '</div>' +
      '</div>',
    link: function(scope, element) {

      element.on('change', function(onChangeEvent) {
        var reader = new FileReader();
        scope.filename = onChangeEvent.target.files[0].name;
        reader.onload = function(onLoadEvent) {
          scope.$apply(function() {
            var content = {
              csv: onLoadEvent.target.result.replace(/\r\n|\r/g, '\n'),
              header: scope.header,
              separator: scope.separator
            };
            scope.content = content.csv;
            scope.result = csvToJSON(content);
            scope.result.filename = scope.filename;
          });
          if (scope.onUpload) {
            scope.onUpload();
          }
        };

        if ((onChangeEvent.target.type === "file") && (onChangeEvent.target.files != null || onChangeEvent.srcElement.files != null)) {
          reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0], scope.encoding);
        } else {
          if (scope.content != null) {
            var content = {
              csv: scope.content,
              header: !scope.header,
              separator: scope.separator
            };
            scope.result = csvToJSON(content);
          }
        }
      });

      var csvToJSON = function(content) {
        var lines = content.csv.split('\n');
        var result = {
          columns: [],
          rows: []
        };
        var start = 0;
        var columnCount = lines[0].split(content.separator).length;

        if (content.header) {
          result.columns = lines[0].split(content.separator).map(function(s){ return s.trim();});
          start = 1;
        }

        for (var i = start; i < lines.length; i++) {
          var obj = {};
          var currentline = lines[i].split(new RegExp(content.separator + '(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)'));
          if (currentline.length === columnCount) {
            if (content.header) {
              for (var j = 0; j < result.columns.length; j++) {
                obj[result.columns[j]] = currentline[j].trim();
              }
            } else {
              for (var k = 0; k < currentline.length; k++) {
                obj[k] = currentline[k].trim();
              }
            }
            result.rows.push(obj);
          }
        }
        return result;
      };
    }
  };
});
