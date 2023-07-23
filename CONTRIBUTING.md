# Contributing

Contributions are always welcome, no matter how large or small.

**Working on your first Pull Request?** You can learn how from this _free_ course [How to Contribute to an Open Source Project on GitHub](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github)

## Project setup

First, [fork](https://guides.github.com/activities/forking) and then clone the caravan repository:

```sh
git clone https://github.com/your-username/caravan
cd caravan
git remote add upstream https://github.com/unchained-capital/caravan
```

Install dependencies:

```sh
npm install
```

Starting caravan locally (this will open caravan in your default browser):

```sh
npm run start
```

## Creating Pull Requests

1. Create a branch:

```sh
git checkout -b my-branch
```

2. Happy Hacking 🎉: Author your awesome code changes.

3. Ensure your changes pass linting and testing:

To test:
```sh
npm test
```

To lint your changes:

```sh
npm run lint
```

4. Commit your changes:

`caravan` uses [commitizen](https://github.com/commitizen/cz-cli) to create commit messages so it can automatically create semantic releases.

```sh
git add .
npm run commit
# answer the questions
```

5. Push your changes:

```sh
git push origin my-branch
```

5. Open [this project on GitHub](https://github.com/unchained-capital/caravan), then click “Compare & pull request”.

## Releasing Caravan

Caravan is released to GitHub Pages (https://unchained-capital.github.io/) by using the following:

```sh
npm run release
git push --follow-tags origin master
```

Then go to GitHub and create a release in the UI.  This will trigger a build and deployment to GitHub pages.


## Help needed

Please checkout the open issues for ideas of things to work on.

Also, please watch the repo and respond to questions/bug reports/feature requests, Thanks!
