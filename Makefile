VERSION=0.1.0
IN=dist/backbone.viewmodel-$(VERSION).js
OUT=dist/backbone.viewmodel-$(VERSION).min.js

dist: js
	echo "Development: $(IN)"
	echo "Production: $(OUT)"

	cat backbone.viewmodel.js backbone.virtual.js backbone.binding.js lib/bindings.js > $(IN)

	curl -s \
    -d compilation_level=SIMPLE_OPTIMIZATIONS \
    -d output_format=text \
    -d output_info=compiled_code \
    --data-urlencode "js_code@${IN}" \
    http://closure-compiler.appspot.com/compile \
    > $(OUT)

test: js
	open test/test.html

js: clean
	coffee --output lib --compile .

clean:
	rm -rf dist/*
	rm -rf lib/*

.PHONY: dist clean test js