> **Archived project.** This repository is no longer maintained and will not be published to any store. Free tools already cover this need better:
>
> - [FeedArc Google Shopping feed validator](https://www.feedarc.com/tools/google-shopping-feed-validator)
> - [Grigora product feed validator](https://www.grigora.co/tools/product-feed-validator/)
> - [AnyTool merchant feed validator](https://www.anytool.tech/merchant-feed-validator)
> - [HERE feed validator](https://here.se/en/feed-validator/)
>
> The code stays available under its license, as is.

# WeAdU Shopping feed check (browser page)

Live page: https://weadu-ltd.github.io/weadu-shopify-feed-check/

A single web page that checks a Google Shopping product feed you paste into it, and lists each product's problems. It is made with Shopify merchants in mind, but works with any feed in Google's format.

The check runs in your browser. The page loads no remote file and sends nothing: you can even open it offline.

## What it reads

- Google RSS 2.0 or Atom feeds (with `g:` fields).
- CSV or tab-separated files whose header row uses Google attribute names: `id`, `title`, `description`, `link`, `image_link` (or `image link`), `availability`, `price`, `brand`, `gtin`, `mpn`, `condition`, `identifier_exists`.
- Up to 500 products per check.

A Shopify product export (columns such as `Handle`, `Body (HTML)`, `Variant Price`) uses other column names and is **not** read correctly. Use the feed file your feed app or sales channel generates in Google's format.

## What is checked

Errors: empty `id`, `title`, `description`, `link`, `image_link`, `availability`, or `price`; title over 150 characters; description over 5,000 characters; link or image not starting with `http://` or `https://`; availability other than `in_stock`, `out_of_stock`, `preorder`, or `backorder`; price that cannot be read or is not greater than zero; GTIN with an invalid length or check digit; the same `id` used twice.

Warnings: title under 15 characters, all in capitals, or with promotional wording (for example "free shipping", "sale", "% off"); price without a currency code; empty brand; empty GTIN and MPN, unless `identifier_exists` is `no`; empty or unknown condition.

Each row also shows a suggested title that starts with the brand when the brand is missing from the title.

A product with no finding is not an approval from Google, and the page does not sign in to Merchant Center or to Shopify.

## Usage

1. Open `index.html` in a browser (from a local copy, or from the public page once it is published).
2. Paste the feed into the text box and click **Check**.
3. Read the summary and the table.

**Load a valid row** and **Load a short title** fill the box with examples. The same examples open directly with `index.html#sample` and `index.html#short`.

## Installation

Nothing to install. Download `index.html` and `feed.js` into the same folder and open `index.html`. No Shopify app, no account, no fee.

## Privacy

The page loads only `feed.js` from the same folder. It makes no network request, uses no cookie or analytics, and stores nothing. The pasted text stays in the browser tab.

## Development

```sh
npm ci
sh test.sh   # logic tests, then page tests in jsdom
```

## License

[MIT](LICENSE)

## About

Made by [WeAdU](https://weadu.com). WeAdU is not affiliated with Shopify or Google.
