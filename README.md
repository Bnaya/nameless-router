# Nameless Router - Routing micro-libraries (NLR/nlr)
# This document is still work in progress
# if you know a good library that do the same, i will ditch this one for it
## Overview
nameless-router is a tiny library to help you reflect url changes on your app's models, in a simple and minimal-boilerplate way.  
It might look very low-level at first glance, but you probably don't need much more. 
And it's very simple to add more functionality as layers on top of the minimal controllers api.  
There's not route declarations, not setup phase. the library will simply call actions on your models.

## Architecture
nameless-router was written to answer usecase of routing at the *state level* of mobx/mobx-state-tree for a very tree-shaped app state.
(Unlike React Router, which is a component based router)
Nonetheless, it has no dependency on mobx or react and can work very nicely as a redux middleware or ourside of the react ecosystem.

.... need to write more

The codebase is very small, less than 1k loc, so i urge you to take a look!


## Is it for me?
* If you are care and aware of the violation of single source of truth by RR and the componend based routing concept
* If you understand the fundamental issue with componend based routing
* if you have an app which based on tree of models, with several levels of branches, with async data fetching.

The answer is yes!

## How to use?
Checkout [the how to use](docs/HowToUse.md) guide

## Road to 1.0
The library is usable as is, but i feel that before i lock down the api's for a major release, there's polishing and triming to do.  
Any help is appreciated!
Help me pile up issues under a milestone that we want to see in 1.0!

## Examples 
* [mst-example-bookshop](examples/mst-example-bookshop) taken from mobx-state-tree, mst-example-bookshop example but with nlr (very basic)
* will add more
* send me yours!

## SSR
Will be supported, hopefully for 1.0 (Not much to do actually)

## Code splitting
The router does not care about it directly. The router just mutate your state via actions.  
You need to put your dynamic `import()`, `require.ensure` ensure in something like:
```tsx
class CategorySplitPoint extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            codeLoaded: false;
            codeLoadingError: false;
        }

        import("./CategoryPageComponent").then((CategoryPageComponent) => {
            this.setState({
                codeLoaded: CategoryPageComponent
            });
        }).catch(() => {
            this.setState({
                codeLoadingError: true
            });
        });
    }

    render() {
        if (this.state.codeLoadingError) {
            return <div>This is bad</div>;
        }

        if (this.state.codeLoaded) {
            return <this.state.codeLoaded model={this.props.model} />;
        }

        return <div>Loading...</div>;
    }
}
....
if (appModel.screen instanceof CategoryUIModel) {
    return <CategorySplitPoint model={appModel.screen} />
}

...
if (appModel.screen instanceof GroupUIModel) {
    return <GroupSplitPoint model={appModel.screen} />
}

```

### What's in the tarball:
The library shipped as 
ES5, ES5 + es6 modules, and es2017, with the appropriate fields in the package.json.  
Instead of shipping d.ts files, i'm playing with pointing the "types" to the index.ts file. lets see how it gose (it's good for some monorepo workflows)

## Prior Art
nameless is heavily influenced by https://github.com/tildeio/router.js, (Part of ember routing) which i used before writing it. The need to declare routing rules, and create controllers for each route at the app's startup time, and the lack of first-class typescript support (not very typescript) made me develop it.
