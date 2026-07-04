git clone https://github.com/adeo/mozaic-design-system.git
cd mozaic-design-system
rm package.json
cd packages/styles
npm install --save-dev postcss-cli cssnano postcss sass
cp ../../../all.scss all.scss
npx sass -I ../tokens/build/scss all.scss mozaic-lm.css
npx postcss -u cssnano --no-map mozaic-lm.css -o mozaic-lm.min.css
cp mozaic-lm.min.css ../../../../../../../public/mozaic-lm.min.css
cd ../../..
rm -rf mozaic-design-system
