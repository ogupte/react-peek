import path from 'path';
import url from 'url';
import http from 'http';
import mime from 'mime-types';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import htmlTemplate from './html-template.js';

export default (mfs, log) => {
	return http.createServer((req, res) => {
		try {
			const pathname = url.parse(req.url).pathname;
			const fileExists = mfs.existsSync(pathname);
			if (fileExists || pathname === '/') {
				const stat = mfs.statSync(pathname);
				if (stat.isDirectory()) {
					//handleDir
					const directoryContents = mfs.readdirSync(pathname);
					if (directoryContents.includes('index.html')) {
						res.writeHead(302, {
							'location': path.resolve(pathname, 'index.html'),
						});
						res.end();
						return;
					}
					const buffer = Buffer.from(htmlTemplate({
						title: `index of ${pathname}`,
						body: renderToStaticMarkup(
							<div>
								<h1>index of {pathname}</h1>
								<div>
									<a href={path.resolve(pathname, '..')}>&lt;-</a>
								</div>
								{directoryContents.map((file, index) => (
									<div key={index}>
										<a href={path.resolve(pathname, file)}>{file}</a>
									</div>
								))}
							</div>
						),
					}), 'utf8');
					res.writeHead(200, {
						'content-length': buffer.length,
						'content-type': mime.contentType('.html'),
					});
					res.write(buffer);
					res.end();
					return;
				} else {
					//handleFile
					const buffer = mfs.readFileSync(pathname);
					res.writeHead(200, {
						'content-length': buffer.length,
						'content-type': mime.contentType(path.extname(pathname)),
					});
					res.write(buffer);
					res.end();
					return;
				}
			}
			res.statusCode = 404;
			res.end('File not found.');
		} catch (err) {
			console.error(err.message);
			log(err.stack);
		}
	});
};
