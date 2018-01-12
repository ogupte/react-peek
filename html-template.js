export default ({ title, body, loadReact, loadLodash, bundlePath, initialState}) => `<!DOCTYPE html>
<html>
	<head>
		<title>${title}</title>
		${initialState ? `
		<script>window.__APP_INITIAL_STATE__ = ${JSON.stringify(initialState)};</script>
		` : ''}
	</head>
	<body>
		<div id="root">${body}</div>
		${loadReact ? `
		<script src="https://unpkg.com/react@16/umd/react.production.min.js"></script>
		<script src="https://unpkg.com/react-dom@16/umd/react-dom.production.min.js"></script>
		` : ''}
		${loadLodash ? `
		<script src="https://cdn.jsdelivr.net/npm/lodash@4.17.4/lodash.min.js"></script>
		` : ''}
		${bundlePath ? `
		<script src="${bundlePath}"></script>
		` : ''}
	</body>
</html>`;
