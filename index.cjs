const { Transformer } = require('@parcel/plugin');
const { minifyHTMLLiterals } = require('minify-html-literals');
const { relativeUrl } = require('@parcel/utils');
const { default: SourceMap } = require('@parcel/source-map');
module.exports.default = new Transformer({
  async transform({ asset, logger, options }) {
    const minify = asset.env.shouldOptimize ?? true;
    const fileName = relativeUrl(options.projectRoot, asset.filePath);
    const source = await asset.getCode();
    const result = minifyHTMLLiterals(source, { fileName, shouldMinify: () => minify });

    if (result) {
      logger.verbose({ message: 'file: ' + fileName });
      asset.setCode(result.code);
      if (result.map) {
        result.map.file = fileName + '.map';
        result.map.sources = [fileName];
        result.map.sourcesContent = [source];
        const map = new SourceMap(options.projectRoot);
        asset.setMap(map);
        map.addVLQMap(result.map);
      }
    }
    return [asset];
  },
});
