/**
 * 重定向地址到mock地址
 */
function mockHandler(map) {
	return function (context) {


		var pathname = map[context.request.pathname];

		if(!pathname){ // 支持正则匹配
			Object.keys(map).some(function(url){
				if(new RegExp(url).test(context.request.pathname)){
					pathname = map[url];
					return true;
				}
			});
		}

        var filename = require('path').normalize( __dirname + '/mock' + pathname);
        context.content = require('fs').readFileSync(filename, 'utf-8');

	};
}



exports.port = 8848;
exports.directoryIndexes = true;
exports.documentRoot = __dirname;

exports.getLocations = function () {
	return [
		{
			location: /^\/market\//,
			handler: [
				mockHandler(require('./mock/debug'))
			]
		}
	];
};

/* eslint-disable guard-for-in */
exports.injectResource = function (res) {
	for (var key in res) {
		global[key] = res[key];
	}
};
