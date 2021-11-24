git checkout gh-pages
git merge master
call ng build --output-path docs --base-href /CalendarAngular/
cd docs
copy index.html 404.html
cd ..
git add docs
git commit -m "Build"
git push -u origin gh-pages
git checkout master
pause
