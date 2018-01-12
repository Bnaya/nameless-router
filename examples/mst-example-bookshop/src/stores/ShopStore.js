import { types, getEnv, flow } from "mobx-state-tree"
import { BookStore } from "./BookStore"
import { CartStore } from "./CartStore"
import { ViewStore } from "./ViewStore"

export const ShopStore = types
    .model("ShopStore", {
        bookStore: types.optional(BookStore, {
            books: {}
        }),
        cart: types.optional(CartStore, {
            entries: []
        }),
        view: types.optional(ViewStore, {})
    })
    .views(self => ({
        get fetch() {
            return getEnv(self).fetch
        },
        get alert() {
            return getEnv(self).alert
        },
        get isLoading() {
            return self.bookStore.isLoading
        },
        get books() {
            return self.bookStore.books
        },
        get sortedAvailableBooks() {
            return self.bookStore.sortedAvailableBooks
        }
    }))
    .actions(self => ({
        afterCreate() {
            self.bookStore.loadBooks()
        }
    }))
    .actions(self => ({
      setupNextLevel(
        params = { feature: "books" },
        extraz,
        willEnter,
        willPassthrough,
        abortSignal,
        linkHelper,
      ) {
        return flow(function*() {
          switch (params.feature) {
            case "books":
              break;

              case "book":
                return new BookController(self.viewStore);
              break;

            default:
              return;
          }

        })();
      },
      extrazChanged(e) {
        return;
      },
      passthrough() {
        return;
      },
      enter() {
        self.view.openBooksPage();
      },
      leave()  {
        return;
      },
      validateParams(p) {
        return true;
      },
    }));

class BookController {
  /**
   *
   * @param {typeof ViewStore.Type} viewStore
   */
  constructor(viewStore) {
    this.viewStore = viewStore;
  }
  async setupNextLevel(
    params,
    extraz,
    willEnter,
    willPassthrough,
    abortSignal,
    linkHelper
  ) {
    // load here extra data about the book and create full book model
    this.viewStore.openBookPageById(params.feature);
  }
  // * Should extrazChanged be async ???
  extrazChanged(e) {

  }
  passthrough() {

  }
  enter() {

  }
  // should be async with an ability to prevent navigation ???
  leave() {

  }
  validateParams(p) {

  }
  invalidUrlHandler(urlSegments, segmentWithIssue) {

  }
}
