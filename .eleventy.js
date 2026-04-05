const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const eleventyImg = require("@11ty/eleventy-img");
const path = require("path");

module.exports = function (eleventyConfig) {
  // Plugins
  eleventyConfig.addPlugin(syntaxHighlight);

  // Passthrough copies
  eleventyConfig.addPassthroughCopy("src/static");
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy({ "src/assets/static": "static" });
  eleventyConfig.addPassthroughCopy({ "src/assets/favicon": "/" });

  // Image shortcode (replaces Lektor's .thumbnail(640) filter)
  eleventyConfig.addAsyncShortcode("image", async function (src, alt, widths = [640], sizes = "100vw") {
    const metadata = await eleventyImg(src, {
      widths,
      formats: ["webp", "jpeg"],
      outputDir: "_site/img/",
      urlPath: "/img/",
    });
    const imageAttributes = { alt, sizes, loading: "lazy", decoding: "async" };
    return eleventyImg.generateHTML(metadata, imageAttributes);
  });

  // Date filters
  eleventyConfig.addFilter("dateformat", function (date, format) {
    if (!date) return "";
    const d = new Date(date);
    if (format === "YYYY") return d.getFullYear().toString();
    if (format === "M") return (d.getMonth() + 1).toString();
    if (format === "YYYY/M/") return `${d.getFullYear()}/${d.getMonth() + 1}/`;
    // Default: MMMM D, YYYY
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  });

  // Collections
  eleventyConfig.addCollection("musings", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/musings/**/*.md")
      .sort((a, b) => b.date - a.date);
  });

  eleventyConfig.addCollection("work", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/work/**/*.md")
      .sort((a, b) => (a.data.order || 99) - (b.data.order || 99));
  });

  eleventyConfig.addCollection("workshops", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/workshops/**/*.md");
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
