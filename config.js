module.exports = {
	config: {
		tailwindjs: "./tailwind.config.js",
		port: 8080
	},
  data: "./data.json",
	paths: {
		root: "./",
		src: {
			html: "./src/templates",
			css: "./src/css",
			js: "./src/js",
			img: "./src/img"
		},
		dist: {
			html: "./dist",
			css: "./dist/css",
			js: "./dist/js",
			img: "./dist/img"
		},
		build: {
			html: "./build",
			css: "./build/css",
			js: "./build/js",
			img: "./build/img"
		}
	}
}