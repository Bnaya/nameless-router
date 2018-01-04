concurrently "tsc -p tsconfig.json" \
  "tsc -p tsconfig.json --module es2015 --target ES5 --outDir dist/es5-esm" \
  "tsc -p tsconfig.json --module es2015 --target ES2017 --lib es2017 --outDir dist/es2017"
