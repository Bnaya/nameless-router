import React from "react"
import ReactDOM from "react-dom"
import { Provider } from "mobx-react"
import { observable, reaction } from "mobx"
import { NamelessRouter } from "nameless-router";

import {
    onSnapshot,
    onAction,
    onPatch,
    applySnapshot,
    applyAction,
    applyPatch,
    getSnapshot
} from "mobx-state-tree"

import App from "./components/App"
import "./index.css"

import { ShopStore } from "./stores/ShopStore"

const fetcher = url => window.fetch(url).then(response => response.json())
const shop = ShopStore.create(
    {},
    {
        navigate(pathSearchHash) {
          window.history.pushState(null, null, pathSearchHash)
          nlRouter.navigate(pathSearchHash)
        },
        fetch: fetcher,
        alert: m => console.log(m) // Noop for demo: window.alert(m)
    }
)

const nlRouter = new NamelessRouter(shop);

const history = {
    snapshots: observable.shallowArray(),
    actions: observable.shallowArray(),
    patches: observable.shallowArray()
}

/**
 * Rendering
 */
ReactDOM.render(
    <Provider shop={shop} history={history}>
        <App />
    </Provider>,
    document.getElementById("root")
)

/**
 * Routing
 */

reaction(
    () => shop.view.currentUrl,
    path => {
        if (window.location.pathname !== path) {
          nlRouter.navigate({...window.location, pathname: path})
          window.history.pushState(null, null, path)
        }
    }
)


window.onpopstate = function historyChange(ev) {
  nlRouter.navigate(window.location)
}


// ---------------

window.shop = shop // for playing around with the console

/**
 * Poor man's effort of "DevTools" to demonstrate the api:
 */

let recording = true // supress recording history when replaying

onSnapshot(
    shop,
    s =>
        recording &&
        history.snapshots.unshift({
            data: s,
            replay() {
                recording = false
                applySnapshot(shop, this.data)
                recording = true
            }
        })
)
onPatch(
    shop,
    s =>
        recording &&
        history.patches.unshift({
            data: s,
            replay() {
                recording = false
                applyPatch(shop, this.data)
                recording = true
            }
        })
)
onAction(
    shop,
    s =>
        recording &&
        history.actions.unshift({
            data: s,
            replay() {
                recording = false
                applyAction(shop, this.data)
                recording = true
            }
        })
)

// add initial snapshot
history.snapshots.push({
    data: getSnapshot(shop),
    replay() {
        // TODO: DRY
        recording = false
        applySnapshot(shop, this.data)
        recording = true
    }
})
