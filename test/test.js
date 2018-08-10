const expect = require('chai').expect;
const co = require('co');

const CSSInlineImages = require('../index').CSSInlineImageFilter;

const helper = require('broccoli-test-helper');
const createBuilder = helper.createBuilder;
const createTempDir = helper.createTempDir;

describe('ember-cli-inline-images', function() {
  it('should inline images in CSS', co.wrap(function*() {
    let input = yield createTempDir();

    try {
      let subject = new CSSInlineImages(input.path(), {
        root: input.path(),
        imagesPath: 'images'
      });

      let output = createBuilder(subject);

      try {
        input.write({
          'style.css': `body { background-image: inline-image('svgs/inline.svg')}`,
          images: {
            svgs: {
            'inline.svg': '<svg></svg>'
            }
          }
        });
        yield output.build();

        expect(output.read()['style.css']).to.equal(`body { background-image: url('data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=')}`);
      } finally {
        yield output.dispose();
      }
    } finally {
      yield input.dispose();
    }
  }));
});
