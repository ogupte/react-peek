import * as path from 'path';
import * as nodeFs from 'fs';
import mkdirp from 'mkdirp';
import _ from 'lodash';

export const outputFile = (filepath, data, options={}) => new Promise((resolve, reject) => {
	try {
		const {
			fs: fs=nodeFs,
		} = options;
		const restOptions = _.omit(restOptions, ['fs']);
		const exists = fs.existsSync(filepath);
		if (exists) {
			fs.stat(filepath, (err, stats) => {
				if (err) {
					return reject(err);
				}
				if (!stats.isFile()) {
					return reject(new Error(`Cannot write file to '${filepath}'. A non-file object already exists at that path.`));
				}
				fs.writeFile(filepath, data, restOptions, (err) => {
					if (err) {
						return reject(err);
					}
					return resolve();
				});
			});
		} else {
			mkdirp(path.dirname(filepath), { fs }, (err) => {
				if (err) {
					return reject(err);
				}
				fs.writeFile(filepath, data, restOptions, (err) => {
					if (err) {
						return reject(err);
					}
					return resolve();
				});
			});
		}
	} catch (err) {
		reject(err);
	}
})

export const recursiveCopy = (pathSource, pathDest, options={}) => new Promise((resolve, reject) => {
	try {
		const {
			sourceFs: fsSource=nodeFs,
			destFs: fsDest=nodeFs,
		} = options;
		const restOptions = _.omit(restOptions, ['fs']);
		if (!fsSource.existsSync(pathSource)) {
			return reject(new Error(`Cannot copy '${pathSource}' from source path. File does not exist.`));
		}
		fsSource.stat(pathSource, (err, stats) => {
			if (err) {
				return reject(err);
			}
			if (stats.isFile()) {
				fsSource.readFile(pathSource, (err, data) => {
					if (err) {
						return reject(err);
					}
					resolve(outputFile(pathDest, data, Object.assign({fs: fsDest}, restOptions)));
				});
			} else if (stats.isDirectory()) {
				fsSource.readdir(pathSource, (err, dirList) => {
					if (err) {
						return reject(err);
					}
					resolve(dirList.reduce((promiseChain, file) => {
						return promiseChain.then(() => {
							return recursiveCopy(path.resolve(pathSource, file), path.resolve(pathDest, file), options);
						});
					}, Promise.resolve(null)));
				});
			}
		});
	} catch (err) {
		reject(err);
	}
});
