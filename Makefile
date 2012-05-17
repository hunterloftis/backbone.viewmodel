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

clean:
	touch dist/deleteme
	touch lib/deleteme
	rm dist/*
	rm lib/*

test: js
	open test/test.html

js:
	coffee --output lib --compile .
	cp *.js lib

.PHONY: dist clean test js