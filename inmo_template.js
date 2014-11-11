function ite(app) {

	var sass = require('node-sass');
	var fs = require('fs');

	app.engine('js', theEngine);
	app.engine('html', theEngine);
	app.engine('css', theEngine);
	app.engine('scss', renderSass);

	function theEngine(filePath, options, callback) {

		fs.readFile(filePath, function (err, content) {

			if (err) throw new Error(err);

			var rendered = content.toString();
			for (var key in options) {	    	
				rendered = rendered.replace("{{" + key + "}}", options[key]);
			}

			return callback(null, rendered);
		});
	}

	function renderSass(filePath, options, callback) {
		fs.readFile(filePath, function(err, content) {
			if (err) throw new Error(err);

			sass.render({
				data: content.toString(),
				success: function(css) {
					return callback(null, css);
				},
				error: function(error) {
					return callback(null, error);
				}
				// outputStyle: 'compressed'
			});
		});
	}
};


module.exports = ite;