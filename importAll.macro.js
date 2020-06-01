"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = void 0;

var _reduce = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/reduce"));

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));

var _path = _interopRequireDefault(require("path"));

var _babelPluginMacros = require("babel-plugin-macros");

var _glob = _interopRequireDefault(require("glob"));

var _internal = require("@redwoodjs/internal");

// The majority of this code is copied from `importAll.macro`: https://github.com/kentcdodds/import-all.macro
// And was modified to work with our `getPaths`.

/**
 * This macro runs during build time.
 * @example
 * ```js
 *  import importAll from '@redwoodjs/api/importAll.macro
 *  const typeDefs = importAll('api', 'graphql')
 * ```
 */
function prevalMacros({
  references,
  state,
  babel
}) {
  var _context;

  (0, _forEach.default)(_context = references.default).call(_context, referencePath => {
    if (referencePath.parentPath.type === 'CallExpression') {
      importAll({
        referencePath,
        state,
        babel
      });
    } else {
      throw new Error(`This is not supported: \`${referencePath.findParent(babel.types.isExpression).getSource()}\`. Please use "importAll('target', 'directory')"`);
    }
  });
}

const getGlobPattern = (callExpressionPath, cwd) => {
  const args = callExpressionPath.parentPath.get('arguments');
  const target = args[0].evaluate().value;
  const dir = args[1].evaluate().value;
  const redwoodPaths = (0, _internal.getPaths)();

  const relativePaths = _path.default.relative(cwd, redwoodPaths[target][dir]);

  return `./${relativePaths}/**/*.{ts,js}`;
};
/**
 * @deprecated Please use: `import services from 'src/lib/services/*.{js,ts}'` instead.
 */


function importAll({
  referencePath,
  state,
  babel
}) {
  var _context2;

  const t = babel.types;
  const {
    filename
  } = state.file.opts;

  const cwd = _path.default.dirname(filename);

  const globPattern = getGlobPattern(referencePath, cwd); // Grab a list of the `js` and `ts` files in the specified directory.
  // Remove `.test.{js|ts}` files from matched patterns, `ignore` in glob
  // doesn't appear to be working correctly:https://github.com/isaacs/node-glob/issues/309

  const importSources = (0, _filter.default)(_context2 = _glob.default.sync(globPattern, {
    cwd
  })).call(_context2, path => !path.match(/\.(test\.js|stories\.js)$/));
  const {
    importNodes,
    objectProperties
  } = (0, _reduce.default)(importSources).call(importSources, (all, source) => {
    const id = referencePath.scope.generateUidIdentifier(source);
    all.importNodes.push(t.importDeclaration([t.importNamespaceSpecifier(id)], t.stringLiteral(source))); // Convert the relative path of the module to a key:
    //  ./services/a.js -> a
    //  ./services/a/a.js -> a
    //  ./graphql/x/x.sdl.js -> x

    const objectKey = _path.default.basename(source, _path.default.extname(source)).replace('.sdl', '');

    all.objectProperties.push(t.objectProperty(t.stringLiteral(objectKey), id));
    return all;
  }, {
    importNodes: [],
    objectProperties: []
  });
  const program = state.file.path;
  program.node.body.unshift(...importNodes);
  const objectExpression = t.objectExpression(objectProperties);
  referencePath.parentPath.replaceWith(objectExpression);
}

var _default = (0, _babelPluginMacros.createMacro)(prevalMacros);

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbXBvcnRBbGwubWFjcm8uanMiXSwibmFtZXMiOlsicHJldmFsTWFjcm9zIiwicmVmZXJlbmNlcyIsInN0YXRlIiwiYmFiZWwiLCJkZWZhdWx0IiwicmVmZXJlbmNlUGF0aCIsInBhcmVudFBhdGgiLCJ0eXBlIiwiaW1wb3J0QWxsIiwiRXJyb3IiLCJmaW5kUGFyZW50IiwidHlwZXMiLCJpc0V4cHJlc3Npb24iLCJnZXRTb3VyY2UiLCJnZXRHbG9iUGF0dGVybiIsImNhbGxFeHByZXNzaW9uUGF0aCIsImN3ZCIsImFyZ3MiLCJnZXQiLCJ0YXJnZXQiLCJldmFsdWF0ZSIsInZhbHVlIiwiZGlyIiwicmVkd29vZFBhdGhzIiwicmVsYXRpdmVQYXRocyIsInBhdGgiLCJyZWxhdGl2ZSIsInQiLCJmaWxlbmFtZSIsImZpbGUiLCJvcHRzIiwiZGlybmFtZSIsImdsb2JQYXR0ZXJuIiwiaW1wb3J0U291cmNlcyIsInN5bmMiLCJtYXRjaCIsImltcG9ydE5vZGVzIiwib2JqZWN0UHJvcGVydGllcyIsImFsbCIsInNvdXJjZSIsImlkIiwic2NvcGUiLCJnZW5lcmF0ZVVpZElkZW50aWZpZXIiLCJwdXNoIiwiaW1wb3J0RGVjbGFyYXRpb24iLCJpbXBvcnROYW1lc3BhY2VTcGVjaWZpZXIiLCJzdHJpbmdMaXRlcmFsIiwib2JqZWN0S2V5IiwiYmFzZW5hbWUiLCJleHRuYW1lIiwicmVwbGFjZSIsIm9iamVjdFByb3BlcnR5IiwicHJvZ3JhbSIsIm5vZGUiLCJib2R5IiwidW5zaGlmdCIsIm9iamVjdEV4cHJlc3Npb24iLCJyZXBsYWNlV2l0aCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7Ozs7Ozs7QUFRQSxTQUFTQSxZQUFULENBQXNCO0FBQUVDLEVBQUFBLFVBQUY7QUFBY0MsRUFBQUEsS0FBZDtBQUFxQkMsRUFBQUE7QUFBckIsQ0FBdEIsRUFBb0Q7QUFBQTs7QUFD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LENBQWlCeEIsQ0FBQyxDQUFDbUIsYUFBRixDQUFnQkMsU0FBaEIsQ0FBakIsRUFBNkNQLEVBQTdDLENBREY7QUFHQSxXQUFPRixHQUFQO0FBQ0QsR0FyQm9ELEVBc0JyRDtBQUFFRixJQUFBQSxXQUFXLEVBQUUsRUFBZjtBQUFtQkMsSUFBQUEsZ0JBQWdCLEVBQUU7QUFBckMsR0F0QnFELENBQXZEO0FBeUJBLFFBQU1lLE9BQU8sR0FBR2xELEtBQUssQ0FBQzJCLElBQU4sQ0FBV0osSUFBM0I7QUFDQTJCLEVBQUFBLE9BQU8sQ0FBQ0MsSUFBUixDQUFhQyxJQUFiLENBQWtCQyxPQUFsQixDQUEwQixHQUFHbkIsV0FBN0I7QUFFQSxRQUFNb0IsZ0JBQWdCLEdBQUc3QixDQUFDLENBQUM2QixnQkFBRixDQUFtQm5CLGdCQUFuQixDQUF6QjtBQUNBaEMsRUFBQUEsYUFBYSxDQUFDQyxVQUFkLENBQXlCbUQsV0FBekIsQ0FBcUNELGdCQUFyQztBQUNEOztlQUVjLG9DQUFZeEQsWUFBWixDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcblxuaW1wb3J0IHsgY3JlYXRlTWFjcm8gfSBmcm9tICdiYWJlbC1wbHVnaW4tbWFjcm9zJ1xuaW1wb3J0IGdsb2IgZnJvbSAnZ2xvYidcbmltcG9ydCB7IGdldFBhdGhzIH0gZnJvbSAnQHJlZHdvb2Rqcy9pbnRlcm5hbCdcblxuLy8gVGhlIG1ham9yaXR5IG9mIHRoaXMgY29kZSBpcyBjb3BpZWQgZnJvbSBgaW1wb3J0QWxsLm1hY3JvYDogaHR0cHM6Ly9naXRodWIuY29tL2tlbnRjZG9kZHMvaW1wb3J0LWFsbC5tYWNyb1xuLy8gQW5kIHdhcyBtb2RpZmllZCB0byB3b3JrIHdpdGggb3VyIGBnZXRQYXRoc2AuXG5cbi8qKlxuICogVGhpcyBtYWNybyBydW5zIGR1cmluZyBidWlsZCB0aW1lLlxuICogQGV4YW1wbGVcbiAqIGBgYGpzXG4gKiAgaW1wb3J0IGltcG9ydEFsbCBmcm9tICdAcmVkd29vZGpzL2FwaS9pbXBvcnRBbGwubWFjcm9cbiAqICBjb25zdCB0eXBlRGVmcyA9IGltcG9ydEFsbCgnYXBpJywgJ2dyYXBocWwnKVxuICogYGBgXG4gKi9cbmZ1bmN0aW9uIHByZXZhbE1hY3Jvcyh7IHJlZmVyZW5jZXMsIHN0YXRlLCBiYWJlbCB9KSB7XG4gIHJlZmVyZW5jZXMuZGVmYXVsdC5mb3JFYWNoKChyZWZlcmVuY2VQYXRoKSA9PiB7XG4gICAgaWYgKHJlZmVyZW5jZVBhdGgucGFyZW50UGF0aC50eXBlID09PSAnQ2FsbEV4cHJlc3Npb24nKSB7XG4gICAgICBpbXBvcnRBbGwoeyByZWZlcmVuY2VQYXRoLCBzdGF0ZSwgYmFiZWwgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgVGhpcyBpcyBub3Qgc3VwcG9ydGVkOiBcXGAke3JlZmVyZW5jZVBhdGhcbiAgICAgICAgICAuZmluZFBhcmVudChiYWJlbC50eXBlcy5pc0V4cHJlc3Npb24pXG4gICAgICAgICAgLmdldFNvdXJjZSgpfVxcYC4gUGxlYXNlIHVzZSBcImltcG9ydEFsbCgndGFyZ2V0JywgJ2RpcmVjdG9yeScpXCJgXG4gICAgICApXG4gICAgfVxuICB9KVxufVxuXG5jb25zdCBnZXRHbG9iUGF0dGVybiA9IChjYWxsRXhwcmVzc2lvblBhdGgsIGN3ZCkgPT4ge1xuICBjb25zdCBhcmdzID0gY2FsbEV4cHJlc3Npb25QYXRoLnBhcmVudFBhdGguZ2V0KCdhcmd1bWVudHMnKVxuICBjb25zdCB0YXJnZXQgPSBhcmdzWzBdLmV2YWx1YXRlKCkudmFsdWVcbiAgY29uc3QgZGlyID0gYXJnc1sxXS5ldmFsdWF0ZSgpLnZhbHVlXG5cbiAgY29uc3QgcmVkd29vZFBhdGhzID0gZ2V0UGF0aHMoKVxuICBjb25zdCByZWxhdGl2ZVBhdGhzID0gcGF0aC5yZWxhdGl2ZShjd2QsIHJlZHdvb2RQYXRoc1t0YXJnZXRdW2Rpcl0pXG4gIHJldHVybiBgLi8ke3JlbGF0aXZlUGF0aHN9LyoqLyoue3RzLGpzfWBcbn1cblxuLyoqXG4gKiBAZGVwcmVjYXRlZCBQbGVhc2UgdXNlOiBgaW1wb3J0IHNlcnZpY2VzIGZyb20gJ3NyYy9saWIvc2VydmljZXMvKi57anMsdHN9J2AgaW5zdGVhZC5cbiAqL1xuZnVuY3Rpb24gaW1wb3J0QWxsKHsgcmVmZXJlbmNlUGF0aCwgc3RhdGUsIGJhYmVsIH0pIHtcbiAgY29uc3QgdCA9IGJhYmVsLnR5cGVzXG4gIGNvbnN0IHsgZmlsZW5hbWUgfSA9IHN0YXRlLmZpbGUub3B0c1xuICBjb25zdCBjd2QgPSBwYXRoLmRpcm5hbWUoZmlsZW5hbWUpXG4gIGNvbnN0IGdsb2JQYXR0ZXJuID0gZ2V0R2xvYlBhdHRlcm4ocmVmZXJlbmNlUGF0aCwgY3dkKVxuXG4gIC8vIEdyYWIgYSBsaXN0IG9mIHRoZSBganNgIGFuZCBgdHNgIGZpbGVzIGluIHRoZSBzcGVjaWZpZWQgZGlyZWN0b3J5LlxuICAvLyBSZW1vdmUgYC50ZXN0Lntqc3x0c31gIGZpbGVzIGZyb20gbWF0Y2hlZCBwYXR0ZXJucywgYGlnbm9yZWAgaW4gZ2xvYlxuICAvLyBkb2Vzbid0IGFwcGVhciB0byBiZSB3b3JraW5nIGNvcnJlY3RseTpodHRwczovL2dpdGh1Yi5jb20vaXNhYWNzL25vZGUtZ2xvYi9pc3N1ZXMvMzA5XG4gIGNvbnN0IGltcG9ydFNvdXJjZXMgPSBnbG9iXG4gICAgLnN5bmMoZ2xvYlBhdHRlcm4sIHsgY3dkIH0pXG4gICAgLmZpbHRlcigocGF0aCkgPT4gIXBhdGgubWF0Y2goL1xcLih0ZXN0XFwuanN8c3Rvcmllc1xcLmpzKSQvKSlcblxuICBjb25zdCB7IGltcG9ydE5vZGVzLCBvYmplY3RQcm9wZXJ0aWVzIH0gPSBpbXBvcnRTb3VyY2VzLnJlZHVjZShcbiAgICAoYWxsLCBzb3VyY2UpID0+IHtcbiAgICAgIGNvbnN0IGlkID0gcmVmZXJlbmNlUGF0aC5zY29wZS5nZW5lcmF0ZVVpZElkZW50aWZpZXIoc291cmNlKVxuICAgICAgYWxsLmltcG9ydE5vZGVzLnB1c2goXG4gICAgICAgIHQuaW1wb3J0RGVjbGFyYXRpb24oXG4gICAgICAgICAgW3QuaW1wb3J0TmFtZXNwYWNlU3BlY2lmaWVyKGlkKV0sXG4gICAgICAgICAgdC5zdHJpbmdMaXRlcmFsKHNvdXJjZSlcbiAgICAgICAgKVxuICAgICAgKVxuXG4gICAgICAvLyBDb252ZXJ0IHRoZSByZWxhdGl2ZSBwYXRoIG9mIHRoZSBtb2R1bGUgdG8gYSBrZXk6XG4gICAgICAvLyAgLi9zZXJ2aWNlcy9hLmpzIC0+IGFcbiAgICAgIC8vICAuL3NlcnZpY2VzL2EvYS5qcyAtPiBhXG4gICAgICAvLyAgLi9ncmFwaHFsL3gveC5zZGwuanMgLT4geFxuICAgICAgY29uc3Qgb2JqZWN0S2V5ID0gcGF0aFxuICAgICAgICAuYmFzZW5hbWUoc291cmNlLCBwYXRoLmV4dG5hbWUoc291cmNlKSlcbiAgICAgICAgLnJlcGxhY2UoJy5zZGwnLCAnJylcbiAgICAgIGFsbC5vYmplY3RQcm9wZXJ0aWVzLnB1c2goXG4gICAgICAgIHQub2JqZWN0UHJvcGVydHkodC5zdHJpbmdMaXRlcmFsKG9iamVjdEtleSksIGlkKVxuICAgICAgKVxuICAgICAgcmV0dXJuIGFsbFxuICAgIH0sXG4gICAgeyBpbXBvcnROb2RlczogW10sIG9iamVjdFByb3BlcnRpZXM6IFtdIH1cbiAgKVxuXG4gIGNvbnN0IHByb2dyYW0gPSBzdGF0ZS5maWxlLnBhdGhcbiAgcHJvZ3JhbS5ub2RlLmJvZHkudW5zaGlmdCguLi5pbXBvcnROb2RlcylcblxuICBjb25zdCBvYmplY3RFeHByZXNzaW9uID0gdC5vYmplY3RFeHByZXNzaW9uKG9iamVjdFByb3BlcnRpZXMpXG4gIHJlZmVyZW5jZVBhdGgucGFyZW50UGF0aC5yZXBsYWNlV2l0aChvYmplY3RFeHByZXNzaW9uKVxufVxuXG5leHBvcnQgZGVmYXVsdCBjcmVhdGVNYWNybyhwcmV2YWxNYWNyb3MpXG4iXX0=