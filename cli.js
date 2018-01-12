#!/usr/bin/env node

const path = require('path');
const package = require('./package.json');
const globby = require('globby');
const parseArgs = require('minimist');
const ora = require('ora');
let spinner;

require('babel-core/register')({
	presets: ['es2015', 'react'],
});

const createStaticFileServer = require('./static-file-server.js').default;
const { outputFile, recursiveCopy } = require('./fs-utils.js');

const {
	loadComponentDataList,
} = require('./index.js');

const argv = parseArgs(process.argv.slice(2), {
	boolean: [
		'version',
		'help',
		'watch',
		'verbose',
	],
	string: [
		'ignore',
		'config',
		'output',
		'output-type',
		'generator',
	],
	alias: {
		'v': 'version',
		'h': 'help',
		'i': 'ignore',
		'c': 'config',
		'o': 'ouput',
		'w': 'watch',
		'g': 'generator',
		'debug': 'verbose',
	},
});

const usage = () => {
	console.log(`
Usage: react-peek {OPTIONS} [COMPONENTS..]

COMPONENTS are one or more globs targeting modules which export a react component.

OPTIONS are:
  -v, --version
    Writes version to stdout.

  -h, --help
    Shows usage.

  -i, --ignore <PATTERN>
    Ignores file paths matching <PATTERN>.

  -c, --config <FILEPATH>
    Uses configuration at <FILEPATH>.

  -o, --output <PATH>
    Defines output type/location, where <PATH> can be a:
      * file path (assumes --output-type 'json')
        example:
          --output './docs/component-data.json'

      * directory path (assumes --output-type 'html')
        example:
          --output './docs'

      * host:port (assumes --output-type 'webserver')
        example:
          --output 'localhost:8080'

    If not set, writes json to stdout.

  --output-type <TYPE>
	 Where <TYPE> is one of: 'json', 'html', 'webserver'.
	 Explicity defines the output type.
	 If not set, <TYPE> is assumed by --output value.

  -w, --watch
    Re-run on changes to target files and process will not terminate.

  -g, --generator <MODULE>
	 Sets a custom site generator where <MODULE> is a package name or module path.
	 The module must export a function with the signature:
		(componentManifestArray) => Promise<MemoryFS> 

  --verbose, --debug
    Writes verbose logs to stdout.

EXAMPLES:
  react-peek --watch --ouput :8080 ./src/components/**.jsx
  react-peek --ouput ./docs --ignore *.spec.jsx ./src/components/**.jsx
  react-peek ./src/components/**.jsx > ./docs/component-meta-data.json
  react-peek --config .react-peek.js
  react-peek --generator react-peek-simple --ouput ./docs ./src/components/**.jsx
	`);
};

const verboseLog = (...args) => {
	if (argv.verbose) {
		return console.log(...args);
	}
};

const webserverOuputRegexp = /(\S*):(\d+)/;

const getOuputType = () => {
	if (argv['output-type']) {
		return argv['output-type'];
	}
	if (argv.output) {
		if (path.extname(argv.output) === '.json') {
			return 'json';
		}
		if (webserverOuputRegexp.test(argv.output)) {
			return 'webserver';
		}
		if (path.extname(argv.output) === '') {
			return 'html';
		}
	}
	return 'json';
};

if (argv.version) {
	console.log(package.version);
	process.exit(0);
}

verboseLog('argv:');
verboseLog(argv);

if (argv.help || argv._.length === 0) {
	usage();
	process.exit(0);
}

spinner = ora('Finding component matches...').start();

globby(argv._, {
	ignore: argv.ignore || [],
})
.then(matches => {
	spinner.succeed(`${matches.length} component matches.`);
	spinner.text = 'Loading component data...';
	spinner.render();
	return matches;
})
.then(loadComponentDataList)
.then((componentDataList) => {
	spinner.succeed('Loaded component data.');
	spinner.text = 'Generating static assets...';
	spinner.render();
	return componentDataList;
})
.then(componentDataList => {
	const outputType = getOuputType();

	verboseLog(`outputType: ${outputType}`);

	if (outputType === 'json') {
		// get component data JSON and save it to disk
		if (argv.output) {
			return outputFile(
				argv.output,
				JSON.stringify(componentDataList, null, 2),
				{ encoding: 'utf8' }
			);
		} else {
			// get component data JSON and write it to stdout
			console.log(JSON.stringify(componentDataList, null, 2));
			return Promise.resolve(null);
		}
	}

	const generateSite = argv.generator ? require(argv.generator) : require('react-peek-simple');

	// generate static site and save it to disk
	if (outputType === 'html') {
		return generateSite(componentDataList)
			.then((fs) => {
				spinner.succeed('Generated static assets.');
				spinner.text = `Saving static site to '${argv.output}'...`;
				return fs;
			})
			.then(fs => recursiveCopy('/', argv.output, { sourceFs: fs }))
			.then(() => {
				spinner.succeed(`Saved static site to '${argv.output}'.`);
			});
	}

	// generate static site and serve it on host:port
	if (outputType === 'webserver') {
		const webserverOuputMatch = webserverOuputRegexp.exec(argv.output);
		const host = webserverOuputMatch[1] || null;
		const port = parseInt(webserverOuputMatch[2], 10);
		verboseLog(`port: ${port}`);
		verboseLog(`host: ${host}`);
		return generateSite(componentDataList)
			.then(fs => {
				spinner.succeed('Generated static assets.');
				createStaticFileServer(fs, verboseLog).listen(port, host);
				spinner.succeed(`Serving static site at 'http://${host || 'localhost'}:${port}/'`);
			});
	}

	return null;
})
.then(() => {
	verboseLog('done.');
	spinner.stop();
})
.catch(err => {
	console.error(err.message);
	verboseLog(err.stack);
	spinner.fail(err.message);
	process.exit(1);
});
